/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#0A0A0A',
        pearl: '#FFFFFF',
        smoke: '#F5F5F5',
        ash: '#E0E0E0',
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E2C97E',
          dark: '#9E7C2A',
          muted: 'rgba(201,168,76,0.15)',
        },
        ink: {
          primary: '#0A0A0A',
          secondary: '#3D3D3D',
          muted: '#6B7280',
          inverse: '#FFFFFF',
        },
        surface: {
          card: '#FFFFFF',
          hover: '#F9F8F5',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 2px 20px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.12)',
        gold: '0 0 0 2px #C9A84C',
      },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      aspectRatio: {
        watch: '3 / 4',
      },
    },
  },
  plugins: [],
}

