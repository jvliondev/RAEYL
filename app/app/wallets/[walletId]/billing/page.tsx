import {
  createBillingRecord,
  deleteBillingRecord,
  openBillingPortal,
  startSubscriptionCheckout,
  updateBillingRecord
} from "@/lib/actions/wallets";
import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { hasCapability } from "@/lib/auth/permissions";
import { requireSession } from "@/lib/auth/access";
import { getWalletBillingData } from "@/lib/data/wallets";
import { formatCurrency, formatDate } from "@/lib/utils";

function billingMessage(
  searchParams: Record<string, string | string[] | undefined>
) {
  const checkout = typeof searchParams.checkout === "string" ? searchParams.checkout : null;
  const portal = typeof searchParams.portal === "string" ? searchParams.portal : null;
  const record = typeof searchParams.record === "string" ? searchParams.record : null;
  const reason = typeof searchParams.reason === "string" ? searchParams.reason : null;

  if (checkout === "success") {
    return "Your subscription checkout completed. Billing updates will appear here as Stripe confirms them.";
  }

  if (checkout === "cancelled") {
    return "Checkout was canceled. Nothing changed.";
  }

  if (checkout === "config-required" || portal === "config-required") {
    if (reason === "missing-price-id") {
      return "Stripe is connected, but this plan does not have a price configured yet.";
    }

    if (reason === "missing-customer") {
      return "Billing portal is not ready yet because no Stripe customer record has been created for this wallet.";
    }

    return "Billing checkout is not fully configured yet. Add the Stripe keys and plan price IDs to finish setup.";
  }

  if (record === "created") {
    return "The website cost was added.";
  }

  if (record === "updated") {
    return "The website cost was updated.";
  }

  if (record === "deleted") {
    return "The website cost was removed.";
  }

  return null;
}

