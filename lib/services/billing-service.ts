import Stripe from "stripe";
import { BillingCadence, BillingStatus, Prisma, SubscriptionProvider } from "@prisma/client/index";

import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/audit";
import { createInAppNotification } from "@/lib/services/notification-service";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" })
  : null;

type StripeConfigStatus = {
  enabled: boolean;
  reason?: string;
  priceId?: string;
  planKey?: string;
};

function normalizePlanKey(planTier?: string | null) {
  const normalized = (planTier ?? "Starter").trim().toLowerCase();

  if (normalized === "growth") {
    return "Growth";
  }

  if (normalized === "scale") {
    return "Scale";
  }

  return "Starter";
}

function getStripePriceId(planKey: string) {
  const mapping: Record<string, string | undefined> = {
    Starter: process.env.STRIPE_PRICE_ID_STARTER,
    Growth: process.env.STRIPE_PRICE_ID_GROWTH,
    Scale: process.env.STRIPE_PRICE_ID_SCALE
  };

  return mapping[planKey] ?? process.env.STRIPE_PRICE_ID_DEFAULT;
}

function getAppBaseUrl() {
  return process.env.NEXTAUTH_URL ?? process.env.APP_URL ?? null;
}

function getStripeConfigStatus(planTier?: string | null): StripeConfigStatus {
  if (!stripe) {
    return { enabled: false, reason: "missing-secret-key" };
  }

  const baseUrl = getAppBaseUrl();
  if (!baseUrl) {
    return { enabled: false, reason: "missing-app-url" };
  }

  const planKey = normalizePlanKey(planTier);
  const priceId = getStripePriceId(planKey);

  if (!priceId) {
    return { enabled: false, reason: "missing-price-id", planKey };
  }

  return { enabled: true, priceId, planKey };
}

function mapStripeStatus(status?: Stripe.Subscription.Status | null): BillingStatus {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "trialing":
      return "TRIALING";
    case "past_due":
    case "unpaid":
      return "PAST_DUE";
    case "canceled":
      return "CANCELED";
    case "incomplete":
    case "incomplete_expired":
      return "INCOMPLETE";
    case "paused":
      return "PAUSED";
    default:
      return "INCOMPLETE";
  }
}

function cadenceFromStripePrice(
  price: Stripe.InvoiceLineItem["price"] | Stripe.SubscriptionItem["price"] | null | undefined
): BillingCadence {
  const interval = price?.recurring?.interval;

  switch (interval) {
    case "year":
      return "ANNUAL";
    case "month":
      return "MONTHLY";
    default:
      return "MONTHLY";
  }
}

function formatPlanLabel(planKey: string) {
  return `RAEYL ${planKey} plan`;
}

async function ensureStripeCustomer(walletId: string) {
  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId },
    include: {
      primaryOwner: {
        select: {
          email: true,
          name: true
        }
      },
      subscriptions: {
        where: {
          provider: SubscriptionProvider.STRIPE
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 1
      }
    }
  });

  if (!wallet) {
    throw new Error("Wallet not found.");
  }

  const subscription = wallet.subscriptions[0] ?? null;
  if (subscription?.stripeCustomerId) {
    return {
      wallet,
      customerId: subscription.stripeCustomerId,
      subscription
    };
  }

  if (!stripe) {
    throw new Error("Stripe is not configured.");
  }

  const customer = await stripe.customers.create({
    email: wallet.primaryOwner?.email ?? wallet.ownerEmail ?? undefined,
    name: wallet.businessName,
    metadata: {
      walletId: wallet.id
    }
  });

  const nextSubscription = subscription
    ? await prisma.walletSubscription.update({
        where: { id: subscription.id },
        data: {
          stripeCustomerId: customer.id
        }
      })
    : await prisma.walletSubscription.create({
        data: {
          walletId: wallet.id,
          provider: SubscriptionProvider.STRIPE,
          planKey: normalizePlanKey(wallet.planTier),
          status: "INCOMPLETE",
          stripeCustomerId: customer.id,
          startedAt: new Date()
        }
      });

  return {
    wallet,
    customerId: customer.id,
    subscription: nextSubscription
  };
}

