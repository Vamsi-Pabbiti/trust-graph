/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        card: '#FFFFFF',
        mainText: '#0F172A',
        subText: '#64748B',
        primary: {
          DEFAULT: '#4F46E5',
          hover: '#4338CA',
          light: '#EEF2FF'
        },
        success: {
          DEFAULT: '#16A34A',
          light: '#DCFCE7'
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7'
        },
        critical: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2'
        },
        border: '#E2E8F0'
      }
    },
  },
  plugins: [],
}
