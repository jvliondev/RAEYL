import Link from "next/link";

import { markAllNotificationsAsRead, markNotificationAsRead } from "@/lib/actions/notifications";
import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireSession } from "@/lib/auth/access";
import { getNotificationsData } from "@/lib/data/wallets";
import { formatDate } from "@/lib/utils";

export default async function NotificationsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const { unreadCount, notifications } = await getNotificationsData(session.user.id);
  const resolvedSearchParams = await searchParams;
  const updated = typeof resolvedSearchParams.updated === "string" ? resolvedSearchParams.updated : null;

  return (
    <AppShell title="Notifications" description="Keep up with invites, billing updates, support activity, and alerts.">
      <div className="space-y-6">
        {updated ? (
          <Card>
            <CardContent className="py-4 text-sm text-muted">
              {updated === "all" ? "All notifications marked read." : "Notification marked read."}
            </CardContent>
          </Card>
        ) : null}
        {notifications.length ? (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>Inbox</CardTitle>
                  <CardDescription>Important updates across ownership, support, billing, and connected tools.</CardDescription>
                </div>
                {unreadCount ? (
                  <form action={markAllNotificationsAsRead}>
                    <SubmitButton variant="secondary" pendingLabel="Updating...">
                      Mark all read
                    </SubmitButton>
                  </form>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-md border p-4 ${notification.isRead ? "border-white/10" : "border-primary/25 bg-white/[0.03]"}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium">{notification.subject}</div>
                      <div className="text-sm text-muted">{notification.body}</div>
                      {notification.wallet ? (
                        <div className="mt-2 text-xs text-muted">{notification.wallet.businessName}</div>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-3">
                        {notification.ctaUrl ? (
                          <Link href={notification.ctaUrl} className="text-sm font-medium text-primary">
                            Open update
                          </Link>
                        ) : null}
                        {!notification.isRead ? (
                          <form action={markNotificationAsRead}>
                            <input type="hidden" name="notificationId" value={notification.id} />
                            <SubmitButton variant="secondary" pendingLabel="Updating...">
                              Mark read
                            </SubmitButton>
                          </form>
                        ) : null}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted">{formatDate(notification.createdAt)}</div>
                      <div className="mt-2 text-xs text-muted">{notification.isRead ? "Read" : "Unread"}</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            title="You're all caught up"
            description="Important invite, billing, support, and connected-tool updates will appear here."
          />
        )}
      </div>
    </AppShell>
  );
}
