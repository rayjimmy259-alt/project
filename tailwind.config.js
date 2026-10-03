/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e8f1ff",
          100: "#cfe0ff",
          200: "#a5c2ff",
          300: "#6b9bff",
          400: "#3b7aff",
          500: "#0A84FF",
          600: "#0069e0",
          700: "#0052b3",
          800: "#003d85",
          900: "#002a5c",
        },
        accent: {
          400: "#ff6b3d",
          500: "#ff5a1f",
          600: "#e64a0f",
        },
        success: {
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
        },
        warning: {
          400: "#fbbf24",
          500: "#f59e0b",
        },
        error: {
          400: "#f87171",
          500: "#ef4444",
        },
        ink: {
          950: "#070b14",
          900: "#0b101c",
          850: "#0f1626",
          800: "#141c30",
          700: "#1c2840",
          600: "#27334d",
          500: "#3a4a66",
          400: "#5a6a85",
          300: "#8a99b3",
          200: "#b8c4d6",
          100: "#e2e8f0",
          50: "#f5f7fa",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
