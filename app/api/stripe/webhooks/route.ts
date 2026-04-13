import Stripe from "stripe";

import { log } from "@/lib/logging";
import { handleStripeWebhookEvent } from "@/lib/services/billing-service";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20"
    })
  : null;

export async function POST(request: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Stripe is not configured.", { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing signature.", { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    log("info", "stripe.webhook.received", {
      action: event.type,
      metadata: {
        eventId: event.id
      }
    });

    await handleStripeWebhookEvent(event);

    return Response.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown webhook error.";

    log("error", "stripe.webhook.failed", {
      metadata: { message }
    });

    return new Response(message, { status: 400 });
  }
}
