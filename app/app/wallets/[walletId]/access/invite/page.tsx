import { inviteTeamMember } from "@/lib/actions/wallets";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireSession } from "@/lib/auth/access";
import { getWalletAccessData } from "@/lib/data/wallets";

export default async function InviteTeammatePage({
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
  const { walletContext } = await getWalletAccessData(walletId, session.user.id);

  return (
    <AppShell
      title="Invite a teammate"
      description="Send an invite to give someone access to this wallet."
      walletContext={walletContext}
    >
      <div className="max-w-lg">
        <form action={inviteTeamMember} className="space-y-6">
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <input type="hidden" name="walletId" value={walletId} />
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Invite details</CardTitle>
                <CardDescription>
                  The invite link will be valid for 7 days. If the person already has a RAEYL account,
                  they will receive an in-app notification.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Email address">
                <Input name="email" type="email" required placeholder="teammate@agency.com" />
              </FormField>
              <FormField label="Role">
                <Select name="role" defaultValue="EDITOR">
                  <option value="DEVELOPER">Developer — full setup and management access</option>
                  <option value="EDITOR">Editor — can view providers and submit support</option>
                  <option value="BILLING_MANAGER">Billing manager — billing read and write</option>
                  <option value="SUPPORT">Support — view and respond to support requests</option>
                  <option value="VIEWER">Viewer — read-only access</option>
                </Select>
              </FormField>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-muted space-y-1">
                <p><span className="text-foreground font-medium">Developer</span> — connect tools, manage providers, do handoffs</p>
                <p><span className="text-foreground font-medium">Editor</span> — view everything, submit support requests</p>
                <p><span className="text-foreground font-medium">Billing manager</span> — view and edit billing records</p>
                <p><span className="text-foreground font-medium">Support</span> — handle support queue and alerts</p>
                <p><span className="text-foreground font-medium">Viewer</span> — read-only, nothing editable</p>
              </div>
              <SubmitButton className="w-full" pendingLabel="Sending invite...">
                Send invite
              </SubmitButton>
            </CardContent>
          </Card>
        </form>
      </div>
    </AppShell>
  );
}
