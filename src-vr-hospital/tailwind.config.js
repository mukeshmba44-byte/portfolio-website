/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Warm, trustworthy clinical palette — deep blue, warm white, gold.
        navy: {
          900: '#04101f',
          800: '#071b31',
          700: '#0a2745',
          600: '#0f3559',
          500: '#164672',
        },
        gold: {
          400: '#f0cf94',
          500: '#e2b569',
          600: '#c9994a',
        },
        cream: {
          50: '#fbf8f3',
          100: '#f4ede1',
          200: '#e3d8c6',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
