import type { Session } from "next-auth";
import type { WalletRole } from "@prisma/client";

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { assertCapability, type Capability } from "@/lib/auth/permissions";

type AuthenticatedSession = Session & {
  user: NonNullable<Session["user"]> & {
    id: string;
  };
};

export async function requireSession(): Promise<AuthenticatedSession> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be signed in.");
  }

  return session as AuthenticatedSession;
}

export async function requireWalletMembership(walletId: string, userId: string) {
  const membership = await prisma.walletMembership.findUnique({
    where: {
      walletId_userId: {
        walletId,
        userId
      }
    }
  });

  if (!membership || membership.status !== "ACTIVE") {
    throw new Error("You do not have access to this wallet.");
  }

  return membership;
}

export async function requireWalletCapability(
  walletId: string,
  userId: string,
  capability: Capability
) {
  const membership = await requireWalletMembership(walletId, userId);
  assertCapability(membership.role.toLowerCase(), capability);
  return membership;
}

export async function requireWalletRole(
  walletId: string,
  userId: string,
  roles: Array<WalletRole | "PLATFORM_ADMIN">
) {
  const membership = await requireWalletMembership(walletId, userId);

  if (!roles.includes(membership.role)) {
    throw new Error("You do not have permission to perform this action.");
  }

  return membership;
}

export async function requireWebsiteInWallet(walletId: string, websiteId: string) {
  const website = await prisma.website.findFirst({
    where: {
      id: websiteId,
      walletId
    },
    select: {
      id: true,
      walletId: true
    }
  });

  if (!website) {
    throw new Error("This website does not belong to the selected wallet.");
  }

  return website;
}

export async function requireProviderInWallet(walletId: string, providerConnectionId: string) {
  const provider = await prisma.providerConnection.findFirst({
    where: {
      id: providerConnectionId,
      walletId
    },
    select: {
      id: true,
      walletId: true,
      websiteId: true
    }
  });

  if (!provider) {
    throw new Error("This provider does not belong to the selected wallet.");
  }

  return provider;
}

export async function requireAdmin(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || user.type !== "ADMIN") {
    throw new Error("Administrator access is required.");
  }

  return user;
}
