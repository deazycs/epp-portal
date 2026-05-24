'use client';

import { useState, useEffect, useCallback } from 'react';
import { Maximize2, Minimize2, Printer, X } from 'lucide-react';
import type { Procurement } from '@/types';
import { STATUS_LABELS } from '@/mock/data/procurements';
import { formatCurrency, formatDate } from '@/lib/utils';

/* ─── Режим презентации ──────────────────── */
export function PresentationMode() {
  const [active, setActive] = useState(false);

  const enable = useCallback(() => {
    document.documentElement.classList.add('presentation-mode');
    setActive(true);
  }, []);

  const disable = useCallback(() => {
    document.documentElement.classList.remove('presentation-mode');
    setActive(false);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F5') { e.preventDefault(); active ? disable() : enable(); }
      if (e.key === 'Escape' && active) disable();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active, enable, disable]);

  // Добавляем CSS для режима презентации
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'presentation-styles';
    style.textContent = `
      html.presentation-mode {
        font-size: 120% !important;
      }
      html.presentation-mode aside {
        display: none !important;
      }
      html.presentation-mode header {
        height: 3rem !important;
      }
      html.presentation-mode .gov-table td,
      html.presentation-mode .gov-table th {
        padding: 10px 12px !important;
        font-size: 14px !important;
      }
      html.presentation-mode .text-xs {
        font-size: 13px !important;
      }
      html.presentation-mode .text-sm {
        font-size: 15px !important;
      }
      html.presentation-mode .text-base {
        font-size: 18px !important;
      }
      html.presentation-mode .text-xl {
        font-size: 22px !important;
      }
      html.presentation-mode .text-2xl {
        font-size: 26px !important;
      }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById('presentation-styles')?.remove(); };
  }, []);

  return (
    <>
      <button
        onClick={active ? disable : enable}
        title={active ? 'Выйти из режима презентации (Esc)' : 'Режим презентации (F5) — крупный шрифт для проектора'}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded transition-colors ${
          active
            ? 'bg-orange-500 text-white hover:bg-orange-600'
            : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
        }`}
      >
        {active ? <Minimize2 size={12}/> : <Maximize2 size={12}/>}
        {active ? 'Выйти из презентации' : 'Режим презентации'}
      </button>

      {active && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-orange-500 text-white text-xs px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2">
          <Maximize2 size={11}/>
          <span>Режим презентации активен · Esc или F5 для выхода</span>
          <button onClick={disable} className="ml-1 opacity-70 hover:opacity-100">
            <X size={11}/>
          </button>
        </div>
      )}
    </>
  );
}

