import { prisma } from "@/lib/prisma";

export interface HandoffReadiness {
  requiredComplete: number;
  requiredTotal: number;
  recommendedComplete: number;
  recommendedTotal: number;
  isReadyForHandoff: boolean;
  canComplete: boolean;
  items: Array<{
    key: string;
    label: string;
    required: boolean;
    complete: boolean;
  }>;
}

export async function getHandoffReadiness(walletId: string): Promise<HandoffReadiness> {
  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId },
    include: {
      websites: {
        include: {
          editRoutes: true
        }
      },
      providers: true,
      invites: true,
      billingRecords: true
    }
  });

  if (!wallet) {
    throw new Error("Wallet not found.");
  }

  const items = [
    {
      key: "wallet_profile",
      label: "Wallet details completed",
      required: true,
      complete: Boolean(wallet.businessName && wallet.name)
    },
    {
      key: "website_added",
      label: "At least one website added",
      required: true,
      complete: wallet.websites.length > 0
    },
    {
      key: "provider_added",
      label: "Core website tools added",
      required: true,
      complete: wallet.providers.length > 0
    },
    {
      key: "owner_added",
      label: "Primary owner entered",
      required: true,
      complete: Boolean(wallet.ownerEmail)
    },
    {
      key: "primary_edit_route",
      label: "Primary edit path set",
      required: true,
      complete: wallet.websites.some((website) =>
        website.editRoutes.some((route) => route.isPrimary)
      )
    },
    {
      key: "owner_invited",
      label: "Ownership invite sent",
      required: true,
      complete: wallet.invites.some(
        (invite) => invite.inviteType === "OWNER_HANDOFF" && ["SENT", "VIEWED", "ACCEPTED"].includes(invite.status)
      )
    },
    {
      key: "billing_added",
      label: "Billing details added",
      required: false,
      complete: wallet.billingRecords.length > 0
    }
  ];

  const required = items.filter((item) => item.required);
  const recommended = items.filter((item) => !item.required);

  const requiredComplete = required.filter((item) => item.complete).length;
  const recommendedComplete = recommended.filter((item) => item.complete).length;
  const isReadyForHandoff = required.every((item) => item.complete);
  const canComplete = isReadyForHandoff && wallet.ownerAcceptanceStatus === "ACCEPTED";

  return {
    requiredComplete,
    requiredTotal: required.length,
    recommendedComplete,
    recommendedTotal: recommended.length,
    isReadyForHandoff,
    canComplete,
    items
  };
}
