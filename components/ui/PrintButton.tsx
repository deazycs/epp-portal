'use client';

import { Printer } from 'lucide-react';
import type { Procurement } from '@/types';
import { STATUS_LABELS } from '@/mock/data/procurements';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';

interface PrintProcurementProps {
  procurement: Procurement;
}

export function PrintProcurementButton({ procurement }: PrintProcurementProps) {
  const handlePrint = () => {
    // Создаём скрытый iframe для печати с кастомным CSS
    const printContent = generatePrintHTML(procurement);
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(printContent);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
  };

  return (
    <button onClick={handlePrint} className="gov-btn gov-btn-ghost gov-btn-sm" title="Распечатать карточку">
      <Printer size={12} /> Печать
    </button>
  );
}

function generatePrintHTML(p: Procurement): string {
  const totalItems = p.items.reduce((s, i) => s + i.totalPrice, 0);

  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8"/>
<title>Карточка закупки ${p.registryNumber}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 11pt; color: #000; background: #fff; padding: 20mm; }
  h1 { font-size: 14pt; font-weight: bold; margin-bottom: 4mm; }
  h2 { font-size: 12pt; font-weight: bold; margin: 6mm 0 3mm; border-bottom: 1pt solid #000; padding-bottom: 1mm; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6mm; padding-bottom: 4mm; border-bottom: 2pt solid #000; }
  .logo { font-size: 10pt; color: #555; }
  .badge { display: inline-block; padding: 1mm 3mm; border: 1pt solid #000; font-size: 9pt; font-weight: bold; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 4mm; }
  table.info td { padding: 1.5mm 2mm; border-bottom: 0.5pt solid #ddd; vertical-align: top; }
  table.info td:first-child { width: 45mm; font-weight: bold; color: #444; font-size: 9pt; }
  table.items th { background: #f0f0f0; padding: 2mm; border: 0.5pt solid #aaa; font-size: 9pt; text-align: left; }
  table.items td { padding: 1.5mm 2mm; border: 0.5pt solid #ccc; font-size: 10pt; vertical-align: top; }
  table.items td.num { text-align: right; }
  .total-row td { font-weight: bold; background: #f8f8f8; }
  .footer { margin-top: 10mm; padding-top: 4mm; border-top: 1pt solid #000; font-size: 9pt; color: #666; display: flex; justify-content: space-between; }
  .sign-block { display: grid; grid-template-columns: 1fr 1fr; gap: 10mm; margin-top: 15mm; }
  .sign-line { border-top: 1pt solid #000; padding-top: 2mm; font-size: 9pt; margin-top: 12mm; }
  @media print {
    body { padding: 15mm; }
    @page { size: A4; margin: 15mm; }
  }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="logo">Федеральная служба государственной регистрации, кадастра и картографии</div>
    <div class="logo">ЕПП — Единый портал поставок</div>
  </div>
  <div style="text-align:right">
    <div class="badge">${STATUS_LABELS[p.status] ?? p.status}</div>
    <div style="font-size:9pt;margin-top:2mm;color:#666">Распечатано: ${new Date().toLocaleString('ru-RU')}</div>
  </div>
</div>

<h1>Карточка закупки № ${p.registryNumber}</h1>
<div style="margin-bottom:4mm;font-size:10pt">${p.title}</div>

<h2>1. Основные сведения</h2>
<table class="info">
  <tr><td>Номер в реестре</td><td>${p.registryNumber}</td></tr>
  ${p.eatNumber ? `<tr><td>Номер в ЕАТ «Берёзка»</td><td>${p.eatNumber}</td></tr>` : ''}
  ${p.eisNumber ? `<tr><td>Номер в ЕИС</td><td>${p.eisNumber}</td></tr>` : ''}
  <tr><td>Наименование закупки</td><td>${p.title}</td></tr>
  <tr><td>Тип закупки</td><td>${p.procurementType === 'goods' ? 'Товары' : p.procurementType === 'works' ? 'Работы' : 'Услуги'}</td></tr>
  <tr><td>Подразделение-инициатор</td><td>${p.departmentName}</td></tr>
  <tr><td>Инициатор</td><td>${p.initiatorName}</td></tr>
  <tr><td>Ответственный специалист</td><td>${p.responsibleName}</td></tr>
  <tr><td>Дата создания</td><td>${formatDateTime(p.createdAt)}</td></tr>
</table>

<h2>2. Финансирование</h2>
<table class="info">
  <tr><td>Плановая стоимость</td><td>${formatCurrency(p.plannedSum)}</td></tr>
  ${p.contractSum ? `<tr><td>Сумма договора</td><td>${formatCurrency(p.contractSum)}</td></tr>` : ''}
  ${p.paidSum ? `<tr><td>Оплачено</td><td>${formatCurrency(p.paidSum)}</td></tr>` : ''}
  <tr><td>КБК</td><td>${p.kbk}</td></tr>
  <tr><td>КОСГУ</td><td>${p.kosgu}</td></tr>
  <tr><td>Источник финансирования</td><td>${p.financingSource}</td></tr>
</table>

<h2>3. Сроки исполнения</h2>
<table class="info">
  <tr><td>Плановая дата начала</td><td>${formatDate(p.plannedStartDate)}</td></tr>
  <tr><td>Плановая дата окончания</td><td>${formatDate(p.plannedEndDate)}</td></tr>
  ${p.contractDate ? `<tr><td>Дата заключения договора</td><td>${formatDate(p.contractDate)}</td></tr>` : ''}
  ${p.contractEndDate ? `<tr><td>Срок исполнения по договору</td><td>${formatDate(p.contractEndDate)}</td></tr>` : ''}
  ${p.actualEndDate ? `<tr><td>Фактическая дата завершения</td><td>${formatDate(p.actualEndDate)}</td></tr>` : ''}
</table>

${p.supplierName ? `
<h2>4. Поставщик</h2>
<table class="info">
  <tr><td>Наименование</td><td>${p.supplierName}</td></tr>
  <tr><td>ИНН</td><td>${p.supplierInn ?? '—'}</td></tr>
</table>` : ''}

${p.items.length > 0 ? `
<h2>${p.supplierName ? '5' : '4'}. Перечень товаров, работ, услуг</h2>
<table class="items">
  <thead>
    <tr><th style="width:5%">№</th><th style="width:50%">Наименование</th><th style="width:10%">Ед.изм.</th><th style="width:10%">Кол-во</th><th style="width:12%">Цена, руб.</th><th style="width:13%">Сумма, руб.</th></tr>
  </thead>
  <tbody>
    ${p.items.map((item, i) => `
    <tr>
      <td class="num">${i + 1}</td>
      <td>${item.name}</td>
      <td>${item.unit}</td>
      <td class="num">${item.quantity}</td>
      <td class="num">${formatCurrency(item.unitPrice)}</td>
      <td class="num">${formatCurrency(item.totalPrice)}</td>
    </tr>`).join('')}
    <tr class="total-row">
      <td colspan="5" style="text-align:right;padding-right:3mm">ИТОГО:</td>
      <td class="num">${formatCurrency(totalItems)}</td>
    </tr>
  </tbody>
</table>` : ''}

<div class="sign-block">
  <div>
    <div style="font-size:10pt;font-weight:bold">Ответственный специалист:</div>
    <div class="sign-line">_________________ / ${p.responsibleName} /</div>
  </div>
  <div>
    <div style="font-size:10pt;font-weight:bold">Начальник отдела МТО:</div>
    <div class="sign-line">_________________ / Смирнова Н.С. /</div>
  </div>
</div>

<div class="footer">
  <span>ЕПП — Единый портал поставок Росреестра</span>
  <span>Документ сформирован автоматически · ${new Date().toLocaleDateString('ru-RU')}</span>
</div>
</body>
</html>`;
}
