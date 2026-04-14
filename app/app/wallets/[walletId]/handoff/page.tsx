import Link from "next/link";

import { completeHandoff, createOwnerInvite } from "@/lib/actions/wallets";
import { requireSession } from "@/lib/auth/access";
import { getWalletHandoffData } from "@/lib/data/wallets";
import { formatDate } from "@/lib/utils";
import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";

function getChecklistItemLink(key: string, walletId: string, firstWebsiteId: string | null): string | null {
  switch (key) {
    case "wallet_profile": return `/app/wallets/${walletId}/settings`;
    case "website_added": return `/app/wallets/${walletId}/websites/new`;
    case "provider_added": return `/app/wallets/${walletId}/providers/new`;
    case "owner_added": return `/app/wallets/${walletId}/settings`;
    case "primary_edit_route":
      return firstWebsiteId
        ? `/app/wallets/${walletId}/websites/${firstWebsiteId}/routes/new`
        : `/app/wallets/${walletId}/websites/new`;
    case "billing_added": return `/app/wallets/${walletId}/billing`;
    default: return null;
  }
}

export default async function HandoffPage({
  params,
  searchParams
}: {
  params: Promise<{ walletId: string }>;
  searchParams: Promise<{ invite?: string }>;
}) {
  const { walletId } = await params;
  const { invite } = await searchParams;
  const session = await requireSession();
  const {
    walletContext,
    ownerEmail,
    handoffStatus,
    ownerAcceptanceStatus,
    readiness,
    latestInvite,
    latestRecord,
    firstWebsiteId,
    timeline
  } = await getWalletHandoffData(walletId, session.user.id);

  const requiredDone = readiness.items.filter((i) => i.required && i.complete).length;
  const requiredTotal = readiness.items.filter((i) => i.required).length;
  const progressPct = Math.round((requiredDone / requiredTotal) * 100);

  return (
    <AppShell
      title="Handoff readiness"
      description="Complete the key setup steps before ownership is formally handed over."
      walletContext={walletContext}
    >
      {invite === "sent" && (
        <div className="mb-4 rounded-md border border-success/30 bg-success/5 p-4 text-sm text-success">
          Ownership invite sent. The owner will receive a notification when they log in.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>Completion checklist</CardTitle>
                  <CardDescription>
                    {requiredDone} of {requiredTotal} required steps complete.
                    {readiness.canComplete
                      ? " Ready to complete handoff."
                      : " Finish the remaining steps to unlock handoff."}
                  </CardDescription>
                </div>
                <Badge variant={readiness.canComplete ? "success" : "warning"}>
                  {handoffStatus}
                </Badge>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1.5 w-full rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-success transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {readiness.items.map((item) => {
                const href = !item.complete
                  ? getChecklistItemLink(item.key, walletId, firstWebsiteId)
                  : null;

                return (
                  <div
                    key={item.key}
                    className={`flex items-center gap-3 rounded-md border p-4 ${
                      item.complete ? "border-white/10" : "border-warning/20 bg-warning/5"
                    }`}
                  >
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        item.complete
                          ? "bg-success/15 text-success"
                          : "bg-warning/15 text-warning"
                      }`}
                    >
                      {item.complete ? "✓" : "!"}
                    </div>
                    <div className="flex flex-1 items-center justify-between gap-3">
                      <span className={`text-sm ${item.complete ? "text-muted line-through" : ""}`}>
                        {item.label}
                        {!item.required && (
                          <span className="ml-2 text-xs text-muted">(recommended)</span>
                        )}
                      </span>
                      {href && !item.complete && (
                        <Button variant="secondary" asChild className="h-7 px-3 text-xs shrink-0">
                          <Link href={href}>Fix this</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}

              <form action={completeHandoff} className="pt-2">
                <input type="hidden" name="walletId" value={walletContext.id} />
                <SubmitButton
                  className="w-full"
                  disabled={!readiness.canComplete}
                  pendingLabel="Completing handoff..."
                >
                  {readiness.canComplete
                    ? "Mark handoff complete"
                    : `Complete ${requiredTotal - requiredDone} more step${requiredTotal - requiredDone !== 1 ? "s" : ""} to unlock`}
                </SubmitButton>
              </form>

              <div className="rounded-md border border-white/10 p-4 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted">Owner acceptance</span>
                  <span>{ownerAcceptanceStatus}</span>
                </div>
                {latestInvite && (
                  <div className="flex justify-between text-xs text-muted">
                    <span>Invite to {latestInvite.email}</span>
                    <span>Expires {formatDate(latestInvite.expiresAt)}</span>
                  </div>
                )}
                {latestRecord?.completedAt && (
                  <div className="text-xs text-success">
                    Completed {formatDate(latestRecord.completedAt)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {timeline.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Handoff timeline</CardTitle>
                <CardDescription>Key moments from setup to ownership acceptance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {timeline.map((item) => (
                  <div key={item.id} className="border-l-2 border-white/10 pl-4">
                    <div className="text-sm font-medium">{item.action}</div>
                    <div className="text-sm text-muted">{item.detail}</div>
                    <div className="text-xs text-muted mt-1">{formatDate(item.createdAt)}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Invite panel */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Invite the owner</CardTitle>
            <CardDescription>
              Send a secure ownership invite. They&apos;ll get a notification to accept and access their wallet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createOwnerInvite} className="space-y-4">
              <input type="hidden" name="walletId" value={walletContext.id} />
              <input type="hidden" name="role" value="WALLET_OWNER" />
              <input type="hidden" name="inviteType" value="OWNER_HANDOFF" />
              <FormField label="Owner email">
                <Input name="email" type="email" defaultValue={ownerEmail ?? ""} required />
              </FormField>
              <FormField label="Expiration date">
                <Input name="expiresAt" type="date" />
              </FormField>
              <FormField label="Welcome note">
                <Textarea
                  name="welcomeNote"
                  rows={4}
                  placeholder="Write a short message for the owner. This shows up when they open their wallet for the first time."
                />
              </FormField>
              <SubmitButton className="w-full" pendingLabel="Sending invite...">
                Send ownership invite
              </SubmitButton>
            </form>

            {latestInvite && (
              <div className="mt-4 rounded-md border border-white/10 p-4 text-xs text-muted space-y-1">
                <div className="font-medium text-foreground text-sm">Last invite</div>
                <div>{latestInvite.email}</div>
                <div className="capitalize">{latestInvite.status.toLowerCase()} · expires {formatDate(latestInvite.expiresAt)}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
