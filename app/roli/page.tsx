'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { USERS } from '@/mock/data/users';
import { Shield, CheckCircle, XCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

const ROLES = [
  {
    id: 'mto_specialist', name: 'Специалист МТО', color: '#003087', bg: '#eff6ff',
    desc: 'Создаёт закупки, ведёт документооборот, работает с ЕАТ и ЕИС',
    perms: {
      'Подавать СЗ': true, 'Создавать закупки': true, 'Размещать на ЕАТ/ЕИС': true,
      'Загружать документы': true, 'Согласовывать договора': false,
      'Подписывать договора': false, 'Подтверждать ЛБО': false,
      'Просматривать аналитику': true,
    },
    users: USERS.filter(u => ['mto_specialist','mto_head'].includes(u.role)).map(u => u.nameShort),
  },
  {
    id: 'deputy_head', name: 'Заместитель руководителя', color: '#7c3aed', bg: '#f5f3ff',
    desc: 'Согласует СЗ, визирует и подписывает договора как уполномоченное лицо',
    perms: {
      'Подавать СЗ': false, 'Создавать закупки': false, 'Размещать на ЕАТ/ЕИС': false,
      'Загружать документы': false, 'Согласовывать договора': true,
      'Подписывать договора': true, 'Подтверждать ЛБО': false,
      'Просматривать аналитику': true,
    },
    users: USERS.filter(u => u.role === 'deputy_head').map(u => u.nameShort),
  },
  {
    id: 'feo', name: 'Финансово-экономический отдел', color: '#b45309', bg: '#fffbeb',
    desc: 'Подтверждает наличие ЛБО, проводит финансовую экспертизу договоров, оплачивает',
    perms: {
      'Подавать СЗ': false, 'Создавать закупки': false, 'Размещать на ЕАТ/ЕИС': false,
      'Загружать документы': false, 'Согласовывать договора': true,
      'Подписывать договора': false, 'Подтверждать ЛБО': true,
      'Просматривать аналитику': true,
    },
    users: USERS.filter(u => u.role === 'feo').map(u => u.nameShort),
  },
  {
    id: 'legal', name: 'Правовой отдел', color: '#b91c1c', bg: '#fef2f2',
    desc: 'Проводит правовую экспертизу договоров. Не инициирует закупки.',
    perms: {
      'Подавать СЗ': false, 'Создавать закупки': false, 'Размещать на ЕАТ/ЕИС': false,
      'Загружать документы': false, 'Согласовывать договора': true,
      'Подписывать договора': false, 'Подтверждать ЛБО': false,
      'Просматривать аналитику': false,
    },
    users: USERS.filter(u => u.role === 'legal').map(u => u.nameShort),
  },
  {
    id: 'initiator', name: 'Инициатор (отделы)', color: '#059669', bg: '#ecfdf5',
    desc: 'ИТ-отдел, ОО, ОГТ — подают СЗ, запрашивают КП, участвуют в приёмке',
    perms: {
      'Подавать СЗ': true, 'Создавать закупки': false, 'Размещать на ЕАТ/ЕИС': false,
      'Загружать документы': true, 'Согласовывать договора': false,
      'Подписывать договора': false, 'Подтверждать ЛБО': false,
      'Просматривать аналитику': false,
    },
    users: USERS.filter(u => ['dept_head','initiator'].includes(u.role)).map(u => u.nameShort),
  },
];

const PERMS = Object.keys(ROLES[0].perms);

export default function RoliPage() {
  return (
    <AppLayout>
      <div className="p-3 sm:p-4 fade-in">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Роли и права'}]}/>
        <div className="mb-3">
          <h1 className="text-base font-bold">Роли и права доступа</h1>
          <p className="text-xs text-gray-500">Разграничение обязанностей по внутреннему регламенту Росреестра</p>
        </div>

        {/* Карточки ролей */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {ROLES.map(role => (
            <div key={role.id} className="gov-card p-4"
              style={{ borderTop: `3px solid ${role.color}` }}>
              <div className="flex items-center gap-2 mb-2">
                <Shield size={14} style={{color: role.color}}/>
                <div className="text-xs font-bold" style={{color: role.color}}>{role.name}</div>
              </div>
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">{role.desc}</p>
              <div className="text-xs text-gray-500 mb-1 font-medium">Сотрудники:</div>
              <div className="flex flex-wrap gap-1">
                {role.users.map(u => (
                  <span key={u} className="text-xs px-1.5 py-0.5 rounded font-medium"
                    style={{background: role.bg, color: role.color, border:`1px solid ${role.color}30`}}>
                    {u}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Матрица прав */}
        <div className="gov-card overflow-hidden">
          <div className="gov-section-title">📊 Матрица прав доступа</div>
          <div className="overflow-x-auto">
            <table className="gov-table">
              <thead>
                <tr>
                  <th className="min-w-48">Действие</th>
                  {ROLES.map(r => (
                    <th key={r.id} className="text-center min-w-28">
                      <div style={{color: r.color, fontSize: 11}}>{r.name}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMS.map(perm => (
                  <tr key={perm}>
                    <td className="text-xs font-medium">{perm}</td>
                    {ROLES.map(role => (
                      <td key={role.id} className="text-center">
                        {(role.perms as Record<string,boolean>)[perm]
                          ? <CheckCircle size={15} className="mx-auto text-green-500"/>
                          : <XCircle size={15} className="mx-auto text-gray-200"/>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
