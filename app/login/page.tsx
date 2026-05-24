'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ChevronRight, Eye, EyeOff, Lock, User } from 'lucide-react';

const USERS = [
  {
    id: 'u1',
    name: 'Петров Андрей Викторович',
    role: 'Ведущий специалист МТО',
    dept: 'Отдел МТО',
    avatar: 'ПА',
    color: 'bg-blue-600',
    login: 'petrov.av',
    description: 'Создание и ведение закупок, загрузка документов, работа с ЕАТ и ЕИС',
  },
  {
    id: 'u2',
    name: 'Смирнова Наталья Сергеевна',
    role: 'Начальник отдела МТО',
    dept: 'Отдел МТО',
    avatar: 'СН',
    color: 'bg-green-700',
    login: 'smirnova.ns',
    description: 'Согласование закупок и победителей, контроль исполнения, аналитика',
  },
  {
    id: 'u5',
    name: 'Фёдоров Сергей Владимирович',
    role: 'Заместитель руководителя',
    dept: 'Руководство',
    avatar: 'ФС',
    color: 'bg-purple-700',
    login: 'fedorov.sv',
    description: 'Визирование договоров, согласование СЗ, панель руководителя',
  },
  {
    id: 'u4',
    name: 'Волкова Елена Игоревна',
    role: 'Главный бухгалтер',
    dept: 'Бухгалтерия / ФЭО',
    avatar: 'ВЕ',
    color: 'bg-orange-600',
    login: 'volkova.ei',
    description: 'Финансирование, платежи, финансовая экспертиза договоров',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [login, setLogin]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const selectedUser = USERS.find(u => u.id === selected);

  const handleSelectUser = (userId: string) => {
    const u = USERS.find(u => u.id === userId)!;
    setSelected(userId);
    setLogin(u.login);
    setPassword('');
    setError('');
  };

  const handleLogin = async () => {
    if (!selected) { setError('Выберите учётную запись'); return; }
    if (!password) { setError('Введите пароль'); return; }
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    router.push('/dashboard');
  };

  const handleDemoAccess = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #001435 0%, #002570 50%, #003087 100%)' }}>

      {/* Верхняя полоса */}
      <div className="border-b border-white border-opacity-10 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-white bg-opacity-15 flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <div className="text-white text-xs font-bold leading-tight">Росреестр</div>
              <div className="text-blue-300 text-xs opacity-70">Управление по Воронежской области</div>
            </div>
          </div>
          <div className="text-blue-300 text-xs opacity-60">
            Внутренняя система · Доступ ограничен
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-4xl">

          {/* Заголовок */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white bg-opacity-10 border border-white border-opacity-20 flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl font-bold text-white">ЕПП</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Единый портал поставок</h1>
            <p className="text-blue-200 text-sm opacity-80">
              Система сопровождения закупок · ЕИС · ЕАТ «Берёзка» · 44-ФЗ
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Выбор учётной записи */}
            <div className="lg:col-span-3">
              <div className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-3 opacity-70">
                Выберите учётную запись
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {USERS.map(u => (
                  <button key={u.id} onClick={() => handleSelectUser(u.id)}
                    className={`text-left p-3 rounded-xl border transition-all duration-200 ${
                      selected === u.id
                        ? 'border-white border-opacity-60 bg-white bg-opacity-15 shadow-lg shadow-blue-900'
                        : 'border-white border-opacity-10 bg-white bg-opacity-5 hover:bg-opacity-10 hover:border-opacity-25'
                    }`}>
                    <div className="flex items-start gap-2.5">
                      <div className={`w-9 h-9 rounded-lg ${u.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {u.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="text-white text-xs font-bold leading-tight truncate">{u.name}</div>
                        <div className="text-blue-200 text-xs opacity-70 mt-0.5">{u.role}</div>
                        <div className="text-blue-300 text-xs opacity-50 mt-1 leading-relaxed">{u.description}</div>
                      </div>
                      {selected === u.id && (
                        <div className="flex-shrink-0 w-4 h-4 rounded-full bg-white flex items-center justify-center ml-auto mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-blue-600" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Форма входа */}
            <div className="lg:col-span-2">
              <div className="bg-white bg-opacity-8 border border-white border-opacity-15 rounded-2xl p-5 backdrop-blur-sm">
                <div className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-4 opacity-70">
                  Вход в систему
                </div>

                {selectedUser && (
                  <div className="flex items-center gap-2.5 p-3 rounded-lg bg-white bg-opacity-8 border border-white border-opacity-15 mb-4">
                    <div className={`w-8 h-8 rounded-lg ${selectedUser.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {selectedUser.avatar}
                    </div>
                    <div>
                      <div className="text-white text-xs font-bold">{selectedUser.name}</div>
                      <div className="text-blue-300 text-xs opacity-70">{selectedUser.dept}</div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="text-blue-200 text-xs mb-1.5 block opacity-70">Логин</label>
                    <div className="relative">
                      <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 opacity-60" />
                      <input
                        type="text"
                        value={login}
                        onChange={e => setLogin(e.target.value)}
                        placeholder="username@rosreestr.ru"
                        className="w-full pl-8 pr-3 py-2.5 text-sm bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-blue-300 placeholder-opacity-40 focus:outline-none focus:border-white focus:border-opacity-50 focus:bg-opacity-15 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-blue-200 text-xs mb-1.5 block opacity-70">Пароль</label>
                    <div className="relative">
                      <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 opacity-60" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={e => { setPassword(e.target.value); setError(''); }}
                        onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }}
                        placeholder="••••••••"
                        className="w-full pl-8 pr-9 py-2.5 text-sm bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-blue-300 placeholder-opacity-40 focus:outline-none focus:border-white focus:border-opacity-50 focus:bg-opacity-15 transition-all"
                      />
                      <button onClick={() => setShowPass(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 opacity-60 hover:opacity-100">
                        {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-300 text-xs bg-red-500 bg-opacity-15 border border-red-400 border-opacity-30 rounded-lg px-3 py-2">
                      ⚠ {error}
                    </div>
                  )}

                  <button onClick={handleLogin} disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-blue-900 text-sm font-bold rounded-lg hover:bg-blue-50 transition-all disabled:opacity-60 mt-1">
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <><ChevronRight size={15} /> Войти в систему</>
                    )}
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-white border-opacity-10">
                  <button onClick={handleDemoAccess}
                    className="w-full py-2 text-xs text-blue-300 opacity-60 hover:opacity-90 transition-opacity">
                    ▶ Демонстрационный доступ (без пароля)
                  </button>
                </div>
              </div>

              {/* Инфо */}
              <div className="mt-3 text-center">
                <p className="text-blue-300 text-xs opacity-40 leading-relaxed">
                  Система предназначена только для авторизованных<br/>
                  сотрудников Росреестра · Все действия протоколируются
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Нижняя полоса */}
      <div className="border-t border-white border-opacity-10 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-blue-300 text-xs opacity-40">
            ЕПП v3.0 · © Росреестр 2026
          </span>
          <span className="text-blue-300 text-xs opacity-40">
            Техподдержка: support@rosreestr.ru
          </span>
        </div>
      </div>
    </div>
  );
}
