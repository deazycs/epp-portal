'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[ЕПП] Ошибка страницы:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background:'#f5f5f5' }}>
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded bg-blue-700 flex items-center justify-center">
            <span className="text-sm font-bold text-white">ЕПП</span>
          </div>
          <div>
            <div className="text-sm font-bold text-blue-900">Единый портал поставок</div>
            <div className="text-xs text-gray-500">Росреестр</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-1.5 bg-red-500" />
          <div className="p-8 text-center">
            <div className="text-5xl font-bold text-red-100 mb-3 font-mono">ERR</div>
            <h1 className="text-base font-bold text-gray-800 mb-2">Что-то пошло не так</h1>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              При загрузке страницы произошла ошибка. Попробуйте обновить или вернитесь на рабочий стол.
            </p>

            {error.message && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded text-left">
                <div className="text-xs font-bold text-red-700 mb-1">Детали ошибки:</div>
                <div className="text-xs font-mono text-red-600 break-all">{error.message}</div>
                {error.digest && (
                  <div className="text-xs text-red-400 mt-1">ID: {error.digest}</div>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={reset}
                className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700 transition-colors"
              >
                🔄 Обновить страницу
              </button>
              <Link href="/dashboard"
                className="px-5 py-2 border border-gray-200 text-gray-600 text-sm font-bold rounded hover:bg-gray-50 transition-colors">
                На рабочий стол
              </Link>
            </div>
          </div>

          <div className="px-8 py-3 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Если ошибка повторяется —{' '}
              <Link href="/support" className="text-blue-500 hover:underline">обратитесь в поддержку</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
