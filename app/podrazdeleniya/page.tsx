'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { MOCK_DEPARTMENTS } from '@/mock/data/users';
export default function PodrazdeleniyaPage() {
  return (
    <AppLayout>
      <div className="p-4">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Подразделения'}]}/>
        <h1 className="text-base font-bold mb-4">Организационная структура</h1>
        <div className="gov-card overflow-hidden">
          <table className="gov-table">
            <thead><tr><th>Подразделение</th><th>Краткое наим.</th><th>Код</th><th>Руководитель</th><th className="text-center">Сотрудников</th><th className="text-center">Активных закупок</th></tr></thead>
            <tbody>
              {MOCK_DEPARTMENTS.map(d=>(
                <tr key={d.id}>
                  <td className="text-xs font-bold">{d.name}</td>
                  <td className="text-xs">{d.shortName}</td>
                  <td className="text-xs font-mono text-blue-600">{d.id}</td>
                  <td className="text-xs">{d.head}</td>
                  <td className="text-center text-xs font-bold">{d.employeeCount}</td>
                  <td className="text-center text-xs font-bold text-blue-700">{0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
