"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageSquare, Plus, Send, X } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type RateLimitError = {
  error: "rate_limited";
  message: string;
  limit: number;
  count: number;
  overage_price?: number;
};

// ── Constants ──────────────────────────────────────────────────────────────────
const SESSION_LIMIT = 20;       // messages before summarise prompt
const SESSION_WARN  = 16;       // warn at this count
const SEND_LIMIT    = 12;       // max messages sent to API per request
const STORAGE_KEY   = (id: string) => `raeyl_chat_${id}`;
const COUNT_KEY     = (id: string) => `raeyl_chat_count_${id}`;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function loadMessages(walletId: string): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(walletId));
    if (!raw) return [];
    return JSON.parse(raw) as Message[];
  } catch {
    return [];
  }
}

function saveMessages(walletId: string, messages: Message[]) {
  try {
    localStorage.setItem(STORAGE_KEY(walletId), JSON.stringify(messages));
  } catch { /* quota exceeded — ignore */ }
}

function clearMessages(walletId: string) {
  try {
    localStorage.removeItem(STORAGE_KEY(walletId));
  } catch { /* ignore */ }
}

// ── Component ──────────────────────────────────────────────────────────────────
export function WalletChat({ walletId, compact = false }: { walletId: string; compact?: boolean }) {
  const [messages, setMessages]         = useState<Message[]>([]);
  const [input, setInput]               = useState("");
  const [streaming, setStreaming]       = useState(false);
  const [summarising, setSummarising]   = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [rateLimited, setRateLimited]   = useState<RateLimitError | null>(null);
  const [remaining, setRemaining]       = useState<string | null>(null);
  const [used, setUsed]                 = useState<number | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);

  const abortRef  = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load persisted messages on mount
  useEffect(() => {
    const saved = loadMessages(walletId);
    setMessages(saved);
  }, [walletId]);

  // Persist whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(walletId, messages);
    }
  }, [messages, walletId]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  // ── Send message ─────────────────────────────────────────────────────────────
  async function send() {
    const trimmed = input.trim();
    if (!trimmed || streaming || summarising) return;

    const userMsg: Message    = { id: uid(), role: "user",      content: trimmed };
    const assistantId         = uid();
    const assistantMsg: Message = { id: assistantId, role: "assistant", content: "" };

    const next = [...messages, userMsg, assistantMsg];
    setMessages(next);
    setInput("");
    setError(null);
    setRateLimited(null);
    setStreaming(true);
    scrollToBottom();

    // Only send last SEND_LIMIT messages as context
    const payload = [...messages, userMsg]
      .slice(-SEND_LIMIT)
      .map((m) => ({ role: m.role, content: m.content }));

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const res = await fetch(`/api/wallet/${walletId}/agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
        signal: abort.signal
      });

      // Handle non-streaming error responses
      if (!res.ok) {
        const contentType = res.headers.get("Content-Type") ?? "";
        if (contentType.includes("application/json")) {
          const data = await res.json();
          if (res.status === 503 && data.error === "not_configured") {
            setNotConfigured(true);
            setMessages((prev) => prev.filter((m) => m.id !== assistantId));
            return;
          }
          if (res.status === 429 && data.error === "rate_limited") {
            setRateLimited(data as RateLimitError);
            setMessages((prev) => prev.filter((m) => m.id !== assistantId));
            return;
          }
        }
        throw new Error(`Request failed: ${res.status}`);
      }

      // Read rate-limit headers
      const remainingHeader = res.headers.get("X-RateLimit-Remaining");
      const usedHeader = res.headers.get("X-RateLimit-Used");
      if (remainingHeader) setRemaining(remainingHeader);
      if (usedHeader) setUsed(Number(usedHeader));

      // Stream the text response
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + chunk } : m
            )
          );
          scrollToBottom();
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError("Something went wrong. Please try again.");
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  // ── New conversation ─────────────────────────────────────────────────────────
  function newConversation() {
    clearMessages(walletId);
    setMessages([]);
    setError(null);
    setRateLimited(null);
  }

  // ── Summarise + continue ─────────────────────────────────────────────────────
  async function summariseAndContinue() {
    if (summarising || streaming) return;
    setSummarising(true);
    setError(null);

    try {
      const res = await fetch(`/api/wallet/${walletId}/agent/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content }))
        })
      });

      if (!res.ok) throw new Error("Summarisation failed.");
      const { summary } = await res.json();

      const summaryNote: Message = {
        id: uid(),
        role: "assistant",
        content: `_Previous conversation summarised:_ ${summary}`
      };

      clearMessages(walletId);
      const fresh = [summaryNote];
      setMessages(fresh);
      saveMessages(walletId, fresh);
    } catch {
      setError("Could not summarise the conversation. Try starting a new one.");
    } finally {
      setSummarising(false);
    }
  }

  // ── Derived state ────────────────────────────────────────────────────────────
  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const atLimit          = userMessageCount >= SESSION_LIMIT;
  const nearLimit        = userMessageCount >= SESSION_WARN && !atLimit;

  // ── Render ────────────────────────────────────────────────────────────────────
  if (notConfigured) {
    return (
      <div className="flex h-full items-center justify-center text-center p-4">
        <div>
          <MessageSquare className="h-8 w-8 text-muted mx-auto mb-3" />
          <p className="text-sm font-medium">AI assistant not configured</p>
          <p className="text-xs text-muted mt-1">
            Add <code className="text-xs">ANTHROPIC_API_KEY</code> to your environment to enable this.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-2">

      {/* Header row */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="text-xs text-muted">
          {used !== null
            ? `${used} of 30 messages used this month`
            : remaining !== null
            ? `${remaining} messages left this month`
            : null}
        </div>
        {messages.length > 0 && (
          <button
            onClick={newConversation}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted hover:text-foreground hover:bg-white/5 transition"
          >
            <Plus className="h-3 w-3" />
            New chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center px-4">
            <div className="max-w-xs space-y-1">
              <p className="text-sm font-medium">Ask anything about your website</p>
              <p className="text-xs text-muted">
                How to update content, where to manage billing, what tools are connected, and more.
              </p>
              <div className="pt-3 flex flex-wrap gap-2 justify-center">
                {["How do I edit my website?", "What tools are connected?", "What does my site cost?"].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); }}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted hover:text-foreground hover:border-white/20 transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  m.role === "user"
                    ? "max-w-[80%] rounded-2xl rounded-tr-sm bg-white/10 px-3.5 py-2.5 text-sm"
                    : "max-w-[92%] rounded-2xl rounded-tl-sm bg-white/[0.04] border border-white/10 px-3.5 py-3 text-sm leading-relaxed"
                }
              >
                {m.content || (m.role === "assistant" && streaming ? (
                  <span className="inline-flex gap-1 text-muted">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse" style={{ animationDelay: "0.15s" }}>●</span>
                    <span className="animate-pulse" style={{ animationDelay: "0.3s" }}>●</span>
                  </span>
                ) : null)}
              </div>
            </div>
          ))
        )}

        {/* Rate limit error */}
        {rateLimited && (
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 space-y-2">
            <p className="text-xs font-medium text-foreground">
              30 included messages used for {new Date().toLocaleString("default", { month: "long" })}
            </p>
            <p className="text-xs text-muted">
              Your $99/month plan includes 30 messages. Additional messages are{" "}
              <span className="text-foreground">${(rateLimited.overage_price ?? 0.016).toFixed(3)} each</span>{" "}
              — contact support to enable overage billing.
            </p>
          </div>
        )}

        {/* General error */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-xs text-destructive flex-1">{error}</p>
            <button onClick={() => setError(null)}>
              <X className="h-3 w-3 text-muted hover:text-foreground" />
            </button>
          </div>
        )}

        {/* Session limit */}
        {atLimit && (
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-center space-y-3">
            <p className="text-xs text-muted">
              Long conversation — continuing costs more per message. Start fresh or summarise to keep going.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={summariseAndContinue}
                disabled={summarising}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5 transition disabled:opacity-50"
              >
                {summarising ? "Summarising…" : "Summarise and continue"}
              </button>
              <button
                onClick={newConversation}
                className="rounded-lg bg-foreground/10 border border-white/10 px-3 py-1.5 text-xs hover:bg-white/[0.12] transition"
              >
                Start new conversation
              </button>
            </div>
          </div>
        )}

        {/* Near-limit warning */}
        {nearLimit && !atLimit && (
          <p className="text-center text-xs text-muted">
            {SESSION_LIMIT - userMessageCount} messages left in this session.
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="flex gap-2 flex-shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={atLimit ? "Start a new conversation to continue…" : "Ask about your website…"}
          disabled={streaming || summarising || atLimit || !!rateLimited}
          className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition disabled:opacity-40 disabled:cursor-not-allowed"
        />
        {streaming ? (
          <button
            type="button"
            onClick={stop}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs text-muted hover:text-foreground transition"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim() || atLimit || !!rateLimited}
            className="rounded-xl bg-foreground px-3.5 py-2.5 text-background disabled:opacity-30 hover:opacity-90 transition"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        )}
      </form>
    </div>
  );
}
