'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
const ROLES=[
  {id:'r1',name:'Специалист МТО',code:'specialist_mto',users:3,desc:'Создание и ведение закупок, загрузка документов'},
  {id:'r2',name:'Начальник отдела',code:'head_department',users:1,desc:'Согласование закупок, просмотр аналитики'},
  {id:'r3',name:'Контрактный управляющий',code:'contract_manager',users:1,desc:'Управление договорами, согласования'},
  {id:'r4',name:'Бухгалтерия',code:'buhgalter',users:1,desc:'Платежи, финансовая отчётность'},
  {id:'r5',name:'Руководство',code:'rukovodstvo',users:1,desc:'Полный просмотр, панель руководителя'},
  {id:'r6',name:'Администратор',code:'admin',users:1,desc:'Полный доступ, администрирование системы'},
];
export default function RoliPage() {
  return (
    <AppLayout>
      <div className="p-4">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Роли и права'}]}/>
        <h1 className="text-base font-bold mb-4">Роли и права доступа</h1>
        <div className="gov-card overflow-hidden">
          <table className="gov-table">
            <thead><tr><th>Роль</th><th>Системный код</th><th>Описание</th><th className="text-center">Пользователей</th></tr></thead>
            <tbody>
              {ROLES.map(r=>(
                <tr key={r.id}>
                  <td className="text-xs font-bold">{r.name}</td>
                  <td className="text-xs font-mono text-blue-600">{r.code}</td>
                  <td className="text-xs text-gray-600">{r.desc}</td>
                  <td className="text-center text-xs font-bold">{r.users}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
