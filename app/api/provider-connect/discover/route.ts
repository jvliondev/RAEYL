import { NextRequest, NextResponse } from "next/server";

import { requireSession, requireWalletCapability } from "@/lib/auth/access";
import { discoverProviderResources } from "@/lib/services/provider-connect-broker";

export async function POST(request: NextRequest) {
  let session: Awaited<ReturnType<typeof requireSession>>;

  try {
    session = await requireSession();
  } catch {
    return NextResponse.json(
      { error: "unauthorized", message: "You must be signed in to verify a provider connection." },
      { status: 401 }
    );
  }

  let body: { walletId?: string; providerSlug?: string; apiToken?: string; externalTeamId?: string };

  try {
    body = (await request.json()) as {
      walletId?: string;
      providerSlug?: string;
      apiToken?: string;
      externalTeamId?: string;
    };
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: "Could not read the connection request." },
      { status: 400 }
    );
  }

  const walletId = body.walletId?.trim();
  const providerSlug = body.providerSlug?.trim().toLowerCase();
  const apiToken = body.apiToken?.trim();

  if (!walletId || !providerSlug || !apiToken) {
    return NextResponse.json(
      { error: "missing_fields", message: "Wallet, provider, and API token are required." },
      { status: 400 }
    );
  }

  try {
    await requireWalletCapability(walletId, session.user.id, "provider.write");
  } catch {
    return NextResponse.json(
      { error: "forbidden", message: "You do not have permission to connect tools in this wallet." },
      { status: 403 }
    );
  }

  try {
    const discovery = await discoverProviderResources({
      walletId,
      providerSlug,
      apiToken,
      externalTeamId: body.externalTeamId?.trim() || undefined
    });

    return NextResponse.json(discovery);
  } catch (error) {
    return NextResponse.json(
      {
        error: "verification_failed",
        message: error instanceof Error ? error.message : "Could not verify this provider token."
      },
      { status: 400 }
    );
  }
}
