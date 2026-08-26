/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        feria: {
          50: '#f2f7f6',
          100: '#e0efeb',
          200: '#c2dfd9',
          300: '#96c6c0',
          400: '#68aaa4',
          500: '#4c8f89',
          600: '#3a7370',
          700: '#315d5c',
          800: '#2b4c4b',
          900: '#273f3f',
          950: '#112527',
          accent: '#e76f51',
          accent2: '#f4a261',
          ink: '#1f2d2d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['"Sora"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(17,37,39,0.05), 0 8px 24px rgba(17,37,39,0.06)',
        lift: '0 2px 4px rgba(17,37,39,0.06), 0 16px 32px rgba(17,37,39,0.10)',
      },
      borderRadius: {
        xl: '0.875rem',
      },
    },
  },
  plugins: [],
}
