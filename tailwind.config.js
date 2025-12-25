/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#6B46C1", // tweak to your palette
          secondary: "#22C55E",
          accent: "#F59E0B",
        },
      },
      backgroundImage: {
        "z-shell":
          "radial-gradient(circle at top, rgba(56,189,248,0.12), transparent 55%), radial-gradient(circle at bottom right, rgba(16,185,129,0.10), transparent 55%), linear-gradient(to bottom, #020617, #020617)",
        "z-lab-header": "linear-gradient(to right, #020617, #020617, #020617)",
        "z-lab-surface":
          "radial-gradient(circle at top left, rgba(148,163,184,0.12), transparent 55%), linear-gradient(to bottom right, #020617, #020617)",
      },
      boxShadow: {
        // <-- this generates the 'shadow-card' utility
        card: "0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)",
        soft: "0 4px 14px rgba(0,0,0,0.06)",
      },
      borderRadius: {
        // guarantees rounded-2xl exists across versions
        "2xl": "1rem",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
