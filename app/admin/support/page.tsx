import { updateSupportRequestStatus } from "@/lib/actions/support";
import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireAdminSession } from "@/lib/auth/access";
import { getAdminSupportData } from "@/lib/data/wallets";
import { formatDate } from "@/lib/utils";

export default async function AdminSupportPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminSession();
  const requests = await getAdminSupportData();
  const resolvedSearchParams = await searchParams;
  const updated = typeof resolvedSearchParams.updated === "string";

  return (
    <AppShell
      title="Admin support"
      description="Review support workload, ownership blockers, and unresolved conversations."
    >
      <div className="space-y-6">
        {updated ? (
          <Card>
            <CardContent className="py-4 text-sm text-muted">Support status updated.</CardContent>
          </Card>
        ) : null}
        <Card>
          <CardHeader>
            <CardTitle>Support queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted">
            {requests.length ? (
              requests.map((request) => (
                <div key={request.id} className="rounded-md border border-white/10 p-4">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <div className="font-medium text-foreground">
                        {request.priority} · {request.subject}
                      </div>
                      <div>
                        {request.walletName}
                        {request.provider ? ` · ${request.provider}` : ""}
                      </div>
                      <div className="text-xs">
                        {request.status} · {request.category} · {request.requester} · {formatDate(request.createdAt)}
                      </div>
                      <div className="mt-1 text-xs text-muted">
                        {request.messages} recent message{request.messages === 1 ? "" : "s"}
                      </div>
                    </div>
                    <form action={updateSupportRequestStatus} className="flex items-center gap-3">
                      <input type="hidden" name="supportRequestId" value={request.id} />
                      <Select name="status" defaultValue={request.status.toUpperCase().replace(/ /g, "_")}>
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In progress</option>
                        <option value="WAITING_ON_CUSTOMER">Waiting on customer</option>
                        <option value="WAITING_ON_PROVIDER">Waiting on provider</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </Select>
                      <SubmitButton variant="secondary" pendingLabel="Saving...">
                        Update
                      </SubmitButton>
                    </form>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="No support cases in queue"
                description="Open support requests will appear here once customers or collaborators submit them."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
