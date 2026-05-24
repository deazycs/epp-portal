'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LiveClock } from '@/components/ui/LiveClock';
import { Bell, Search, ChevronDown, LogOut, User, Settings, Menu, X, Clock } from 'lucide-react';
import { cn, formatTimeAgo } from '@/lib/utils';
import { CURRENT_USER } from '@/mock/data/users';
import { useAppStore } from '@/store/index';

const TYPE_ICONS: Record<string, string> = { warning: '⚠', error: '🔴', success: '✅', info: 'ℹ' };

interface HeaderProps {
  onMenuToggle: () => void;
  sidebarCollapsed: boolean;
}

export function Header({ onMenuToggle, sidebarCollapsed }: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppStore();
  const unread = notifications.filter(n => !n.isRead);
  const overdueCount = useAppStore(s => s.procurements.filter(p => p.isOverdue).length);

  return (
    <header className="flex items-center h-10 px-3 gap-3 border-b border-blue-900 flex-shrink-0"
      style={{ background: '#003087' }}>

      <button onClick={onMenuToggle} className="text-white opacity-70 hover:opacity-100 p-1 rounded">
        {sidebarCollapsed ? <Menu size={16} /> : <X size={16} />}
      </button>

      {/* Логотип ЕПП */}
      <Link href="/dashboard" className="flex items-center gap-2 border-r border-blue-600 pr-3 hover:opacity-90">
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded bg-white flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold" style={{ color: '#003087' }}>ЕПП</span>
          </div>
          <div className="hidden sm:block">
            <div className="text-white font-bold text-xs leading-tight">Единый портал поставок</div>
            <div className="text-blue-300 text-xs opacity-70 leading-tight">Росреестр · ЕИС · ЕАТ «Берёзка»</div>
          </div>
        </div>
      </Link>

      {/* Поиск */}
      <div className="flex-1 max-w-md">
        {searchOpen ? (
          <div className="relative">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-300" />
            <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск по реестру..."
              className="w-full bg-blue-800 text-white placeholder-blue-300 text-xs py-1.5 pl-7 pr-3 rounded border border-blue-600 focus:outline-none focus:border-blue-400"
              onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
              onKeyDown={e => {
                if (e.key === 'Escape') setSearchOpen(false);
                if (e.key === 'Enter') { window.location.href = `/poisk?q=${encodeURIComponent(searchQuery)}`; }
              }} />
          </div>
        ) : (
          <button onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 text-blue-300 text-xs hover:text-white transition-colors">
            <Search size={13} />
            <span className="hidden md:inline">Поиск закупок, договоров, поставщиков...</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 ml-auto">
        <LiveClock />
        {/* Просрочки */}
        {overdueCount > 0 && (
          <Link href="/kontrol-srokov"
            className="flex items-center gap-1 text-xs text-yellow-200 bg-red-700 bg-opacity-60 px-2 py-0.5 rounded hover:bg-opacity-80 transition-colors">
            <Clock size={11} />
            <span className="hidden sm:inline">{overdueCount} просрочки</span>
          </Link>
        )}

        {/* Уведомления */}
        <div className="relative">
          <button onClick={() => { setNotifOpen(!notifOpen); setUserOpen(false); }}
            className="relative p-1.5 text-white opacity-70 hover:opacity-100">
            <Bell size={15} />
            {unread.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
                {unread.length > 9 ? '9+' : unread.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-gray-200 rounded shadow-xl z-50">
              <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50">
                <span className="font-bold text-xs">Уведомления ({unread.length})</span>
                <button onClick={markAllNotificationsRead}
                  className="text-xs text-blue-600 hover:underline">Прочитать все</button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.slice(0, 6).map(n => (
                  <div key={n.id} onClick={() => markNotificationRead(n.id)}
                    className={cn('px-3 py-2 border-b cursor-pointer hover:bg-gray-50', !n.isRead && 'bg-blue-50')}>
                    <div className="flex items-start gap-2">
                      <span className="text-sm leading-none mt-0.5">{TYPE_ICONS[n.type]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs truncate">{n.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</div>
                        <div className="text-xs text-gray-400 mt-1">{formatTimeAgo(n.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/uvedomleniya" onClick={() => setNotifOpen(false)}
                className="block text-center text-xs text-blue-600 py-2 hover:bg-gray-50 border-t">
                Все уведомления →
              </Link>
            </div>
          )}
        </div>

        {/* Пользователь */}
        <div className="relative">
          <button onClick={() => { setUserOpen(!userOpen); setNotifOpen(false); }}
            className="flex items-center gap-1.5 text-white opacity-80 hover:opacity-100 px-1">
            <div className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center text-xs font-bold text-white">
              {CURRENT_USER.shortName.split(' ').map((p: string) => p[0]).join('').slice(0, 2)}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold leading-tight">{CURRENT_USER.shortName}</div>
              <div className="text-xs opacity-60 leading-tight">Специалист МТО</div>
            </div>
            <ChevronDown size={11} className="opacity-60" />
          </button>

          {userOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded shadow-xl z-50">
              <div className="px-3 py-2 border-b bg-gray-50">
                <div className="font-bold text-xs">{CURRENT_USER.fullName}</div>
                <div className="text-xs text-gray-500">{CURRENT_USER.position}</div>
              </div>
              <Link href="/profil" className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50">
                <User size={12} /> Профиль
              </Link>
              <Link href="/nastroyky" className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50">
                <Settings size={12} /> Настройки
              </Link>
              <hr className="my-1" />
              <Link href="/login" className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 text-red-600">
                <LogOut size={12} /> Выйти
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
