/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        crimson: {
          DEFAULT: '#E10600',
          600: '#C40500',
          400: '#FF2A22',
        },
        ink: '#0B0B0D',
        graphite: '#141518',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        display: ['"Barlow Condensed"', 'Impact', 'sans-serif'],
        script: ['Caveat', 'cursive'],
      },
      letterSpacing: {
        eyebrow: '0.22em',
      },
      boxShadow: {
        'glow-red': '0 0 0 1px rgba(225,6,0,0.55), 0 0 24px -4px rgba(225,6,0,0.55)',
        'glow-red-lg': '0 0 40px -6px rgba(225,6,0,0.65)',
        lift: '0 24px 48px -24px rgba(0,0,0,0.65)',
      },
      keyframes: {
        ping2: {
          '0%': { transform: 'scale(1)', opacity: '0.55' },
          '80%, 100%': { transform: 'scale(2.6)', opacity: '0' },
        },
      },
      animation: {
        ping2: 'ping2 2.6s cubic-bezier(0,0,0.2,1) infinite',
      },
    },
  },
  plugins: [],
}
