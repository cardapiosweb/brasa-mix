/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}", "./styles/**/*.{html,js}"],
  theme: {
    fontFamily:{
      'sans': ['Mulish', 'sans-serif']
    },
    extend: {
      backgroundImage:{
      "home": "url('/assets/img/bg.png')"
      }
    },
  },
  plugins: [],
}