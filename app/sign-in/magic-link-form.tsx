"use client";

import { useActionState, useState } from "react";

import { sendMagicLink } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MagicLinkForm() {
  const [open, setOpen] = useState(false);
  const [result, action] = useActionState(sendMagicLink, null);

  if (result?.sent) {
    return (
      <div className="rounded-md border border-white/10 bg-white/[0.03] p-4 text-sm text-muted text-center">
        Check your email — a sign-in link is on its way to{" "}
        <span className="text-foreground">{result.email}</span>.
      </div>
    );
  }

  if (!open) {
    return (
      <Button variant="secondary" className="w-full" onClick={() => setOpen(true)}>
        Send a sign-in link
      </Button>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <Input
        type="email"
        name="email"
        required
        placeholder="you@business.com"
        autoFocus
      />
      {result?.error && (
        <p className="text-sm text-destructive">{result.error}</p>
      )}
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">Send link</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
