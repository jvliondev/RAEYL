import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createProviderConnection, startProviderOAuth } from "@/lib/actions/wallets";
import { requireSession } from "@/lib/auth/access";
import { getWalletFormData } from "@/lib/data/wallets";
import { CATEGORY_LABELS, PROVIDER_CATALOG, getTemplateBySlug } from "@/lib/data/provider-catalog";
import { TokenDiscoveryConnectionFields } from "@/components/app/token-discovery-connection-fields";
import { getProviderAdapter } from "@/lib/providers/registry";
import { getProviderOAuthReadiness } from "@/lib/providers/oauth";
import { getProviderFrameworkProfile } from "@/lib/services/provider-framework";
import { getProviderMagicConnectProfile } from "@/lib/services/provider-connect-broker";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";

export default async function NewProviderPage({
  params,
  searchParams
}: {
  params: Promise<{ walletId: string }>;
  searchParams: Promise<{ websiteId?: string; template?: string; formError?: string; returnTo?: string; providerId?: string; setupChain?: string }>;
}) {
  const { walletId } = await params;
  const { websiteId, template: templateSlug, formError, returnTo, providerId, setupChain } = await searchParams;
  const session = await requireSession();
  const { walletContext, websites, providerDraft } = await getWalletFormData(walletId, session.user.id, providerId);

  const selectedTemplate = templateSlug ? getTemplateBySlug(templateSlug) : undefined;
  const providerProfile = selectedTemplate
    ? getProviderFrameworkProfile({ slug: selectedTemplate.slug, providerName: selectedTemplate.displayName })
    : null;
  const adapter = selectedTemplate ? getProviderAdapter(selectedTemplate.slug) : null;
  const adapterCapabilities = adapter?.getCapabilities() ?? [];
  const authStrategy = adapter?.getAuthStrategy() ?? null;
  const oauthReadiness = selectedTemplate
    ? getProviderOAuthReadiness(
        selectedTemplate.slug,
        process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? process.env.APP_URL ?? null
      )
    : null;
  const supportsOAuth = Boolean(adapter?.getOAuthConfig?.());
  const magicConnectProfile = selectedTemplate ? getProviderMagicConnectProfile(selectedTemplate.slug) : null;
  const usesMagicDiscovery = magicConnectProfile?.mode === "token_discovery";
  const inSetupChain = setupChain === "1";
  const grouped: Record<string, typeof PROVIDER_CATALOG> = {};

  for (const template of PROVIDER_CATALOG) {
    if (!grouped[template.category]) {
      grouped[template.category] = [];
    }
    grouped[template.category].push(template);
  }

  return (
    <AppShell
      title={selectedTemplate ? `Connect ${selectedTemplate.displayName}` : "Connect a tool"}
      description={
        selectedTemplate
          ? providerDraft
            ? `Repair or refresh ${selectedTemplate.displayName} for this wallet.`
            : inSetupChain
              ? `Connect ${selectedTemplate.displayName} and let RAEYL carry you to the next setup step.`
              : `Set up ${selectedTemplate.displayName} for this wallet.`
          : "Choose from the catalog or add any custom tool."
      }
      walletContext={walletContext}
    >
      <div className="mb-6">
        <Link
          href={
            returnTo && returnTo.startsWith(`/app/wallets/${walletId}`)
              ? returnTo
              : inSetupChain
                ? `/app/wallets/${walletContext.id}/setup`
                : `/app/wallets/${walletContext.id}/providers`
          }
          className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to connected tools
        </Link>
      </div>
      {!selectedTemplate ? (
        <div className="space-y-8">
          <div className="grid gap-6">
            {Object.entries(grouped).map(([category, templates]) => (
              <div key={category}>
                <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
                  {CATEGORY_LABELS[category] ?? category}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {templates.map((template) => (
                    <a
                      key={template.slug}
                      href={`/app/wallets/${walletId}/providers/new?template=${template.slug}${websiteId ? `&websiteId=${websiteId}` : ""}${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ""}${inSetupChain ? "&setupChain=1" : ""}`}
                      className="flex cursor-pointer flex-col gap-1 rounded-md border border-white/10 p-4 transition-all hover:border-white/20 hover:bg-white/5"
                    >
                      <div className="text-sm font-medium">{template.displayName}</div>
                      <div className="line-clamp-2 text-xs text-muted">{template.defaultOwnerLabel}</div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Custom</div>
            <a
              href={`/app/wallets/${walletId}/providers/new?template=custom${websiteId ? `&websiteId=${websiteId}` : ""}${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ""}${inSetupChain ? "&setupChain=1" : ""}`}
              className="flex max-w-sm cursor-pointer flex-col gap-1 rounded-md border border-white/10 p-4 transition-all hover:border-white/20 hover:bg-white/5"
            >
              <div className="text-sm font-medium">Custom tool</div>
              <div className="text-xs text-muted">Add any tool not in the catalog above.</div>
            </a>
          </div>
        </div>
      ) : (
        <form action={createProviderConnection} className="grid gap-6 xl:grid-cols-[1fr_320px]">
          {formError ? <p className="md:col-span-2 text-sm text-destructive">{formError}</p> : null}
          <input type="hidden" name="walletId" value={walletContext.id} />
          {selectedTemplate.slug !== "custom" ? (
            <input type="hidden" name="providerTemplateSlug" value={selectedTemplate.slug} />
          ) : null}
          {providerDraft ? <input type="hidden" name="providerId" value={providerDraft.id} /> : null}
          {returnTo && returnTo.startsWith(`/app/wallets/${walletId}`) ? (
            <input type="hidden" name="returnTo" value={returnTo} />
          ) : null}
          {inSetupChain ? <input type="hidden" name="setupChain" value="1" /> : null}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Connection details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <FormField label="Category">
                  <Select name="category" defaultValue={selectedTemplate.category ?? "CUSTOM"}>
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Connection method">
                  <Select
                    name="connectionMethod"
                    defaultValue={providerDraft?.connectionMethod ?? selectedTemplate.defaultConnectionMethod ?? "MANUAL"}
                  >
                    <option value="MANUAL">Manual record</option>
                    <option value="API_TOKEN">API token</option>
                    <option value="SECURE_LINK">Secure link</option>
                    <option value="OAUTH" disabled={!supportsOAuth}>
                      OAuth
                    </option>
                  </Select>
                </FormField>
                <FormField label="Provider name">
                  <Input
                    name="providerName"
                    required
                    defaultValue={providerDraft?.providerName ?? (selectedTemplate.displayName !== "Custom tool" ? selectedTemplate.displayName : "")}
                    placeholder="e.g. Vercel"
                  />
                </FormField>
                <FormField label="Display label">
                  <Input
                    name="displayLabel"
                    defaultValue={providerDraft?.displayLabel ?? selectedTemplate.defaultOwnerLabel ?? ""}
                    placeholder="e.g. Website hosting"
                  />
                </FormField>
                {!usesMagicDiscovery ? (
                  <>
                    <FormField label="Connected account label">
                      <Input
                        name="connectedAccountLabel"
                        defaultValue={providerDraft?.connectedAccountLabel ?? ""}
                        placeholder="e.g. acme-corp project"
                      />
                    </FormField>
                    <FormField label="External project ID or name">
                      <Input
                        name="externalProjectId"
                        defaultValue={providerDraft?.externalProjectId ?? ""}
                        placeholder="Optional: lock this wallet to one project"
                      />
                    </FormField>
                    <FormField label="External team ID or slug">
                      <Input
                        name="externalTeamId"
                        defaultValue={providerDraft?.externalTeamId ?? ""}
                        placeholder="Optional: select the correct team or workspace"
                      />
                    </FormField>
                  </>
                ) : null}
                <FormField label="Website link">
                  <Select name="websiteId" defaultValue={providerDraft?.websiteId ?? websiteId ?? websites[0]?.id ?? ""}>
                    {websites.length ? (
                      websites.map((website) => (
                        <option key={website.id} value={website.id}>
                          {website.name}
                        </option>
                      ))
                    ) : (
                      <option value="">No website added yet</option>
                    )}
                  </Select>
                </FormField>
                {!usesMagicDiscovery ? (
                  <FormField label="Dashboard URL">
                    <Input
                      name="dashboardUrl"
                      defaultValue={providerDraft?.dashboardUrl ?? selectedTemplate.dashboardUrlPattern ?? ""}
                      placeholder="https://dashboard.provider.com"
                    />
                  </FormField>
                ) : null}
                <FormField label="Edit URL">
                  <Input
                    name="editUrl"
                    defaultValue={providerDraft?.editUrl ?? ""}
                    placeholder="https://editor.provider.com"
                  />
                </FormField>
                {!usesMagicDiscovery ? (
                  <FormField label="Billing URL">
                    <Input
                      name="billingUrl"
                      defaultValue={providerDraft?.billingUrl ?? selectedTemplate.billingUrlPattern ?? ""}
                      placeholder="https://dashboard.provider.com/billing"
                    />
                  </FormField>
                ) : null}
                <FormField label="Support URL">
                  <Input
                    name="supportUrl"
                    defaultValue={providerDraft?.supportUrl ?? selectedTemplate.supportUrl ?? ""}
                    placeholder="https://support.provider.com"
                  />
                </FormField>
                <FormField label="Owner-facing description" className="md:col-span-2">
                  <Textarea
                    name="ownerDescription"
                    defaultValue={providerDraft?.ownerDescription ?? selectedTemplate.defaultDescription ?? ""}
                    placeholder="Explain what this tool does in plain language for the owner."
                    rows={3}
                  />
                </FormField>
                {magicConnectProfile ? (
                  <TokenDiscoveryConnectionFields
                    walletId={walletContext.id}
                    profile={magicConnectProfile}
                    initialDashboardUrl={providerDraft?.dashboardUrl ?? selectedTemplate.dashboardUrlPattern}
                    initialBillingUrl={providerDraft?.billingUrl ?? selectedTemplate.billingUrlPattern}
                  />
                ) : (
                  <FormField
                    label="API token"
                    hint="Used when connection method is API token. Stored encrypted and never shown in full."
                    className="md:col-span-2"
                  >
                    <Input name="apiToken" type="password" placeholder="Paste provider API token" />
                  </FormField>
                )}
                <FormField
                  label="Secure credential or access code"
                  hint="Used when connection method is Secure link. Stored encrypted."
                  className="md:col-span-2"
                >
                  <Input
                    name="secureCredential"
                    type="password"
                    placeholder="Paste secure credential or shared access code"
                  />
                </FormField>
                <div className="md:col-span-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-muted">
                  <div className="font-medium text-foreground">Connection behavior</div>
                  <ul className="mt-2 space-y-1">
                    <li>Manual record: saves links and notes only.</li>
                    <li>
                      API token: stores the token securely and discovers the right account or project for supported
                      providers.
                    </li>
                    <li>OAuth: sends you through the provider approval screen and returns with the account attached.</li>
                    <li>Secure link: stores an access credential securely alongside the dashboard links.</li>
                  </ul>
                </div>
                {supportsOAuth ? (
                  <div className="md:col-span-2 rounded-xl border border-primary/20 bg-primary/[0.05] p-4 text-sm text-muted">
                    <div className="font-medium text-foreground">One-click provider authorization</div>
                    <p className="mt-2">
                      Let RAEYL open {selectedTemplate.displayName}, ask for approval, and return with the verified
                      account already attached to this wallet.
                    </p>
                    {oauthReadiness?.enabled ? (
                      <SubmitButton
                        formAction={startProviderOAuth}
                        variant="secondary"
                        className="mt-4"
                        pendingLabel="Redirecting..."
                      >
                        {providerDraft ? `Reconnect ${selectedTemplate.displayName} with OAuth` : `Connect ${selectedTemplate.displayName} with OAuth`}
                      </SubmitButton>
                    ) : (
                      <div className="mt-3 space-y-2 text-xs text-warning">
                        <p>
                          OAuth is supported here, but this app still needs provider credentials before the live
                          approval screen can open.
                        </p>
                        {oauthReadiness?.missingKeys?.length ? (
                          <div className="rounded-md border border-warning/20 bg-warning/5 p-3">
                            <div className="font-medium text-foreground">Missing environment keys</div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {oauthReadiness.missingKeys.map((key) => (
                                <span key={key} className="rounded-md border border-white/10 px-2 py-1 text-xs text-foreground">
                                  {key}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : null}
                        {oauthReadiness?.callbackUrl ? (
                          <div className="rounded-md border border-white/10 bg-white/[0.03] p-3 text-muted">
                            Register this callback URL with the provider app:
                            <div className="mt-2 break-all text-foreground">{oauthReadiness.callbackUrl}</div>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : null}
                {providerProfile ? (
                  <div className="md:col-span-2 rounded-xl border border-primary/20 bg-primary/[0.05] p-4 text-sm text-muted">
                    <div className="font-medium text-foreground">Best connection for this tool</div>
                    <p className="mt-2">
                      {providerProfile.bestConnectionMethod === "API_TOKEN"
                        ? "Use an API token when possible."
                        : providerProfile.bestConnectionMethod === "OAUTH"
                          ? "OAuth is the cleanest connection path for this tool."
                          : "A manual record is the best fallback for this tool today."}
                    </p>
                    <p className="mt-2">{providerProfile.autoImportLabel}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-md border border-white/10 px-2 py-1">
                        Live verification {providerProfile.supportsLiveVerification ? "available" : "limited"}
                      </span>
                      <span className="rounded-md border border-white/10 px-2 py-1">
                        Health checks {providerProfile.supportsHealthChecks ? "available" : "planned"}
                      </span>
                      <span className="rounded-md border border-white/10 px-2 py-1">
                        Edit routing {providerProfile.supportsEditRouting ? "supported" : "optional"}
                      </span>
                    </div>
                  </div>
                ) : null}
                {adapter && authStrategy ? (
                  <div className="md:col-span-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-muted">
                    <div className="font-medium text-foreground">What RAEYL will do</div>
                    <p className="mt-2">{authStrategy.description}</p>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-widest text-muted">Auth strategy</div>
                        <div className="mt-2 text-foreground">{authStrategy.title}</div>
                        <p className="mt-1 text-xs text-muted">{authStrategy.securityNote}</p>
                      </div>
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-widest text-muted">Capabilities</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {adapterCapabilities.map((capability) => (
                            <span key={capability} className="rounded-md border border-white/10 px-2 py-1 text-xs">
                              {capability}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Billing and notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Monthly cost estimate">
                <Input
                  name="monthlyCostEstimate"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={
                    providerDraft?.monthlyCostEstimate && providerDraft.monthlyCostEstimate > 0
                      ? String(providerDraft.monthlyCostEstimate)
                      : ""
                  }
                  placeholder="84"
                />
              </FormField>
              <FormField label="Renewal date">
                <Input name="renewalDate" type="date" defaultValue={providerDraft?.renewalDate ?? ""} />
              </FormField>
              <FormField label="Notes">
                <Textarea
                  name="notes"
                  defaultValue={providerDraft?.notes ?? ""}
                  placeholder="Technical notes, support ownership, or connection context."
                />
              </FormField>
              <SubmitButton className="w-full">{providerDraft ? "Repair connected tool" : "Save connected tool"}</SubmitButton>
              <a
                href={`/app/wallets/${walletId}/providers/new${websiteId ? `?websiteId=${websiteId}` : ""}${returnTo ? `${websiteId ? "&" : "?"}returnTo=${encodeURIComponent(returnTo)}` : ""}${inSetupChain ? `${websiteId || returnTo ? "&" : "?"}setupChain=1` : ""}`}
                className="mt-2 block text-center text-xs text-muted hover:text-foreground"
              >
                Back to catalog
              </a>
            </CardContent>
          </Card>
        </form>
      )}
    </AppShell>
  );
}
