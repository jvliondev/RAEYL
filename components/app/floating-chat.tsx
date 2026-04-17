"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { WalletChat } from "./wallet-chat";

/**
 * RaeylFloatMark — the R ribbon mark used as the chat toggle icon.
 * Gradient IDs are prefixed "fc-" to avoid conflicts with other SVG instances on the page.
 */
function RaeylFloatMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 130 172"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Purple/violet main face */}
        <linearGradient id="fc-purple" x1="15" y1="10" x2="115" y2="165" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#c084fc" />
          <stop offset="40%"  stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#5b21b6" />
        </linearGradient>
        {/* Cyan inner ribbon */}
        <linearGradient id="fc-cyan" x1="15" y1="165" x2="90" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#67e8f9" />
        </linearGradient>
        {/* Dark navy counter */}
        <linearGradient id="fc-navy" x1="95" y1="25" x2="38" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#0f0e2a" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>
      </defs>

      {/* Layer 1: Navy depth shadow */}
      <path
        d="M 18 158 L 18 14 L 68 14
           C 102 14 120 35 116 63
           C 113 86  97 101 75 105
           L 116 158 L 89 158
           L 53 107  L 40 107
           L 40 158 Z"
        fill="#1e1b4b"
        transform="translate(5 6)"
        opacity="0.85"
      />

      {/* Layer 2: Purple main body */}
      <path
        d="M 18 158 L 18 14 L 68 14
           C 102 14 120 35 116 63
           C 113 86  97 101 75 105
           L 116 158 L 89 158
           L 53 107  L 40 107
           L 40 158 Z"
        fill="url(#fc-purple)"
      />

      {/* Inner counter (bowl of R) */}
      <path
        d="M 40 32 L 40 89
           C 60 94  90 88  95 63
           C 100 37  68 30  40 32 Z"
        fill="url(#fc-navy)"
      />

      {/* Layer 3: Cyan inner ribbon strip */}
      <path
        d="M 14 14 C 18 8 26 8 34 11
           L 34 108 L 72 158 L 90 158
           L 52 108 L 52 13
           C 42 10 16 10 14 14 Z"
        fill="url(#fc-cyan)"
        opacity="0.9"
      />
    </svg>
  );
}

export function FloatingChat({ walletId }: { walletId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat panel — appears above the toggle button */}
      {open && (
        <div
          className="absolute bottom-[calc(100%+12px)] right-0 flex w-[340px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d0d] shadow-2xl"
          style={{
            height: 480,
            boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.05)"
          }}
        >
          {/* Panel header */}
          <div className="flex flex-shrink-0 items-center justify-between border-b border-white/[0.06] bg-black/30 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <RaeylFloatMark className="h-5 w-auto" />
              <span className="text-sm font-semibold text-white/80">Website Assistant</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-white/30 transition hover:bg-white/[0.05] hover:text-white/70"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Chat body */}
          <div className="min-h-0 flex-1 overflow-hidden p-3">
            <WalletChat walletId={walletId} compact />
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close assistant" : "Open website assistant"}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 active:scale-95"
        style={{
          background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 40%, #0891b2 100%)",
          boxShadow: "0 8px 32px rgba(124,58,237,0.45), 0 2px 8px rgba(0,0,0,0.6)"
        }}
      >
        {open ? (
          <X className="h-5 w-5 text-white" />
        ) : (
          <RaeylFloatMark className="h-8 w-auto" />
        )}
      </button>
    </div>
  );
}
