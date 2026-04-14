import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/app/empty-state";
import { getAdminUsersData } from "@/lib/data/admin";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage() {
  const users = await getAdminUsersData();

  return (
    <AppShell title="Users" description="All registered accounts across the platform.">
      <Card>
        <CardHeader>
          <CardTitle>All users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {users.length === 0 ? (
            <EmptyState title="No users yet" description="Registered users will appear here." />
          ) : (
            users.map((user) => (
              <div key={user.id} className="flex flex-col gap-3 rounded-md border border-white/10 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted">{user.email}</div>
                  <div className="text-xs text-muted mt-1">
                    Joined {formatDate(user.createdAt)}
                    {user.lastLoginAt ? ` · Last login ${formatDate(user.lastLoginAt)}` : ""}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={user.status === "ACTIVE" ? "success" : "warning"}>
                    {user.status.toLowerCase()}
                  </Badge>
                  {user.type !== "STANDARD" && (
                    <Badge variant="accent">{user.type.toLowerCase()}</Badge>
                  )}
                  {user.walletCount > 0 && (
                    <Badge variant="neutral">{user.walletCount} wallet{user.walletCount !== 1 ? "s" : ""}</Badge>
                  )}
                  {user.ownedWallets > 0 && (
                    <Badge variant="neutral">{user.ownedWallets} owned</Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
