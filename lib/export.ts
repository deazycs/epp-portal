import type { Procurement } from '@/types';
import { WORKFLOW_STATUS_LABELS } from '@/lib/constants';


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

export async function exportProcurementsXLSX(data: Procurement[], filename = 'Реестр закупок ЕПП') {
  // Динамический импорт чтобы не грузить xlsx на сервере
  const XLSX = await import('xlsx');

  const now = new Date();
  const dateStr = now.toLocaleDateString('ru-RU');

  // Лист 1 — данные реестра
  const rows = data.map((p, i) => ({
    '№': i + 1,
    'Рег. номер': p.registryNumber,
    'Наименование': p.title,
    'Статус': WORKFLOW_STATUS_LABELS[p.status] ?? p.status,
    'Подразделение': p.departmentName,
    'Тип': (p as any).procurementType === 'goods' ? 'Товары' : (p as any).procurementType === 'works' ? 'Работы' : 'Услуги',
    'Плановая сумма': p.plannedSum,
    'Сумма договора': p.contractSum ?? '',
    'Оплачено': p.paidSum ?? '',
    'Поставщик': p.supplierName ?? '',
    'ИНН': p.supplierInn ?? '',
    'Ответственный': p.responsibleName,
    'Дата создания': p.createdAt.split('T')[0],
    'Плановый срок': p.plannedEndDate,
    'Срок поставки': (p as any).deliveryDate ?? '',
    'Просрочка': p.isOverdue ? 'Да' : 'Нет',
    'КБК': p.kbk ?? '',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  // Ширина колонок
  ws['!cols'] = [
    {wch:4},{wch:18},{wch:45},{wch:20},{wch:18},{wch:10},
    {wch:16},{wch:16},{wch:14},{wch:24},{wch:13},{wch:18},
    {wch:13},{wch:13},{wch:13},{wch:8},{wch:28},
  ];

  // Лист 2 — сводка
  const summary = [
    { 'Показатель': 'Дата выгрузки', 'Значение': dateStr },
    { 'Показатель': 'Всего записей', 'Значение': data.length },
    { 'Показатель': 'Активных', 'Значение': data.filter(p => !['archive','cancelled'].includes(p.status)).length },
    { 'Показатель': 'Просрочено', 'Значение': data.filter(p => p.isOverdue).length },
    { 'Показатель': 'Плановая стоимость (руб.)', 'Значение': data.reduce((s,p)=>s+p.plannedSum,0) },
    { 'Показатель': 'Сумма договоров (руб.)', 'Значение': data.reduce((s,p)=>s+(p.contractSum??0),0) },
    { 'Показатель': 'Оплачено (руб.)', 'Значение': data.reduce((s,p)=>s+(p.paidSum??0),0) },
    { 'Показатель': 'Экономия (руб.)', 'Значение': data.reduce((s,p)=>s+p.plannedSum-(p.contractSum??p.plannedSum),0) },
  ];
  const ws2 = XLSX.utils.json_to_sheet(summary);
  ws2['!cols'] = [{wch:30},{wch:20}];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Реестр закупок');
  XLSX.utils.book_append_sheet(wb, ws2, 'Сводка');

  // Заголовок файла
  XLSX.writeFile(wb, `${filename} ${dateStr}.xlsx`);
}

export async function exportTasksXLSX(tasks: any[], filename = 'Задачи ЕПП') {
  const XLSX = await import('xlsx');
  const now = new Date().toLocaleDateString('ru-RU');
  const rows = tasks.map((t, i) => ({
    '№': i + 1,
    'Задача': t.title,
    'Исполнитель': t.assigneeName,
    'Постановщик': t.creatorName,
    'Статус': t.status === 'done' ? 'Выполнено' : t.status === 'overdue' ? 'Просрочено' : t.status === 'in_progress' ? 'В работе' : 'Новая',
    'Приоритет': t.priority === 'urgent' ? 'Срочный' : t.priority === 'high' ? 'Высокий' : 'Обычный',
    'Срок': t.dueDate ?? '',
    'Закупка': t.procurementId ?? '',
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{wch:4},{wch:60},{wch:20},{wch:20},{wch:14},{wch:12},{wch:13},{wch:18}];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Задачи');
  XLSX.writeFile(wb, `${filename} ${now}.xlsx`);
}

export async function exportContractsXLSX(data: any[], filename = 'Договоры ЕПП') {
  const XLSX = await import('xlsx');
  const now = new Date().toLocaleDateString('ru-RU');
  const rows = data.map((p, i) => ({
    '№': i + 1,
    'Рег. номер': p.registryNumber,
    'Предмет': p.title,
    'Поставщик': p.supplierName ?? '',
    'ИНН': p.supplierInn ?? '',
    'Сумма': p.contractSum ?? 0,
    'Оплачено': p.paidSum ?? 0,
    'Дата договора': p.contractDate ?? '',
    'Срок': p.contractEndDate ?? '',
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{wch:4},{wch:18},{wch:45},{wch:24},{wch:14},{wch:14},{wch:14},{wch:14},{wch:14}];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Договоры');
  XLSX.writeFile(wb, `${filename} ${now}.xlsx`);
}
