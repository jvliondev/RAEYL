import crypto from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { runBootstrapSeed } from "@/lib/services/bootstrap-seed";

function matchesSecret(provided: string, expected: string) {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.ADMIN_BOOTSTRAP_SECRET;

  if (!expectedSecret) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const providedSecret =
    request.headers.get("x-bootstrap-secret") ??
    (await request.json().catch(() => ({} as { secret?: string }))).secret ??
    "";

  if (!providedSecret || !matchesSecret(providedSecret, expectedSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await runBootstrapSeed(prisma);

  return NextResponse.json({
    ok: true,
    summary
  });
}
