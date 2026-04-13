import { updateNotificationPreference } from "@/lib/actions/notifications";
import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/access";
import { getNotificationPreferencesData } from "@/lib/data/wallets";

export default async function NotificationSettingsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const preferences = await getNotificationPreferencesData(session.user.id);
  const resolvedSearchParams = await searchParams;
  const updated = typeof resolvedSearchParams.updated === "string";

  return (
    <AppShell
      title="Notification settings"
      description="Choose how invite updates, support messages, billing notices, and alerts reach you."
    >
      <div className="space-y-6">
        {updated ? (
          <Card>
            <CardContent className="py-4 text-sm text-muted">
              Notification preferences updated.
            </CardContent>
          </Card>
        ) : null}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {preferences.map((item) => (
              <div key={item.label} className="flex flex-col gap-4 rounded-md border border-white/10 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-sm text-muted">
                    Email: {item.email ? "On" : "Off"} • In-app: {item.inApp ? "On" : "Off"}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <form action={updateNotificationPreference}>
                    <input type="hidden" name="type" value={item.type} />
                    <input type="hidden" name="channel" value="IN_APP" />
                    <input type="hidden" name="isEnabled" value={String(!item.inApp)} />
                    <Button variant="secondary" type="submit">
                      {item.inApp ? "Turn off in-app" : "Turn on in-app"}
                    </Button>
                  </form>
                  <form action={updateNotificationPreference}>
                    <input type="hidden" name="type" value={item.type} />
                    <input type="hidden" name="channel" value="EMAIL" />
                    <input type="hidden" name="isEnabled" value={String(!item.email)} />
                    <Button variant="secondary" type="submit">
                      {item.email ? "Turn off email" : "Turn on email"}
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
