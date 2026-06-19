/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dsv: {
          green: '#1f7a3a',
          dark: '#14552a',
          red: '#d93025',
          cream: '#fff8ec',
          ink: '#1f2a24',
          muted: '#6b756f',
          line: '#e6eadf',
        },
      },
      keyframes: {
        heroSlide: {
          '0%, 28%': { transform: 'translateX(0)' },
          '33%, 61%': { transform: 'translateX(-100%)' },
          '66%, 94%': { transform: 'translateX(-200%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        heroSlide: 'heroSlide 18s infinite',
      },
    },
  },
  plugins: [],
};
