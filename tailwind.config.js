/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        yakoyo: {
          bg: '#0a0a0a',
          surface: '#141414',
          surface2: '#1a1a1a',
          accent: '#FF6B00',
          muted: '#888888'
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
        accent: ['Cormorant Garamond', 'serif']
      },
      boxShadow: {
        glow: '0 0 20px rgba(255, 107, 0, 0.45)'
      }
    }
  },
  plugins: []
};
