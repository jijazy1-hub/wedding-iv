/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        champagne: {
          50:  "#fdf9f0",
          100: "#f9f0d8",
          200: "#f2dfa8",
          300: "#e8c96e",
          400: "#ddb040",
          500: "#c8962a",
          600: "#a87620",
          700: "#875d1c",
          800: "#6e4b1d",
          900: "#5c3f1a",
        },
        blush: {
          50:  "#fdf4f4",
          100: "#fbe8e8",
          200: "#f8d5d5",
          300: "#f2b4b4",
          400: "#e88585",
          500: "#d95f5f",
          600: "#c44040",
          700: "#a43232",
          800: "#882d2d",
          900: "#712a2a",
        },
        ivory: "#faf7f2",
        "deep-green": "#1a2e1a",
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        body: ["var(--font-garamond)", "Georgia", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.8s ease forwards",
        "fade-up": "fadeUp 0.8s ease forwards",
        "fade-up-delay": "fadeUp 0.8s ease 0.3s forwards",
        "fade-up-delay2": "fadeUp 0.8s ease 0.6s forwards",
        "petal-fall": "petalFall linear infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        petalFall: {
          "0%": { transform: "translateY(-20px) rotate(0deg)", opacity: "0.8" },
          "100%": { transform: "translateY(100vh) rotate(360deg)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
