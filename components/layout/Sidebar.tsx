'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, ShoppingCart, FileText, Users,
  BarChart3, Calendar, AlertTriangle, CheckCircle, Bell,
  Search, Settings, Archive, Clock, BookOpen,
  CreditCard, ChevronDown, ChevronRight, Database,
  TrendingUp, Package, Calculator, ClipboardList,
  Shield, DollarSign, Eye, Building2, HelpCircle,
  CheckSquare, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/index';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  badgeType?: 'danger' | 'warning' | 'info';
  children?: NavItem[];
  hint?: string; // подсказка что делает раздел
}

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const { procurements, tasks, notifications } = useAppStore();
  const [openGroups, setOpenGroups] = useState<string[]>([
    'Закупки', 'Контроль', 'Финансы'
  ]);

  const unread        = notifications.filter(n => !n.isRead).length;
  const overdueProcs  = procurements.filter(p => p.isOverdue).length;
  const urgentTasks   = tasks.filter(t => t.status === 'overdue' || t.priority === 'urgent').length;
  const pendingAppr   = procurements.filter(p =>
    ['sz_approval','winner_approval','contract_expertise','deputy_signing'].includes(p.status)
  ).length;
  const activeProcs   = procurements.filter(p =>
    !['archive','cancelled'].includes(p.status)
  ).length;

  const toggleGroup = (g: string) =>
    setOpenGroups(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  const nav: { section: string; items: NavItem[] }[] = [
    {
      section: 'Главное',
      items: [
        { href: '/dashboard',  label: 'Рабочий стол', icon: <LayoutDashboard size={14}/>, hint: 'KPI, задачи, сводка' },
        { href: '/poisk',      label: 'Поиск',         icon: <Search size={14}/>, hint: 'Поиск по всей системе' },
        { href: '/uvedomleniya', label: 'Уведомления', icon: <Bell size={14}/>,
          badge: unread || undefined, badgeType: 'danger', hint: 'Системные оповещения' },
      ],
    },
    {
      section: 'Закупки',
      items: [
        { href: '/sluzhebnye-zapiski', label: 'Служебные записки', icon: <FileText size={14}/>,
          hint: 'СЗ от подразделений — основание для закупки' },
        { href: '/zakupki',    label: 'Реестр закупок', icon: <ShoppingCart size={14}/>,
          badge: activeProcs || undefined, badgeType: 'info', hint: 'Все закупки от СЗ до архива',
          children: [
            { href: '/zakupki', label: 'Все закупки', icon: <ShoppingCart size={13}/> },
            { href: '/zakupki/novaya', label: 'Создать закупку', icon: <CheckCircle size={13}/> },
            { href: '/zakupki/arkhiv', label: 'Архив', icon: <Archive size={13}/> },
          ],
        },
        { href: '/nmck',       label: 'Калькулятор НМЦК', icon: <Calculator size={14}/>,
          hint: 'Расчёт НМЦК по Приказу №567, коэф. вариации' },
        { href: '/kp',         label: 'Сравнение КП',     icon: <BarChart3 size={14}/>,
          hint: 'Сравнение коммерческих предложений' },
        { href: '/soglasovaniya', label: 'Согласования', icon: <CheckSquare size={14}/>,
          badge: pendingAppr || undefined, badgeType: 'warning', hint: 'Визирование СЗ и договоров' },
      ],
    },
    {
      section: 'Исполнение',
      items: [
        { href: '/kontrakty',  label: 'Договоры', icon: <BookOpen size={14}/>,
          hint: 'Реестр подписанных договоров' },
        { href: '/priemka',    label: 'Приёмка товаров', icon: <Package size={14}/>,
          hint: 'Акты приёмки, уполномоченные лица' },
        { href: '/ispolnenie', label: 'Исполнение', icon: <TrendingUp size={14}/>,
          hint: 'Прогресс поставки по позициям' },
      ],
    },
    {
      section: 'Финансы',
      items: [
        { href: '/platezhi',          label: 'Платежи',        icon: <CreditCard size={14}/>,
          hint: 'Оплата по договорам' },
        { href: '/grafik-platezhey',  label: 'График платежей', icon: <Calendar size={14}/>,
          hint: 'Сводный план оплат по месяцам' },
        { href: '/platezhi-feo',      label: 'Оплата через ФЭО', icon: <Building2 size={14}/>,
          hint: 'Оплата через ФЭО: передача документов и подтверждение' },
      ],
    },
    {
      section: 'Контроль',
      items: [
        { href: '/kontrol-srokov', label: 'Контроль сроков', icon: <Clock size={14}/>,
          badge: overdueProcs || undefined, badgeType: 'danger',
          hint: 'Светофор дедлайнов: поставка, оплата, ЕИС' },
        { href: '/zadachi',    label: 'Задачи',      icon: <CheckCircle size={14}/>,
          badge: urgentTasks || undefined, badgeType: 'danger',
          hint: 'Поручения и контроль исполнения' },
        { href: '/riski',      label: 'Риски',       icon: <AlertTriangle size={14}/>,
          hint: 'Операционные и финансовые риски' },
        { href: '/proverki',   label: 'Проверки',    icon: <Eye size={14}/>,
          hint: 'Внутренний контроль и аудит' },
        { href: '/monitoring', label: 'Мониторинг',  icon: <TrendingUp size={14}/>,
          hint: 'Просрочки и нарушения сроков' },
      ],
    },
    {
      section: 'Аналитика',
      items: [
        { href: '/analitika',  label: 'Аналитика',          icon: <BarChart3 size={14}/>,
          hint: 'Динамика, бюджет, экономия' },
        { href: '/kpi',        label: 'KPI',                icon: <TrendingUp size={14}/>,
          hint: 'Показатели эффективности МТО' },
        { href: '/rukovoditel',label: 'Панель руководителя', icon: <Building2 size={14}/>,
          hint: 'Вид для Толоконникова Ю.В.' },
        { href: '/otchetnost', label: 'Отчётность ЕИС',     icon: <Database size={14}/>,
          hint: 'Размещение отчётов в ЕИС (ч.9 ст.94)' },
      ],
    },
    {
      section: 'Поставщики и документы',
      items: [
        { href: '/postavshchiki', label: 'Поставщики', icon: <Users size={14}/>,
          hint: 'Рейтинг надёжности поставщиков' },
        { href: '/dokumenty',  label: 'Документы',    icon: <FileText size={14}/>,
          hint: 'Хранилище документов закупок' },
        { href: '/spravochniki',label: 'Справочники', icon: <BookOpen size={14}/>,
          hint: 'КБК, ОКПД2, внешние ресурсы' },
      ],
    },
    {
      section: 'Система',
      items: [
        { href: '/istoriya',   label: 'История действий', icon: <ClipboardList size={14}/>,
          hint: 'Аудиторский след всех операций' },
        { href: '/kalendar',   label: 'Календарь',        icon: <Calendar size={14}/>,
          hint: 'Дедлайны и события' },
        { href: '/nastroyky',  label: 'Настройки',        icon: <Settings size={14}/>,
          hint: 'Профиль и уведомления' },
        { href: '/pasport',    label: 'Паспорт системы',  icon: <Shield size={14}/>,
          hint: 'Для комиссии: описание ЕПП' },
        { href: '/about',      label: 'О системе',        icon: <HelpCircle size={14}/>,
          hint: 'Экономический эффект ЕПП' },
      ],
    },
  ];

  if (collapsed) {
    return (
      <aside className="flex flex-col h-full overflow-hidden bg-[#001e5e] w-12">
        {/* Лого */}
        <Link href="/dashboard"
          className="flex items-center justify-center h-[52px] border-b border-white border-opacity-10 hover:bg-white hover:bg-opacity-8 transition-colors flex-shrink-0">
          <div className="w-7 h-7 rounded bg-white flex items-center justify-center">
            <span className="text-xs font-bold text-[#003087]">ЕПП</span>
          </div>
        </Link>

        <div className="flex-1 overflow-y-auto py-2 space-y-0.5 px-1">
          {nav.flatMap(g => g.items).map(item => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}
                title={item.label}
                className={cn(
                  'flex items-center justify-center w-full h-9 rounded-lg transition-all relative',
                  active ? 'bg-white bg-opacity-15 text-white' : 'text-white text-opacity-50 hover:bg-white hover:bg-opacity-8 hover:text-opacity-80'
                )}>
                {item.icon}
                {item.badge ? (
                  <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-red-500 rounded-full text-white text-xs flex items-center justify-center leading-none" style={{fontSize:'8px'}}>
                    {Number(item.badge) > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex flex-col h-full overflow-hidden bg-[#001e5e] w-56">
      {/* Лого */}
      <Link href="/dashboard"
        className="flex items-center gap-2.5 px-3 py-3 border-b border-white border-opacity-8 hover:bg-white hover:bg-opacity-5 transition-colors flex-shrink-0 min-h-[52px]">
        <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 bg-white">
          <span className="text-xs font-bold text-[#003087]">ЕПП</span>
        </div>
        <div className="min-w-0">
          <div className="text-white text-xs font-bold leading-tight truncate">Единый портал поставок</div>
          <div className="text-blue-300 text-xs opacity-60 leading-tight truncate">ЕИС · ЕАТ «Берёзка»</div>
        </div>
      </Link>

      {/* Навигация */}
      <nav className="flex-1 overflow-y-auto py-2">
        {nav.map(group => {
          const isOpen = openGroups.includes(group.section);
          return (
            <div key={group.section} className="mb-1">
              {/* Заголовок группы */}
              <button
                onClick={() => toggleGroup(group.section)}
                className="w-full flex items-center justify-between px-3 py-1 mb-0.5 hover:bg-white hover:bg-opacity-5 rounded mx-1 transition-colors">
                <span className="text-xs font-bold uppercase tracking-wider text-white text-opacity-35">
                  {group.section}
                </span>
                {isOpen
                  ? <ChevronDown size={11} className="text-white opacity-30"/>
                  : <ChevronRight size={11} className="text-white opacity-30"/>
                }
              </button>

              {isOpen && (
                <div className="space-y-0.5">
                  {group.items.map(item => {
                    const active = isActive(item.href);
                    const hasChildren = item.children && item.children.length > 0;
                    const childOpen = hasChildren && item.children!.some(c => isActive(c.href));

                    if (hasChildren) {
                      return (
                        <div key={item.href}>
                          <Link href={item.href}
                            className={cn(
                              'flex items-center gap-2 px-3 py-2 mx-1.5 rounded-lg text-xs font-medium transition-all relative',
                              active || childOpen
                                ? 'bg-white bg-opacity-13 text-white font-bold'
                                : 'text-white text-opacity-60 hover:bg-white hover:bg-opacity-8 hover:text-opacity-85'
                            )}>
                            {(active || childOpen) && (
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#4d9fff] rounded-r"/>
                            )}
                            <span className="flex-shrink-0">{item.icon}</span>
                            <span className="truncate flex-1">{item.label}</span>
                            {item.badge ? (
                              <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-md min-w-[18px] text-center',
                                item.badgeType === 'danger' ? 'bg-red-500 text-white' :
                                item.badgeType === 'warning' ? 'bg-yellow-500 text-white' :
                                'bg-blue-500 text-white')}>
                                {item.badge}
                              </span>
                            ) : null}
                          </Link>
                          {childOpen && (
                            <div className="ml-4 space-y-0.5">
                              {item.children!.map(child => (
                                <Link key={child.href} href={child.href}
                                  className={cn(
                                    'flex items-center gap-2 px-3 py-1.5 mx-1.5 rounded-lg text-xs transition-all',
                                    isActive(child.href)
                                      ? 'bg-white bg-opacity-10 text-white font-bold'
                                      : 'text-white text-opacity-45 hover:text-opacity-70 hover:bg-white hover:bg-opacity-5'
                                  )}>
                                  {child.icon}
                                  <span className="truncate">{child.label}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <Link key={item.href} href={item.href}
                        title={item.hint}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 mx-1.5 rounded-lg text-xs font-medium transition-all relative',
                          active
                            ? 'bg-white bg-opacity-13 text-white font-bold'
                            : 'text-white text-opacity-60 hover:bg-white hover:bg-opacity-8 hover:text-opacity-85'
                        )}>
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#4d9fff] rounded-r"/>
                        )}
                        <span className="flex-shrink-0">{item.icon}</span>
                        <span className="truncate flex-1">{item.label}</span>
                        {item.badge ? (
                          <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-md min-w-[18px] text-center flex-shrink-0',
                            item.badgeType === 'danger' ? 'bg-red-500 text-white' :
                            item.badgeType === 'warning' ? 'bg-yellow-500 text-white' :
                            'bg-blue-400 text-white')}>
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Версия */}
      <div className="px-3 py-2 border-t border-white border-opacity-8 flex-shrink-0">
        <div className="text-xs text-white text-opacity-25">ЕПП v3.0 · Росреестр</div>
      </div>
    </aside>
  );
}
