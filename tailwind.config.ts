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
        pastel: {
          pink: "#fce4ec",
          "pink-light": "#f8bbd9",
          purple: "#e1bee7",
          "purple-light": "#ce93d8",
          lavender: "#d1c4e9",
          yellow: "#fff9c4",
          "yellow-light": "#fff59d",
        },
      },
    },
  },
  plugins: [],
};
export default config;
