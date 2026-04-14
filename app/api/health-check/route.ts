import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { checkWalletProviderHealth } from "@/lib/services/provider-health-service";
import { requireWalletCapability } from "@/lib/auth/access";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { walletId } = await req.json() as { walletId: string };
  if (!walletId) {
    return NextResponse.json({ error: "walletId is required" }, { status: 400 });
  }

  try {
    await requireWalletCapability(walletId, session.user.id, "provider.read");
    const results = await checkWalletProviderHealth(walletId, session.user.id);
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Health check failed" },
      { status: 500 }
    );
  }
}
