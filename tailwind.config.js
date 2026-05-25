/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  safelist: [
    // Динамические цвета из данных (users.ts, dashboard, about и т.д.)
    'bg-blue-600', 'bg-blue-500', 'bg-blue-100', 'bg-blue-50',
    'bg-green-700', 'bg-green-600', 'bg-green-500', 'bg-green-100', 'bg-green-50',
    'bg-purple-700', 'bg-purple-600', 'bg-purple-50',
    'bg-yellow-600', 'bg-yellow-500', 'bg-yellow-100', 'bg-yellow-50',
    'bg-orange-600', 'bg-orange-500', 'bg-orange-100', 'bg-orange-50',
    'bg-red-700', 'bg-red-600', 'bg-red-500', 'bg-red-100', 'bg-red-50',
    'bg-gray-700', 'bg-gray-600', 'bg-gray-500', 'bg-gray-200', 'bg-gray-100',
    'bg-teal-600', 'bg-indigo-500',
    'text-blue-700', 'text-blue-600', 'text-blue-800',
    'text-green-700', 'text-green-600', 'text-green-800',
    'text-purple-700', 'text-yellow-700', 'text-orange-700',
    'text-red-700', 'text-gray-700', 'text-white',
    'border-blue-300', 'border-green-300', 'border-yellow-300',
    'border-orange-300', 'border-red-300', 'border-gray-300',
    // Из контроля сроков и других страниц
    { pattern: /bg-(red|orange|yellow|green|blue|purple|gray|amber|sky|lime)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /text-(red|orange|yellow|green|blue|purple|gray|amber|sky|lime)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /border-(red|orange|yellow|green|blue|purple|gray|amber|sky|lime)-(50|100|200|300|400|500|600|700|800|900)/ },
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
