import { prisma } from "@/lib/prisma";

export const providerRepository = {
  create(data: Parameters<typeof prisma.providerConnection.create>[0]["data"]) {
    return prisma.providerConnection.create({ data });
  },
  listByWallet(walletId: string) {
    return prisma.providerConnection.findMany({
      where: { walletId },
      orderBy: { updatedAt: "desc" }
    });
  },
  findById(id: string) {
    return prisma.providerConnection.findUnique({
      where: { id },
      include: {
        secrets: true,
        billingRecords: true,
        alerts: true
      }
    });
  }
};