export default async function BillingPage({
  params,
  searchParams
}: {
  params: Promise<{ walletId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { walletId } = await params;
  const resolvedSearchParams = await searchParams;
  const session = await requireSession();
  const {
    walletContext,
    totalMonthlyEstimate,
    records,
    providers,
    subscription,
    invoiceHistory,
    billingConfig
  } = await getWalletBillingData(walletId, session.user.id);
  const canManageBilling = walletContext.role
    ? hasCapability(walletContext.role, "billing.write")
    : false;
  const statusMessage = billingMessage(resolvedSearchParams);
  const formError = typeof resolvedSearchParams.formError === "string" ? resolvedSearchParams.formError : null;

  return (
    <AppShell
      title="Billing and website costs"
      description="See what your website costs, when each bill renews, and where each payment is managed."
      walletContext={walletContext}
    >
      <div className="space-y-6">
        {formError && (
          <Card>
            <CardContent className="py-4 text-sm text-destructive">{formError}</CardContent>
          </Card>
        )}
        {statusMessage ? (
          <Card>
            <CardContent className="py-4 text-sm text-muted">{statusMessage}</CardContent>
          </Card>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Billing summary</CardTitle>
                <CardDescription>
                  A clear monthly estimate across RAEYL and the website services tracked in this wallet.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-4xl font-semibold">{formatCurrency(totalMonthlyEstimate)}</div>
              <div className="grid gap-3">
                {records.length ? (
                  records.map((record) => (
                    <div key={record.id} className="rounded-md border border-white/10 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="font-medium">{record.label}</div>
                          <div className="text-sm text-muted">{record.description}</div>
                          <div className="mt-2 text-xs text-muted">
                            {record.cadence}
                            {record.renewalDate ? ` · Next date ${formatDate(record.renewalDate)}` : ""}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(record.amount, record.currency)}</div>
                          <div className="text-xs text-muted">
                            {record.monthlyEquivalent > 0
                              ? `${formatCurrency(record.monthlyEquivalent, record.currency)} monthly view`
                              : "One-time charge"}
                          </div>
                        </div>
                      </div>
                      {(record.billingUrl || record.invoiceUrl) ? (
                        <div className="mt-3 flex flex-wrap gap-3 text-sm">
                          {record.billingUrl ? (
                            <a href={record.billingUrl} className="text-primary">
                              Open billing link
                            </a>
                          ) : null}
                          {record.invoiceUrl ? (
                            <a href={record.invoiceUrl} className="text-primary">
                              Open invoice
                            </a>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title="No website costs recorded yet"
                    description="Add the first tracked cost so the owner can see a complete website spend view."
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>RAEYL subscription</CardTitle>
                  <CardDescription>
                    Manage the RAEYL plan for this wallet and keep payment details current.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-md border border-white/10 p-4 text-sm text-muted">
                  <div className="font-medium text-foreground">
                    {subscription?.planKey ?? billingConfig.planKey} plan
                  </div>
                  <div>{subscription?.status ?? "Not started yet"}</div>
                  {subscription?.currentPeriodEnd ? (
                    <div className="mt-1">Current period ends {formatDate(subscription.currentPeriodEnd)}</div>
                  ) : null}
                </div>
                {!billingConfig.stripeReady ? (
                  <div className="rounded-md border border-warning/20 bg-warning/10 p-4 text-sm text-warning">
                    Stripe setup still needs configuration before live checkout can run.
                  </div>
                ) : null}
                {canManageBilling ? (
                  <>
                    <form action={startSubscriptionCheckout}>
                      <input type="hidden" name="walletId" value={walletContext.id} />
                      <SubmitButton className="w-full" pendingLabel="Opening checkout...">
                        Start or update subscription
                      </SubmitButton>
                    </form>
                    <form action={openBillingPortal}>
                      <input type="hidden" name="walletId" value={walletContext.id} />
                      <SubmitButton className="w-full" variant="secondary" pendingLabel="Opening billing page...">
                        Open billing portal
                      </SubmitButton>
                    </form>
                  </>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invoice history</CardTitle>
                <CardDescription>
                  Past RAEYL invoices appear here as Stripe events are received.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {invoiceHistory.length ? (
                  invoiceHistory.map((record) => (
                    <div key={record.id} className="rounded-md border border-white/10 p-4 text-sm">
                      <div className="font-medium">{record.label}</div>
                      <div className="text-muted">
                        {formatCurrency(record.amount, record.currency)}
                        {record.renewalDate ? ` · ${formatDate(record.renewalDate)}` : ""}
                      </div>
                      {record.invoiceUrl ? (
                        <a href={record.invoiceUrl} className="mt-2 inline-block text-primary">
                          Open invoice
                        </a>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title="No invoice history yet"
                    description="Once Stripe posts invoice events for this wallet, they will appear here."
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <CardHeader>
              <CardTitle>Renewal timeline</CardTitle>
              <CardDescription>
                Keep annual renewals visible so nothing important sneaks up on the owner.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {records.filter((record) => record.renewalDate).length ? (
                records
                  .filter((record) => record.renewalDate)
                  .slice(0, 6)
                  .map((record) => (
                    <div key={record.id} className="rounded-md border border-white/10 p-4 text-sm">
                      <div className="font-medium">{record.label}</div>
                      <div className="text-muted">
                        {record.cadence} renewal · {formatDate(record.renewalDate!)}
                      </div>
                    </div>
                  ))
              ) : (
                <EmptyState
                  title="No renewals scheduled yet"
                  description="Renewal reminders appear once website costs include billing dates."
                />
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            {canManageBilling ? (
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Add website cost</CardTitle>
                    <CardDescription>
                      Track provider and manual costs so the owner sees the full website picture.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <form action={createBillingRecord} className="grid gap-4 md:grid-cols-2">
                    <input type="hidden" name="walletId" value={walletContext.id} />
                    <input type="hidden" name="status" value="ACTIVE" />
                    <input type="hidden" name="currency" value="USD" />
                    <input type="hidden" name="isOwnerManaged" value="true" />
                    <FormField label="Cost type">
                      <Select name="sourceType" defaultValue="PROVIDER_COST">
                        <option value="PROVIDER_COST">Connected service</option>
                        <option value="MANUAL_ADJUSTMENT">Manual website cost</option>
                      </Select>
                    </FormField>
                    <FormField label="Connected tool">
                      <Select name="providerConnectionId" defaultValue="">
                        <option value="">General website cost</option>
                        {providers.map((provider) => (
                          <option key={provider.id} value={provider.id}>
                            {provider.label}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                    <FormField label="Label">
                      <Input name="label" placeholder="Domain renewal" required />
                    </FormField>
                    <FormField label="Amount">
                      <Input name="amount" type="number" min="0" step="0.01" required />
                    </FormField>
                    <FormField label="Billing cadence">
                      <Select name="cadence" defaultValue="MONTHLY">
                        <option value="MONTHLY">Monthly</option>
                        <option value="QUARTERLY">Quarterly</option>
                        <option value="ANNUAL">Annual</option>
                        <option value="ONE_TIME">One time</option>
                        <option value="USAGE_BASED">Usage based</option>
                      </Select>
                    </FormField>
                    <FormField label="Renewal date">
                      <Input name="renewalDate" type="date" />
                    </FormField>
                    <FormField label="Billing link" className="md:col-span-2">
                      <Input name="billingUrl" placeholder="https://dashboard.provider.com/billing" />
                    </FormField>
                    <FormField label="Description" className="md:col-span-2">
                      <Input
                        name="description"
                        placeholder="What this cost is for, in simple owner-friendly language."
                      />
                    </FormField>
                    <div className="md:col-span-2">
                      <SubmitButton className="w-full">Save website cost</SubmitButton>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : null}

            <Card>
              <CardHeader>
                <CardTitle>Managed cost records</CardTitle>
                <CardDescription>
                  Update owner-managed costs, links, and renewal dates without touching provider billing systems.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {records.filter((record) => record.isOwnerManaged).length ? (
                  records
                    .filter((record) => record.isOwnerManaged)
                    .map((record) => (
                      <div key={record.id} className="rounded-md border border-white/10 p-4">
                        <form action={updateBillingRecord} className="grid gap-4 md:grid-cols-2">
                          <input type="hidden" name="id" value={record.id} />
                          <input type="hidden" name="walletId" value={walletContext.id} />
                          <input type="hidden" name="status" value="ACTIVE" />
                          <input type="hidden" name="currency" value={record.currency} />
                          <input type="hidden" name="isOwnerManaged" value="true" />
                          <FormField label="Cost type">
                            <Select name="sourceType" defaultValue={record.sourceType}>
                              <option value="PROVIDER_COST">Connected service</option>
                              <option value="MANUAL_ADJUSTMENT">Manual website cost</option>
                            </Select>
                          </FormField>
                          <FormField label="Connected tool">
                            <Select name="providerConnectionId" defaultValue={record.providerConnectionId ?? ""}>
                              <option value="">General website cost</option>
                              {providers.map((provider) => (
                                <option key={provider.id} value={provider.id}>
                                  {provider.label}
                                </option>
                              ))}
                            </Select>
                          </FormField>
                          <FormField label="Label">
                            <Input name="label" defaultValue={record.label} required />
                          </FormField>
                          <FormField label="Amount">
                            <Input name="amount" type="number" min="0" step="0.01" defaultValue={record.amount} required />
                          </FormField>
                          <FormField label="Billing cadence">
                            <Select name="cadence" defaultValue={record.cadence.toUpperCase().replace(" ", "_")}>
                              <option value="MONTHLY">Monthly</option>
                              <option value="QUARTERLY">Quarterly</option>
                              <option value="ANNUAL">Annual</option>
                              <option value="ONE_TIME">One time</option>
                              <option value="USAGE_BASED">Usage based</option>
                            </Select>
                          </FormField>
                          <FormField label="Renewal date">
                            <Input
                              name="renewalDate"
                              type="date"
                              defaultValue={record.renewalDate ? record.renewalDate.slice(0, 10) : ""}
                            />
                          </FormField>
                          <FormField label="Billing link" className="md:col-span-2">
                            <Input name="billingUrl" defaultValue={record.billingUrl ?? ""} />
                          </FormField>
                          <FormField label="Invoice link" className="md:col-span-2">
                            <Input name="invoiceUrl" defaultValue={record.invoiceUrl ?? ""} />
                          </FormField>
                          <FormField label="Reference" className="md:col-span-2">
                            <Input name="providerReference" defaultValue={record.providerReference ?? ""} />
                          </FormField>
                          <FormField label="Description" className="md:col-span-2">
                            <Input name="description" defaultValue={record.description} />
                          </FormField>
                          {canManageBilling ? (
                            <div className="md:col-span-2">
                              <SubmitButton pendingLabel="Saving...">Save changes</SubmitButton>
                            </div>
                          ) : null}
                        </form>
                        {canManageBilling ? (
                          <form action={deleteBillingRecord} className="mt-3">
                            <input type="hidden" name="id" value={record.id} />
                            <input type="hidden" name="walletId" value={walletContext.id} />
                            <SubmitButton variant="secondary" pendingLabel="Removing...">
                              Remove cost
                            </SubmitButton>
                          </form>
                        ) : null}
                      </div>
                    ))
                ) : (
                  <EmptyState
                    title="No owner-managed costs yet"
                    description="Provider and manual costs you add here can be updated and removed over time."
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
