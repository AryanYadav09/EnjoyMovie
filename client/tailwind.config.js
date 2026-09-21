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
        canvas: '#090A0E',
        'surface-1': '#0D0F15',
        'surface-2': '#161A24',
        'surface-3': '#1D2230',
        'surface-hover': '#242A3B',
        amber: {
          accent: '#F59E0B',
          glow: 'rgba(245, 158, 11, 0.25)',
          deep: '#D97706'
        },
        gold: {
          cinema: '#F5C518',
          glow: 'rgba(245, 197, 24, 0.25)'
        },
        cyan: {
          vivid: '#38BDF8'
        },
        cinema: {
          heading: '#F8FAFC',
          body: '#CBD5E1',
          muted: '#64748B',
          stroke: 'rgba(255, 255, 255, 0.08)',
          'stroke-bright': 'rgba(255, 255, 255, 0.16)'
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif']
      },
      boxShadow: {
        'cinema-glow': '0 0 24px -4px rgba(245, 158, 11, 0.35)',
        'cinema-gold-glow': '0 0 20px -4px rgba(245, 197, 24, 0.3)',
        'glass-card': '0 12px 32px -8px rgba(0, 0, 0, 0.75)'
      },
      aspectRatio: {
        'poster': '2 / 3'
      }
    },
  },
  plugins: [],
}
