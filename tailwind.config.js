/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#0B6B5C',
          dark: '#3DB39D',
          ink: '#FFFFFF',
          'ink-dark': '#06201B',
          soft: '#DDEFEB',
          'soft-dark': '#173A33',
        },
        ink: {
          DEFAULT: '#17221F',
          dark: '#E6EEEB',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#18211E',
        },
        canvas: {
          DEFAULT: '#F3F5F4',
          dark: '#0F1513',
        },
        muted: {
          DEFAULT: '#5B6863',
          dark: '#9AA8A3',
        },
        line: {
          DEFAULT: '#D5DDDA',
          dark: '#2C3934',
        },
        bad: {
          DEFAULT: '#B3261E',
          dark: '#F2867D',
        },
        warn: {
          soft: '#FFF3D6',
          'soft-dark': '#3A3018',
        }
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
