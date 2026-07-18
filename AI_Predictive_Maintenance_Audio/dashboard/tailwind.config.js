/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0a0a0f',
        purple: {
          500: '#8b5cf6',
          900: '#4c1d95',
        }
      }
    },
  },
  plugins: [],
}
