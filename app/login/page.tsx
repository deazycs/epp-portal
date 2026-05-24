import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{background:'#f0f2f5'}}>
      <div className="h-1.5 w-full" style={{background:'#003087'}}/>
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <div className="w-10 h-10 rounded flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{background:'#003087'}}>
            <span className="text-xs font-bold">ЕПП</span>
          </div>
          <div>
            <div className="font-bold text-sm" style={{color:'#003087'}}>Федеральная служба государственной регистрации, кадастра и картографии</div>
            <div className="text-xs text-gray-500">ЕПП — Единый портал поставок · ЕИС · ЕАТ «Берёзка»</div>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-white border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b" style={{background:'#003087'}}>
              <h1 className="text-white font-bold text-sm">Вход в систему</h1>
              <p className="text-blue-200 text-xs mt-0.5">ЕПП v3.0 · Единый портал поставок</p>
            </div>
            <div className="p-6">
              <div className="gov-alert gov-alert-info mb-4 text-xs">
                <span>ℹ</span>
                <div><strong>DEMO-режим.</strong> Нажмите «Войти» для входа без авторизации.</div>
              </div>
              <div className="mb-3">
                <label className="gov-label">Имя пользователя</label>
                <input type="text" className="gov-input" defaultValue="petrov.av" placeholder="Логин"/>
              </div>
              <div className="mb-3">
                <label className="gov-label">Пароль</label>
                <input type="password" className="gov-input" defaultValue="••••••••"/>
              </div>
              <div className="mb-4">
                <label className="gov-label">Роль (демонстрация)</label>
                <select className="gov-select">
                  <option>Специалист МТО — Петров А.В.</option>
                  <option>Начальник отдела — Смирнова Н.С.</option>
                  <option>Контрактный управляющий — Козлов Д.М.</option>
                  <option>Бухгалтерия — Волкова Е.И.</option>
                  <option>Руководство — Перегудова Е.П.</option>
                  <option>Администратор системы</option>
                </select>
              </div>
              <Link href="/dashboard">
                <button type="button" className="gov-btn gov-btn-primary w-full justify-center py-2">
                  Войти в систему
                </button>
              </Link>
              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 text-center">
                Техподдержка: admin@rosreestr.ru · доб. 2099
              </div>
            </div>
          </div>
          <div className="mt-3 text-center text-xs text-gray-400 px-4">
            Использование системы разрешено только авторизованным сотрудникам Росреестра.
          </div>
        </div>
      </main>
      <footer className="text-center text-xs text-gray-400 py-3 border-t bg-white">
        © 2026 Росреестр · ЕПП v3.0 · Единый портал поставок
      </footer>
    </div>
  );
}
