/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors for skill levels to make visual pairing easy
        level: {
          beginner: '#a7f3d0',     // Light green
          intermediate: '#fef08a', // Yellow
          advanced: '#fed7aa',     // Orange
          expert: '#fecaca',       // Red
          vip: '#e9d5ff'           // Purple
        }
      }
    },
  },
  plugins: [],
}
