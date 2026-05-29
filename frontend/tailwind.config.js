/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0d0e12",
        cardBg: "rgba(17, 18, 24, 0.75)",
        cardBorder: "rgba(255, 255, 255, 0.08)",
        accentViolet: "#7c3aed",
        accentIndigo: "#4f46e5",
        accentEmerald: "#10b981",
        accentCyan: "#06b6d4",
        mutedText: "#9ca3af",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glowViolet: "0 0 15px rgba(124, 58, 237, 0.3)",
        glowEmerald: "0 0 15px rgba(16, 185, 129, 0.3)",
        glowCyan: "0 0 15px rgba(6, 182, 212, 0.3)",
      }
    },
  },
  plugins: [],
}
