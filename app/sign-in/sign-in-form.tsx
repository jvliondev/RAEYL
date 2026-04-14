"use client";

import { useActionState } from "react";

import { loginWithCredentials } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

export function SignInForm() {
  const [error, action] = useActionState(loginWithCredentials, null);

  return (
    <form action={action} className="space-y-4">
      <FormField label="Email">
        <Input type="email" name="email" required placeholder="you@business.com" />
      </FormField>
      <FormField label="Password">
        <Input type="password" name="password" required placeholder="Your password" />
      </FormField>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <SubmitButton className="w-full" pendingLabel="Signing in...">Open my wallet</SubmitButton>
    </form>
  );
}
