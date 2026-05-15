/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Newsreader', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // Warm newspaper palette
        paper: {
          50:  '#FBFAF4',
          100: '#F2EFE7',
          200: '#E9E5DA',
          300: '#D8D2C0',
          400: '#BDB59E',
        },
        ink: {
          900: '#0F0F0F',
          800: '#1F2024',
          700: '#383A40',
          600: '#555761',
          500: '#7A7C84',
          400: '#9CA0A8',
          300: '#BEC2CA',
        },
        // class name kept as `sage` for stability, the shade is deep navy
        sage: {
          50:  '#E8EDF4',
          100: '#C7D2E2',
          300: '#5C7AA1',
          500: '#1F3A6B',
          600: '#182E55',
          700: '#11233F',
        },
        // class name kept as `clay`, the shade is warm rust
        clay: {
          50:  '#F8E8DF',
          100: '#F0CCB7',
          300: '#DC8E66',
          500: '#B25131',
          600: '#903F22',
        },
        sky: {
          500: '#3F6573',
          600: '#2F4D58',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(20,20,20,0.04), 0 8px 24px -12px rgba(20,20,20,0.10)',
        warm: '0 2px 4px rgba(20,20,20,0.05), 0 24px 48px -24px rgba(20,20,20,0.18)',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: 0.55 },
          '50%':      { opacity: 0.95 },
        },
      },
      animation: {
        'pulse-soft': 'pulse-soft 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
