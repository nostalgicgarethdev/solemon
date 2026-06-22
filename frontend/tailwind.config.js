/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', "monospace"],
        body: ['"IBM Plex Mono"', "monospace"],
      },
      colors: {
        sol: "#9945FF",
        lemon: "#FFD93D",
        night: "#0B1020",
      },
    },
  },
  plugins: [],
};