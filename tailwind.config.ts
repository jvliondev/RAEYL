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
        background: "#061111",
        foreground: "#eef7f5",
        muted: "#8ca4a0",
        border: "#1b3432",
        card: "#0b1918",
        cardForeground: "#eff8f6",
        primary: {
          DEFAULT: "#6df2c2",
          foreground: "#032e22"
        },
        secondary: {
          DEFAULT: "#133c38",
          foreground: "#d9fcf1"
        },
        accent: {
          DEFAULT: "#4bd4f7",
          foreground: "#032a33"
        },
        success: "#5ce39f",
        warning: "#ffd166",
        destructive: "#ff7a7a",
        ring: "#7eead0"
      },
      boxShadow: {
        panel: "0 24px 80px rgba(0, 0, 0, 0.28)",
        soft: "0 16px 40px rgba(0, 0, 0, 0.18)"
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem"
      },
      backgroundImage: {
        grid: "linear-gradient(to right, rgba(109,242,194,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(109,242,194,0.08) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
