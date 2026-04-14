"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth/config";
import { recordAuditEvent } from "@/lib/audit";
import { emailSchema } from "@/lib/validation/backend";

export async function registerUser(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = emailSchema.parse(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const agencyName = String(formData.get("agencyName") ?? "").trim();

  if (password.length < 12) {
    throw new Error("Password must be at least 12 characters.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("An account already exists for this email.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash
    }
  });

  await recordAuditEvent({
    actorUserId: user.id,
    actorType: "USER",
    entityType: "USER",
    entityId: user.id,
    action: "user.created",
    summary: `New user created${agencyName ? ` for ${agencyName}` : ""}.`
  });

  await signIn("credentials", {
    email,
    password,
    redirect: false
  });

  redirect("/app/onboarding");
}

export async function loginWithCredentials(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/app"
    });
  } catch (error) {
    // next-auth throws a redirect error on success — re-throw it so the redirect works
    const { isRedirectError } = await import("next/dist/client/components/redirect-error");
    if (isRedirectError(error)) throw error;
    return "Invalid email or password. Please try again.";
  }

  return null;
}