export async function createCheckoutSession(walletId: string, actorUserId: string) {
  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId },
    select: {
      id: true,
      businessName: true,
      planTier: true
    }
  });

  if (!wallet) {
    return { url: `/app/wallets/${walletId}/billing?billing=wallet-not-found` };
  }

  const config = getStripeConfigStatus(wallet.planTier);
  if (!config.enabled || !config.priceId || !config.planKey) {
    return {
      url: `/app/wallets/${walletId}/billing?checkout=config-required&reason=${config.reason ?? "unknown"}`
    };
  }

  const baseUrl = getAppBaseUrl();
  if (!baseUrl || !stripe) {
    return { url: `/app/wallets/${walletId}/billing?checkout=config-required&reason=missing-app-url` };
  }

  const { customerId, subscription } = await ensureStripeCustomer(walletId);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    allow_promotion_codes: true,
    success_url: `${baseUrl}/app/wallets/${walletId}/billing?checkout=success`,
    cancel_url: `${baseUrl}/app/wallets/${walletId}/billing?checkout=cancelled`,
    line_items: [
      {
        price: config.priceId,
        quantity: 1
      }
    ],
    metadata: {
      walletId,
      actorUserId,
      planKey: config.planKey
    },
    subscription_data: {
      metadata: {
        walletId,
        actorUserId,
        planKey: config.planKey
      }
    }
  });

  await prisma.walletSubscription.upsert({
    where: {
      id: subscription.id
    },
    update: {
      planKey: config.planKey,
      stripePriceId: config.priceId,
      metadata: {
        checkoutSessionId: session.id
      }
    },
    create: {
      walletId,
      provider: SubscriptionProvider.STRIPE,
      planKey: config.planKey,
      status: "INCOMPLETE",
      stripeCustomerId: customerId,
      stripePriceId: config.priceId,
      metadata: {
        checkoutSessionId: session.id
      }
    }
  });

  await recordAuditEvent({
    actorUserId,
    actorType: "USER",
    walletId,
    entityType: "SUBSCRIPTION",
    entityId: subscription.id,
    action: "billing.checkout.created",
    summary: "Stripe checkout session created."
  });

  return { url: session.url ?? `/app/wallets/${walletId}/billing` };
}

