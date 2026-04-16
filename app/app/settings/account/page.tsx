import { updateAccountSettings } from "@/lib/actions/wallets";
import { requireSession } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/app/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function AccountSettingsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true
    }
  });
  const resolvedSearchParams = await searchParams;
  const updated = typeof resolvedSearchParams.updated === "string";
  const formError = typeof resolvedSearchParams.formError === "string" ? resolvedSearchParams.formError : null;

  return (
    <AppShell
      title="Account settings"
      description="Manage your personal profile, sign-in methods, and notification preferences."
    >
      <div className="max-w-3xl space-y-6">
        {formError && (
          <Card>
            <CardContent className="py-4 text-sm text-destructive">{formError}</CardContent>
          </Card>
        )}
        {updated ? (
          <Card>
            <CardContent className="py-4 text-sm text-muted">Your account details were updated.</CardContent>
          </Card>
        ) : null}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateAccountSettings} className="grid gap-4 md:grid-cols-2">
              <FormField label="Full name">
                <Input name="name" defaultValue={user?.name ?? ""} required />
              </FormField>
              <FormField label="Email">
                <Input name="email" type="email" defaultValue={user?.email ?? session.user.email ?? ""} required />
              </FormField>
              <FormField label="Phone" className="md:col-span-2">
                <Input name="phone" defaultValue={user?.phone ?? ""} />
              </FormField>
              <div className="md:col-span-2">
                <SubmitButton pendingLabel="Saving...">Save changes</SubmitButton>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
