import { saveUserPreferences } from "@/lib/actions/wallets";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireSession } from "@/lib/auth/access";
import { getUserPreferences } from "@/lib/data/wallets";

export default async function PreferenceSettingsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const prefs = await getUserPreferences(session.user.id);
  const resolvedSearchParams = await searchParams;
  const updated = typeof resolvedSearchParams.updated === "string";

  return (
    <AppShell
      title="Preferences"
      description="Tune the way RAEYL feels day to day without changing ownership or wallet settings."
    >
      <div className="max-w-2xl space-y-6">
        {updated && (
          <Card>
            <CardContent className="py-4 text-sm text-muted">Preferences saved.</CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Display and workflow</CardTitle>
            <CardDescription>
              These settings control your personal view — they only affect your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={saveUserPreferences} className="space-y-5">
              <FormField
                label="Default landing page"
                hint="Where you land after signing in or clicking the RAEYL logo."
              >
                <Select name="defaultLandingPage" defaultValue={prefs.defaultLandingPage}>
                  <option value="overview">Overview — all wallets at a glance</option>
                  <option value="wallets">Wallets list</option>
                  <option value="notifications">Notifications</option>
                </Select>
              </FormField>

              <FormField
                label="Date display"
                hint="How dates appear throughout the app."
              >
                <Select name="dateFormat" defaultValue={prefs.dateFormat}>
                  <option value="relative">Relative — 3 days ago</option>
                  <option value="absolute">Absolute — Apr 9, 2026</option>
                </Select>
              </FormField>

              <FormField
                label="Information density"
                hint="Compact mode reduces whitespace for a tighter view."
              >
                <Select name="compactMode" defaultValue={String(prefs.compactMode)}>
                  <option value="false">Comfortable — standard spacing</option>
                  <option value="true">Compact — reduced spacing</option>
                </Select>
              </FormField>

              <SubmitButton pendingLabel="Saving...">Save preferences</SubmitButton>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
