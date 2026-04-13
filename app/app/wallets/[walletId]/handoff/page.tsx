import { completeHandoff, createOwnerInvite } from "@/lib/actions/wallets";
import { requireSession } from "@/lib/auth/access";
import { getWalletHandoffData } from "@/lib/data/wallets";
import { formatDate } from "@/lib/utils";
import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";

export default async function HandoffPage({
  params
}: {
  params: Promise<{ walletId: string }>;
}) {
  const { walletId } = await params;
  const session = await requireSession();
  const { walletContext, ownerEmail, handoffStatus, ownerAcceptanceStatus, readiness, latestInvite, timeline } =
    await getWalletHandoffData(walletId, session.user.id);

  return (
    <AppShell
      title="Handoff readiness"
      description="Complete the key setup steps before ownership is formally handed over."
      walletContext={walletContext}
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Completion checklist</CardTitle>
                <CardDescription>Track what remains before the owner accepts the wallet with confidence.</CardDescription>
              </div>
              <Badge variant={readiness.canComplete ? "success" : "warning"}>{handoffStatus}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {readiness.items.map((item, index) => (
                <div key={item.key} className="flex items-center gap-3 rounded-md border border-white/10 p-4">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold ${
                      item.complete ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
              <form action={completeHandoff} className="pt-2">
                <input type="hidden" name="walletId" value={walletContext.id} />
                <SubmitButton className="w-full">Mark handoff complete</SubmitButton>
              </form>
              <div className="rounded-md border border-white/10 p-4 text-sm text-muted">
                <div className="font-medium text-foreground">Owner acceptance</div>
                <div>{ownerAcceptanceStatus}</div>
                {latestInvite ? (
                  <div className="mt-2">
                    Latest invite to {latestInvite.email} • expires {formatDate(latestInvite.expiresAt)}
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Handoff timeline</CardTitle>
                <CardDescription>Show the key handoff moments clearly from setup to ownership acceptance.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {timeline.map((item) => (
                <div key={item.id} className="border-l border-white/10 pl-4">
                  <div className="text-sm font-medium">{item.action}</div>
                  <div className="text-sm text-muted">{item.detail}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <Card className="h-fit">
          <CardHeader>
            <div>
              <CardTitle>Invite the owner</CardTitle>
              <CardDescription>Send a secure ownership invite with a message that feels considered and clear.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form action={createOwnerInvite} className="space-y-4">
              <input type="hidden" name="walletId" value={walletContext.id} />
              <input type="hidden" name="role" value="WALLET_OWNER" />
              <input type="hidden" name="inviteType" value="OWNER_HANDOFF" />
              <FormField label="Owner email">
                <Input name="email" type="email" defaultValue={ownerEmail ?? ""} required />
              </FormField>
              <FormField label="Expiration date">
                <Input name="expiresAt" type="date" />
              </FormField>
              <FormField label="Welcome note">
                <Textarea name="welcomeNote" placeholder="Add a short handoff message for the owner." />
              </FormField>
              <SubmitButton className="w-full">Send ownership invite</SubmitButton>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
