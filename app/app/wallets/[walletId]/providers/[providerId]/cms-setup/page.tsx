import Link from "next/link";

import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/access";
import { getWalletProviderDetailData } from "@/lib/data/wallets";
import { buildCMSEditorUrl, detectCMSProvider, getCMSOwnerDescription } from "@/lib/services/cms-service";

const CMS_SETUP_GUIDES: Record<string, {
  title: string;
  steps: string[];
  editRouteLabel: string;
  editRouteDescription: string;
}> = {
  sanity: {
    title: "Connect Sanity for owner editing",
    steps: [
      "Find your Sanity project ID in sanity.io/manage → select your project → Settings → API.",
      "Add the project ID to this provider's metadata (edit the provider and add projectId to the metadata field).",
      "If you have a self-hosted or embedded Sanity Studio, paste the studio URL instead.",
      "Create an edit route below pointing to the studio URL. Mark it as primary if it's the main editing path.",
      "The owner will see 'Edit your website' and land directly in Sanity Studio — no extra logins."
    ],
    editRouteLabel: "Edit website content",
    editRouteDescription: "Opens Sanity Studio where you can update text, images, and content across your site."
  },
  contentful: {
    title: "Connect Contentful for owner editing",
    steps: [
      "Find your Space ID in Contentful → Settings → General Settings.",
      "Add the Space ID to this provider's metadata.",
      "Create an edit route pointing to your Contentful space URL.",
      "For a better experience, link directly to the content type the owner will edit most often.",
      "The owner will be taken straight to the content editor when they click 'Edit website'."
    ],
    editRouteLabel: "Edit website content",
    editRouteDescription: "Opens Contentful where you can update your website's content and media."
  },
  webflow: {
    title: "Connect Webflow for owner editing",
    steps: [
      "In Webflow, go to your project and copy the site ID from the URL.",
      "Add an edit route pointing to your Webflow designer URL.",
      "Consider creating separate routes for CMS collection items vs. page editing.",
      "The owner will see clear paths to edit the content areas you define."
    ],
    editRouteLabel: "Edit website in Webflow",
    editRouteDescription: "Opens the Webflow editor where you can update content, images, and page layout."
  },
  tina: {
    title: "Connect TinaCMS for owner editing",
    steps: [
      "Make sure TinaCMS is set up in your Next.js site (see tina.io/docs).",
      "The TinaCMS admin URL is typically /admin on your production site (e.g. yoursite.com/admin).",
      "Create an edit route pointing to /admin on your site's domain.",
      "TinaCMS shows a visual editor directly on the site — ideal for non-technical owners."
    ],
    editRouteLabel: "Edit website content",
    editRouteDescription: "Opens the visual content editor directly on your website."
  }
};

export default async function CMSSetupPage({
  params
}: {
  params: Promise<{ walletId: string; providerId: string }>;
}) {
  const { walletId, providerId } = await params;
  const session = await requireSession();
  const { walletContext, provider } = await getWalletProviderDetailData(
    walletId,
    providerId,
    session.user.id
  );

  const cmsProvider = detectCMSProvider(provider.name);
  const guide = cmsProvider ? CMS_SETUP_GUIDES[cmsProvider] : null;

  const metadata = provider.metadata as Record<string, string> | null;
  const projectId = metadata?.projectId ?? metadata?.spaceId ?? metadata?.siteId;
  const studioUrl = metadata?.studioUrl ?? provider.editUrl;

  const editorUrl = cmsProvider
    ? buildCMSEditorUrl({
        provider: cmsProvider,
        projectId,
        studioUrl: studioUrl ?? undefined,
        dataset: metadata?.dataset
      })
    : provider.editUrl ?? null;

  return (
    <AppShell
      title={guide?.title ?? "CMS editor setup"}
      description="Configure the editing path so owners can update the site without any technical knowledge."
      walletContext={walletContext}
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {guide ? (
            <Card>
              <CardHeader>
                <CardTitle>Setup steps</CardTitle>
                <CardDescription>
                  Follow these steps to give the owner a clean, direct path to edit the site.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {guide.steps.map((step, i) => (
                  <div key={i} className="flex gap-4 rounded-md border border-white/10 p-4">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
                      {i + 1}
                    </div>
                    <p className="text-sm text-muted">{step}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Add an editing path</CardTitle>
                <CardDescription>
                  Create an edit route that takes the owner directly to where they can make changes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted">
                <p>
                  Find the URL the owner should visit to edit content — this is usually the CMS
                  admin URL or the embedded studio URL.
                </p>
                <p>
                  Create an edit route for this website pointing to that URL, mark it as the
                  primary editing path, and the owner will see it front and center in their wallet.
                </p>
              </CardContent>
            </Card>
          )}

          {editorUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Detected editor URL</CardTitle>
                <CardDescription>
                  This is where the owner will land when they click &quot;Edit website&quot;.
                  Test it before sending the invite.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-md border border-white/10 bg-white/[0.03] p-4 font-mono text-sm break-all">
                  {editorUrl}
                </div>
                <Button asChild variant="secondary">
                  <a href={editorUrl} target="_blank" rel="noopener noreferrer">
                    Test editor URL
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add an edit route</CardTitle>
              <CardDescription>
                Create the editing path the owner will use. This is the most important step.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted">
                Once you add an edit route and mark it as primary, the owner&apos;s wallet will show a
                clear &quot;Edit your website&quot; button that goes straight to the editor.
              </p>
              {provider.websiteId && (
                <Button asChild className="w-full">
                  <Link
                    href={`/app/wallets/${walletId}/websites/${provider.websiteId}/routes/new`}
                  >
                    Add editing path
                  </Link>
                </Button>
              )}
              <Button asChild variant="secondary" className="w-full">
                <Link href={`/app/wallets/${walletId}/providers/${providerId}`}>
                  Back to provider
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What the owner sees</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted space-y-2">
              <p>
                {cmsProvider
                  ? getCMSOwnerDescription(cmsProvider)
                  : "A clear button that takes them to the right place to edit their site."}
              </p>
              <p>
                They never see the CMS dashboard, credentials, or technical settings — just the
                editing interface you point them to.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
