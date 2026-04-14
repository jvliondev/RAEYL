"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth/config";
import { recordAuditEvent } from "@/lib/audit";
import { emailSchema } from "@/lib/validation/backend";

export async function registerUser(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const name = String(formData.get("name") ?? "").trim();
  const rawEmail = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const agencyName = String(formData.get("agencyName") ?? "").trim();

  if (!name) return "Please enter your full name.";
  if (password.length < 12) return "Password must be at least 12 characters.";

  let email: string;
  try {
    email = emailSchema.parse(rawEmail);
  } catch {
    return "Please enter a valid email address.";
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return "An account already exists for this email. Try signing in instead.";

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, name, passwordHash }
  });

  await recordAuditEvent({
    actorUserId: user.id,
    actorType: "USER",
    entityType: "USER",
    entityId: user.id,
    action: "user.created",
    summary: `New user created${agencyName ? ` for ${agencyName}` : ""}.`
  });

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch {
    // If auto-sign-in fails, redirect to sign-in page rather than crashing
    redirect("/sign-in?registered=1");
  }

  redirect("/app/onboarding");
}

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/app" });
}

export async function sendMagicLink(
  _prevState: { sent?: boolean; email?: string; error?: string } | null,
  formData: FormData
): Promise<{ sent?: boolean; email?: string; error?: string }> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  if (!process.env.RESEND_API_KEY) {
    return { error: "Email sign-in is not configured yet. Sign in with your password or Google." };
  }

  try {
    await signIn("resend", { email, redirect: false });
    return { sent: true, email };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Could not send the sign-in link. Please try again." };
    }
    throw error;
  }
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
    if (error instanceof AuthError) {
      return "Invalid email or password. Please try again.";
    }
    // re-throw redirect errors so Next.js can handle the redirect
    throw error;
  }

  return null;
}
