'use client';

import { useState, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { useAppStore } from '@/store/index';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
  CheckCircle, XCircle, Clock, AlertTriangle,
  Upload, FileText, Printer, Users, Package
} from 'lucide-react';
import { getAcceptancePersons } from '@/mock/data/users';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// Уполномоченные лица — из централизованной функции users.ts
// Зависит от типа закупки: ИТ→Митусов, охрана→Щербинин, канцелярия→Давыдова, остальное→Черемных
function getResponsible(procurement: any) {
  const persons = getAcceptancePersons(procurement.title ?? '', (procurement as any).kosgu);
  return persons.map(p => ({
    name: p.nameShort,
    position: p.position,
    dept: p.deptShort,
  }));
}

interface AcceptDoc {
  id: string;
  name: string;
  type: 'scan' | 'uploaded';
  date: string;
  size?: string;
}

export default function PriemkaPage() {
  const { procurements, changeStatus } = useAppStore();
  const fileRef = useRef<HTMLInputElement>(null);

  // Закупки на этапе исполнения
  const forAcceptance = procurements.filter(p =>
    ['execution', 'payment'].includes(p.status) && p.supplierName
  );

  const [selectedId, setSelectedId]     = useState<string | null>(forAcceptance[0]?.id ?? null);
  const [signed, setSigned]             = useState<Record<string, string[]>>({});
  const [docs, setDocs]                 = useState<Record<string, AcceptDoc[]>>({});
  const [defects, setDefects]           = useState<Record<string, string>>({});
  const [accepted, setAccepted]         = useState<Record<string, boolean>>({});
  const [rejected, setRejected]         = useState<Record<string, boolean>>({});
  const [defectInput, setDefectInput]   = useState('');

  const sel = procurements.find(p => p.id === selectedId);
  const responsible = sel ? getResponsible(sel) : [];
  const selDocs = docs[selectedId ?? ''] ?? [];
  const selSigned = signed[selectedId ?? ''] ?? [];
  const allSigned = responsible.length > 0 && responsible.every(r => selSigned.includes(r.name));

  const toggleSign = (procId: string, name: string) => {
    setSigned(prev => {
      const cur = prev[procId] ?? [];
      return {
        ...prev,
        [procId]: cur.includes(name) ? cur.filter(n => n !== name) : [...cur, name],
      };
    });
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedId) return;
    const files = Array.from(e.target.files ?? []);
    const newDocs: AcceptDoc[] = files.map(f => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: f.name,
      type: 'uploaded',
      date: new Date().toLocaleDateString('ru-RU'),
      size: f.size > 1024 * 1024
        ? `${(f.size / 1024 / 1024).toFixed(1)} МБ`
        : `${Math.round(f.size / 1024)} КБ`,
    }));
    setDocs(prev => ({ ...prev, [selectedId]: [...(prev[selectedId] ?? []), ...newDocs] }));
    e.target.value = '';
  };

  const acceptDelivery = (procId: string) => {
    setAccepted(prev => ({ ...prev, [procId]: true }));
    setRejected(prev => ({ ...prev, [procId]: false }));
  };

  const rejectDelivery = (procId: string) => {
    setRejected(prev => ({ ...prev, [procId]: true }));
    setAccepted(prev => ({ ...prev, [procId]: false }));
  };

  const moveToPayment = (procId: string) => {
    // Документы переданы в ФЭО — первый шаг оплаты
    changeStatus(procId, 'payment_docs' as any, 'u_shv', 'Швецов К.Е.');
  };

  const printAct = () => {
    if (!sel) return;
    const respList = responsible.map(r =>
      `<tr><td>${r.name}</td><td>${r.position}</td><td>${r.dept}</td>
       <td style="text-align:center">${selSigned.includes(r.name) ? '✓' : '___________'}</td></tr>`
    ).join('');
    const docList = selDocs.map(d =>
      `<tr><td>${d.name}</td><td>${d.date}</td></tr>`
    ).join('');

    const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"/>
<title>Акт приёмки ${sel.registryNumber}</title>
<style>
body{font-family:Arial,sans-serif;font-size:10pt;padding:20mm;color:#000}
h2{text-align:center;font-size:12pt;font-weight:bold;margin-bottom:2mm}
p{margin:2mm 0}
table{width:100%;border-collapse:collapse;margin:4mm 0}
th,td{border:0.5pt solid #666;padding:2mm;font-size:9pt;text-align:left}
th{background:#f0f0f0;font-weight:bold}
.sign-row{margin-top:10mm;display:grid;grid-template-columns:1fr 1fr;gap:15mm}
.sign-box{border-top:0.5pt solid #000;padding-top:2mm;font-size:9pt}
@media print{@page{size:A4 portrait;margin:20mm}}
</style></head><body>
<p style="text-align:center;font-size:9pt">Федеральная служба государственной регистрации, кадастра и картографии<br>
Управление по Воронежской области</p>
<h2>АКТ О ПРИЁМКЕ ТОВАРОВ (РАБОТ, УСЛУГ)</h2>
<p style="text-align:center;font-size:9pt">Форма 0510452 · ${new Date().toLocaleDateString('ru-RU')}</p>
<table>
<tr><th colspan="2">Сведения о закупке</th></tr>
<tr><td width="40%">Регистрационный номер</td><td><b>${sel.registryNumber}</b></td></tr>
<tr><td>Предмет контракта</td><td>${sel.title}</td></tr>
<tr><td>Поставщик</td><td>${sel.supplierName ?? '—'} · ИНН ${sel.supplierInn ?? '—'}</td></tr>
<tr><td>Сумма контракта</td><td><b>${formatCurrency(sel.contractSum ?? sel.plannedSum)}</b></td></tr>
<tr><td>Срок поставки по договору</td><td>${(sel as any).deliveryDate ? formatDate((sel as any).deliveryDate) : '—'}</td></tr>
<tr><td>Адрес поставки</td><td>${(sel as any).deliveryAddress ?? 'г. Воронеж, ул. Средне-Московская, д. 14'}</td></tr>
<tr><td>Дата приёмки</td><td>${new Date().toLocaleDateString('ru-RU')}</td></tr>
</table>
<p><b>Основание:</b> ч.3 ст.94 44-ФЗ от 05.04.2013, условия контракта</p>
${sel.items && sel.items.length > 0 ? `
<table>
<tr><th>Наименование</th><th>Ед.</th><th style="text-align:right">Кол-во</th><th style="text-align:right">Цена, руб.</th><th style="text-align:right">Сумма, руб.</th><th>Соответствие</th></tr>
${sel.items.map(i => `<tr><td>${i.name}</td><td>${i.unit}</td><td style="text-align:right">${i.quantity}</td>
<td style="text-align:right">${i.unitPrice.toLocaleString('ru-RU')}</td>
<td style="text-align:right">${i.totalPrice.toLocaleString('ru-RU')}</td>
<td>✓ Соответствует ТЗ</td></tr>`).join('')}
</table>` : ''}
${selDocs.length > 0 ? `
<p><b>Документы поставщика:</b></p>
<table><tr><th>Наименование документа</th><th>Дата</th></tr>${docList}</table>` : ''}
${defects[selectedId ?? ''] ? `<p><b>Замечания:</b> ${defects[selectedId ?? '']}</p>` : '<p>Недостатки не выявлены. Товар (работы, услуги) соответствуют условиям контракта.</p>'}
<p><b>Решение:</b> ${accepted[sel.id] ? 'Принять. Акт подписан.' : rejected[sel.id] ? 'Отказать. Мотивированный отказ направлен поставщику.' : 'На рассмотрении.'}</p>
<p><b>Уполномоченные лица заказчика:</b></p>
<table>
<tr><th>ФИО</th><th>Должность</th><th>Подразделение</th><th style="text-align:center">Подпись</th></tr>
${respList}
</table>
<div class="sign-row">
<div class="sign-box">Поставщик передал:<br><br>_________________ / ${sel.supplierName ?? '—'} /</div>
<div class="sign-box">Заказчик принял:<br><br>_________________ / ${responsible[0]?.name ?? '—'} /</div>
</div>
</body></html>`;
    const w = window.open('', '_blank', 'width=900,height=750');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 700);
  };

  const statusLabel = (procId: string) => {
    if (accepted[procId]) return { label: 'Принято', cls: 'bg-green-50 text-green-700 border-green-300' };
    if (rejected[procId]) return { label: 'Отказ',   cls: 'bg-red-50 text-red-700 border-red-300' };
    return { label: 'На приёмке', cls: 'bg-yellow-50 text-yellow-700 border-yellow-300' };
  };

  return (
    <AppLayout>
      <div className="p-3 sm:p-4">
        <Breadcrumbs items={[{ label: 'Рабочий стол', href: '/dashboard' }, { label: 'Приёмка товаров' }]}/>

        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Приёмка товаров, работ и услуг</h1>
            <p className="text-xs text-gray-500">
              ч.3 ст.94 44-ФЗ · Экспертиза исполнения контракта · Срок до 20 рабочих дней
            </p>
          </div>
        </div>

        {/* Пояснение что такое приёмка */}
        <div className="gov-alert gov-alert-info mb-3 text-xs">
          <Package size={13} className="flex-shrink-0 mt-0.5"/>
          <div>
            <strong>Как работает приёмка по 44-ФЗ:</strong> поставщик привозит товар и передаёт
            накладную, счёт, акт, сертификаты. Уполномоченное лицо заказчика проверяет товар
            и подписывает документы. Загрузите сканы полученных документов, отметьте подпись
            ответственного — и передайте закупку на оплату. Если есть недостатки — фиксируйте их
            и отказывайте в приёмке с мотивированным отказом.
          </div>
        </div>

        {forAcceptance.length === 0 ? (
          <div className="gov-card p-12 text-center text-gray-400">
            <Package size={40} className="mx-auto mb-3 opacity-20"/>
            <p className="text-sm font-medium">Нет закупок на приёмке</p>
            <p className="text-xs mt-1">Переведите закупку на этап «Исполнение»</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

            {/* Список закупок */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                Ожидают приёмки ({forAcceptance.length})
              </div>
              {forAcceptance.map(p => {
                const st = statusLabel(p.id);
                const resp = getResponsible(p);
                const signedCount = (signed[p.id] ?? []).length;
                return (
                  <div key={p.id}
                    onClick={() => setSelectedId(p.id === selectedId ? null : p.id)}
                    className={`gov-card p-3 cursor-pointer hover:shadow transition-all ${selectedId === p.id ? 'border-blue-400 border-2' : ''}`}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono font-bold text-blue-600">{p.registryNumber}</div>
                        <div className="text-xs font-bold text-gray-800 mt-0.5 leading-snug line-clamp-2">{p.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{p.supplierName}</div>
                      </div>
                      <span className={`gov-badge flex-shrink-0 ${st.cls}`}>{st.label}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">
                        {(p as any).deliveryDate ? formatDate((p as any).deliveryDate) : formatDate(p.plannedEndDate)}
                      </span>
                      <span className={`font-bold ${signedCount >= resp.length ? 'text-green-600' : 'text-gray-400'}`}>
                        ✍ {signedCount}/{resp.length}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Детали */}
            <div className="lg:col-span-2">
              {sel ? (
                <div className="space-y-3">

                  {/* Данные о поставке */}
                  <div className="gov-card overflow-hidden">
                    <div className="gov-section-title flex items-center justify-between">
                      <span>📦 Приёмка · {sel.registryNumber}</span>
                      <button onClick={printAct} className="gov-btn gov-btn-ghost gov-btn-sm">
                        <Printer size={12}/> Акт приёмки
                      </button>
                    </div>
                    <div className="p-4">
                      {/* Таблица параметров как в ЕАТ */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 border border-gray-200 rounded-lg overflow-hidden mb-4">
                        {[
                          { label: 'Поставщик',       value: sel.supplierName ?? '—' },
                          { label: 'ИНН',              value: sel.supplierInn ?? '—' },
                          { label: 'Сумма контракта',  value: formatCurrency(sel.contractSum ?? sel.plannedSum) },
                          { label: 'Дата контракта',   value: sel.contractDate ? formatDate(sel.contractDate) : '—' },
                          { label: 'Срок поставки',    value: (sel as any).deliveryDate ? formatDate((sel as any).deliveryDate) : '—' },
                          { label: 'Дней на приёмку',  value: `${(sel as any).acceptanceDays ?? 5} р.д. (ч.13 ст.94)` },
                          { label: 'Адрес поставки',   value: (sel as any).deliveryAddress ?? 'г. Воронеж, Средне-Московская, 14' },
                          { label: 'Порядок поставки', value: (sel as any).deliveryConditions ?? 'Единовременная поставка' },
                        ].map((item, i) => (
                          <div key={i} className={`p-2.5 border-b border-r border-gray-100 ${i % 4 === 3 ? 'border-r-0' : ''} ${i >= 4 ? 'border-b-0' : ''}`}>
                            <div className="text-xs text-gray-400 mb-0.5">{item.label}</div>
                            <div className="text-xs font-bold text-gray-800">{item.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Позиции если есть */}
                      {sel.items && sel.items.length > 0 && (
                        <div className="mb-4">
                          <div className="text-xs font-bold text-gray-700 mb-1.5">Позиции поставки:</div>
                          <table className="gov-table">
                            <thead>
                              <tr><th>Наименование</th><th>Ед.</th><th className="text-right">Кол-во</th><th className="text-right">Цена</th><th className="text-right">Сумма</th><th>Соответствие ТЗ</th></tr>
                            </thead>
                            <tbody>
                              {sel.items.map(item => (
                                <tr key={item.id}>
                                  <td className="text-xs">{item.name}</td>
                                  <td className="text-xs">{item.unit}</td>
                                  <td className="text-xs text-right">{item.quantity}</td>
                                  <td className="text-xs text-right">{formatCurrency(item.unitPrice)}</td>
                                  <td className="text-xs font-bold text-right">{formatCurrency(item.totalPrice)}</td>
                                  <td>
                                    {!rejected[sel.id]
                                      ? <span className="gov-badge bg-green-50 text-green-700 border-green-200">✓ Соответствует</span>
                                      : <span className="gov-badge bg-red-50 text-red-600 border-red-200">✗ Недостатки</span>
                                    }
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Замечания */}
                      <div className="mb-3">
                        <div className="text-xs font-bold text-gray-700 mb-1.5">Замечания и недостатки:</div>
                        <textarea
                          className="gov-input text-xs resize-none"
                          rows={2}
                          placeholder="Укажите недостатки если есть: несоответствие ТЗ, недостача, повреждения, отсутствие документов..."
                          value={defects[selectedId ?? ''] ?? ''}
                          onChange={e => setDefects(prev => ({ ...prev, [selectedId!]: e.target.value }))}
                          disabled={accepted[sel.id] || rejected[sel.id]}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Документы поставщика */}
                  <div className="gov-card overflow-hidden">
                    <div className="gov-section-title">📄 Документы поставщика (сканы)</div>
                    <div className="p-3">
                      <p className="text-xs text-gray-500 mb-3">
                        Загрузите сканы полученных от поставщика документов: накладная (ТОРГ-12 или УПД),
                        счёт-фактура, акт выполненных работ, сертификаты качества, паспорта изделий.
                      </p>

                      {selDocs.length > 0 && (
                        <div className="space-y-1 mb-3">
                          {selDocs.map(doc => (
                            <div key={doc.id} className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded">
                              <FileText size={13} className="text-blue-500 flex-shrink-0"/>
                              <span className="text-xs flex-1 truncate font-medium">{doc.name}</span>
                              {doc.size && <span className="text-xs text-gray-400">{doc.size}</span>}
                              <span className="text-xs text-gray-400">{doc.date}</span>
                              <span className="gov-badge bg-green-50 text-green-700 border-green-200 text-xs">Загружен</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <input ref={fileRef} type="file" multiple className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.tiff,.docx,.xlsx"
                        onChange={handleUpload}/>
                      <button
                        onClick={() => fileRef.current?.click()}
                        disabled={accepted[sel.id] || rejected[sel.id]}
                        className="gov-btn gov-btn-secondary gov-btn-sm disabled:opacity-40">
                        <Upload size={12}/> Загрузить скан документа
                      </button>
                      <span className="text-xs text-gray-400 ml-2">PDF, JPG, PNG, TIFF, DOCX</span>
                    </div>
                  </div>

                  {/* Уполномоченные лица */}
                  <div className="gov-card overflow-hidden">
                    <div className="gov-section-title">
                      ✍ Уполномоченные лица на приёмку
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-gray-500 mb-3">
                        Состав определяется приказом о разделении обязанностей.
                        Для данного типа закупки («{sel.title.slice(0, 40)}…»):
                      </p>
                      <div className="space-y-2 mb-3">
                        {responsible.map(r => {
                          const isSigned = selSigned.includes(r.name);
                          return (
                            <div key={r.name}
                              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isSigned ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isSigned ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                  {isSigned ? '✓' : r.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div>
                                  <div className="text-xs font-bold">{r.name}</div>
                                  <div className="text-xs text-gray-500">{r.position} · {r.dept}</div>
                                </div>
                              </div>
                              {!accepted[sel.id] && !rejected[sel.id] ? (
                                <button
                                  onClick={() => toggleSign(sel.id, r.name)}
                                  className={`gov-btn gov-btn-sm ${isSigned ? 'gov-btn-ghost text-red-500' : 'gov-btn-secondary'}`}>
                                  {isSigned ? 'Отозвать' : '✍ Подписать'}
                                </button>
                              ) : (
                                <span className={`text-xs font-bold ${isSigned ? 'text-green-600' : 'text-gray-400'}`}>
                                  {isSigned ? '✓ Подписал' : 'Не подписал'}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {!accepted[sel.id] && !rejected[sel.id] && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => acceptDelivery(sel.id)}
                            disabled={!allSigned || selDocs.length === 0}
                            title={!allSigned ? 'Требуется подпись всех уполномоченных лиц' : selDocs.length === 0 ? 'Загрузите хотя бы один документ поставщика' : ''}
                            className="flex-1 gov-btn gov-btn-success gov-btn-sm justify-center disabled:opacity-40">
                            <CheckCircle size={13}/> Товар принят — подписать акт
                          </button>
                          <button
                            onClick={() => rejectDelivery(sel.id)}
                            className="gov-btn gov-btn-danger gov-btn-sm">
                            <XCircle size={13}/> Мотивированный отказ
                          </button>
                        </div>
                      )}
                      {(!allSigned || selDocs.length === 0) && !accepted[sel.id] && !rejected[sel.id] && (
                        <p className="text-xs text-gray-400 mt-1.5">
                          {!allSigned && '⚠ Нужна подпись всех уполномоченных лиц. '}
                          {selDocs.length === 0 && '⚠ Загрузите скан накладной или акта от поставщика.'}
                        </p>
                      )}
                    </div>

                    {accepted[sel.id] && (
                      <div className="p-3 bg-green-50 border-t border-green-200">
                        <div className="flex items-start gap-2 mb-3">
                          <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5"/>
                          <div>
                            <div className="text-xs font-bold text-green-700">
                              Товар принят {new Date().toLocaleDateString('ru-RU')}
                            </div>
                            <div className="text-xs text-green-600 mt-0.5">
                              Акт подписан. Документы поставщика загружены. Передайте в бухгалтерию для оплаты.
                            </div>
                          </div>
                        </div>
                        <button onClick={() => moveToPayment(sel.id)}
                          className="gov-btn gov-btn-primary gov-btn-sm w-full justify-center">
                          → Перевести на этап «Оплата»
                        </button>
                      </div>
                    )}

                    {rejected[sel.id] && (
                      <div className="p-3 bg-red-50 border-t border-red-200">
                        <div className="flex items-start gap-2">
                          <XCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5"/>
                          <div>
                            <div className="text-xs font-bold text-red-700">Мотивированный отказ — {new Date().toLocaleDateString('ru-RU')}</div>
                            {defects[sel.id] && (
                              <div className="text-xs text-red-600 mt-0.5">Основание: {defects[sel.id]}</div>
                            )}
                            <div className="text-xs text-red-500 mt-1">
                              Поставщику {sel.supplierName} направлено уведомление. Срок устранения: 10 р.д.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Link href={`/zakupki/${sel.id}`} className="gov-btn gov-btn-ghost gov-btn-sm w-full justify-center">
                    → Открыть карточку закупки
                  </Link>
                </div>
              ) : (
                <div className="gov-card p-12 text-center text-gray-400">
                  <Package size={40} className="mx-auto mb-3 opacity-20"/>
                  <p className="text-sm">Выберите закупку для приёмки</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
