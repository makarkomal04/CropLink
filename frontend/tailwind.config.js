/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'farmer-green': '#2e7d32', // Earthy green
        'farmer-brown': '#795548', // Soft brown
        'farmer-yellow': '#fff9c4', // Light yellow background
        'farmer-accent': '#8bc34a', // Lighter green for accents
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
