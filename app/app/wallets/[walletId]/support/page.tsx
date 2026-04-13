import { submitSupportRequest } from "@/lib/actions/wallets";
import { addSupportReply } from "@/lib/actions/support";
import { AppShell } from "@/components/app/app-shell";
import { EmptyState } from "@/components/app/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { hasCapability } from "@/lib/auth/permissions";
import { requireSession } from "@/lib/auth/access";
import { getWalletSupportData } from "@/lib/data/wallets";
import { formatDate } from "@/lib/utils";

export default async function SupportPage({
  params,
  searchParams
}: {
  params: Promise<{ walletId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { walletId } = await params;
  const resolvedSearchParams = await searchParams;
  const session = await requireSession();
  const { walletContext, supportCases, providers } = await getWalletSupportData(
    walletId,
    session.user.id
  );
  const canWriteSupport = walletContext.role
    ? hasCapability(walletContext.role, "support.write")
    : false;
  const updated = typeof resolvedSearchParams.updated === "string" ? resolvedSearchParams.updated : null;
  const submitted = typeof resolvedSearchParams.submitted === "string";

  return (
    <AppShell
      title="Support"
      description="Track open requests, share context, and keep support tied to the right website tools."
      walletContext={walletContext}
    >
      <div className="space-y-6">
        {submitted || updated ? (
          <Card>
            <CardContent className="py-4 text-sm text-muted">
              {updated === "reply"
                ? "Your support reply was added."
                : "Your support request was submitted."}
            </CardContent>
          </Card>
        ) : null}
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Support cases</CardTitle>
                <CardDescription>Keep the support path visible to the owner and the setup partner.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {supportCases.length ? (
                supportCases.map((item) => (
                  <div key={item.id} className="rounded-md border border-white/10 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{item.subject}</div>
                        <div className="text-sm text-muted">
                          {item.status} • {item.priority} priority • {formatDate(item.createdAt)}
                        </div>
                        <div className="mt-1 text-xs text-muted">
                          {item.category}
                          {item.relatedProvider ? ` • ${item.relatedProvider}` : ""}
                          {item.requester ? ` • Opened by ${item.requester}` : ""}
                        </div>
                      </div>
                    </div>
                    {item.recentMessages.length ? (
                      <div className="mt-4 space-y-3">
                        {item.recentMessages.map((message) => (
                          <div key={message.id} className="rounded-md border border-white/10 bg-white/[0.02] p-3">
                            <div className="text-sm">{message.body}</div>
                            <div className="mt-1 text-xs text-muted">
                              {message.author} • {formatDate(message.createdAt)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {canWriteSupport ? (
                      <form action={addSupportReply} className="mt-4 space-y-3">
                        <input type="hidden" name="supportRequestId" value={item.id} />
                        <FormField label="Add reply">
                          <Textarea
                            name="body"
                            placeholder="Share an update, answer, or next step."
                            required
                          />
                        </FormField>
                        <SubmitButton pendingLabel="Sending...">Send reply</SubmitButton>
                      </form>
                    ) : null}
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No support cases yet"
                  description="Open support requests will appear here once the first question is submitted."
                />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>New support request</CardTitle>
                <CardDescription>Submit a request with the right wallet and provider context.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form action={submitSupportRequest} className="space-y-4">
                <input type="hidden" name="walletId" value={walletContext.id} />
                <FormField label="Subject">
                  <Input name="subject" required placeholder="Domain renewal question" />
                </FormField>
                <FormField label="Related tool">
                  <Select name="providerConnectionId" defaultValue="">
                    <option value="">General wallet support</option>
                    {providers.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.label}
                      </option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Issue category">
                  <Select name="category" defaultValue="Billing">
                    <option>Billing</option>
                    <option>Domain</option>
                    <option>Hosting</option>
                    <option>Content editing</option>
                    <option>Access</option>
                    <option>General support</option>
                  </Select>
                </FormField>
                <FormField label="Priority">
                  <Select name="priority" defaultValue="NORMAL">
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </Select>
                </FormField>
                <FormField label="Description">
                  <Textarea
                    name="description"
                    required
                    placeholder="Share what is happening, what you expected, and which tool this relates to."
                  />
                </FormField>
                <SubmitButton className="w-full">Send support request</SubmitButton>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
