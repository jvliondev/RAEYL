"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { WalletChat } from "./wallet-chat";
import { RaeylMark } from "@/components/ui/raeyl-logo";

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
              <RaeylMark className="h-5 w-auto" />
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
          <RaeylMark className="h-8 w-auto" />
        )}
      </button>
    </div>
  );
}
