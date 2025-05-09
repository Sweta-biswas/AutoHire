/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-custom': 'linear-gradient(90deg, rgba(224, 231, 255, 0.9) 0%, rgba(243, 244, 255, 0.9) 50%, rgba(219, 234, 254, 0.9) 100%)',
      }
    },
   
  },
  plugins: [],
}