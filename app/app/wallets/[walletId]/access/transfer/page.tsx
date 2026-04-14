import { transferPrimaryOwnership } from "@/lib/actions/wallets";
import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireSession } from "@/lib/auth/access";
import { getWalletAccessData } from "@/lib/data/wallets";

export default async function TransferOwnershipPage({
  params
}: {
  params: Promise<{ walletId: string }>;
}) {
  const { walletId } = await params;
  const session = await requireSession();
  const { walletContext, members } = await getWalletAccessData(walletId, session.user.id);

  const currentOwner = members.find((m) => m.isPrimaryOwner);
  const transferTargets = members.filter(
    (m) => m.userId !== session.user.id && m.status === "active"
  );

  return (
    <AppShell
      title="Transfer primary ownership"
      description="Assign a new primary owner for this wallet. This action is recorded in the audit log."
      walletContext={walletContext}
    >
      <div className="max-w-lg">
        <div className="space-y-6">
          {currentOwner && (
            <Card>
              <CardHeader>
                <CardTitle>Current primary owner</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{currentOwner.name}</div>
                  <div className="text-sm text-muted">{currentOwner.email}</div>
                </div>
                <Badge>Primary owner</Badge>
              </CardContent>
            </Card>
          )}

          {transferTargets.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted">
                  There are no other active members to transfer ownership to.
                  Invite a teammate first.
                </p>
              </CardContent>
            </Card>
          ) : (
            <form action={transferPrimaryOwnership}>
              <input type="hidden" name="walletId" value={walletId} />
              <Card>
                <CardHeader>
                  <CardTitle>Transfer to</CardTitle>
                  <CardDescription>
                    The selected member will become the primary owner. Their role will be updated
                    to Wallet Owner. This is permanent unless transferred again.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField label="New primary owner">
                    <Select name="toUserId" defaultValue="">
                      <option value="" disabled>Select a member...</option>
                      {transferTargets.map((m) => (
                        <option key={m.userId} value={m.userId}>
                          {m.name} — {m.email}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                  <div className="rounded-md border border-warning/30 bg-warning/5 p-4 text-sm text-warning">
                    This will immediately update wallet ownership. The new owner will receive
                    an in-app notification.
                  </div>
                  <SubmitButton className="w-full" pendingLabel="Transferring...">
                    Confirm transfer
                  </SubmitButton>
                </CardContent>
              </Card>
            </form>
          )}
        </div>
      </div>
    </AppShell>
  );
}
