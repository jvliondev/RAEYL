import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInForm } from "./sign-in-form";

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
