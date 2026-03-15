import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: "#07111f",
        ink: "#ecf2ff",
        muted: "#8aa0c2",
        accent: "#78e7ff",
        line: "rgba(148, 163, 184, 0.18)"
      },
      boxShadow: {
        panel: "0 20px 60px rgba(2, 8, 23, 0.45)"
      },
      backgroundImage: {
        "hero-grid": "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
