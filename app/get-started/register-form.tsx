"use client";

import { useActionState } from "react";
import Link from "next/link";

import { registerUser } from "@/lib/actions/auth";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

export function RegisterForm() {
  const [error, action] = useActionState(registerUser, null);

  return (
    <form action={action} className="space-y-4">
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
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <SubmitButton className="w-full" pendingLabel="Creating account...">
        Create developer account
      </SubmitButton>
      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-primary">
          Sign in
        </Link>
      </p>
    </form>
  );
}
