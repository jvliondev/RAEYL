import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PreferenceSettingsPage() {
  return (
    <AppShell
      title="Preferences"
      description="Tune the way RAEYL feels day to day without changing ownership or wallet settings."
    >
      <Card>
        <CardHeader>
          <CardTitle>Display and workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted">
          <div className="rounded-md border border-white/10 p-4">Default landing page • Overview</div>
          <div className="rounded-md border border-white/10 p-4">Theme • Dark</div>
          <div className="rounded-md border border-white/10 p-4">Compact information mode • Off</div>
          <p className="text-xs text-muted">
            Preference persistence is prepared here and will connect to saved user defaults in the next settings pass.
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
