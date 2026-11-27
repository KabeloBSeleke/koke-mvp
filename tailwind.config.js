/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ['./*.html', './partials/*.html', './js/**/*.js'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand (fixed in both themes)
        primary: '#F26522',
        secondary: '#191D26',
        accent: '#FF8A4C',
        // Theme-aware tokens (values in src/site.css :root / .dark)
        paper: v('paper'),
        'paper-alt': v('paper-alt'),
        ink: v('ink'),
        body: v('body'),
        muted: v('muted'),
        rule: v('rule'),
        'orange-ink': v('orange-ink'),
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        page: '72rem',
      },
    },
  },
  plugins: [],
};
