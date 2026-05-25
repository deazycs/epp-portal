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
  Shield, Building2, HelpCircle,
  CheckSquare, ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/index';

const BG   = '#001e5e';
const LINK  = { color: 'rgba(255,255,255,0.65)' };
const LINK_HOVER = { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)' };
const LINK_ACTIVE = { background: 'rgba(255,255,255,0.14)', color: '#fff', fontWeight: 700 };
const SEC   = { color: 'rgba(255,255,255,0.32)', fontSize: '9px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' as const };

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  badgeColor?: string;
  hint?: string;
  children?: { href: string; label: string; icon: React.ReactNode }[];
}

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle?: () => void }) {
  const pathname = usePathname();
  const { procurements, tasks, notifications } = useAppStore();
  const [openGroups, setOpenGroups] = useState<string[]>([
    'Главное','Закупки','Исполнение','Финансы','Контроль','Аналитика','Справочники','Система'
  ]);
  const [hovered, setHovered] = useState<string | null>(null);

  const unread       = notifications.filter(n => !n.isRead).length;
  const overdue      = procurements.filter(p => p.isOverdue).length;
  const urgentTasks  = tasks.filter(t => t.status === 'overdue' || t.priority === 'urgent').length;
  const pendingAppr  = procurements.filter(p =>
    ['sz_approval','winner_approval','contract_expertise','deputy_signing'].includes(p.status)
  ).length;
  const activeProcs  = procurements.filter(p => !['archive','cancelled'].includes(p.status)).length;

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  const toggleGroup = (g: string) =>
    setOpenGroups(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const nav: { section: string; items: NavItem[] }[] = [
    {
      section: 'Главное',
      items: [
        { href: '/dashboard',     label: 'Рабочий стол',   icon: <LayoutDashboard size={14}/>, hint: 'KPI и быстрые действия' },
        { href: '/poisk',         label: 'Поиск',           icon: <Search size={14}/> },
        { href: '/uvedomleniya',  label: 'Уведомления',     icon: <Bell size={14}/>, badge: unread || undefined, badgeColor: '#ef4444' },
      ],
    },
    {
      section: 'Закупки',
      items: [
        { href: '/sluzhebnye-zapiski', label: 'Служебные записки', icon: <FileText size={14}/>, hint: 'СЗ — основание для закупки' },
        { href: '/zakupki',       label: 'Реестр закупок',  icon: <ShoppingCart size={14}/>, badge: activeProcs || undefined, badgeColor: '#3b82f6',
          children: [
            { href: '/zakupki',          label: 'Все закупки',    icon: <ShoppingCart size={13}/> },
            { href: '/zakupki/novaya',   label: 'Создать закупку',icon: <CheckCircle size={13}/> },
            { href: '/zakupki/arkhiv',   label: 'Архив',          icon: <Archive size={13}/> },
          ],
        },
        { href: '/nmck',          label: 'Калькулятор НМЦК', icon: <Calculator size={14}/>, hint: 'Приказ №567, коэф. вариации' },
        { href: '/kp',            label: 'Сравнение КП',    icon: <BarChart3 size={14}/>, hint: 'Анализ рынка' },
        { href: '/soglasovaniya', label: 'Согласования',    icon: <CheckSquare size={14}/>, badge: pendingAppr || undefined, badgeColor: '#f59e0b' },
      ],
    },
    {
      section: 'Исполнение',
      items: [
        { href: '/kontrakty',  label: 'Договоры',           icon: <BookOpen size={14}/> },
        { href: '/priemka',    label: 'Приёмка товаров',    icon: <Package size={14}/>, hint: 'Акты приёмки по 44-ФЗ' },
        { href: '/ispolnenie', label: 'Исполнение',         icon: <TrendingUp size={14}/> },
      ],
    },
    {
      section: 'Финансы',
      items: [
        { href: '/platezhi',         label: 'Платежи',         icon: <CreditCard size={14}/> },
        { href: '/platezhi-feo',     label: 'Оплата через ФЭО',icon: <Building2 size={14}/>, hint: 'ФЭО → оплата → исполнено' },
        { href: '/grafik-platezhey', label: 'График платежей', icon: <Calendar size={14}/> },
      ],
    },
    {
      section: 'Контроль',
      items: [
        { href: '/kontrol-srokov', label: 'Контроль сроков', icon: <Clock size={14}/>, badge: overdue || undefined, badgeColor: '#ef4444' },
        { href: '/zadachi',        label: 'Задачи',          icon: <CheckCircle size={14}/>, badge: urgentTasks || undefined, badgeColor: '#ef4444' },
        { href: '/riski',          label: 'Риски',           icon: <AlertTriangle size={14}/> },
        { href: '/proverki',       label: 'Проверки',        icon: <Shield size={14}/> },
        { href: '/monitoring',     label: 'Мониторинг',      icon: <TrendingUp size={14}/> },
      ],
    },
    {
      section: 'Аналитика',
      items: [
        { href: '/analitika',   label: 'Аналитика',          icon: <BarChart3 size={14}/> },
        { href: '/kpi',         label: 'KPI',                icon: <TrendingUp size={14}/> },
        { href: '/rukovoditel', label: 'Панель руководителя',icon: <Building2 size={14}/> },
        { href: '/otchetnost',  label: 'Отчётность ЕИС',     icon: <Database size={14}/> },
      ],
    },
    {
      section: 'Справочники',
      items: [
        { href: '/postavshchiki', label: 'Поставщики', icon: <Users size={14}/> },
        { href: '/dokumenty',     label: 'Документы',  icon: <FileText size={14}/> },
        { href: '/spravochniki',  label: 'Справочники',icon: <BookOpen size={14}/> },
      ],
    },
    {
      section: 'Система',
      items: [
        { href: '/istoriya',    label: 'История',        icon: <ClipboardList size={14}/> },
        { href: '/kalendar',    label: 'Календарь',      icon: <Calendar size={14}/> },
        { href: '/chat',        label: 'Чат',            icon: <Users size={14}/> },
        { href: '/nastroyky',   label: 'Настройки',      icon: <Settings size={14}/> },
        { href: '/pasport',     label: 'Паспорт системы',icon: <Shield size={14}/> },
        { href: '/about',       label: 'О системе',      icon: <HelpCircle size={14}/> },
      ],
    },
  ];

  // Свёрнутый вид
  if (collapsed) {
    return (
      <aside style={{ background: BG, width: 48, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', flexShrink: 0 }}>
        {/* Лого */}
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 52, borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#003087' }}>ЕПП</span>
          </div>
        </Link>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 4px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {nav.flatMap(g => g.items).map(item => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} title={item.hint ?? item.label}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  height: 36, borderRadius: 8, position: 'relative',
                  ...(active ? LINK_ACTIVE : { color: 'rgba(255,255,255,0.55)' }),
                  textDecoration: 'none',
                }}>
                {item.icon}
                {item.badge ? (
                  <span style={{
                    position: 'absolute', top: 2, right: 2,
                    width: 14, height: 14, borderRadius: '50%',
                    background: item.badgeColor ?? '#ef4444',
                    color: '#fff', fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800
                  }}>
                    {item.badge > 9 ? '9+' : item.badge}
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
    <aside style={{ background: BG, width: 220, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', flexShrink: 0 }}>
      {/* Лого */}
      <Link href="/dashboard" style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0, textDecoration: 'none', minHeight: 52,
      }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#003087' }}>ЕПП</span>
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ color: '#fff', fontSize: 11, fontWeight: 700, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Единый портал поставок
          </div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, lineHeight: 1.2 }}>ЕИС · ЕАТ «Берёзка»</div>
        </div>
      </Link>

      {/* Навигация */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        {nav.map(group => {
          const isOpen = openGroups.includes(group.section);
          return (
            <div key={group.section} style={{ marginBottom: 2 }}>
              {/* Заголовок группы */}
              <button onClick={() => toggleGroup(group.section)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '4px 12px', background: 'none', border: 'none', cursor: 'pointer',
                  ...SEC, marginBottom: 2,
                }}>
                <span>{group.section}</span>
                {isOpen
                  ? <ChevronDown size={9} style={{ color: 'rgba(255,255,255,0.3)' }}/>
                  : <ChevronRight size={9} style={{ color: 'rgba(255,255,255,0.3)' }}/>
                }
              </button>

              {isOpen && (
                <div>
                  {group.items.map(item => {
                    const active = isActive(item.href);
                    const hasChildren = item.children && item.children.length > 0;
                    const childActive = hasChildren && item.children!.some(ch => isActive(ch.href));

                    if (hasChildren) {
                      return (
                        <div key={item.href}>
                          <Link href={item.href}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              padding: '7px 12px 7px 16px', margin: '0 6px', borderRadius: 8,
                              textDecoration: 'none', fontSize: 12, position: 'relative',
                              ...(active || childActive ? LINK_ACTIVE : LINK),
                            }}>
                            {(active || childActive) && (
                              <span style={{ position: 'absolute', left: -2, top: '50%', transform: 'translateY(-50%)', width: 3, height: '60%', background: '#4d9fff', borderRadius: '0 2px 2px 0' }}/>
                            )}
                            <span style={{ flexShrink: 0 }}>{item.icon}</span>
                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                            {item.badge ? (
                              <span style={{ background: item.badgeColor ?? '#3b82f6', color: '#fff', fontSize: 10, fontWeight: 800, padding: '1px 5px', borderRadius: 6, flexShrink: 0 }}>
                                {item.badge}
                              </span>
                            ) : null}
                          </Link>
                          {(active || childActive) && (
                            <div style={{ marginLeft: 16, marginBottom: 2 }}>
                              {item.children!.map(ch => (
                                <Link key={ch.href} href={ch.href}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '5px 12px 5px 12px', margin: '0 6px', borderRadius: 8,
                                    textDecoration: 'none', fontSize: 11,
                                    ...(isActive(ch.href) ? LINK_ACTIVE : { ...LINK, color: 'rgba(255,255,255,0.45)' }),
                                  }}>
                                  {ch.icon}
                                  <span>{ch.label}</span>
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
                        onMouseEnter={() => setHovered(item.href)}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '7px 12px 7px 16px', margin: '0 6px', borderRadius: 8,
                          textDecoration: 'none', fontSize: 12, position: 'relative',
                          ...(active ? LINK_ACTIVE : hovered === item.href ? LINK_HOVER : LINK),
                        }}>
                        {active && (
                          <span style={{ position: 'absolute', left: -2, top: '50%', transform: 'translateY(-50%)', width: 3, height: '60%', background: '#4d9fff', borderRadius: '0 2px 2px 0' }}/>
                        )}
                        <span style={{ flexShrink: 0 }}>{item.icon}</span>
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                        {item.badge ? (
                          <span style={{ background: item.badgeColor ?? '#3b82f6', color: '#fff', fontSize: 10, fontWeight: 800, padding: '1px 5px', borderRadius: 6, flexShrink: 0 }}>
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
      <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.07)', fontSize: 10, color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>
        ЕПП v3.0 · Росреестр 2026
      </div>
    </aside>
  );
}
