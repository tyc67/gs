/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      height: {
        'screen-10rem': 'calc(100vh - 10rem)',
      },
      spacing: {
        '1px': '1px',
      },
    },
  },
  plugins: [],
}