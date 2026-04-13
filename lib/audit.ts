import { auditLogSchema } from "@/lib/validation/backend";
import { log } from "@/lib/logging";

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

  return parsed;
}
