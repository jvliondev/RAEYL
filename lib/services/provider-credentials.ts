import { Prisma, SecretStatus, SecretType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { encryptSecret, fingerprintSecret, maskSecret } from "@/lib/security/encryption";

type StoreProviderSecretInput = {
  providerConnectionId: string;
  secretType: SecretType;
  rawValue: string;
  createdById?: string;
  environment?: "PRODUCTION" | "STAGING" | "DEVELOPMENT" | "SHARED";
  scopes?: string[];
  expiresAt?: Date;
};

type PrismaLike = typeof prisma | Prisma.TransactionClient;

export async function storeProviderSecret(
  db: PrismaLike,
  {
    providerConnectionId,
    secretType,
    rawValue,
    createdById,
    environment = "PRODUCTION",
    scopes = [],
    expiresAt
  }: StoreProviderSecretInput
) {
  await db.providerSecret.updateMany({
    where: {
      providerConnectionId,
      secretType,
      status: SecretStatus.ACTIVE
    },
    data: {
      status: SecretStatus.ROTATED,
      rotatedAt: new Date()
    }
  });

  return db.providerSecret.create({
    data: {
      providerConnectionId,
      secretType,
      environment,
      encryptedValue: encryptSecret(rawValue),
      keyVersion: 1,
      valueFingerprint: fingerprintSecret(rawValue),
      maskedPreview: maskSecret(rawValue),
      scopes,
      expiresAt,
      createdById
    }
  });
}
