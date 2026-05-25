'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { CheckSquare, BarChart3, Calculator,
  LayoutDashboard, ShoppingCart, FileText, Building2, Users, Calendar, AlertTriangle, CheckCircle, Bell,
  Search, Settings, Shield, Archive, Clock, BookOpen,
  CreditCard, ChevronDown, ChevronRight, Star, Database,
  Eye, TrendingUp, Boxes, Plug, MessageSquare, HelpCircle,
  ClipboardList, Layers, Package
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/index';

interface NavItem {
  href?: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  badgeType?: 'warning' | 'danger' | 'info';
  children?: NavItem[];
}

interface NavSection {
  section: string;
  items: NavItem[];
}

function Badge({ badge, badgeType }: { badge: number | string; badgeType?: string }) {
  return (
    <span className={cn(
      'text-xs px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 min-w-4 text-center leading-none',
      badgeType === 'danger' && 'bg-red-500 text-white',
      badgeType === 'warning' && 'bg-yellow-400 text-white',
      badgeType === 'info' && 'bg-sky-400 text-white',
      !badgeType && 'bg-blue-600 text-blue-100',
    )}>
      {badge}
    </span>
  );
}

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<string[]>(['Реестр закупок', 'Контроль']);

  const unreadCount = useAppStore(s => s.notifications.filter(n => !n.isRead).length);
  const overdueCount = useAppStore(s => s.procurements.filter(p => p.isOverdue).length);
  const activeCount = useAppStore(s => s.procurements.filter(p => !['archive','cancelled'].includes(p.status)).length);
  const taskCount = useAppStore(s => s.tasks.filter(t => ['new','in_progress','overdue'].includes(t.status)).length);
  const riskCount = 4;

  const NAV: NavSection[] = [
    {
      section: 'ГЛАВНОЕ',
      items: [
        { href: '/dashboard', label: 'Рабочий стол', icon: <LayoutDashboard size={13} /> },
        { href: '/poisk', label: 'Глобальный поиск', icon: <Search size={13} /> },
      ],
    },
    {
      section: 'ЗАКУПКИ',
      items: [
        {
          label: 'Реестр закупок', icon: <ShoppingCart size={13} />, badge: activeCount,
          children: [
            { href: '/zakupki', label: 'Все закупки', icon: <ClipboardList size={12} /> },
            { href: '/zakupki/novaya', label: 'Создать закупку', icon: <ShoppingCart size={12} /> },
            { href: '/zakupki/arkhiv', label: 'Архив', icon: <Archive size={12} /> },
          ],
        },
        { href: '/kontrakty', label: 'Договоры', icon: <FileText size={13} /> },
        { href: '/ispolnenie', label: 'Исполнение', icon: <CheckCircle size={13} /> },
        { href: '/platezhi', label: 'Платежи', icon: <CreditCard size={13} />, badge: 1, badgeType: 'danger' },
        { href: '/sluzhebnye-zapiski', label: 'Служебные записки', icon: <FileText size={13} /> },
      ],
    },
    {
      section: 'ПОСТАВЩИКИ И ДОКУМЕНТЫ',
      items: [
        { href: '/postavshchiki', label: 'Поставщики', icon: <Building2 size={13} /> },
        { href: '/dokumenty', label: 'Документы', icon: <Layers size={13} /> },
        { href: '/shablony', label: 'Шаблоны', icon: <Boxes size={13} /> },
      ],
    },
    {
      section: 'КОНТРОЛЬ',
      items: [
        { href: '/kontrol-srokov', label: 'Контроль сроков', icon: <Clock size={13} />, badge: overdueCount > 0 ? overdueCount : undefined, badgeType: 'danger' },
        { href: '/soglasovaniya', label: 'Согласования', icon: <CheckCircle size={13} />, badge: 3, badgeType: 'warning' },
        { href: '/zadachi', label: 'Задачи', icon: <ClipboardList size={13} />, badge: taskCount > 0 ? taskCount : undefined },
        { href: '/uvedomleniya', label: 'Уведомления', icon: <Bell size={13} />, badge: unreadCount > 0 ? unreadCount : undefined, badgeType: 'danger' },
        { href: '/monitoring', label: 'Мониторинг', icon: <AlertTriangle size={13} /> },
        { href: '/riski', label: 'Центр рисков', icon: <AlertTriangle size={13} />, badge: riskCount, badgeType: 'danger' },
        { href: '/proverki', label: 'Проверки', icon: <Eye size={13} /> },
        { href: '/kalendar', label: 'Календарь', icon: <Calendar size={13} /> },
      ],
    },
    {
      section: 'АНАЛИТИКА',
      items: [
        { href: '/analitika', label: 'Аналитика', icon: <BarChart3 size={13} /> },
        { href: '/otchetnost', label: 'Отчётность', icon: <TrendingUp size={13} /> },
        { href: '/kpi', label: 'Центр KPI', icon: <Star size={13} /> },
        { href: '/rukovoditel', label: 'Панель руководителя', icon: <TrendingUp size={13} /> },
      ],
    },
    {
      section: 'ИСТОРИЯ',
      items: [
        { href: '/zhurnal', label: 'Журнал действий', icon: <BookOpen size={13} /> },
        { href: '/istoriya', label: 'История изменений', icon: <Clock size={13} /> },
      ],
    },
    {
      section: 'АДМИНИСТРИРОВАНИЕ',
      items: [
        { href: '/polzovateli', label: 'Пользователи', icon: <Users size={13} /> },
        { href: '/roli', label: 'Роли и права', icon: <Shield size={13} /> },
        { href: '/podrazdeleniya', label: 'Подразделения', icon: <Building2 size={13} /> },
        { href: '/spravochniki', label: 'Справочники', icon: <Database size={13} /> },
        { href: '/integracii', label: 'Интеграции', icon: <Plug size={13} /> },
      ],
    },
    {
      section: 'ПРОЧЕЕ',
      items: [
        { href: '/chat', label: 'Чат', icon: <MessageSquare size={13} />, badge: 2 },
        { href: '/nastroyky', label: 'Настройки', icon: <Settings size={13} /> },
        { href: '/profil', label: 'Профиль', icon: <Users size={13} /> },
        { href: '/support', label: 'Поддержка', icon: <HelpCircle size={13} /> },
      { href: '/pasport', label: 'Паспорт системы', icon: <BookOpen size={13} /> },
      { href: '/about', label: 'О системе', icon: <Star size={13} /> },
      ],
    },
  ];

  const toggle = (label: string) =>
    setOpenGroups(p => p.includes(label) ? p.filter(l => l !== label) : [...p, label]);

  const isActive = (href?: string) => href === pathname;
  const isChildActive = (item: NavItem) => item.children?.some(c => c.href === pathname) ?? false;

  return (
    <aside className={cn('flex flex-col h-full overflow-hidden transition-all duration-200', collapsed ? 'w-12' : 'w-56')}
      style={{ background: '#001e5e' }}>

      {/* Логотип ЕПП */}
      <Link href="/dashboard"
        className="flex items-center gap-2 px-3 py-3 border-b border-blue-900 hover:bg-blue-900 transition-colors flex-shrink-0">
        <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 bg-white">
          <span className="text-xs font-bold" style={{ color: '#003087' }}>ЕПП</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-white font-bold text-xs leading-tight truncate">Единый портал поставок</div>
            <div className="text-blue-300 text-xs opacity-70 leading-tight">ЕИС · ЕАТ «Берёзка»</div>
          </div>
        )}
      </Link>

      <nav className="flex-1 overflow-y-auto py-1">
        {NAV.map(section => (
          <div key={section.section}>
            {!collapsed && (
              <div className="px-3 pt-3 pb-1 text-xs font-bold text-blue-400 opacity-60 tracking-widest uppercase">
                {section.section}
              </div>
            )}
            {section.items.map(item => {
              if (item.children) {
                const open = openGroups.includes(item.label);
                const active = isChildActive(item);
                return (
                  <div key={item.label}>
                    <button onClick={() => toggle(item.label)}
                      className={cn('gov-sidebar-link w-full text-left', active && 'bg-blue-900')}>
                      <span className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="flex-shrink-0">{item.icon}</span>
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </span>
                      {!collapsed && (
                        <span className="flex items-center gap-1 flex-shrink-0">
                          {item.badge !== undefined && <Badge badge={item.badge} badgeType={item.badgeType} />}
                          {open ? <ChevronDown size={10} className="opacity-50" /> : <ChevronRight size={10} className="opacity-50" />}
                        </span>
                      )}
                    </button>
                    {open && !collapsed && (
                      <div className="ml-3 border-l border-blue-800 pl-2">
                        {item.children.map(child => (
                          <Link key={child.href} href={child.href!}
                            className={cn('gov-sidebar-link text-xs', isActive(child.href) && 'active')}>
                            <span className="flex-shrink-0">{child.icon}</span>
                            <span className="truncate flex-1">{child.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link key={item.href} href={item.href!}
                  className={cn('gov-sidebar-link justify-between', isActive(item.href) && 'active')}>
                  <span className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </span>
                  {!collapsed && item.badge !== undefined && <Badge badge={item.badge} badgeType={item.badgeType} />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="px-3 py-2 border-t border-blue-900 text-xs text-blue-400 opacity-40 flex-shrink-0">
          ЕПП v3.0 · Росреестр
        </div>
      )}
    </aside>
  );
}
