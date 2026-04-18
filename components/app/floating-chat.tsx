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
      viewBox="0 0 140 165"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="fc-body" x1="16" y1="8" x2="124" y2="158" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#efefef" />
          <stop offset="8%"   stopColor="#d6d6d6" />
          <stop offset="22%"  stopColor="#a0a0a0" />
          <stop offset="40%"  stopColor="#3c3c3c" />
          <stop offset="55%"  stopColor="#1a1a1a" />
          <stop offset="70%"  stopColor="#5a5a5a" />
          <stop offset="84%"  stopColor="#9e9e9e" />
          <stop offset="100%" stopColor="#b8b8b8" />
        </linearGradient>
        <linearGradient id="fc-ribbon" x1="54" y1="10" x2="36" y2="155" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#ffffff" />
          <stop offset="15%"  stopColor="#ebebeb" />
          <stop offset="42%"  stopColor="#c0c0c0" />
          <stop offset="68%"  stopColor="#848484" />
          <stop offset="100%" stopColor="#909090" />
        </linearGradient>
        <radialGradient id="fc-counter" cx="58%" cy="42%" r="54%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#1c1c1c" />
          <stop offset="100%" stopColor="#060606" />
        </radialGradient>
        <filter id="fc-shadow" x="-18%" y="-12%" width="145%" height="145%">
          <feDropShadow dx="3" dy="6" stdDeviation="7" floodColor="#000" floodOpacity="0.72" />
        </filter>
      </defs>

      <path
        d="M 22 158 L 20 16 C 20 10 38 8 66 10 C 102 12 124 32 122 64 C 120 90 104 108 80 112 L 120 158 L 96 158 L 60 112 L 42 112 L 42 158 Z"
        fill="#000000" opacity="0.6" transform="translate(4 5)"
      />
      <g filter="url(#fc-shadow)">
        <path
          d="M 22 158 L 20 16 C 20 10 38 8 66 10 C 102 12 124 32 122 64 C 120 90 104 108 80 112 L 120 158 L 96 158 L 60 112 L 42 112 L 42 158 Z"
          fill="url(#fc-body)"
        />
        <path
          d="M 42 30 L 42 92 C 56 100 94 96 100 68 C 106 40 82 26 42 30 Z"
          fill="url(#fc-counter)"
        />
        <path
          d="M 16 16 C 18 8 28 8 38 12 L 38 112 L 76 158 L 96 158 L 54 112 L 54 13 C 46 10 18 10 16 16 Z"
          fill="url(#fc-ribbon)" opacity="0.93"
        />
      </g>
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
