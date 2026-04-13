import { prisma } from "@/lib/prisma";
import type { WalletCreateInput } from "@/lib/validation/backend";

export const walletRepository = {
  create(data: WalletCreateInput & { createdById: string }) {
    return prisma.wallet.create({
      data: {
        ...data,
        primaryDeveloperId: data.createdById,
        status: "IN_SETUP",
        setupStatus: "PROFILE_COMPLETE"
      }
    });
  },
  findByUser(userId: string) {
    return prisma.wallet.findMany({
      where: {
        memberships: {
          some: {
            userId
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    });
  },
  findById(walletId: string) {
    return prisma.wallet.findUnique({
      where: { id: walletId },
      include: {
        memberships: true,
        websites: true,
        providers: true,
        alerts: true,
        billingRecords: true
      }
    });
  }
};
