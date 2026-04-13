import { prisma } from "@/lib/prisma";

export const inviteRepository = {
  create(data: Parameters<typeof prisma.invite.create>[0]["data"]) {
    return prisma.invite.create({ data });
  },
  findActiveByWallet(walletId: string) {
    return prisma.invite.findMany({
      where: {
        walletId,
        status: {
          in: ["DRAFT", "SENT", "VIEWED"]
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }
};
