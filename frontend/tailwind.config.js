/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#e9fbf6",
          100: "#c9f4e8",
          400: "#34c9a4",
          500: "#14b890",
          600: "#0ea37e",
          700: "#0b8467"
        },
        ink: {
          50: "#f7f8fa",
          100: "#eef0f3",
          200: "#e3e6ea",
          400: "#9aa2ad",
          500: "#6b7280",
          700: "#3a4149",
          900: "#1c2126"
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(16, 24, 32, 0.04), 0 1px 3px 0 rgba(16, 24, 32, 0.06)"
      },
      borderRadius: {
        xl2: "1rem"
      }
    }
  },
  plugins: []
};
