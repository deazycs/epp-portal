'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ChevronRight } from 'lucide-react';
import { LOGIN_USERS } from '@/mock/data/users';

export default function LoginPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (userId: string) => {
    setSelected(userId);
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #001435 0%, #002570 50%, #003087 100%)' }}>

      {/* Верхняя полоса */}
      <div className="border-b border-white border-opacity-10 px-4 sm:px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-white bg-opacity-15 flex items-center justify-center flex-shrink-0">
              <Shield size={16} className="text-white"/>
            </div>
            <div>
              <div className="text-white text-xs font-bold leading-tight">Росреестр</div>
              <div className="text-blue-300 text-xs opacity-70 hidden sm:block">Управление по Воронежской области</div>
            </div>
          </div>
          <div className="text-blue-300 text-xs opacity-50 hidden sm:block">
            Внутренняя система · v3.0 · 2026
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 flex items-center justify-center p-4 py-6">
        <div className="w-full max-w-3xl">

          {/* Заголовок */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-white bg-opacity-10 border border-white border-opacity-20 flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-white">ЕПП</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Единый портал поставок</h1>
            <p className="text-blue-200 text-sm opacity-80">
              Система сопровождения закупок · Выберите учётную запись для входа
            </p>
          </div>

          {/* Карточки пользователей */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {LOGIN_USERS.map(u => (
              <button key={u.userId}
                onClick={() => handleLogin(u.userId)}
                disabled={loading}
                className={`text-left p-4 rounded-xl border transition-all duration-200 disabled:opacity-60 ${
                  selected === u.userId
                    ? 'border-white border-opacity-70 bg-white bg-opacity-20 shadow-lg'
                    : 'border-white border-opacity-10 bg-white bg-opacity-5 hover:bg-opacity-12 hover:border-opacity-30'
                }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                      u.userId === 'u_shv' ? 'bg-blue-600' :
                      u.userId === 'u_che' ? 'bg-green-700' :
                      u.userId === 'u_tol' ? 'bg-purple-700' :
                      'bg-yellow-600'
                    }`}>
                    {selected === u.userId && loading
                      ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                      : u.userId === 'u_shv' ? 'bg-blue-600' : u.userId === 'u_che' ? 'bg-green-700' : u.userId === 'u_tol' ? 'bg-purple-700' : 'bg-yellow-600'
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-bold leading-tight">{u.name}</div>
                    <div className="text-blue-300 text-xs mt-0.5 opacity-80">{u.role}</div>
                    <div className="text-blue-400 text-xs mt-1 opacity-60 leading-snug">{u.desc}</div>
                  </div>
                  <ChevronRight size={16} className="text-white opacity-30 flex-shrink-0 mt-1"/>
                </div>
              </button>
            ))}
          </div>

          {/* Подсказка */}
          <p className="text-center text-blue-300 text-xs opacity-40">
            Нажмите на карточку для входа · Демонстрационный режим · Данные защищены
          </p>
        </div>
      </div>

      {/* Нижняя полоса */}
      <div className="border-t border-white border-opacity-10 px-4 sm:px-6 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-blue-300 text-xs opacity-40">ЕПП v3.0 · © Росреестр 2026</span>
          <span className="text-blue-300 text-xs opacity-40 hidden sm:block">г. Воронеж, ул. Средне-Московская, д. 14</span>
        </div>
      </div>
    </div>
  );
}
