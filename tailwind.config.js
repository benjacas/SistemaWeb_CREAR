/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#6D5AE6',
        'primary-dark': '#5647c8',
        'primary-light': '#EEE9FF',
        'primary-subtle': '#FDF8F3',
        sidebar: '#1E1147',
        'sidebar-end': '#2D1B69',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-md': '0 4px 12px 0 rgb(109 90 230 / 0.10)',
      },
    },
  },
  plugins: [],
}