export async function createBillingPortalSession(walletId: string, actorUserId: string) {
  const subscription = await prisma.walletSubscription.findFirst({
    where: {
      walletId,
      provider: SubscriptionProvider.STRIPE
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const baseUrl = getAppBaseUrl();

  if (!stripe || !subscription?.stripeCustomerId || !baseUrl) {
    return {
      url: `/app/wallets/${walletId}/billing?portal=config-required&reason=${
        !subscription?.stripeCustomerId ? "missing-customer" : "missing-stripe-config"
      }`
    };
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${baseUrl}/app/wallets/${walletId}/billing`
  });

  await recordAuditEvent({
    actorUserId,
    actorType: "USER",
    walletId,
    entityType: "SUBSCRIPTION",
    entityId: subscription.id,
    action: "billing.portal.created",
    summary: "Stripe billing portal session created."
  });

  return { url: session.url };
}

async function findWalletSubscriptionForStripeEvent(subscriptionId?: string | null, customerId?: string | null) {
  if (subscriptionId) {
    const bySubscription = await prisma.walletSubscription.findFirst({
      where: {
        stripeSubscriptionId: subscriptionId
      }
    });

    if (bySubscription) {
      return bySubscription;
    }
  }

  if (customerId) {
    const byCustomer = await prisma.walletSubscription.findFirst({
      where: {
        stripeCustomerId: customerId
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (byCustomer) {
      return byCustomer;
    }
  }

  return null;
}

export async function syncWalletSubscriptionFromStripeSubscription(
  stripeSubscription: Stripe.Subscription,
  walletIdFromMetadata?: string | null
) {
  const existing = await findWalletSubscriptionForStripeEvent(
    stripeSubscription.id,
    typeof stripeSubscription.customer === "string" ? stripeSubscription.customer : stripeSubscription.customer?.id
  );

  const walletId = walletIdFromMetadata ?? existing?.walletId;
  if (!walletId) {
    return null;
  }

  const planKey = normalizePlanKey(stripeSubscription.metadata.planKey);
  const customerId =
    typeof stripeSubscription.customer === "string"
      ? stripeSubscription.customer
      : stripeSubscription.customer?.id;

  const data: Prisma.WalletSubscriptionUncheckedCreateInput = {
    walletId,
    provider: SubscriptionProvider.STRIPE,
    planKey,
    status: mapStripeStatus(stripeSubscription.status),
    stripeCustomerId: customerId,
    stripeSubscriptionId: stripeSubscription.id,
    stripePriceId: stripeSubscription.items.data[0]?.price.id,
    currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
    currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    canceledAt: stripeSubscription.canceled_at
      ? new Date(stripeSubscription.canceled_at * 1000)
      : null,
    startedAt: stripeSubscription.start_date
      ? new Date(stripeSubscription.start_date * 1000)
      : new Date(),
    trialEndsAt: stripeSubscription.trial_end
      ? new Date(stripeSubscription.trial_end * 1000)
      : null,
    metadata: {
      stripeStatus: stripeSubscription.status
    }
  };

  if (existing) {
    return prisma.walletSubscription.update({
      where: { id: existing.id },
      data
    });
  }

  return prisma.walletSubscription.create({
    data
  });
}

export async function syncInvoiceRecord(invoice: Stripe.Invoice) {
  const subscription = await findWalletSubscriptionForStripeEvent(
    typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id,
    typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id
  );

  if (!subscription) {
    return null;
  }

  const line = invoice.lines.data[0];
  const amount = (invoice.amount_paid || invoice.amount_due || invoice.total || 0) / 100;
  const cadence = cadenceFromStripePrice(line?.price);
  const status: BillingStatus =
    invoice.status === "paid"
      ? "ACTIVE"
      : invoice.status === "open"
        ? "PAST_DUE"
        : subscription.status;

  return prisma.billingRecord.upsert({
    where: {
      id: `stripe-invoice-${invoice.id}`
    },
    update: {
      amount: new Prisma.Decimal(amount),
      status,
      invoiceUrl: invoice.hosted_invoice_url ?? undefined,
      renewalDate: invoice.period_end ? new Date(invoice.period_end * 1000) : undefined,
      providerReference: invoice.id
    },
    create: {
      id: `stripe-invoice-${invoice.id}`,
      walletId: subscription.walletId,
      sourceType: "RAEYL_SUBSCRIPTION",
      label: formatPlanLabel(subscription.planKey),
      description: "Your RAEYL subscription for this website wallet.",
      amount: new Prisma.Decimal(amount),
      currency: (invoice.currency ?? "usd").toUpperCase(),
      cadence,
      status,
      providerReference: invoice.id,
      invoiceUrl: invoice.hosted_invoice_url ?? undefined,
      billingUrl: invoice.hosted_invoice_url ?? undefined,
      renewalDate: invoice.period_end ? new Date(invoice.period_end * 1000) : undefined,
      isOwnerManaged: false,
      createdById: null
    }
  });
}

export async function handleStripeWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") {
        break;
      }

      const walletId = session.metadata?.walletId;
      if (!walletId) {
        break;
      }

      if (session.subscription && stripe) {
        const subscription = await stripe.subscriptions.retrieve(String(session.subscription));
        const synced = await syncWalletSubscriptionFromStripeSubscription(subscription, walletId);

        if (synced) {
          await recordAuditEvent({
            actorType: "SYSTEM",
            walletId,
            entityType: "SUBSCRIPTION",
            entityId: synced.id,
            action: "billing.checkout.completed",
            summary: "Stripe checkout completed."
          });
        }
      }

      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const synced = await syncWalletSubscriptionFromStripeSubscription(
        subscription,
        subscription.metadata.walletId
      );

      if (synced) {
        await recordAuditEvent({
          actorType: "SYSTEM",
          walletId: synced.walletId,
          entityType: "SUBSCRIPTION",
          entityId: synced.id,
          action: `stripe.${event.type}`,
          summary: "Wallet subscription synced from Stripe."
        });
      }

      break;
    }
    case "invoice.paid":
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const record = await syncInvoiceRecord(invoice);

      if (record) {
        const subscription = await prisma.walletSubscription.findFirst({
          where: {
            walletId: record.walletId
          },
          orderBy: {
            createdAt: "desc"
          }
        });

        if (subscription && event.type === "invoice.payment_failed") {
          await prisma.walletSubscription.update({
            where: { id: subscription.id },
            data: {
              status: "PAST_DUE"
            }
          });

          const ownerMembership = await prisma.walletMembership.findFirst({
            where: {
              walletId: record.walletId,
              isPrimaryOwner: true,
              status: "ACTIVE"
            }
          });

          if (ownerMembership) {
            await createInAppNotification({
              userId: ownerMembership.userId,
              walletId: record.walletId,
              type: "BILLING",
              subject: "Payment needs attention",
              body: "Your RAEYL subscription payment did not go through. Review billing to keep everything current.",
              ctaUrl: `/app/wallets/${record.walletId}/billing`
            });
          }
        }

        await recordAuditEvent({
          actorType: "SYSTEM",
          walletId: record.walletId,
          entityType: "BILLING",
          entityId: record.id,
          action: `stripe.${event.type}`,
          summary:
            event.type === "invoice.paid"
              ? "RAEYL invoice recorded."
              : "RAEYL invoice payment failed."
        });
      }

      break;
    }
    default:
      break;
  }
}

export function getBillingConfigurationSummary(planTier?: string | null) {
  const config = getStripeConfigStatus(planTier);

  if (config.enabled) {
    return {
      stripeReady: true,
      reason: null,
      planKey: config.planKey
    };
  }

  return {
    stripeReady: false,
    reason: config.reason ?? "unknown",
    planKey: config.planKey ?? normalizePlanKey(planTier)
  };
}
