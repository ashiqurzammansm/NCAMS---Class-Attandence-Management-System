/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef9ff', 100: '#d8f0ff', 200: '#b9e4ff', 300: '#8fd4ff',
          400: '#5dbdff', 500: '#2fa4ff', 600: '#1181e6', 700: '#0c66b8',
          800: '#0d5291', 900: '#0e4476'
        }
      }
    },
  },
  plugins: [],
}
