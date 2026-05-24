import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: '#f5f5f5' }}>

      {/* Шапка в стиле системы */}
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded bg-blue-700 flex items-center justify-center">
            <span className="text-sm font-bold text-white">ЕПП</span>
          </div>
          <div>
            <div className="text-sm font-bold text-blue-900">Единый портал поставок</div>
            <div className="text-xs text-gray-500">Росреестр · ЕИС · ЕАТ «Берёзка»</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="h-1.5 w-full bg-blue-700" />

          <div className="p-8 text-center">
            {/* Код ошибки */}
            <div className="text-7xl font-bold text-gray-200 mb-2 font-mono">404</div>

            <h1 className="text-base font-bold text-gray-800 mb-1">
              Страница не найдена
            </h1>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Запрашиваемый раздел системы не существует или был перемещён.
              Проверьте адрес или воспользуйтесь навигацией.
            </p>

            {/* Быстрые ссылки */}
            <div className="space-y-2 mb-6 text-left">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                Перейти в раздел:
              </div>
              {[
                { href: '/dashboard', label: '🏠 Рабочий стол' },
                { href: '/zakupki', label: '📋 Реестр закупок' },
                { href: '/kontrol-srokov', label: '⏰ Контроль сроков' },
                { href: '/analitika', label: '📊 Аналитика' },
              ].map(link => (
                <Link key={link.href} href={link.href}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded border border-transparent hover:border-blue-200 transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>

            <Link href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-700 text-white text-sm font-bold rounded hover:bg-blue-800 transition-colors">
              ← На рабочий стол
            </Link>
          </div>

          <div className="px-8 py-3 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              ЕПП v3.0 · Росреестр · Если проблема повторяется —{' '}
              <Link href="/support" className="text-blue-500 hover:underline">обратитесь в поддержку</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
