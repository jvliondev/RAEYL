import Link from "next/link";

import { acceptInvite } from "@/lib/actions/wallets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import { getInvitePreview } from "@/lib/data/invites";
import { formatDate } from "@/lib/utils";

export default async function AcceptInvitePage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const preview = await getInvitePreview(token);
  const acceptAction = acceptInvite.bind(null, token);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-2xl">
        <CardHeader className="block space-y-2">
          <div className="text-sm font-semibold tracking-[0.22em]">RAEYL</div>
          <CardTitle>Accept your website wallet</CardTitle>
          <CardDescription>
            This gives you a clear place to review your website systems, editing paths, billing, and access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-md border border-white/10 bg-white/[0.03] p-5">
            {preview.invite?.wallet ? (
              <>
                <div className="text-sm text-muted">Business</div>
                <div className="text-lg font-semibold">{preview.invite.wallet.businessName}</div>
                <p className="mt-2 text-sm text-muted">
                  You are accepting access as the primary owner of this website wallet for {preview.invite.email}.
                </p>
                <div className="mt-3 text-xs text-muted">
                  Invite status: {preview.status}
                  {preview.invite.expiresAt ? ` • Expires ${formatDate(preview.invite.expiresAt)}` : ""}
                </div>
              </>
            ) : (
              <>
                <div className="text-sm text-muted">Invite status</div>
                <div className="text-lg font-semibold">This invite is unavailable</div>
                <p className="mt-2 text-sm text-muted">
                  The link may be expired, revoked, or already used. Ask the sender to issue a fresh invite.
                </p>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {preview.isValid ? (
              <form action={acceptAction}>
                <SubmitButton>Accept wallet access</SubmitButton>
              </form>
            ) : null}
            <Link href="/get-started">
              <Button variant="secondary">
                {preview.isValid ? "Create account first" : "Request a new invite"}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
