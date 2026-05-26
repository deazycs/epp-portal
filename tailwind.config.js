/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './mock/**/*.{js,ts}',
    './lib/**/*.{js,ts}',
  ],

  safelist: [


    // Из динамических паттернов приложения
    'text-red-600', 'text-green-600', 'text-blue-600', 'text-gray-400', 'text-gray-600',
    'text-green-500', 'text-orange-600', 'text-yellow-600', 'text-indigo-600',
    'bg-yellow-50', 'bg-green-100', 'bg-red-100', 'bg-blue-100', 'bg-orange-100',
    'border-yellow-200', 'border-green-200', 'border-red-200', 'border-blue-200',
    'border-orange-200', 'border-indigo-200', 'border-purple-200',
    'text-right', 'ml-auto', 'text-left',
    'border-green-500', 'border-red-500', 'border-orange-500', 'border-blue-500',
    'bg-green-500', 'bg-red-500', 'bg-orange-500', 'bg-blue-500', 'bg-yellow-500',
    'bg-green-600', 'bg-red-600', 'bg-blue-600',
    'text-white',
    'gov-btn-ghost', 'gov-btn-primary', 'gov-btn-success', 'gov-btn-danger',
    'gov-btn-secondary',
    'border-0',
    'text-blue-800', 'text-green-800', 'text-red-800', 'text-orange-800',
    'bg-green-800', 'bg-blue-800',
    'text-green-400', 'text-red-400', 'text-gray-300', 'text-gray-200',
    'bg-gray-400', 'bg-gray-300', 'bg-gray-600',
    'font-bold',
    // Все hover классы
    'hover:bg-gray-50', 'hover:bg-blue-50', 'hover:bg-green-50',
    'hover:bg-orange-50', 'hover:bg-red-50',
    // Статусные классы для бейджей
    'border-l-4', 'border-l-3',
    // Text классы из динамических данных
    'text-green-700', 'text-red-700', 'text-orange-700', 'text-blue-700',
    'text-yellow-700', 'text-purple-700', 'text-gray-700',
    'bg-green-50', 'bg-red-50', 'bg-orange-50', 'bg-yellow-50',
    'bg-blue-50', 'bg-purple-50', 'bg-gray-50', 'bg-indigo-50',
    'border-green-300', 'border-red-300', 'border-orange-300',
    'border-yellow-300', 'border-blue-300', 'border-gray-300',
    'border-green-400', 'border-red-400', 'border-orange-400',
    // Размеры и прочее
    'w-5', 'h-5', 'h-px', 'w-8',
    'bg-green-400', 'bg-gray-200',
    // font-bold conditional
    'font-bold', 'font-medium',
    // Ring и border для selection
    'ring-2', 'ring-blue-500', 'ring-offset-1',
    'border-blue-400', 'border-2',
    'border-green-400', 'border-orange-400',
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
    { pattern: /(bg|text|border|ring|from|to|via)-(red|orange|yellow|green|blue|purple|gray|amber|sky|lime|indigo|teal|violet|pink|emerald|slate|zinc|cyan|rose)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /(hover|focus|active|disabled):(bg|text|border)-(red|orange|yellow|green|blue|purple|gray|indigo|teal)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /border-l-(1|2|3|4|8)/ },
    { pattern: /(w|h)-(\d+)/ },
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
