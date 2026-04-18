import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createProviderConnection } from "@/lib/actions/wallets";
import { requireSession } from "@/lib/auth/access";
import { getWalletFormData } from "@/lib/data/wallets";
import { CATEGORY_LABELS, PROVIDER_CATALOG, getTemplateBySlug } from "@/lib/data/provider-catalog";
import { getProviderFrameworkProfile } from "@/lib/services/provider-framework";
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
  searchParams: Promise<{ websiteId?: string; template?: string; formError?: string }>;
}) {
  const { walletId } = await params;
  const { websiteId, template: templateSlug, formError } = await searchParams;
  const session = await requireSession();
  const { walletContext, websites } = await getWalletFormData(walletId, session.user.id);

  const selectedTemplate = templateSlug ? getTemplateBySlug(templateSlug) : undefined;
  const providerProfile = selectedTemplate
    ? getProviderFrameworkProfile({ slug: selectedTemplate.slug, providerName: selectedTemplate.displayName })
    : null;
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
          ? `Set up ${selectedTemplate.displayName} for this wallet.`
          : "Choose from the catalog or add any custom tool."
      }
      walletContext={walletContext}
    >
      <div className="mb-6">
        <Link
          href={`/app/wallets/${walletContext.id}/providers`}
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
                      href={`/app/wallets/${walletId}/providers/new?template=${template.slug}${websiteId ? `&websiteId=${websiteId}` : ""}`}
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
              href={`/app/wallets/${walletId}/providers/new?template=custom${websiteId ? `&websiteId=${websiteId}` : ""}`}
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
                  <Select name="connectionMethod" defaultValue={selectedTemplate.defaultConnectionMethod ?? "MANUAL"}>
                    <option value="MANUAL">Manual record</option>
                    <option value="OAUTH">OAuth</option>
                    <option value="API_TOKEN">API token</option>
                    <option value="SECURE_LINK">Secure link</option>
                  </Select>
                </FormField>
                <FormField label="Provider name">
                  <Input
                    name="providerName"
                    required
                    defaultValue={selectedTemplate.displayName !== "Custom tool" ? selectedTemplate.displayName : ""}
                    placeholder="e.g. Vercel"
                  />
                </FormField>
                <FormField label="Display label">
                  <Input
                    name="displayLabel"
                    defaultValue={selectedTemplate.defaultOwnerLabel ?? ""}
                    placeholder="e.g. Website hosting"
                  />
                </FormField>
                <FormField label="Connected account label">
                  <Input name="connectedAccountLabel" placeholder="e.g. acme-corp project" />
                </FormField>
                <FormField label="External project ID or name">
                  <Input name="externalProjectId" placeholder="Optional: lock this wallet to one project" />
                </FormField>
                <FormField label="External team ID or slug">
                  <Input name="externalTeamId" placeholder="Optional: select the correct team or workspace" />
                </FormField>
                <FormField label="Website link">
                  <Select name="websiteId" defaultValue={websiteId ?? websites[0]?.id ?? ""}>
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
                <FormField label="Dashboard URL">
                  <Input
                    name="dashboardUrl"
                    defaultValue={selectedTemplate.dashboardUrlPattern ?? ""}
                    placeholder="https://dashboard.provider.com"
                  />
                </FormField>
                <FormField label="Edit URL">
                  <Input name="editUrl" placeholder="https://editor.provider.com" />
                </FormField>
                <FormField label="Billing URL">
                  <Input
                    name="billingUrl"
                    defaultValue={selectedTemplate.billingUrlPattern ?? ""}
                    placeholder="https://dashboard.provider.com/billing"
                  />
                </FormField>
                <FormField label="Support URL">
                  <Input
                    name="supportUrl"
                    defaultValue={selectedTemplate.supportUrl ?? ""}
                    placeholder="https://support.provider.com"
                  />
                </FormField>
                <FormField label="Owner-facing description" className="md:col-span-2">
                  <Textarea
                    name="ownerDescription"
                    defaultValue={selectedTemplate.defaultDescription ?? ""}
                    placeholder="Explain what this tool does in plain language for the owner."
                    rows={3}
                  />
                </FormField>
                <FormField
                  label="API token"
                  hint={
                    selectedTemplate.slug === "vercel"
                      ? "For Vercel, paste a personal token and RAEYL will verify the account and look for projects automatically."
                      : "Used when connection method is API token. Stored encrypted and never shown in full."
                  }
                  className="md:col-span-2"
                >
                  <Input name="apiToken" type="password" placeholder="Paste provider API token" />
                </FormField>
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
                <div className="md:col-span-2 rounded-md border border-white/10 bg-white/[0.03] p-4 text-sm text-muted">
                  <div className="font-medium text-foreground">Connection behavior</div>
                  <ul className="mt-2 space-y-1">
                    <li>Manual record: saves links and notes only.</li>
                    <li>API token: stores the token securely and verifies supported providers like Vercel.</li>
                    <li>OAuth: framework ready, provider-specific authorization flows still being added.</li>
                    <li>Secure link: stores an access credential securely alongside the dashboard links.</li>
                  </ul>
                </div>
                {providerProfile ? (
                  <div className="md:col-span-2 rounded-md border border-primary/20 bg-primary/5 p-4 text-sm text-muted">
                    <div className="font-medium text-foreground">Best connection for this tool</div>
                    <p className="mt-2">
                      {providerProfile.bestConnectionMethod === "API_TOKEN"
                        ? "Use an API token when possible."
                        : providerProfile.bestConnectionMethod === "OAUTH"
                          ? "OAuth will become the cleanest connection path for this tool."
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
              </CardContent>
            </Card>
          </div>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Billing and notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Monthly cost estimate">
                <Input name="monthlyCostEstimate" type="number" min="0" step="1" placeholder="84" />
              </FormField>
              <FormField label="Renewal date">
                <Input name="renewalDate" type="date" />
              </FormField>
              <FormField label="Notes">
                <Textarea name="notes" placeholder="Technical notes, support ownership, or connection context." />
              </FormField>
              <SubmitButton className="w-full">Save connected tool</SubmitButton>
              <a
                href={`/app/wallets/${walletId}/providers/new${websiteId ? `?websiteId=${websiteId}` : ""}`}
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
