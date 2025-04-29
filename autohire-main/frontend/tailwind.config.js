/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-custom': 'linear-gradient(180deg, hsla(0, 0%, 100%, 1) 30%, hsla(237, 100%, 95%, 1) 100%)',
      }
    },
   
  },
  plugins: [],
}