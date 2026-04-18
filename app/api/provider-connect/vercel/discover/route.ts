import { NextRequest, NextResponse } from "next/server";

import { requireSession, requireWalletCapability } from "@/lib/auth/access";
import { getVercelConnectionSnapshot } from "@/lib/services/vercel-service";

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

  let body: { walletId?: string; apiToken?: string; externalTeamId?: string };

  try {
    body = (await request.json()) as { walletId?: string; apiToken?: string; externalTeamId?: string };
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: "Could not read the connection request." },
      { status: 400 }
    );
  }

  const walletId = body.walletId?.trim();
  const apiToken = body.apiToken?.trim();

  if (!walletId || !apiToken) {
    return NextResponse.json(
      { error: "missing_fields", message: "Wallet and API token are required." },
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
    const snapshot = await getVercelConnectionSnapshot({
      apiToken,
      externalTeamId: body.externalTeamId?.trim() || undefined
    });

    const visibleProjects = snapshot.selectedTeam
      ? snapshot.projects.filter((project) => project.accountId === snapshot.selectedTeam?.id)
      : snapshot.projects;

    return NextResponse.json({
      accountLabel: snapshot.accountLabel,
      user: snapshot.user,
      dashboardUrl: snapshot.dashboardUrl,
      billingUrl: snapshot.billingUrl,
      teams: snapshot.teams.map((team) => ({
        id: team.id,
        label: team.name ?? team.slug ?? team.id,
        slug: team.slug ?? null
      })),
      projects: visibleProjects.map((project) => ({
        id: project.id,
        name: project.name ?? project.id,
        accountId: project.accountId ?? null
      })),
      selectedTeamId: snapshot.selectedTeam?.id ?? null,
      selectedProjectId: snapshot.selectedProject?.id ?? null
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "verification_failed",
        message: error instanceof Error ? error.message : "Could not verify the Vercel token."
      },
      { status: 400 }
    );
  }
}
