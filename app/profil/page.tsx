'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs, InfoRow, OnlineDot } from '@/components/ui/index';
import { CURRENT_USER } from '@/mock/data/users';
import { useAppStore } from '@/store/index';
import { MOCK_TASKS } from '@/mock/data/other';
import { formatDateTime, formatCurrency, ROLE_LABELS } from '@/lib/utils';
import { Mail, Phone, Building2, Shield } from 'lucide-react';
import Link from 'next/link';

export default function ProfilPage() {
  const { procurements, tasks } = useAppStore();
  const myProcs = procurements.filter(p => p.responsibleId === 'u_shv');
    const myProc = myProcs.filter(p=>p.responsibleId==='u_shv');
  const myTasks = MOCK_TASKS.filter(t=>t.assigneeId==='u_shv');
  const totalSum = myProc.reduce((s,p)=>s+p.plannedSum,0);
  return (
    <AppLayout>
      <div className="p-4">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Профиль сотрудника'}]}/>
        <h1 className="text-base font-bold mb-4">Профиль сотрудника</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <div className="gov-card p-4 text-center mb-3">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700 mx-auto mb-3">
                {CURRENT_USER.nameShort.split(' ').map((p:string)=>p[0]).join('').slice(0,2)}
              </div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <OnlineDot isOnline={true}/>
                <span className="text-sm font-bold">{CURRENT_USER.name}</span>
              </div>
              <div className="text-xs text-gray-500 mb-0.5">{CURRENT_USER.position}</div>
              <div className="text-xs text-gray-400">{CURRENT_USER.dept}</div>
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5 text-left">
                <div className="flex items-center gap-2 text-xs text-gray-600"><Mail size={12} className="text-gray-400"/>{CURRENT_USER.email}</div>
                <div className="flex items-center gap-2 text-xs text-gray-600"><Phone size={12} className="text-gray-400"/>{CURRENT_USER.phone}</div>
                <div className="flex items-center gap-2 text-xs text-gray-600"><Building2 size={12} className="text-gray-400"/>{CURRENT_USER.dept}</div>
                <div className="flex items-center gap-2 text-xs text-gray-600"><Shield size={12} className="text-gray-400"/>{ROLE_LABELS[CURRENT_USER.role]}</div>
              </div>
            </div>
            <div className="gov-card p-3">
              <div className="text-xs font-bold text-gray-700 mb-2">Моя статистика</div>
              <div className="space-y-2">
                {[
                  {label:'Активных закупок', val:myProc.filter(p=>!['archive','cancelled'].includes(p.status)).length, cls:'text-blue-700'},
                  {label:'Завершённых', val:myProc.filter(p=>p.status==='archive').length, cls:'text-green-700'},
                  {label:'Задач в работе', val:myTasks.filter(t=>['new','in_progress'].includes(t.status)).length, cls:'text-yellow-700'},
                  {label:'Просроченных задач', val:myTasks.filter(t=>t.status==='overdue').length, cls:'text-red-600'},
                  {label:'Сумма закупок', val:formatCurrency(totalSum), cls:'text-gray-700'},
                ].map(s=>(
                  <div key={s.label} className="flex justify-between border-b border-gray-100 pb-1">
                    <span className="text-xs text-gray-500">{s.label}</span>
                    <span className={`text-xs font-bold ${s.cls}`}>{s.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="gov-card">
              <div className="gov-section-title">Служебные сведения</div>
              <div className="p-3">
                <InfoRow label="Табельный номер" value="МТО-004512"/>
                <InfoRow label="Логин" value={<span className="font-mono">{CURRENT_USER.email}</span>}/>
                <InfoRow label="Роль" value={ROLE_LABELS[CURRENT_USER.role]}/>
                <InfoRow label="Подразделение" value={CURRENT_USER.dept}/>
                <InfoRow label="Должность" value={CURRENT_USER.position}/>
                <InfoRow label="Email" value={CURRENT_USER.email}/>
                <InfoRow label="Роль" value={
                  <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">{CURRENT_USER.role}</span>
                }/>
              </div>
            </div>
            <div className="gov-card">
              <div className="gov-section-title">Мои закупки</div>
              <div className="overflow-x-auto">
                <table className="gov-table">
                  <thead><tr><th>Номер</th><th>Наименование</th><th>Статус</th><th>Сумма</th></tr></thead>
                  <tbody>
                    {myProc.slice(0,5).map(p=>(
                      <tr key={p.id}>
                        <td><Link href={`/zakupki/${p.id}`} className="text-blue-600 hover:underline font-bold text-xs">{p.registryNumber}</Link></td>
                        <td className="text-xs">{p.title.slice(0,40)}…</td>
                        <td><span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded border text-gray-600">{p.status}</span></td>
                        <td className="text-xs font-bold">{formatCurrency(p.plannedSum)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
