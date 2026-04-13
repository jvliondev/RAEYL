import Link from "next/link";

import { registerUser } from "@/lib/actions/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

export default function GetStartedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="eyebrow">Developer Setup</p>
              <h1 className="text-4xl font-semibold tracking-tight">
                Give every client a handoff that feels finished.
              </h1>
              <p className="text-base text-muted">
                Build the ownership layer around the website, connect the right tools,
                define editing paths, and hand everything over with confidence.
              </p>
            </div>
            <div className="grid gap-4">
              {[
                "Create the website wallet your client will actually use.",
                "Connect hosting, CMS, billing visibility, domains, and support links.",
                "Invite the owner into a calm control center instead of a pile of handoff notes."
              ].map((item) => (
                <div key={item} className="rounded-md border border-white/10 bg-white/[0.03] p-4 text-sm text-muted">
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="block space-y-2">
            <div className="text-sm font-semibold tracking-[0.22em]">RAEYL</div>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Start with the developer path. Owner invitations, access, and handoff all happen inside the wallet flow.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={registerUser} className="space-y-4">
              <FormField label="Full name">
                <Input name="name" required placeholder="Alex Morgan" />
              </FormField>
              <FormField label="Work email">
                <Input name="email" type="email" required placeholder="alex@agency.com" />
              </FormField>
              <FormField label="Password" hint="Use at least 12 characters.">
                <Input name="password" type="password" required />
              </FormField>
              <FormField label="Agency or studio name">
                <Input name="agencyName" placeholder="Northline Studio" />
              </FormField>
              <SubmitButton className="w-full">Create developer account</SubmitButton>
            </form>
            <p className="mt-6 text-center text-sm text-muted">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-primary">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
