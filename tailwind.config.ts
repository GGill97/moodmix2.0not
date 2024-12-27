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
        terracotta: {
          DEFAULT: "rgb(226, 114, 91, 0.6)",
          light: "rgb(245, 182, 164, 0.4)",
        },
        "sandy-beige": "rgb(245, 222, 179, 0.4)",
        "soft-brown": "rgb(139, 69, 19, 0.8)",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        primary: ["var(--font-primary)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
