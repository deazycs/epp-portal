/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'gov-blue': '#003087',
        'gov-blue-dark': '#001f5c',
        'gov-blue-light': '#0050b3',
        'gov-blue-hover': '#1a4a9e',
        'gov-gray': '#f5f5f5',
        'gov-border': '#d9d9d9',
        'gov-text': '#262626',
        'gov-text-secondary': '#595959',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Arial', 'sans-serif'],
        mono: ['Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
