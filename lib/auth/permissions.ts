import { WalletRole } from "@/lib/types";

export type Capability =
  | "wallet.read"
  | "wallet.write"
  | "website.write"
  | "provider.read"
  | "provider.write"
  | "billing.read"
  | "billing.write"
  | "access.manage"
  | "handoff.manage"
  | "alerts.manage"
  | "support.read"
  | "support.write"
  | "settings.read"
  | "settings.write"
  | "admin.access"
  | "notifications.read";

const roleCapabilities: Record<WalletRole, Capability[]> = {
  platform_admin: [
    "wallet.read",
    "wallet.write",
    "website.write",
    "provider.read",
    "provider.write",
    "billing.read",
    "billing.write",
    "access.manage",
    "handoff.manage",
    "alerts.manage",
    "support.read",
    "support.write",
    "settings.read",
    "settings.write",
    "admin.access",
    "notifications.read"
  ],
  wallet_owner: [
    "wallet.read",
    "wallet.write",
    "website.write",
    "provider.read",
    "provider.write",
    "billing.read",
    "billing.write",
    "access.manage",
    "handoff.manage",
    "alerts.manage",
    "support.read",
    "support.write",
    "settings.read",
    "settings.write",
    "notifications.read"
  ],
  developer: [
    "wallet.read",
    "wallet.write",
    "website.write",
    "provider.read",
    "provider.write",
    "access.manage",
    "handoff.manage",
    "alerts.manage",
    "support.read",
    "support.write",
    "settings.read",
    "settings.write",
    "notifications.read"
  ],
  editor: [
    "wallet.read",
    "provider.read",
    "support.read",
    "support.write",
    "settings.read",
    "notifications.read"
  ],
  viewer: ["wallet.read", "settings.read", "notifications.read"],
  billing_manager: [
    "wallet.read",
    "billing.read",
    "billing.write",
    "support.read",
    "support.write",
    "settings.read",
    "notifications.read"
  ],
  support: [
    "wallet.read",
    "provider.read",
    "alerts.manage",
    "support.read",
    "support.write",
    "settings.read",
    "notifications.read"
  ]
};

function normalizeRole(role: string): WalletRole {
  return role.toLowerCase() as WalletRole;
}

export function hasCapability(role: WalletRole | string, capability: Capability) {
  return roleCapabilities[normalizeRole(role)].includes(capability);
}

export function listCapabilities(role: WalletRole | string) {
  return roleCapabilities[normalizeRole(role)];
}

export function assertCapability(
  role: WalletRole | string,
  capability: Capability,
  message = "You do not have permission to perform this action."
) {
  if (!hasCapability(role, capability)) {
    throw new Error(message);
  }
}
