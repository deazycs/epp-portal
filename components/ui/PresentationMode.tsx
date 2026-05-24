'use client';

import { useState, useEffect } from 'react';
import { Maximize2, Minimize2, Printer, Shield, ShieldOff } from 'lucide-react';
import type { Procurement } from '@/types';
import { STATUS_LABELS } from '@/mock/data/procurements';
import { formatCurrency, formatDate } from '@/lib/utils';

/* ─── Режим презентации ──────────────────── */
export function PresentationMode() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const style = document.getElementById('presentation-styles');
    if (active) {
      if (!style) {
        const s = document.createElement('style');
        s.id = 'presentation-styles';
        s.textContent = `
          html.presentation-mode body { font-size: 115% !important; }
          html.presentation-mode .gov-table td,
          html.presentation-mode .gov-table th { padding: 9px 11px !important; font-size: 13px !important; }
          html.presentation-mode .text-xs { font-size: 12px !important; }
          html.presentation-mode .text-sm { font-size: 14px !important; }
          html.presentation-mode .text-base { font-size: 17px !important; }
          html.presentation-mode .text-xl { font-size: 21px !important; }
          html.presentation-mode .text-2xl { font-size: 25px !important; }
        `;
        document.head.appendChild(s);
      }
      document.documentElement.classList.add('presentation-mode');
    } else {
      document.documentElement.classList.remove('presentation-mode');
      document.getElementById('presentation-styles')?.remove();
    }
  }, [active]);

  // F5 — переключение
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'F5') { e.preventDefault(); setActive(a => !a); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  return (
    <>
      <button
        onClick={() => setActive(a => !a)}
        title={active ? 'Выйти из режима презентации (F5)' : 'Режим презентации — увеличивает шрифт для проектора (F5)'}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded transition-colors ${
          active
            ? 'bg-orange-500 text-white hover:bg-orange-600'
            : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
        }`}
      >
        {active ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
        {active ? 'Режим проектора ВКЛ' : 'Режим проектора'}
      </button>

      {/* Индикатор активного режима */}
      {active && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[9990] bg-orange-500 text-white text-xs px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 pointer-events-none">
          <Maximize2 size={11} />
          <span>Режим проектора активен · F5 для выхода</span>
        </div>
      )}
    </>
  );
}

/* ─── Режим демонстрации ─────────────────── */
// Скрывает незавершённые разделы из меню во время показа комиссии
export function DefenseMode() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (active) {
      document.documentElement.setAttribute('data-defense', 'true');
      const s = document.createElement('style');
      s.id = 'defense-styles';
      s.textContent = `
        [data-defense="true"] a[href="/chat"],
        [data-defense="true"] a[href="/shablony"],
        [data-defense="true"] a[href="/podrazdeleniya"],
        [data-defense="true"] a[href="/roli"],
        [data-defense="true"] a[href="/spravochniki"],
        [data-defense="true"] a[href="/support"] {
          display: none !important;
        }
      `;
      document.head.appendChild(s);
    } else {
      document.documentElement.removeAttribute('data-defense');
      document.getElementById('defense-styles')?.remove();
    }
  }, [active]);

  return (
    <>
      <button
        onClick={() => setActive(a => !a)}
        title={active
          ? 'Показать все разделы меню'
          : 'Режим демонстрации — скрывает незавершённые разделы из меню'}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded transition-colors ${
          active
            ? 'bg-purple-600 text-white hover:bg-purple-700'
            : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
        }`}
      >
        {active ? <ShieldOff size={12} /> : <Shield size={12} />}
        {active ? 'Режим демо ВКЛ' : 'Режим демо'}
      </button>

      {active && (
        <div className="fixed top-12 right-4 z-[9990] bg-purple-600 text-white text-xs px-3 py-1.5 rounded-full shadow-lg pointer-events-none">
          🛡️ Режим демонстрации — меню очищено
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
        <td>${i + 1}</td>
        <td><strong>${p.registryNumber}</strong>${p.eatNumber ? `<br/><small>${p.eatNumber}</small>` : ''}</td>
        <td>${p.title}</td>
        <td>${STATUS_LABELS[p.status] ?? p.status}</td>
        <td>${p.departmentName}</td>
        <td style="text-align:right"><strong>${formatCurrency(p.plannedSum)}</strong></td>
        <td>${p.contractSum ? formatCurrency(p.contractSum) : '—'}</td>
        <td>${p.supplierName ?? '—'}</td>
        <td>${p.isOverdue ? `<span style="color:red;font-weight:bold">Просрочено</span>` : ((p as any).deliveryDate ? formatDate((p as any).deliveryDate) : formatDate(p.plannedEndDate))}</td>
        <td>${p.responsibleName}</td>
      </tr>
    `).join('');

    const totalPlanned  = data.reduce((s, p) => s + p.plannedSum, 0);
    const totalContract = data.reduce((s, p) => s + (p.contractSum ?? 0), 0);
    const economy       = totalPlanned - totalContract;

    const html = `<!DOCTYPE html>
<html lang="ru"><head><meta charset="UTF-8"/>
<title>Реестр закупок ЕПП</title>
<style>
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:Arial,sans-serif; font-size:9pt; padding:10mm; }
.header { display:flex; justify-content:space-between; margin-bottom:4mm; padding-bottom:3mm; border-bottom:2pt solid #003087; }
.logo { font-size:11pt; font-weight:bold; color:#003087; }
h1 { font-size:13pt; font-weight:bold; margin-bottom:3mm; }
.totals { display:grid; grid-template-columns:repeat(4,1fr); gap:2mm; margin-bottom:3mm; }
.total-card { border:0.5pt solid #ddd; padding:2mm; }
.total-val { font-size:10pt; font-weight:bold; color:#003087; }
.total-lbl { font-size:7pt; color:#555; }
table { width:100%; border-collapse:collapse; }
th { background:#003087; color:white; padding:2mm; font-size:8pt; text-align:left; border:0.5pt solid #001e5e; }
td { padding:1.5mm 2mm; font-size:8pt; border:0.5pt solid #ccc; vertical-align:top; }
tr:nth-child(even) { background:#f8f8f8; }
.footer { margin-top:4mm; padding-top:2mm; border-top:0.5pt solid #000; display:flex; justify-content:space-between; font-size:7pt; color:#555; }
.sign { margin-top:8mm; display:grid; grid-template-columns:1fr 1fr; gap:15mm; }
.sign-line { border-top:0.5pt solid #000; padding-top:1mm; font-size:8pt; margin-top:8mm; }
@media print { @page { size:A4 landscape; margin:10mm; } }
</style></head><body>
<div class="header">
  <div><div class="logo">ЕПП — Единый портал поставок</div>
  <div style="font-size:8pt;color:#555">Федеральная служба государственной регистрации, кадастра и картографии (Росреестр)</div></div>
  <div style="text-align:right;font-size:8pt;color:#555">Дата: ${new Date().toLocaleString('ru-RU')}<br/>Записей: ${data.length}</div>
</div>
<h1>Реестр закупок</h1>
<div class="totals">
  <div class="total-card"><div class="total-val">${data.length}</div><div class="total-lbl">Всего</div></div>
  <div class="total-card"><div class="total-val">${formatCurrency(totalPlanned)}</div><div class="total-lbl">Плановая сумма</div></div>
  <div class="total-card"><div class="total-val">${formatCurrency(totalContract)}</div><div class="total-lbl">Сумма договоров</div></div>
  <div class="total-card"><div class="total-val" style="color:green">${formatCurrency(economy)}</div><div class="total-lbl">Экономия</div></div>
</div>
<table>
<thead><tr>
  <th style="width:3%">№</th><th style="width:10%">Номер</th><th style="width:22%">Наименование</th>
  <th style="width:10%">Статус</th><th style="width:9%">Подразделение</th>
  <th style="width:9%;text-align:right">План. сумма</th><th style="width:9%;text-align:right">Дог. сумма</th>
  <th style="width:10%">Поставщик</th><th style="width:9%">Срок</th><th style="width:9%">Ответственный</th>
</tr></thead>
<tbody>${rows}</tbody>
</table>
<div class="sign">
  <div><div style="font-size:9pt">Начальник отдела МТО:</div><div class="sign-line">_________________ / Смирнова Н.С. /</div></div>
  <div><div style="font-size:9pt">Специалист МТО:</div><div class="sign-line">_________________ / Петров А.В. /</div></div>
</div>
<div class="footer">
  <span>ЕПП — Единый портал поставок Росреестра</span>
  <span>Сформировано автоматически · ${new Date().toLocaleDateString('ru-RU')}</span>
</div>
</body></html>`;

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
      title="Распечатать реестр на A4 альбомный">
      <Printer size={12} /> Распечатать реестр
    </button>
  );
}
