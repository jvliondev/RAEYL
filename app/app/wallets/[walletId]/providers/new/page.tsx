import { createProviderConnection } from "@/lib/actions/wallets";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { requireSession } from "@/lib/auth/access";
import { getWalletFormData } from "@/lib/data/wallets";

export default async function NewProviderPage({
  params
}: {
  params: Promise<{ walletId: string }>;
}) {
  const { walletId } = await params;
  const session = await requireSession();
  const { walletContext, websites } = await getWalletFormData(walletId, session.user.id);

  return (
    <AppShell
      title="Connect website tool"
      description="Add a connected tool with the right owner explanation, action links, and billing context."
      walletContext={walletContext}
    >
      <form action={createProviderConnection} className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <input type="hidden" name="walletId" value={walletContext.id} />
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connection details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField label="Category">
                <Select name="category" defaultValue="CMS">
                  <option value="HOSTING">Hosting</option>
                  <option value="DATABASE">Database</option>
                  <option value="CMS">CMS / content editing</option>
                  <option value="DOMAIN">Domain</option>
                  <option value="ANALYTICS">Analytics</option>
                  <option value="PAYMENTS">Payments</option>
                  <option value="SUPPORT">Support</option>
                  <option value="CUSTOM">Custom tool</option>
                </Select>
              </FormField>
              <FormField label="Connection method">
                <Select name="connectionMethod" defaultValue="MANUAL">
                  <option value="MANUAL">Manual record</option>
                  <option value="OAUTH">OAuth</option>
                  <option value="API_TOKEN">API token</option>
                  <option value="SECURE_LINK">Secure link</option>
                </Select>
              </FormField>
              <FormField label="Provider name">
                <Input name="providerName" required placeholder="Builder.io" />
              </FormField>
              <FormField label="Display label">
                <Input name="displayLabel" placeholder="Website content editing" />
              </FormField>
              <FormField label="Connected account label">
                <Input name="connectedAccountLabel" placeholder="Content space" />
              </FormField>
              <FormField label="Website link">
                <Select name="websiteId" defaultValue={websites[0]?.id ?? ""}>
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
                <Input name="dashboardUrl" placeholder="https://dashboard.provider.com" />
              </FormField>
              <FormField label="Edit URL">
                <Input name="editUrl" placeholder="https://editor.provider.com" />
              </FormField>
              <FormField label="Billing URL">
                <Input name="billingUrl" placeholder="https://dashboard.provider.com/billing" />
              </FormField>
              <FormField label="Support URL">
                <Input name="supportUrl" placeholder="https://support.provider.com" />
              </FormField>
              <FormField label="Owner-facing description" className="md:col-span-2">
                <Textarea
                  name="ownerDescription"
                  placeholder="Explain what this tool does in plain language for the owner."
                />
              </FormField>
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
          </CardContent>
        </Card>
      </form>
    </AppShell>
  );
}
