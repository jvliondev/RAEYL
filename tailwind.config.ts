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
      colors: {
        background: "#07071a",
        foreground: "#eeeeff",
        muted: "#6b6b9a",
        border: "#1a1a38",
        card: "#0c0c22",
        cardForeground: "#eeeeff",
        primary: {
          DEFAULT: "#8b5cf6",
          foreground: "#ffffff"
        },
        secondary: {
          DEFAULT: "#1a1a35",
          foreground: "#c4c4dd"
        },
        accent: {
          DEFAULT: "#22d3ee",
          foreground: "#0a0a1f"
        },
        success: "#34d399",
        warning: "#fbbf24",
        destructive: "#f87171",
        ring: "#8b5cf6",
        violet: {
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9"
        }
      },
      boxShadow: {
        panel: "0 24px 80px rgba(0,0,0,0.45)",
        soft: "0 16px 40px rgba(0,0,0,0.28)",
        glow: "0 0 40px rgba(139,92,246,0.25)",
        "glow-cyan": "0 0 40px rgba(34,211,238,0.18)",
        "glow-sm": "0 0 20px rgba(139,92,246,0.2)"
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem"
      },
      backgroundImage: {
        grid: "linear-gradient(to right, rgba(139,92,246,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(139,92,246,0.07) 1px, transparent 1px)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-glow":
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(139,92,246,0.25), transparent)"
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        pulse: "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite"
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
