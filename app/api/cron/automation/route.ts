import { NextRequest, NextResponse } from "next/server";

import { runPlatformAutomationSweep } from "@/lib/services/automation-service";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");

  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runPlatformAutomationSweep();
  return NextResponse.json({ ok: true, wallets: result.length, result });
}
