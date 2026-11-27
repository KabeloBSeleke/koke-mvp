/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './js/**/*.js'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#F26522',
        secondary: '#191D26',
        surface: '#F5F5F5',
        accent: '#FF8A4C',
        border: '#E0E0E0',
        'text-primary': '#1A1A1A',
        'text-inverse': '#FFFFFF',
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
