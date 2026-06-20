/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        chatBgDark: '#212121',
        sidebarBgDark: '#171717',
      }
    },
  },
  plugins: [],
}