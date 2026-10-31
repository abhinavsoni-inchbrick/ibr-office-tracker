/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#0c1117',
          900: '#141b24',
          800: '#1c2530',
          700: '#2a3544',
          600: '#3d4a5c',
          400: '#8b9aab',
          300: '#b0bcc9',
          100: '#e8edf2',
        },
        accent: {
          DEFAULT: '#1a6b5a',
          soft: '#e6f2ef',
          muted: '#2d8a74',
        },
        warn: {
          DEFAULT: '#b45309',
          soft: '#fef3e8',
        },
        danger: {
          DEFAULT: '#b91c1c',
          soft: '#fef2f2',
        },
      },
    },
  },
  plugins: [],
}
