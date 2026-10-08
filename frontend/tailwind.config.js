/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#0d1117",
        "surface-variant": "#161b22",
        "on-surface": "#f0f6fc",
        "on-surface-variant": "#8b949e",
        primary: "#6366f1",
        "primary-container": "#1e1b4b",
        "on-primary": "#ffffff",
        "on-primary-container": "#c7d2fe",
        "outline-variant": "#30363d"
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
        "2xl": "1.5rem",
        full: "9999px"
      },
      fontFamily: {
        headline: ["Inter", "sans-serif"],
        display: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Public Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      }
    }
  },
  plugins: [],
}
