import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/access";
import { getWalletWebsiteDetailData } from "@/lib/data/wallets";

export default async function WebsiteDetailPage({
  params
}: {
  params: Promise<{ walletId: string; websiteId: string }>;
}) {
  const { walletId, websiteId } = await params;
  const session = await requireSession();
  const { walletContext, website, providers } = await getWalletWebsiteDetailData(
    walletId,
    websiteId,
    session.user.id
  );

  return (
    <AppShell
      title={website.name}
      description="Review the live site, environments, editing paths, and linked systems."
      walletContext={walletContext}
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Environment links</CardTitle>
                <CardDescription>Open the live website, staging environment, or the primary editing path.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button>Open production</Button>
              <Button variant="secondary">Open staging</Button>
              <Button variant="secondary">Edit website</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Editing paths</CardTitle>
                <CardDescription>These are the actions the owner will use when they want to update the site.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {website.editRoutes.map((route) => (
                <div key={route.id} className="rounded-md border border-white/10 p-4">
                  <div className="text-sm font-medium">{route.label}</div>
                  <p className="text-sm text-muted">{route.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Website summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted">
              <div><span className="text-foreground">Primary domain:</span> {website.primaryDomain}</div>
              <div><span className="text-foreground">Framework:</span> {website.framework}</div>
              <div><span className="text-foreground">Status:</span> {website.status}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Linked tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {providers.slice(0, 4).map((provider) => (
                <div key={provider.id} className="rounded-md border border-white/10 p-4 text-sm">
                  <div className="font-medium">{provider.label}</div>
                  <div className="text-muted">{provider.name}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
