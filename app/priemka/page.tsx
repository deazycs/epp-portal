'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { useAppStore } from '@/store/index';
import { formatDate, formatCurrency } from '@/lib/utils';
import { CheckCircle, XCircle, Clock, AlertTriangle, Users, FileText, Plus, Printer } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const COMMISSION_MEMBERS = [
  { id:'m1', role:'Председатель', name:'Смирнова Н.С.', position:'Начальник отдела МТО' },
  { id:'m2', role:'Член комиссии', name:'Петров А.В.',   position:'Ведущий специалист МТО' },
  { id:'m3', role:'Член комиссии', name:'Козлов Д.М.',   position:'Контрактный управляющий' },
];

export default function PriemkaPage() {
  const { procurements } = useAppStore();

  // Закупки на приёмке — этап «Исполнение» с поставщиком
  const forAcceptance = procurements.filter(p =>
    ['execution','payment'].includes(p.status) && p.supplierName
  );

  const [selectedId, setSelectedId] = useState<string|null>(
    forAcceptance[0]?.id ?? null
  );
  const [signatures, setSignatures] = useState<Record<string,string[]>>({});
  const [defects, setDefects]       = useState<Record<string,string[]>>({});
  const [remarks, setRemarks]       = useState<Record<string,string>>({});
  const [accepted, setAccepted]     = useState<Record<string,boolean>>({});
  const [rejected, setRejected]     = useState<Record<string,boolean>>({});
  const [defectInput, setDefectInput] = useState('');
  const [remarkInput, setRemarkInput] = useState('');

  const sel = procurements.find(p => p.id === selectedId);

  const sign = (procId: string, memberId: string) => {
    setSignatures(prev => {
      const cur = prev[procId] ?? [];
      return {
        ...prev,
        [procId]: cur.includes(memberId)
          ? cur.filter(x => x !== memberId)
          : [...cur, memberId],
      };
    });
  };

  const isSigned   = (procId: string, memberId: string) => (signatures[procId] ?? []).includes(memberId);
  const allSigned  = (procId: string) => COMMISSION_MEMBERS.every(m => isSigned(procId, m.id));
  const procDefects = (procId: string) => defects[procId] ?? [];
  const procRemark  = (procId: string) => remarks[procId] ?? '';

  const addDefect = (procId: string) => {
    if (!defectInput.trim()) return;
    setDefects(prev => ({ ...prev, [procId]: [...(prev[procId]??[]), defectInput.trim()] }));
    setDefectInput('');
  };

  const accept = (procId: string) => {
    setAccepted(prev => ({ ...prev, [procId]: true }));
    setRejected(prev => ({ ...prev, [procId]: false }));
  };

  const reject = (procId: string) => {
    setRejected(prev => ({ ...prev, [procId]: true }));
    setAccepted(prev => ({ ...prev, [procId]: false }));
  };

  const printAct = (p: typeof sel) => {
    if (!p) return;
    const sigs = (signatures[p.id] ?? []);
    const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"/>
<title>Акт приёмки ${p.registryNumber}</title>
<style>
body{font-family:Arial,sans-serif;font-size:10pt;padding:15mm}
h2{text-align:center;font-size:13pt}
h3{font-size:11pt}
table{width:100%;border-collapse:collapse;margin-bottom:5mm}
th,td{border:0.5pt solid #999;padding:2mm;font-size:9pt}
th{background:#f0f5ff;font-weight:bold}
.sign-row{display:grid;grid-template-columns:repeat(3,1fr);gap:10mm;margin-top:10mm}
.sign-box{border-top:0.5pt solid #000;padding-top:2mm;font-size:8pt}
@media print{@page{size:A4;margin:15mm}}
</style></head><body>
<p style="text-align:center;font-size:9pt">Росреестр · Управление по Воронежской области · Отдел МТО</p>
<h2>АКТ ПРИЁМКИ ТОВАРОВ (РАБОТ, УСЛУГ)</h2>
<p style="text-align:center">Форма 0510452 · ${new Date().toLocaleDateString('ru-RU')}</p>
<table><tr><th>Реквизит</th><th>Значение</th></tr>
<tr><td>Закупка</td><td>${p.registryNumber}</td></tr>
<tr><td>Предмет</td><td>${p.title}</td></tr>
<tr><td>Поставщик</td><td>${p.supplierName ?? '—'} · ИНН ${p.supplierInn ?? '—'}</td></tr>
<tr><td>Сумма договора</td><td>${formatCurrency(p.contractSum ?? p.plannedSum)}</td></tr>
<tr><td>Срок поставки</td><td>${(p as any).deliveryDate ? formatDate((p as any).deliveryDate) : '—'}</td></tr>
<tr><td>Срок приёмки</td><td>${(p as any).acceptanceDays ?? 5} рабочих дней</td></tr>
<tr><td>Адрес поставки</td><td>${(p as any).deliveryAddress ?? 'г. Воронеж, ул. Средне-Московская, д. 14'}</td></tr>
</table>
<h3>Заключение комиссии</h3>
<table><tr><th>Наименование</th><th>Ед.</th><th>Кол-во</th><th>Цена ед., руб.</th><th>Сумма, руб.</th><th>Соответствие</th></tr>
${(p.items??[]).map(i=>`<tr><td>${i.name}</td><td>${i.unit}</td><td>${i.quantity}</td><td>${i.unitPrice.toLocaleString('ru-RU')}</td><td>${i.totalPrice.toLocaleString('ru-RU')}</td><td style="color:green">✓ Соответствует</td></tr>`).join('')}
</table>
${(procDefects(p.id).length > 0) ? `<p><b>Выявленные недостатки:</b> ${procDefects(p.id).join('; ')}</p>` : '<p>Недостатков не выявлено.</p>'}
${procRemark(p.id) ? `<p><b>Примечание:</b> ${procRemark(p.id)}</p>` : ''}
<p style="margin-top:5mm"><b>Решение комиссии:</b> ${accepted[p.id] ? '✅ Товар принят. Акт подписан.' : rejected[p.id] ? '❌ Отказ в приёмке.' : 'На рассмотрении.'}</p>
<div class="sign-row">
${COMMISSION_MEMBERS.map(m=>`<div class="sign-box"><div>${m.role}</div><div style="margin:5mm 0">________________</div><div>${m.name}</div></div>`).join('')}
</div>
</body></html>`;
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 600);
  };

  const STATUS_LABEL = (procId: string) => {
    if (accepted[procId]) return { label:'Принято', cls:'bg-green-50 text-green-700 border-green-300', icon:<CheckCircle size={11}/> };
    if (rejected[procId]) return { label:'Отказ', cls:'bg-red-50 text-red-700 border-red-300', icon:<XCircle size={11}/> };
    return { label:'Ожидает', cls:'bg-yellow-50 text-yellow-700 border-yellow-300', icon:<Clock size={11}/> };
  };

  return (
    <AppLayout>
      <div className="p-3 sm:p-4">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Приёмочная комиссия'}]}/>

        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Приёмочная комиссия</h1>
            <p className="text-xs text-gray-500">Актирование поставок · Форма 0510452 · ч.13 ст.94 44-ФЗ (до 20 р.д.)</p>
          </div>
        </div>

        <div className="gov-alert gov-alert-info mb-3 text-xs">
          <Users size={13} className="flex-shrink-0 mt-0.5"/>
          <span>Приёмочная комиссия формируется автоматически из закупок на этапе «Исполнение». Каждый член подписывает акт. При недостатках — фиксируется замечание и выдаётся отказ.</span>
        </div>

        {forAcceptance.length === 0 ? (
          <div className="gov-card p-12 text-center text-gray-400">
            <Users size={40} className="mx-auto mb-3 opacity-20"/>
            <p className="text-sm font-medium">Нет закупок на приёмке</p>
            <p className="text-xs mt-1">Появятся когда закупка перейдёт на этап «Исполнение»</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Список */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide px-1 mb-2">Объекты приёмки</div>
              {forAcceptance.map(p => {
                const st = STATUS_LABEL(p.id);
                const signed = (signatures[p.id]??[]).length;
                return (
                  <div key={p.id}
                    onClick={()=>setSelectedId(p.id===selectedId?null:p.id)}
                    className={`gov-card p-3 cursor-pointer hover:shadow transition-all ${selectedId===p.id?'border-blue-400 border-2':''}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono font-bold text-blue-600">{p.registryNumber}</div>
                        <div className="text-xs font-bold text-gray-800 mt-0.5 leading-snug line-clamp-2">{p.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{p.supplierName}</div>
                      </div>
                      <span className={`gov-badge flex items-center gap-1 flex-shrink-0 ${st.cls}`}>{st.icon} {st.label}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1.5">
                      <span className="text-gray-400">Срок: {(p as any).deliveryDate ? formatDate((p as any).deliveryDate) : formatDate(p.plannedEndDate)}</span>
                      <span className={`font-bold ${signed===COMMISSION_MEMBERS.length?'text-green-600':'text-gray-400'}`}>
                        {signed}/{COMMISSION_MEMBERS.length} подписей
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
                      <span>📋 Акт приёмки · {sel.registryNumber}</span>
                      <button onClick={()=>printAct(sel)} className="gov-btn gov-btn-ghost gov-btn-sm">
                        <Printer size={12}/> Распечатать акт
                      </button>
                    </div>
                    <div className="p-4">
                      {/* Условия поставки в стиле ЕАТ Берёзка */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 mb-4 border border-gray-200 rounded-lg overflow-hidden">
                        {[
                          { label:'Поставщик', value: sel.supplierName ?? '—' },
                          { label:'ИНН', value: sel.supplierInn ?? '—' },
                          { label:'Сумма договора', value: formatCurrency(sel.contractSum ?? sel.plannedSum) },
                          { label:'Договор от', value: sel.contractDate ? formatDate(sel.contractDate) : '—' },
                          { label:'Срок поставки', value: (sel as any).deliveryDate ? formatDate((sel as any).deliveryDate) : '—' },
                          { label:'Дней на поставку', value: `${(sel as any).deliveryDays ?? 30} р.д.` },
                          { label:'Срок приёмки', value: `${(sel as any).acceptanceDays ?? 5} р.д.` },
                          { label:'Адрес поставки', value: (sel as any).deliveryAddress ?? 'г. Воронеж, ул. Средне-Московская, д. 14' },
                        ].map((item, i) => (
                          <div key={i} className={`p-2.5 border-b border-r border-gray-100 ${i%4===3?'border-r-0':''} ${i>=4?'border-b-0':''}`}>
                            <div className="text-xs text-gray-400 mb-0.5">{item.label}</div>
                            <div className="text-xs font-bold text-gray-800">{item.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Позиции */}
                      {sel.items && sel.items.length > 0 && (
                        <div className="mb-4">
                          <div className="text-xs font-bold text-gray-700 mb-1.5">Позиции поставки:</div>
                          <table className="gov-table">
                            <thead><tr><th>Наименование</th><th>Ед.</th><th className="text-right">Кол-во</th><th className="text-right">Цена</th><th className="text-right">Сумма</th><th>Качество</th></tr></thead>
                            <tbody>
                              {sel.items.map(item => (
                                <tr key={item.id}>
                                  <td className="text-xs">{item.name}</td>
                                  <td className="text-xs">{item.unit}</td>
                                  <td className="text-xs text-right">{item.quantity}</td>
                                  <td className="text-xs text-right">{formatCurrency(item.unitPrice)}</td>
                                  <td className="text-xs font-bold text-right">{formatCurrency(item.totalPrice)}</td>
                                  <td><span className="gov-badge bg-green-50 text-green-700 border-green-200 text-xs">✓ Соответствует</span></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Недостатки и примечания */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                            <AlertTriangle size={11} className="text-orange-500"/> Выявленные недостатки
                          </div>
                          {procDefects(sel.id).map((d,i) => (
                            <div key={i} className="text-xs p-1.5 bg-red-50 border border-red-200 rounded mb-1">{d}</div>
                          ))}
                          {procDefects(sel.id).length === 0 && (
                            <p className="text-xs text-gray-400 mb-2">Не выявлено</p>
                          )}
                          {!accepted[sel.id] && !rejected[sel.id] && (
                            <div className="flex gap-1">
                              <input className="gov-input flex-1 text-xs" placeholder="Описание недостатка..."
                                value={defectInput} onChange={e=>setDefectInput(e.target.value)}
                                onKeyDown={e=>e.key==='Enter'&&addDefect(sel.id)}/>
                              <button onClick={()=>addDefect(sel.id)} className="gov-btn gov-btn-ghost gov-btn-sm"><Plus size={12}/></button>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-700 mb-1.5">Примечание комиссии</div>
                          {procRemark(sel.id) ? (
                            <div className="text-xs p-2 bg-gray-50 border border-gray-200 rounded mb-2">{procRemark(sel.id)}</div>
                          ) : <p className="text-xs text-gray-400 mb-2">Нет</p>}
                          {!accepted[sel.id] && !rejected[sel.id] && (
                            <div className="flex gap-1">
                              <input className="gov-input flex-1 text-xs" placeholder="Примечание..."
                                value={remarkInput} onChange={e=>setRemarkInput(e.target.value)}
                                onKeyDown={e=>{ if(e.key==='Enter'){ setRemarks(prev=>({...prev,[sel.id]:remarkInput})); setRemarkInput(''); }}}/>
                              <button onClick={()=>{ setRemarks(prev=>({...prev,[sel.id]:remarkInput})); setRemarkInput(''); }}
                                className="gov-btn gov-btn-ghost gov-btn-sm"><Plus size={12}/></button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Состав комиссии */}
                  <div className="gov-card overflow-hidden">
                    <div className="gov-section-title">👥 Состав приёмочной комиссии</div>
                    <div className="p-3 space-y-2">
                      {COMMISSION_MEMBERS.map(m => {
                        const signed = isSigned(sel.id, m.id);
                        return (
                          <div key={m.id} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${signed?'bg-green-50 border-green-200':'bg-white border-gray-200'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${signed?'bg-green-500 text-white':'bg-gray-100 text-gray-500'}`}>
                                {signed ? '✓' : m.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-gray-800">{m.name}</div>
                                <div className="text-xs text-gray-500">{m.role} · {m.position}</div>
                              </div>
                            </div>
                            {!accepted[sel.id] && !rejected[sel.id] ? (
                              <button onClick={()=>sign(sel.id, m.id)}
                                className={`gov-btn gov-btn-sm ${signed?'gov-btn-ghost text-red-500':'gov-btn-secondary'}`}>
                                {signed ? 'Отозвать' : 'Подписать'}
                              </button>
                            ) : (
                              <span className={`text-xs font-bold ${signed?'text-green-600':'text-gray-400'}`}>
                                {signed ? '✓ Подписано' : 'Не подписано'}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Итоговые кнопки */}
                    {!accepted[sel.id] && !rejected[sel.id] && (
                      <div className="p-3 border-t border-gray-100 flex gap-2">
                        <button onClick={()=>accept(sel.id)}
                          disabled={!allSigned(sel.id)}
                          className="flex-1 gov-btn gov-btn-success gov-btn-sm justify-center disabled:opacity-40"
                          title={!allSigned(sel.id)?'Все члены комиссии должны подписать':''}>
                          <CheckCircle size={13}/> Принять товар — подписать акт
                        </button>
                        <button onClick={()=>reject(sel.id)}
                          className="gov-btn gov-btn-danger gov-btn-sm">
                          <XCircle size={13}/> Отказ
                        </button>
                      </div>
                    )}

                    {accepted[sel.id] && (
                      <div className="p-3 bg-green-50 border-t border-green-200 flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-600"/>
                        <div>
                          <div className="text-xs font-bold text-green-700">Товар принят {new Date().toLocaleDateString('ru-RU')}</div>
                          <div className="text-xs text-green-600">Акт приёмки подписан всеми членами комиссии. Документы переданы в бухгалтерию.</div>
                        </div>
                      </div>
                    )}

                    {rejected[sel.id] && (
                      <div className="p-3 bg-red-50 border-t border-red-200">
                        <div className="flex items-start gap-2">
                          <XCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5"/>
                          <div>
                            <div className="text-xs font-bold text-red-700">Отказ в приёмке — {new Date().toLocaleDateString('ru-RU')}</div>
                            <div className="text-xs text-red-600 mt-0.5">Поставщику {sel.supplierName} направлено уведомление об устранении недостатков в течение 10 рабочих дней.</div>
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
                  <FileText size={40} className="mx-auto mb-3 opacity-20"/>
                  <p className="text-sm">Выберите объект приёмки</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
