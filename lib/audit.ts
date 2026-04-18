import { auditLogSchema } from "@/lib/validation/backend";
import { log } from "@/lib/logging";
import { prisma } from "@/lib/prisma";

export type AuditInput = Parameters<typeof auditLogSchema.parse>[0];

export function buildAuditEntry(input: AuditInput) {
  return auditLogSchema.parse(input);
}

export async function recordAuditEvent(input: AuditInput) {
  const parsed = buildAuditEntry(input);

  log("info", "audit.event.recorded", {
    requestId: parsed.requestId,
    userId: parsed.actorUserId,
    walletId: parsed.walletId,
    entityId: parsed.entityId,
    action: parsed.action,
    metadata: {
      actorType: parsed.actorType,
      entityType: parsed.entityType
    }
  });

  return prisma.auditLog.create({
    data: {
      actorUserId: parsed.actorUserId,
      actorType: parsed.actorType,
      walletId: parsed.walletId,
      entityType: parsed.entityType,
      entityId: parsed.entityId,
      action: parsed.action,
      summary: parsed.summary,
      metadata: parsed.metadata,
      ipAddress: parsed.ipAddress,
      userAgent: parsed.userAgent,
      requestId: parsed.requestId
    }
  });
}
