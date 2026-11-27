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
        // Legacy tokens still used by pages awaiting the revamp
        surface: '#F5F5F5',
        border: '#E0E0E0',
        'text-primary': '#1A1A1A',
        'text-inverse': '#FFFFFF',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      maxWidth: {
        page: '72rem',
      },
    },
  },
  plugins: [],
};
