import { NextRequest, NextResponse } from "next/server";

import { requireSession, requireWalletCapability } from "@/lib/auth/access";

async function fetchJson<T>(url: string, token: string) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase verification failed (${response.status}): ${body || "Unknown response."}`);
  }

  return (await response.json()) as T;
}

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
      { error: "missing_fields", message: "Wallet and access token are required." },
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
    const [organizations, projects] = await Promise.all([
      fetchJson<Array<{ id: string; slug?: string; name?: string }>>(
        "https://api.supabase.com/v1/organizations",
        apiToken
      ).catch(() => []),
      fetchJson<
        Array<{
          id: string;
          ref?: string;
          organization_id?: string;
          organization_slug?: string;
          name?: string;
          region?: string;
        }>
      >("https://api.supabase.com/v1/projects", apiToken).catch(() => [])
    ]);

    const selectedOrganization =
      organizations.find(
        (organization) =>
          organization.id === body.externalTeamId ||
          organization.slug === body.externalTeamId ||
          organization.name === body.externalTeamId
      ) ?? null;

    const visibleProjects = selectedOrganization
      ? projects.filter(
          (project) =>
            project.organization_id === selectedOrganization.id ||
            project.organization_slug === selectedOrganization.slug
        )
      : projects;

    return NextResponse.json({
      accountLabel:
        selectedOrganization?.name ??
        selectedOrganization?.slug ??
        projects[0]?.organization_slug ??
        "Verified Supabase account",
      organizations: organizations.map((organization) => ({
        id: organization.id,
        slug: organization.slug ?? null,
        label: organization.name ?? organization.slug ?? organization.id
      })),
      projects: visibleProjects.map((project) => ({
        id: project.id,
        ref: project.ref ?? project.id,
        name: project.name ?? project.ref ?? project.id,
        organizationId: project.organization_id ?? null,
        region: project.region ?? null
      })),
      selectedOrganizationId: selectedOrganization?.id ?? null,
      billingUrl: selectedOrganization?.slug
        ? `https://supabase.com/dashboard/org/${selectedOrganization.slug}/billing`
        : "https://supabase.com/dashboard/account/tokens"
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "verification_failed",
        message: error instanceof Error ? error.message : "Could not verify the Supabase token."
      },
      { status: 400 }
    );
  }
}
