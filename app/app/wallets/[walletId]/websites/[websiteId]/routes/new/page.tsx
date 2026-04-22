import { createEditRoute } from "@/lib/actions/wallets";
import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { requireSession } from "@/lib/auth/access";
import { getWalletWebsiteDetailData } from "@/lib/data/wallets";

function firstQueryValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function NewEditRoutePage({
  params,
  searchParams
}: {
  params: Promise<{ walletId: string; websiteId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { walletId, websiteId } = await params;
  const sp = await searchParams;
  const formError = typeof sp.formError === "string" ? sp.formError : null;
  const session = await requireSession();
  const { walletContext, website, providers } = await getWalletWebsiteDetailData(
    walletId,
    websiteId,
    session.user.id
  );

  const hasPrimary = website.editRoutes.some((r) => r.isPrimary);
  const defaults = {
    label: firstQueryValue(sp.label).slice(0, 120),
    destinationUrl: firstQueryValue(sp.destinationUrl),
    description: firstQueryValue(sp.description).slice(0, 500),
    providerId: firstQueryValue(sp.providerId),
    contentKey: firstQueryValue(sp.contentKey).slice(0, 120),
    isPrimary: firstQueryValue(sp.isPrimary) === "true"
  };

  return (
    <AppShell
      title="Add an editing path"
      description="Define where the owner goes to make a specific type of change on their website."
      walletContext={walletContext}
    >
      <form action={createEditRoute} className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {formError && <p className="xl:col-span-2 text-sm text-destructive">{formError}</p>}
        <input type="hidden" name="walletId" value={walletId} />
        <input type="hidden" name="websiteId" value={websiteId} />

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Path details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField label="Label" className="md:col-span-2">
                <Input
                  name="label"
                  required
                  placeholder="Edit homepage content"
                  defaultValue={defaults.label}
                />
              </FormField>
              <FormField label="Destination URL" className="md:col-span-2">
                <Input
                  name="destinationUrl"
                  type="url"
                  required
                  placeholder="https://studio.sanity.io/..."
                  defaultValue={defaults.destinationUrl}
                />
              </FormField>
              <FormField label="Description" className="md:col-span-2">
                <Textarea
                  name="description"
                  placeholder="Explain what the owner can do here in plain language. E.g. Update text, images, or services on the homepage."
                  defaultValue={defaults.description}
                />
              </FormField>
              <FormField label="Linked tool (optional)">
                <Select name="providerId" defaultValue={defaults.providerId}>
                  <option value="">No linked tool</option>
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label || p.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Content key (optional)">
                <Input name="contentKey" placeholder="homepage" defaultValue={defaults.contentKey} />
              </FormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Visibility</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted">Choose which roles can see this editing path.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { value: "WALLET_OWNER", label: "Owner" },
                  { value: "DEVELOPER", label: "Developer" },
                  { value: "EDITOR", label: "Editor" },
                  { value: "VIEWER", label: "Viewer" },
                  { value: "BILLING_MANAGER", label: "Billing manager" },
                  { value: "SUPPORT", label: "Support" }
                ].map(({ value, label }) => (
                  <label key={value} className="flex cursor-pointer items-center gap-3 rounded-md border border-white/10 p-3 text-sm">
                    <input
                      type="checkbox"
                      name="visibleToRoles"
                      value={value}
                      defaultChecked={value === "WALLET_OWNER" || value === "DEVELOPER"}
                      className="h-4 w-4 rounded"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Sort order">
                <Input name="sortOrder" type="number" min="0" defaultValue="0" />
              </FormField>
              <label className="flex cursor-pointer items-start gap-3 rounded-md border border-white/10 p-4">
                <input
                  type="checkbox"
                  name="isPrimary"
                  value="true"
                  defaultChecked={defaults.isPrimary || !hasPrimary}
                  className="mt-0.5 h-4 w-4 rounded"
                />
                <div>
                  <div className="text-sm font-medium">Primary editing path</div>
                  <div className="text-xs text-muted">
                    This is the main &ldquo;Edit website&rdquo; button the owner sees.
                    {hasPrimary && (
                      <span className="ml-1 text-warning">One path is already set as primary.</span>
                    )}
                  </div>
                </div>
              </label>
              <SubmitButton className="w-full" pendingLabel="Saving...">
                Save editing path
              </SubmitButton>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Website</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted space-y-1">
              <div><span className="text-foreground">Site:</span> {website.name}</div>
              <div><span className="text-foreground">Domain:</span> {website.primaryDomain}</div>
              <div>
                <span className="text-foreground">Existing paths:</span>{" "}
                {website.editRoutes.length === 0 ? "None yet" : (
                  <span className="space-x-1">
                    {website.editRoutes.map((r) => (
                      <Badge key={r.id} variant={r.isPrimary ? "accent" : "neutral"}>
                        {r.label}
                      </Badge>
                    ))}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </AppShell>
  );
}
