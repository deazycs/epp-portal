'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { useAppStore } from '@/store/index';
import { USERS, INITIATING_DEPTS } from '@/mock/data/users';
import { Users, ShoppingCart, FileText, Phone } from 'lucide-react';

export const dynamic = 'force-dynamic';

const ALL_DEPTS = [
  { id:'mto',    name:'Отдел МТО', short:'МТО', color:'#003087', bg:'#eff6ff',
    desc:'Материально-техническое обеспечение. Единственный отдел создающий закупки на площадках.',
    canOrder: true },
  { id:'it',     name:'ИТ-отдел (Отдел эксплуатации ИС)', short:'ИТ-отдел', color:'#1d4ed8', bg:'#eff6ff',
    desc:'Эксплуатация информационных систем, технических средств и каналов связи. Инициатор ИТ-закупок.',
    canOrder: false },
  { id:'oo',     name:'Отдел общего обеспечения', short:'ОО', color:'#b45309', bg:'#fffbeb',
    desc:'Общее обеспечение деятельности Управления. Инициатор закупок хозяйственных товаров и услуг.',
    canOrder: false },
  { id:'ogt',    name:'Отдел по защите гос. тайны', short:'ОГТ', color:'#374151', bg:'#f9fafb',
    desc:'Защита государственной тайны и мобилизационная подготовка. Инициатор закупок по безопасности.',
    canOrder: false },
  { id:'feo',    name:'Финансово-экономический отдел', short:'ФЭО', color:'#b45309', bg:'#fffbeb',
    desc:'Финансовое планирование, учёт, контроль ЛБО. Экспертиза договоров, проведение оплат.',
    canOrder: false },
  { id:'legal',  name:'Отдел правового обеспечения', short:'Правовой', color:'#b91c1c', bg:'#fef2f2',
    desc:'Правовая экспертиза договоров и нормативных актов. Консультирование по 44-ФЗ.',
    canOrder: false },
];

export default function PodrazdeleniyaPage() {
  const { procurements } = useAppStore();

  const getDeptStats = (deptId: string) => {
    const deptUsers = USERS.filter(u => {
      if (deptId === 'mto')   return ['mto_specialist','mto_head'].includes(u.role);
      if (deptId === 'it')    return u.deptShort === 'ИТ-отдел';
      if (deptId === 'oo')    return u.deptShort === 'ОО';
      if (deptId === 'ogt')   return u.deptShort === 'ОГТ';
      if (deptId === 'feo')   return u.role === 'feo';
      if (deptId === 'legal') return u.role === 'legal';
      return false;
    });
    const active = procurements.filter(p =>
      !['archive','cancelled'].includes(p.status) && p.departmentName?.toLowerCase().includes(deptId)
    ).length;
    return { users: deptUsers, active };
  };

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 fade-in">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Подразделения'}]}/>
        <div className="mb-4">
          <h1 className="text-base font-bold">Подразделения</h1>
          <p className="text-xs text-gray-500">Структура Управления Росреестра по Воронежской области</p>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="gov-card p-3 text-center">
            <div className="text-2xl font-bold text-blue-700">{ALL_DEPTS.length}</div>
            <div className="text-xs text-gray-500">Подразделений</div>
          </div>
          <div className="gov-card p-3 text-center">
            <div className="text-2xl font-bold text-green-700">{USERS.length}</div>
            <div className="text-xs text-gray-500">Сотрудников в системе</div>
          </div>
          <div className="gov-card p-3 text-center">
            <div className="text-2xl font-bold text-indigo-700">{INITIATING_DEPTS.length}</div>
            <div className="text-xs text-gray-500">Инициаторов закупок</div>
          </div>
        </div>

        {/* Карточки подразделений */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ALL_DEPTS.map(dept => {
            const { users } = getDeptStats(dept.id);
            return (
              <div key={dept.id} className="gov-card p-4 flex flex-col gap-3"
                style={{ borderLeft: `4px solid ${dept.color}` }}>
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded"
                      style={{ background: dept.bg, color: dept.color }}>
                      {dept.short}
                    </span>
                    {dept.canOrder && (
                      <span className="text-xs px-2 py-0.5 rounded font-bold"
                        style={{ background:'#ecfdf5', color:'#065f46', border:'1px solid #6ee7b7' }}>
                        ✓ Создаёт закупки
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-gray-800 leading-snug">{dept.name}</div>
                  <div className="text-xs text-gray-500 mt-1 leading-relaxed">{dept.desc}</div>
                </div>

                {users.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-400 mb-1.5 flex items-center gap-1">
                      <Users size={11}/> Сотрудники в системе:
                    </div>
                    <div className="space-y-1">
                      {users.map(u => (
                        <div key={u.id} className="flex items-center justify-between text-xs">
                          <div>
                            <span className="font-medium text-gray-800">{u.nameShort}</span>
                            <span className="text-gray-400 ml-1">· {u.position.split(' ').slice(0,2).join(' ')}</span>
                          </div>
                          {u.ext && (
                            <span className="text-gray-400 flex items-center gap-1">
                              <Phone size={9}/> {u.ext}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
