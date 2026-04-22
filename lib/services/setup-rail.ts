import { prisma } from "@/lib/prisma";
import { getWalletTemplateBySlug } from "@/lib/data/wallet-templates";
import {
  buildSetupConnectionTargets,
  parseStoredSetupProfile,
  pickNextSetupConnectionTarget
} from "@/lib/services/setup-orchestrator";

export async function getWalletSetupConnectionTargets(walletId: string) {
  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId },
    include: {
      websites: {
        orderBy: {
          createdAt: "asc"
        },
        select: {
          id: true,
          name: true
        }
      },
      providers: {
        orderBy: {
          createdAt: "asc"
        },
        select: {
          id: true,
          providerName: true,
          category: true,
          connectionState: true,
          healthStatus: true,
          connectionConfidence: true,
          reconnectRequired: true,
          metadata: true
        }
      },
      settings: {
        where: {
          scope: "WALLET",
          key: {
            in: ["walletTemplate", "setupProfile"]
          }
        },
        select: {
          key: true,
          value: true
        }
      }
    }
  });

  if (!wallet) {
    throw new Error("Wallet not found.");
  }

  const settingMap = Object.fromEntries(wallet.settings.map((setting) => [setting.key, setting.value]));
  const templateSlug = typeof settingMap.walletTemplate === "string" ? settingMap.walletTemplate : null;
  const walletTemplate = getWalletTemplateBySlug(templateSlug);
  const setupProfile = parseStoredSetupProfile(settingMap.setupProfile);

  return buildSetupConnectionTargets({
    walletId,
    setupProfile,
    walletTemplate,
    providers: wallet.providers.map((provider) => ({
      id: provider.id,
      providerName: provider.providerName,
      category: provider.category,
      connectionState: provider.connectionState,
      healthStatus: provider.healthStatus,
      connectionConfidence: provider.connectionConfidence,
      reconnectRequired: provider.reconnectRequired,
      metadata:
        provider.metadata && typeof provider.metadata === "object" && !Array.isArray(provider.metadata)
          ? (provider.metadata as Record<string, unknown>)
          : {}
    })),
    websites: wallet.websites
  });
}

export async function getNextSetupConnectionTarget(walletId: string) {
  const targets = await getWalletSetupConnectionTargets(walletId);
  return pickNextSetupConnectionTarget(targets);
}

export function buildSetupTargetHref(input: {
  walletId: string;
  providerSlug: string;
  websiteId?: string | null;
  returnTo?: string | null;
  setupChain?: boolean;
}) {
  const params = new URLSearchParams({
    template: input.providerSlug
  });

  if (input.websiteId) {
    params.set("websiteId", input.websiteId);
  }

  if (input.returnTo) {
    params.set("returnTo", input.returnTo);
  }

  if (input.setupChain) {
    params.set("setupChain", "1");
  }

  return `/app/wallets/${input.walletId}/providers/new?${params.toString()}`;
}
