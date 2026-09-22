import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: "#050507",
          900: "#090a0f",
          850: "#0f111a",
          800: "#161926",
          700: "#222638",
        },
        cyber: {
          cyan: "#00f0ff",
          indigo: "#4f46e5",
          violet: "#8b5cf6",
          emerald: "#10b981",
          amber: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
        display: ["var(--font-display)", "Archivo", "sans-serif"],
      },
      animation: {
        "spin-slow": "spin 20s linear infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "radar-sweep": "radar 4s linear infinite",
        "scanline": "scanline 8s linear infinite",
      },
      keyframes: {
        radar: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
      },
      boxShadow: {
        "sharp": "0 1px 0 0 rgba(255, 255, 255, 0.08) inset, 0 10px 30px -10px rgba(0, 0, 0, 0.8)",
        "laser": "0 0 20px -5px rgba(0, 240, 255, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
