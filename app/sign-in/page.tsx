import Link from "next/link";

import { loginWithCredentials } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="block space-y-2">
          <div className="text-sm font-semibold tracking-[0.22em]">RAEYL</div>
          <CardTitle>Sign in to your wallet</CardTitle>
          <CardDescription>
            Open your website control center to review connected tools, costs, access, and the right next step.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={loginWithCredentials} className="space-y-4">
            <FormField label="Email">
              <Input type="email" name="email" required placeholder="you@business.com" />
            </FormField>
            <FormField label="Password">
              <Input type="password" name="password" required placeholder="Your password" />
            </FormField>
            <SubmitButton className="w-full">Open my wallet</SubmitButton>
          </form>
          <div className="mt-4 grid gap-3">
            <Button variant="secondary">Send a sign-in link</Button>
            <Button variant="secondary">Continue with Google</Button>
          </div>
          <p className="mt-6 text-center text-sm text-muted">
            New to RAEYL?{" "}
            <Link href="/get-started" className="text-primary">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
