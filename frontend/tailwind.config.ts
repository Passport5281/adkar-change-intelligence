import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        heat: {
          none: "#f1f5f9",
          low: "#bbf7d0",
          medium: "#fef08a",
          high: "#fed7aa",
          critical: "#fca5a5",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.15s ease-out",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
