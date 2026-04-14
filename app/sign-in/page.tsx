import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loginWithGoogle } from "@/lib/actions/auth";
import { SignInForm } from "./sign-in-form";
import { MagicLinkForm } from "./magic-link-form";

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
          <SignInForm />
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 text-sm text-muted">
              <div className="h-px flex-1 bg-white/10" />
              or continue with
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <form action={loginWithGoogle}>
              <Button type="submit" variant="secondary" className="w-full">
                Continue with Google
              </Button>
            </form>
            <MagicLinkForm />
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
