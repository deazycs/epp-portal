'use client';

import type { Procurement, Contract, Task } from '@/types';
import { STATUS_LABELS } from '@/mock/data/procurements';
import { PROCUREMENT_TYPE_LABELS } from '@/lib/utils';

function toCSV(headers: string[], rows: (string|number)[][]): string {
  const BOM = '\uFEFF';
  const lines = [headers, ...rows].map(row =>
    row.map(cell => {
      const s = String(cell ?? '');
      return s.includes(';') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    }).join(';')
  );
  return BOM + lines.join('\r\n');
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportProcurementsXLSX(data: Procurement[]) {
  const headers = [
    '№','Номер реестра','Номер ЕАТ','Номер ЕИС','Наименование закупки',
    'Статус','Тип','Подразделение','Ответственный',
    'Плановая сумма','Сумма договора','Оплачено',
    'КБК','КОСГУ','Поставщик','ИНН поставщика',
    'Дата создания','Плановое начало','Плановое окончание',
    'Дата договора','Факт. завершение','Просрочка',
  ];
  const rows = data.map((p, i) => [
    i + 1,
    p.registryNumber,
    p.eatNumber ?? '',
    p.eisNumber ?? '',
    p.title,
    STATUS_LABELS[p.status] ?? p.status,
    PROCUREMENT_TYPE_LABELS[p.procurementType],
    p.departmentName,
    p.responsibleName,
    p.plannedSum,
    p.contractSum ?? '',
    p.paidSum ?? '',
    p.kbk,
    p.kosgu,
    p.supplierName ?? '',
    p.supplierInn ?? '',
    p.createdAt?.slice(0, 10) ?? '',
    p.plannedStartDate,
    p.plannedEndDate,
    p.contractDate ?? '',
    p.actualEndDate ?? '',
    p.isOverdue ? 'Да' : 'Нет',
  ]);
  downloadCSV(toCSV(headers, rows), 'реестр_закупок');
}

export async function exportContractsXLSX(data: Contract[]) {
  const headers = [
    '№','Номер договора','Предмет','Поставщик','ИНН',
    'Статус','Сумма','Оплачено','Дата подписания',
    'Срок исполнения','Факт. завершение','Подразделение','Ответственный','Просрочка',
  ];
  const rows = data.map((c, i) => [
    i + 1, c.number, c.subject, c.supplierName, c.supplierInn,
    c.status, c.totalSum, c.paidSum,
    c.signDate, c.endDate, c.actualEndDate ?? '',
    c.departmentName, c.responsibleName, c.isOverdue ? 'Да' : 'Нет',
  ]);
  downloadCSV(toCSV(headers, rows), 'реестр_договоров');
}

export async function exportTasksXLSX(data: Task[]) {
  const STATUS: Record<string,string> = {
    new:'Новая', in_progress:'В работе',
    done:'Выполнена', overdue:'Просрочена', cancelled:'Отменена',
  };
  const headers = ['№','Задача','Статус','Приоритет','Исполнитель','Постановщик','Срок','Выполнена'];
  const rows = data.map((t, i) => [
    i + 1, t.title, STATUS[t.status] ?? t.status, t.priority,
    t.assigneeName, t.creatorName, t.dueDate ?? '', t.completedAt?.slice(0,10) ?? '',
  ]);
  downloadCSV(toCSV(headers, rows), 'задачи');
}
