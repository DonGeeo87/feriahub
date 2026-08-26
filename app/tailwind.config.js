/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        feria: {
          // Paleta cálida: café, terracota, ámbar, tierra — coherente con el video de ferias
          50: '#fbf5ec',   // crema cálido
          100: '#f4e7d4',  // arena claro
          200: '#e8d0b0',  // arena
          300: '#d8b184',  // beige tostado
          400: '#c38d5c',  // tostado
          500: '#ad6f3a',  // café claro
          600: '#95562b',  // café/terracota — primario
          700: '#7a4222',  // café
          800: '#5c3118',  // café profundo
          900: '#3f200e',  // café muy profundo
          950: '#251205',
          accent: '#d05a2b',  // naranja/terracota — CTA principal
          accent2: '#e8a03d', // ámbar — acentos
          ink: '#3f200e',     // texto principal
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['"Sora"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(63,34,18,0.05), 0 8px 24px rgba(63,34,18,0.06)',
        lift: '0 2px 4px rgba(63,34,18,0.06), 0 16px 32px rgba(63,34,18,0.10)',
      },
      borderRadius: {
        xl: '0.875rem',
      },
    },
  },
  plugins: [],
}
