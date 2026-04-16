import Link from "next/link";

import { updateWalletSettings } from "@/lib/actions/wallets";
import { requireSession } from "@/lib/auth/access";
import { getWalletSettingsData } from "@/lib/data/wallets";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";

export default async function WalletSettingsPage({
  params,
  searchParams
}: {
  params: Promise<{ walletId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { walletId } = await params;
  const session = await requireSession();
  const { walletContext, wallet } = await getWalletSettingsData(walletId, session.user.id);
  const resolvedSearchParams = await searchParams;
  const updated = typeof resolvedSearchParams.updated === "string";
  const formError = typeof resolvedSearchParams.formError === "string" ? resolvedSearchParams.formError : null;

  return (
    <AppShell
      title="Wallet settings"
      description="Keep the business profile, support defaults, and wallet presentation polished and up to date."
      walletContext={walletContext}
    >
      <div className="max-w-4xl space-y-6">
        {formError && (
          <Card>
            <CardContent className="py-4 text-sm text-destructive">{formError}</CardContent>
          </Card>
        )}
        {updated ? (
          <Card>
            <CardContent className="py-4 text-sm text-muted">Your wallet settings were updated.</CardContent>
          </Card>
        ) : null}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Business info</CardTitle>
              <CardDescription>Keep the core business and website details clear for the owner experience.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form action={updateWalletSettings} className="grid gap-4 md:grid-cols-2">
              <input type="hidden" name="walletId" value={wallet.id} />
              <FormField label="Business name">
                <Input name="businessName" defaultValue={wallet.businessName} required />
              </FormField>
              <FormField label="Website URL">
                <Input name="websiteUrl" type="url" defaultValue={wallet.websiteUrl ?? ""} />
              </FormField>
              <FormField label="Wallet notes" className="md:col-span-2">
                <Textarea name="notes" defaultValue={wallet.notes ?? ""} />
              </FormField>
              <div className="md:col-span-2 flex flex-wrap gap-3">
                <SubmitButton pendingLabel="Saving...">Save changes</SubmitButton>
                <Link
                  href={`/app/wallets/${wallet.id}`}
                  className="surface inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-foreground transition hover:border-white/20 hover:bg-white/[0.05]"
                >
                  Review owner experience
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
