import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-inter)", "system-ui", "sans-serif"]
      },
      colors: {
        background: "#080808",
        foreground: "#f0f0f0",
        muted: "#767676",
        border: "#222222",
        card: "#0e0e0e",
        cardForeground: "#f0f0f0",
        primary: {
          DEFAULT: "#d0d0d0",
          foreground: "#0a0a0a"
        },
        secondary: {
          DEFAULT: "#141414",
          foreground: "#888888"
        },
        accent: {
          DEFAULT: "#4d8fff",
          foreground: "#ffffff"
        },
        success: "#34d399",
        warning: "#f59e0b",
        destructive: "#ef4444",
        ring: "#3a3a3a",
        /* Titanium scale for granular control */
        silver: {
          "50":  "#fafafa",
          "100": "#f0f0f0",
          "200": "#d8d8d8",
          "300": "#b8b8b8",
          "400": "#909090",
          "500": "#686868",
          "600": "#484848",
          "700": "#2e2e2e",
          "800": "#1a1a1a",
          "900": "#0e0e0e"
        }
      },
      boxShadow: {
        /* Inset highlight + deep cast shadow — the "luxury object on a shelf" look */
        card:     "inset 0 1px 0 rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.45)",
        elevated: "inset 0 1px 0 rgba(255,255,255,0.06), 0 40px 100px rgba(0,0,0,0.55)",
        panel:    "inset 0 1px 0 rgba(255,255,255,0.08), 0 60px 140px rgba(0,0,0,0.65)",
        "btn-metal": "inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.5)",
        "btn-metal-hover": "inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.55)",
        "glow-blue": "0 0 40px rgba(77,143,255,0.12)",
        "glow-white": "0 0 60px rgba(255,255,255,0.04)"
      },
      backgroundImage: {
        "metal-primary":  "linear-gradient(135deg, #d4d4d4 0%, #a0a0a0 30%, #4a4a4a 65%, #585858 85%, #1e1e1e 100%)",
        "metal-button":   "linear-gradient(135deg, #d8d8d8 0%, #acacac 40%, #c4c4c4 100%)",
        "metal-button-h": "linear-gradient(135deg, #e8e8e8 0%, #bfbfbf 40%, #d4d4d4 100%)",
        "surface-shine":  "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)",
        "hero-radial":    "radial-gradient(ellipse 80% 55% at 50% -5%, rgba(255,255,255,0.04), transparent)",
        "dot-grid":       "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)"
      },
      backgroundSize: {
        "dot-28": "28px 28px"
      },
      borderRadius: {
        xl:  "0.75rem",
        "2xl": "1rem",
        "3xl": "1.25rem"
      },
      animation: {
        "fade-up":   "fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in":   "fadeIn 0.5s cubic-bezier(0.16,1,0.3,1) both",
        shimmer:     "shimmer 2.5s linear infinite"
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" }
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" }
        }
      }
    }
  },
  plugins: []
};

export default config;
