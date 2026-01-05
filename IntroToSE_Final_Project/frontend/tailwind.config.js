/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#19e65e',
        'background-light': '#f6f8f6',
        'background-dark': '#112116',
        'surface-dark': '#1c261f',
        'surface-border': '#3c5344',
        'border-dark': '#29382e',
        'input-border': '#3c5344',
        'text-secondary': '#9db8a6',
        'secondary-text': '#9db8a6',
        'text-muted': '#9db8a6',
        'card-dark': '#1c261f',
      },
      fontFamily: {
        display: ['Manrope', 'sans-serif'],
        body: ['Noto Sans', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
}
