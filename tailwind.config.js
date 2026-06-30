/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          light: '#FEF3C7',
          DEFAULT: '#D97706',
          dark: '#B45309',
          ring: '#FDE68A',
        },
        terra: {
          DEFAULT: '#FCF9F2',
          card: '#FFFFFF',
          hover: '#F6F0E6',
          alt: '#F3EDE0',
        },
        stone: {
          50: '#FCF9F2',
          100: '#EDE6D8',
          200: '#D6CDBB',
          300: '#B8AD98',
          400: '#A89B85',
          500: '#78716C',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
        success: {
          light: '#F7FEE7',
          DEFAULT: '#65A30D',
          dark: '#4D7C0F',
        },
        danger: {
          light: '#FEF2F2',
          DEFAULT: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
        'card-hover': '0 4px 14px rgba(0,0,0,0.07)',
        'warm': '0 8px 24px rgba(120, 113, 108, 0.1)',
        'glow-amber': '0 4px 14px rgba(245, 158, 11, 0.25)',
      },
      borderRadius: {
        '2xl': '16px',
        'xl': '12px',
      }
    },
  },
  plugins: [],
}