/* ─── Печать реестра ─────────────────────── */
export function PrintRegistryButton({ data }: { data: Procurement[] }) {
  const handlePrint = () => {
    const rows = data.map((p, i) => `
      <tr>
        <td>${i+1}</td>
        <td><strong>${p.registryNumber}</strong>${p.eatNumber ? `<br/><small>${p.eatNumber}</small>` : ''}</td>
        <td>${p.title}</td>
        <td>${STATUS_LABELS[p.status] ?? p.status}</td>
        <td>${p.departmentName}</td>
        <td style="text-align:right"><strong>${formatCurrency(p.plannedSum)}</strong></td>
        <td>${p.contractSum ? formatCurrency(p.contractSum) : '—'}</td>
        <td>${p.supplierName ?? '—'}</td>
        <td>${p.isOverdue ? `<span style="color:red;font-weight:bold">Просрочено ${p.overduedays??''}д.</span>` : formatDate(p.plannedEndDate)}</td>
        <td>${p.responsibleName}</td>
      </tr>
    `).join('');

    const totalPlanned = data.reduce((s,p)=>s+p.plannedSum,0);
    const totalContract = data.reduce((s,p)=>s+(p.contractSum??0),0);
    const economy = totalPlanned - totalContract;

    const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8"/>
<title>Реестр закупок ЕПП — Росреестр</title>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:Arial,sans-serif; font-size:9pt; color:#000; padding:10mm; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:5mm; padding-bottom:3mm; border-bottom:2pt solid #003087; }
  .logo { font-size:11pt; font-weight:bold; color:#003087; }
  .sub { font-size:8pt; color:#555; }
  h1 { font-size:13pt; font-weight:bold; margin-bottom:3mm; }
  .meta { font-size:8pt; color:#555; margin-bottom:4mm; }
  table { width:100%; border-collapse:collapse; margin-bottom:4mm; }
  th { background:#003087; color:white; padding:3mm 2mm; font-size:8pt; text-align:left; border:0.5pt solid #001e5e; }
  td { padding:2mm; font-size:8pt; border:0.5pt solid #ddd; vertical-align:top; }
  tr:nth-child(even) { background:#f8f8f8; }
  .totals { display:grid; grid-template-columns:repeat(4,1fr); gap:3mm; margin-bottom:4mm; }
  .total-card { border:0.5pt solid #ddd; padding:2mm 3mm; border-radius:2pt; }
  .total-val { font-size:11pt; font-weight:bold; color:#003087; }
  .total-lbl { font-size:7pt; color:#555; }
  .footer { margin-top:5mm; padding-top:2mm; border-top:0.5pt solid #000; display:flex; justify-content:space-between; font-size:7pt; color:#555; }
  .sign { margin-top:8mm; display:grid; grid-template-columns:1fr 1fr; gap:15mm; }
  .sign-line { border-top:0.5pt solid #000; padding-top:1mm; font-size:8pt; margin-top:8mm; }
  @media print { @page { size:A4 landscape; margin:10mm; } }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="logo">ЕПП — Единый портал поставок</div>
    <div class="sub">Федеральная служба государственной регистрации, кадастра и картографии (Росреестр)</div>
    <div class="sub">Отдел материально-технического обеспечения</div>
  </div>
  <div style="text-align:right">
    <div class="sub">Дата выгрузки: ${new Date().toLocaleString('ru-RU')}</div>
    <div class="sub">Записей в выгрузке: ${data.length}</div>
  </div>
</div>

<h1>Реестр закупок</h1>
<div class="meta">
  Сформировано автоматически из системы ЕПП · 
  Активных: ${data.filter(p=>!['archive','cancelled'].includes(p.status)).length} · 
  Просрочено: ${data.filter(p=>p.isOverdue).length}
</div>

<div class="totals">
  <div class="total-card">
    <div class="total-val">${data.length}</div>
    <div class="total-lbl">Всего записей</div>
  </div>
  <div class="total-card">
    <div class="total-val">${formatCurrency(totalPlanned)}</div>
    <div class="total-lbl">Плановая стоимость</div>
  </div>
  <div class="total-card">
    <div class="total-val">${formatCurrency(totalContract)}</div>
    <div class="total-lbl">Сумма договоров</div>
  </div>
  <div class="total-card">
    <div class="total-val" style="color:green">${formatCurrency(economy)}</div>
    <div class="total-lbl">Экономия бюджета</div>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th style="width:3%">№</th>
      <th style="width:9%">Номер</th>
      <th style="width:22%">Наименование закупки</th>
      <th style="width:10%">Статус</th>
      <th style="width:9%">Подразделение</th>
      <th style="width:9%;text-align:right">Плановая сумма</th>
      <th style="width:9%;text-align:right">Сумма договора</th>
      <th style="width:10%">Поставщик</th>
      <th style="width:9%">Срок</th>
      <th style="width:10%">Ответственный</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>

<div class="sign">
  <div>
    <div style="font-size:9pt">Начальник отдела МТО:</div>
    <div class="sign-line">_________________ / Смирнова Н.С. /</div>
  </div>
  <div>
    <div style="font-size:9pt">Специалист МТО:</div>
    <div class="sign-line">_________________ / Петров А.В. /</div>
  </div>
</div>

<div class="footer">
  <span>ЕПП — Единый портал поставок Росреестра</span>
  <span>Документ сформирован автоматически · Хранить 5 лет</span>
</div>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=1100,height=700');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 600);
  };

  return (
    <button onClick={handlePrint}
      className="gov-btn gov-btn-ghost gov-btn-sm"
      title="Распечатать реестр закупок (формат A4 альбомный)">
      <Printer size={12}/> Распечатать реестр
    </button>
  );
}


/* ─── Режим защиты ──────────────────────── */
// Скрывает из сайдбара разделы которые не нужно показывать комиссии
const HIDDEN_IN_DEFENSE = ['/chat', '/shablony', '/podrazdeleniya', '/roli', '/spravochniki', '/support'];

export function DefenseMode() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (active) {
      document.documentElement.setAttribute('data-defense', 'true');
      // Скрываем пункты сайдбара
      const style = document.createElement('style');
      style.id = 'defense-styles';
      style.textContent = `
        [data-defense="true"] a[href="/chat"],
        [data-defense="true"] a[href="/shablony"],
        [data-defense="true"] a[href="/podrazdeleniya"],
        [data-defense="true"] a[href="/roli"],
        [data-defense="true"] a[href="/spravochniki"],
        [data-defense="true"] a[href="/support"] {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
    } else {
      document.documentElement.removeAttribute('data-defense');
      document.getElementById('defense-styles')?.remove();
    }
  }, [active]);

  return (
    <button
      onClick={() => setActive(a => !a)}
      title={active ? "Выйти из режима защиты" : "Режим защиты — скрывает незавершённые разделы из меню"}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded transition-colors ${
        active
          ? 'bg-red-600 text-white hover:bg-red-700'
          : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
      }`}
    >
      🛡️ {active ? 'Режим защиты ВКЛ' : 'Режим защиты'}
    </button>
  );
}
