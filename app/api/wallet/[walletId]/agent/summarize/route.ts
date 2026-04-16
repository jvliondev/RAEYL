import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { NextRequest } from "next/server";

import { requireSession } from "@/lib/auth/access";
import { buildWalletAgentContext } from "@/lib/services/agent-context";

export const maxDuration = 30;

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
    return new Response(JSON.stringify({ error: "not_configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" }
    });
  }

  const { walletId } = await params;

  const ctx = await buildWalletAgentContext(walletId, session.user.id);
  if (!ctx) {
    return new Response("Wallet not found.", { status: 404 });
  }

  let messages: { role: string; content: string }[];
  try {
    const body = await req.json();
    if (!Array.isArray(body.messages)) throw new Error("invalid");
    messages = body.messages;
  } catch {
    return new Response("Invalid request body.", { status: 400 });
  }

  // Summarisation is infrastructure — intentionally not counted against the
  // wallet's 30-message monthly allowance. It runs once per session reset.
  if (messages.length === 0) {
    return Response.json({ summary: "" });
  }

  const transcript = messages
    .map((m) => `${m.role === "user" ? "Owner" : "Assistant"}: ${m.content}`)
    .join("\n\n");

  const { text } = await generateText({
    model: anthropic("claude-haiku-4-5-20251001"),
    system: `You are a conversation summarizer. Summarize the key points, decisions, and unresolved questions from this conversation between a website owner and their AI assistant. Be concise — 3 to 6 sentences. Write in third person. Only include what matters for continuing the conversation later.`,
    prompt: `Conversation to summarize for wallet "${ctx.businessName}":\n\n${transcript}`,
    maxOutputTokens: 300
  });

  return Response.json({ summary: text });
}
