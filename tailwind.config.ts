import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B1220",
          50: "#F3F5F8",
          100: "#E4E8EE",
          200: "#C7CFDB",
          300: "#9DAAC0",
          400: "#6B7A98",
          500: "#4A5776",
          600: "#374260",
          700: "#293350",
          800: "#1A2238",
          900: "#0F1526",
          950: "#0B1220",
        },
        amber: {
          DEFAULT: "#E8590C",
          50: "#FFF4ED",
          100: "#FFE4D2",
          200: "#FFC6A3",
          300: "#FFA066",
          400: "#FF7A33",
          500: "#E8590C",
          600: "#C64607",
          700: "#9E3708",
          800: "#7C2C0C",
          900: "#66270E",
        },
        paper: "#FBFAF8",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-manrope)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,18,32,0.04), 0 8px 24px -8px rgba(11,18,32,0.10)",
        pop: "0 4px 12px -2px rgba(232,89,12,0.35)",
      },
      backgroundImage: {
        grain: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.5s ease both",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
