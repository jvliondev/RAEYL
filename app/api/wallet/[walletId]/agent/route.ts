import { anthropic } from "@ai-sdk/anthropic";
import { streamText, type SystemModelMessage } from "ai";
import { NextRequest } from "next/server";

import { requireSession } from "@/lib/auth/access";
import { prisma } from "@/lib/prisma";
import { buildWalletAgentContext, formatContextForPrompt } from "@/lib/services/agent-context";

export const maxDuration = 60;

// ── Included messages per wallet per month ────────────────────────────────────
const MONTHLY_INCLUDED = 30;
const OVERAGE_PRICE_USD = 0.016; // shown to user in limit messages

// ── Rate limiting via Setting model (per wallet, per calendar month) ──────────
async function checkAndIncrementMonthlyCount(
  walletId: string
): Promise<{ allowed: boolean; count: number; limit: number }> {
  const month = new Date().toISOString().slice(0, 7); // "2026-04"
  const key = `agent_count_${month}`;

  const existing = await prisma.setting.findFirst({
    where: { scope: "USER", userId: null, walletId, key }
  });

  const count = existing ? Number(existing.value) : 0;

  if (count >= MONTHLY_INCLUDED) {
    return { allowed: false, count, limit: MONTHLY_INCLUDED };
  }

  if (existing) {
    await prisma.setting.update({
      where: { id: existing.id },
      data: { value: count + 1 }
    });
  } else {
    await prisma.setting.create({
      data: { scope: "USER", userId: null, walletId, key, value: 1 }
    });
  }

  return { allowed: true, count: count + 1, limit: MONTHLY_INCLUDED };
}

// ── System prompt ──────────────────────────────────────────────────────────────
function buildSystemPrompt(contextBlock: string, role: string): string {
  const isOwner = role.toUpperCase() === "WALLET_OWNER";

  const persona = isOwner
    ? `You are the RAEYL website assistant — a friendly, knowledgeable guide for the website owner. Help the owner understand their website, find what they need, and feel confident managing it. Speak in plain language. Be warm, clear, and practical. Always reference the specific tools, URLs, and details in their wallet context.`
    : `You are the RAEYL workspace assistant — a knowledgeable partner for the developer or team member managing this wallet. Speak technically when helpful. Help with setup questions, explain wallet state, clarify provider details, and guide next steps. Reference the specific data in the wallet context.`;

  return `${persona}

--- WALLET CONTEXT ---
${contextBlock}
--- END CONTEXT ---

Rules:
- Base answers on the wallet context above. If something isn't there, say so honestly.
- For editing tasks, always point to the specific edit route URL from the context.
- For billing questions, reference the actual providers and costs from the context.
- For tool-specific help, reference dashboard and support URLs from the context.
- If an alert is present, mention it proactively when relevant.
- Keep responses concise and actionable. Use short paragraphs or bullet points.
- Never invent URLs, credentials, or account details.`;
}

// ── POST handler ───────────────────────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ walletId: string }> }
) {
  let session: Awaited<ReturnType<typeof requireSession>>;
  try {
    session = await requireSession();
  } catch {
    return new Response("Unauthorized.", { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "not_configured", message: "AI assistant is not configured yet." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const { walletId } = await params;

  const ctx = await buildWalletAgentContext(walletId, session.user.id);
  if (!ctx) {
    return new Response("Wallet not found or access denied.", { status: 404 });
  }

  // ── Rate limiting (per wallet, per calendar month) ───────────────────────────
  const rateCheck = await checkAndIncrementMonthlyCount(walletId);

  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({
        error: "rate_limited",
        message: `Your wallet has used all ${MONTHLY_INCLUDED} included messages for this month. Additional messages are $${OVERAGE_PRICE_USD.toFixed(3)} each — contact support to enable overages.`,
        limit: rateCheck.limit,
        count: rateCheck.count,
        overage_price: OVERAGE_PRICE_USD
      }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── Parse request body ───────────────────────────────────────────────────────
  let messages: { role: string; content: string }[];
  try {
    const body = await req.json();
    if (!Array.isArray(body.messages)) throw new Error("invalid");
    messages = body.messages;
  } catch {
    return new Response("Invalid request body.", { status: 400 });
  }

  // ── Trim to last 12 messages (server-side safety) ────────────────────────────
  const trimmed = messages.slice(-12);

  // ── Build system prompt with Anthropic cache_control ────────────────────────
  const contextBlock = formatContextForPrompt(ctx);
  const systemText = buildSystemPrompt(contextBlock, ctx.role);

  const systemMessage: SystemModelMessage = {
    role: "system",
    content: systemText,
    providerOptions: {
      anthropic: { cacheControl: { type: "ephemeral" } }
    }
  };

  // ── Stream ───────────────────────────────────────────────────────────────────
  const result = streamText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: systemMessage,
    messages: trimmed as import("ai").ModelMessage[],
    maxOutputTokens: 1024
  });

  return new Response(result.textStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-RateLimit-Limit": String(rateCheck.limit),
      "X-RateLimit-Remaining": String(Math.max(0, rateCheck.limit - rateCheck.count)),
      "X-RateLimit-Used": String(rateCheck.count)
    }
  });
}
