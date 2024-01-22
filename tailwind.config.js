/** @type {import('tailwindcss').Config} */
export default {
  purge: {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
  },
  theme: {
    extend: {
      colors: {
        primary: "#95BB20",
        secondary: "#00354e",
        'custom-gray': '#D6DBDC',
      },
      fontFamily: {
        sans: ["Myriad Variable Concept", "sans-serif"],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      'mytheme',
      'corporate',
    ],
  },
};