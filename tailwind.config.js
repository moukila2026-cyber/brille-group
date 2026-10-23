/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f2f5fa',
          100: '#e3e9f3',
          200: '#c3cfe3',
          300: '#94a9c9',
          400: '#5e7da8',
          500: '#3c5c8a',
          600: '#2c4670',
          700: '#22375a',
          800: '#16253d',
          900: '#0d1a2d',
          950: '#08111f',
        },
        gold: {
          50: '#fbf7ec',
          100: '#f6ecd2',
          200: '#ecd9a2',
          300: '#e0bf6c',
          400: '#d6a945',
          500: '#c9922f',
          600: '#ad7226',
          700: '#8a5522',
          800: '#734422',
          900: '#613a20',
        },
        brandred: { DEFAULT: '#c8102e', dark: '#9c0c24' },
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'system-ui', '-apple-system', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['"Segoe UI Semibold"', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(13,26,45,.04), 0 8px 24px -8px rgba(13,26,45,.12)',
        lift: '0 12px 40px -12px rgba(13,26,45,.28)',
      },
      maxWidth: { '8xl': '88rem' },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: { 'fade-up': 'fade-up .5s ease-out both' },
    },
  },
  plugins: [],
}
