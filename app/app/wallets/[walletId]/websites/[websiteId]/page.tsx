import Link from "next/link";

import { createSuggestedEditRoute, deleteEditRoute } from "@/lib/actions/wallets";
import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireSession } from "@/lib/auth/access";
import { getWalletWebsiteDetailData } from "@/lib/data/wallets";

export default async function WebsiteDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ walletId: string; websiteId: string }>;
  searchParams: Promise<{ route?: string }>;
}) {
  const { walletId, websiteId } = await params;
  const { route } = await searchParams;
  const session = await requireSession();
  const { walletContext, website, providers } = await getWalletWebsiteDetailData(
    walletId,
    websiteId,
    session.user.id
  );

  const primaryRoute = website.editRoutes.find((r) => r.isPrimary);
  const canWrite = ["developer", "wallet_owner", "platform_admin"].includes(walletContext.role);
  const suggestedRoutes = providers.flatMap((provider) =>
    (provider.suggestedRoutes ?? []).map((suggestion, suggestionIndex) => ({
      ...suggestion,
      providerId: provider.id,
      providerLabel: provider.label || provider.name,
      suggestionIndex
    }))
  );

  return (
    <AppShell
      title={website.name}
      description="Review the live site, environments, editing paths, and linked systems."
      walletContext={walletContext}
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          {route === "created" ? (
            <Card>
              <CardContent className="py-4 text-sm text-success">
                Suggested owner action created. The website wallet now has a new editing path.
              </CardContent>
            </Card>
          ) : null}
          {route === "exists" ? (
            <Card>
              <CardContent className="py-4 text-sm text-muted">
                That suggested action already exists for this website.
              </CardContent>
            </Card>
          ) : null}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Environment links</CardTitle>
                <CardDescription>Open the live website, staging environment, or the primary editing path.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {website.productionUrl ? (
                <Button asChild>
                  <a href={website.productionUrl} target="_blank" rel="noopener noreferrer">
                    Open production
                  </a>
                </Button>
              ) : (
                <Button disabled>Open production</Button>
              )}
              {website.stagingUrl ? (
                <Button variant="secondary" asChild>
                  <a href={website.stagingUrl} target="_blank" rel="noopener noreferrer">
                    Open staging
                  </a>
                </Button>
              ) : (
                <Button variant="secondary" disabled>Open staging</Button>
              )}
              {primaryRoute ? (
                <Button variant="secondary" asChild>
                  <a href={primaryRoute.destinationUrl} target="_blank" rel="noopener noreferrer">
                    Edit website
                  </a>
                </Button>
              ) : (
                <Button variant="secondary" disabled>Edit website</Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>Editing paths</CardTitle>
                  <CardDescription>These are the actions the owner will use when they want to update the site.</CardDescription>
                </div>
                {canWrite && (
                  <Button variant="secondary" asChild className="shrink-0">
                    <Link href={`/app/wallets/${walletId}/websites/${websiteId}/routes/new`}>
                      Add path
                    </Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {website.editRoutes.length === 0 ? (
                <div className="rounded-md border border-white/10 p-6 text-center">
                  <p className="text-sm text-muted">No editing paths added yet.</p>
                  {canWrite && (
                    <Button variant="secondary" asChild className="mt-3">
                      <Link href={`/app/wallets/${walletId}/websites/${websiteId}/routes/new`}>
                        Add the first editing path
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                website.editRoutes.map((route) => (
                  <div key={route.id} className="rounded-md border border-white/10 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{route.label}</span>
                          {route.isPrimary && <Badge variant="accent">Primary</Badge>}
                        </div>
                        <p className="text-sm text-muted">{route.description}</p>
                        <a
                          href={route.destinationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          {route.destinationUrl}
                        </a>
                      </div>
                      {canWrite && (
                        <form action={deleteEditRoute}>
                          <input type="hidden" name="walletId" value={walletId} />
                          <input type="hidden" name="websiteId" value={websiteId} />
                          <input type="hidden" name="routeId" value={route.id} />
                          <SubmitButton
                            variant="ghost"
                            className="text-xs text-muted hover:text-destructive"
                            pendingLabel="Removing..."
                          >
                            Remove
                          </SubmitButton>
                        </form>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {suggestedRoutes.length > 0 ? (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Suggested owner actions</CardTitle>
                  <CardDescription>
                    RAEYL inferred these editing paths from your connected tools. Turn them into real wallet actions in one click.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestedRoutes.map((suggestion) => (
                  <div
                    key={`${suggestion.providerId}-${suggestion.suggestionIndex}-${suggestion.label}`}
                    className="rounded-md border border-white/10 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{suggestion.label}</span>
                          {suggestion.recommendedPrimary ? <Badge variant="accent">Recommended primary</Badge> : null}
                          <Badge variant="neutral">{suggestion.confidenceScore}% confidence</Badge>
                        </div>
                        <p className="text-sm text-muted">{suggestion.purpose}</p>
                        <div className="text-xs text-muted">From {suggestion.providerLabel}</div>
                      </div>
                      {canWrite ? (
                        <div className="flex flex-col gap-2">
                          <form action={createSuggestedEditRoute}>
                            <input type="hidden" name="walletId" value={walletId} />
                            <input type="hidden" name="providerId" value={suggestion.providerId} />
                            <input type="hidden" name="suggestionIndex" value={suggestion.suggestionIndex} />
                            <SubmitButton variant="secondary" pendingLabel="Creating...">
                              Create action
                            </SubmitButton>
                          </form>
                          <Button asChild variant="ghost" size="sm">
                            <Link
                              href={`/app/wallets/${walletId}/websites/${websiteId}/routes/new?label=${encodeURIComponent(suggestion.label)}&destinationUrl=${encodeURIComponent(suggestion.destinationUrl)}&description=${encodeURIComponent(suggestion.purpose)}&providerId=${encodeURIComponent(suggestion.providerId)}&contentKey=${encodeURIComponent(suggestion.destinationType)}&isPrimary=${suggestion.recommendedPrimary ? "true" : "false"}`}
                            >
                              Customize
                            </Link>
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
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
              {providers.length === 0 ? (
                <p className="text-sm text-muted">No tools linked to this website yet.</p>
              ) : (
                providers.slice(0, 4).map((provider) => (
                  <div key={provider.id} className="rounded-md border border-white/10 p-4 text-sm">
                    <div className="font-medium">{provider.label || provider.name}</div>
                    <div className="text-muted">{provider.name}</div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
