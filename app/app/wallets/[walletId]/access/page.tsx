import Link from "next/link";

import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/app/empty-state";
import { requireSession } from "@/lib/auth/access";
import { getWalletAccessData } from "@/lib/data/wallets";

export default async function AccessPage({
  params,
  searchParams
}: {
  params: Promise<{ walletId: string }>;
  searchParams: Promise<{ invite?: string; transferred?: string }>;
}) {
  const { walletId } = await params;
  const { invite, transferred } = await searchParams;
  const session = await requireSession();
  const { walletContext, members, pendingInvites } = await getWalletAccessData(
    walletId,
    session.user.id
  );

  return (
    <AppShell
      title="Who can access this website"
      description="Review access, invite teammates, and keep ownership clear."
      walletContext={walletContext}
    >
      {invite === "sent" && (
        <div className="mb-4 rounded-md border border-success/30 bg-success/5 p-4 text-sm text-success">
          Invite sent. They will receive a notification once they log in.
        </div>
      )}
      {transferred === "1" && (
        <div className="mb-4 rounded-md border border-success/30 bg-success/5 p-4 text-sm text-success">
          Ownership transferred successfully.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Active members</CardTitle>
              <CardDescription>See who can access this wallet, what they can do, and whether ownership is clearly assigned.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.length ? (
              members.map((member) => (
                <div key={member.id} className="flex flex-col gap-3 rounded-md border border-white/10 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-muted">{member.email}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge>
                      {member.isPrimaryOwner
                        ? "Primary owner"
                        : member.role === "developer"
                          ? "Developer"
                          : member.role === "billing_manager"
                            ? "Billing access"
                            : member.role === "editor"
                              ? "Editor"
                              : member.role === "viewer"
                                ? "Viewer"
                                : member.role === "support"
                                  ? "Support"
                                  : member.role.replace("_", " ")}
                    </Badge>
                    <Badge variant={member.status === "active" ? "success" : "warning"}>
                      {member.status}
                    </Badge>
                    {member.isPrimaryDeveloper && (
                      <Badge variant="accent">Primary developer</Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="No active members yet"
                description="People with wallet access will appear here once invitations are accepted."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Manage access</CardTitle>
              <CardDescription>Invite collaborators or reassign ownership.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" asChild>
              <Link href={`/app/wallets/${walletId}/access/invite`}>
                Invite teammate
              </Link>
            </Button>
            <Button variant="secondary" className="w-full" asChild>
              <Link href={`/app/wallets/${walletId}/access/transfer`}>
                Transfer primary ownership
              </Link>
            </Button>

            {pendingInvites.length > 0 && (
              <div className="rounded-md border border-white/10 p-4 text-sm text-muted">
                <div className="mb-2 font-medium text-foreground">Pending invites</div>
                <div className="space-y-2">
                  {pendingInvites.map((invite) => (
                    <div key={invite.id}>
                      <div>{invite.email}</div>
                      <div className="text-xs">{invite.role} · {invite.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
