import { createWebsite } from "@/lib/actions/wallets";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { requireSession } from "@/lib/auth/access";
import { getWalletFormData } from "@/lib/data/wallets";

export default async function NewWebsitePage({
  params,
  searchParams
}: {
  params: Promise<{ walletId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { walletId } = await params;
  const sp = await searchParams;
  const formError = typeof sp.formError === "string" ? sp.formError : null;
  const session = await requireSession();
  const { walletContext } = await getWalletFormData(walletId, session.user.id);

  return (
    <AppShell
      title="Add website"
      description="Include the live address, staging link, and enough detail for a clear handoff."
      walletContext={walletContext}
    >
      <form action={createWebsite} className="max-w-5xl space-y-6">
        {formError && <p className="text-sm text-destructive">{formError}</p>}
        <input type="hidden" name="walletId" value={walletContext.id} />
        <Card>
          <CardHeader>
            <CardTitle>Website details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField label="Website name">
              <Input name="name" required placeholder="Evergreen Dental" />
            </FormField>
            <FormField label="Primary domain">
              <Input name="primaryDomain" placeholder="evergreendental.com" />
            </FormField>
            <FormField label="Production URL">
              <Input name="productionUrl" placeholder="https://evergreendental.com" />
            </FormField>
            <FormField label="Staging URL">
              <Input name="stagingUrl" placeholder="https://staging.evergreendental.com" />
            </FormField>
            <FormField label="Site category">
              <Input name="siteCategory" placeholder="Healthcare" />
            </FormField>
            <FormField label="Framework or stack">
              <Input name="framework" placeholder="Next.js + Supabase + Builder.io" />
            </FormField>
            <FormField label="Deployment notes" className="md:col-span-2">
              <Textarea name="deploymentNotes" placeholder="Notes about deployment ownership, preview setup, or launch timing." />
            </FormField>
          </CardContent>
        </Card>
        <SubmitButton>Create website record</SubmitButton>
      </form>
    </AppShell>
  );
}
