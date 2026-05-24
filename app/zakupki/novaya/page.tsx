'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { Plus, Trash2, Save, Send, CheckCircle } from 'lucide-react';
import { useAppStore } from '@/store/index';
import type { Procurement, ProcurementItem } from '@/types';
import { buildWorkflow, PROCEDURE_LABELS, PROCEDURE_DESCRIPTIONS } from '@/mock/data/procurements';

interface FormItem { id: number; name: string; unit: string; qty: number; price: number; }

export default function NovayaZakupkaPage() {
  const router = useRouter();
  const { addProcurement } = useAppStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [procType, setProcType] = useState<'goods'|'works'|'services'>('goods');
  const [priority, setPriority] = useState<'low'|'normal'|'high'|'urgent'>('normal');
  const [dept, setDept] = useState('d1');
  const [deptName, setDeptName] = useState('Отдел МТО');
  const [procedure, setProcedure] = useState<string>('eat_kotировки');
  const [method, setMethod] = useState('ЕАТ «Берёзка»');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [kbk, setKbk] = useState('321 0113 4590100002 244');
  const [kosgu, setKosgu] = useState('244');
  const [items, setItems] = useState<FormItem[]>([{ id:1, name:'', unit:'шт.', qty:1, price:0 }]);
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const addItem = () => setItems(p => [...p, { id:Date.now(), name:'', unit:'шт.', qty:1, price:0 }]);
  const removeItem = (id: number) => setItems(p => p.filter(i => i.id !== id));
  const updateItem = (id: number, field: keyof FormItem, value: string | number) =>
    setItems(p => p.map(i => i.id === id ? { ...i, [field]: value } : i));

  const totalSum = items.reduce((s,i) => s + i.qty * i.price, 0);

  const validate = () => {
    const e: string[] = [];
    if (!title.trim()) e.push('Введите наименование закупки');
    if (!startDate) e.push('Укажите дату начала');
    if (!endDate) e.push('Укажите дату окончания');
    if (items.every(i => !i.name.trim())) e.push('Добавьте хотя бы одну позицию');
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (e.length > 0) { setErrors(e); return; }
    setErrors([]);
    setSaved(true);
  };

  const handleSubmit = () => {
    const e = validate();
    if (e.length > 0) { setErrors(e); return; }
    setErrors([]);

    const id = `p-${Date.now()}`;
    const num = `РЗ-2026-${String(Math.floor(Math.random()*900+100)).padStart(5,'0')}`;

    const procItems: ProcurementItem[] = items
      .filter(i => i.name.trim())
      .map((i,idx) => ({
        id: `item-${idx}`,
        name: i.name,
        unit: i.unit,
        quantity: i.qty,
        unitPrice: i.price,
        totalPrice: i.qty * i.price,
      }));

    const newProc: Procurement = {
      id,
      registryNumber: num,
      title: title.trim(),
      description: description.trim(),
      status: 'draft',
      riskLevel: 'low',
      departmentId: dept,
      departmentName: deptName,
      initiatorId: 'u1',
      initiatorName: 'Петров А.В.',
      responsibleId: 'u1',
      responsibleName: 'Петров А.В.',
      plannedSum: totalSum,
      paidSum: 0,
      budgetCode: '051',
      kbk,
      kosgu,
      financingSource: 'Федеральный бюджет',
      procurementType: procType,
      items: procItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      plannedStartDate: startDate,
      plannedEndDate: endDate,
      documentIds: [],
      tags: [method],
      priority,
      isOverdue: false,
      procedure: procedure,
      workflowSteps: buildWorkflow(procedure).map((s, i) => ({
        id: `ws-${id}-${i}`,
        procurementId: id,
        status: s.status as import('@/types').ProcurementStatus,
        name: s.name,
        description: s.description,
        order: s.order,
        responsible: s.responsible,
        requiredDocuments: s.requiredDocuments,
        isCompleted: false,
        isActive: s.order === 1,
      })),
    };

    addProcurement(newProc);
    setSubmitted(true);
    setTimeout(() => router.push(`/zakupki/${id}`), 1500);
  };

  const DEPTS = [
    {id:'d1',name:'Отдел МТО'},{id:'d4',name:'ИТ-отдел'},
    {id:'d5',name:'АХО'},{id:'d3',name:'Бухгалтерия'},{id:'d6',name:'Юротдел'},
  ];

  if (submitted) {
    return (
      <AppLayout>
        <div className="p-4 flex items-center justify-center min-h-64">
          <div className="text-center">
            <CheckCircle size={48} className="mx-auto mb-3 text-green-500"/>
            <h2 className="text-base font-bold text-gray-800 mb-1">Закупка создана!</h2>
            <p className="text-xs text-gray-500">Переходим в карточку закупки...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-3 sm:p-4">
        <Breadcrumbs items={[
          {label:'Рабочий стол',href:'/dashboard'},
          {label:'Реестр закупок',href:'/zakupki'},
          {label:'Создать закупку'},
        ]}/>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-base font-bold">Создание новой закупки</h1>
          <div className="flex gap-2">
            <button onClick={() => router.back()} className="gov-btn gov-btn-ghost gov-btn-sm">Отмена</button>
            <button onClick={handleSave} className="gov-btn gov-btn-ghost gov-btn-sm"><Save size={12}/> Черновик</button>
            <button onClick={handleSubmit} className="gov-btn gov-btn-primary gov-btn-sm"><Send size={12}/> На согласование</button>
          </div>
        </div>

        {saved && !submitted && (
          <div className="gov-alert gov-alert-success mb-3 text-xs"><span>✓</span><span>Черновик сохранён в реестре.</span></div>
        )}
        {errors.length > 0 && (
          <div className="gov-alert gov-alert-danger mb-3">
            <span>⚠</span>
            <div className="text-xs">{errors.map((e,i)=><div key={i}>• {e}</div>)}</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">

            {/* Основные сведения */}
            <div className="gov-card">
              <div className="gov-section-title">1. Основные сведения</div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="gov-label">Наименование закупки *</label>
                  <input className={`gov-input ${errors.some(e=>e.includes('наименование'))?'border-red-400':''}`}
                    placeholder="Введите наименование предмета закупки..." value={title} onChange={e=>setTitle(e.target.value)}/>
                </div>
                <div>
                  <label className="gov-label">Описание / обоснование потребности</label>
                  <textarea className="gov-input min-h-16 resize-none" placeholder="Опишите потребность..." value={description} onChange={e=>setDescription(e.target.value)}/>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="gov-label">Тип закупки *</label>
                    <select className="gov-select" value={procType} onChange={e=>setProcType(e.target.value as 'goods'|'works'|'services')}>
                      <option value="goods">Товары</option>
                      <option value="works">Работы</option>
                      <option value="services">Услуги</option>
                    </select>
                  </div>
                  <div>
                    <label className="gov-label">Приоритет</label>
                    <select className="gov-select" value={priority} onChange={e=>setPriority(e.target.value as 'low'|'normal'|'high'|'urgent')}>
                      <option value="low">Низкий</option>
                      <option value="normal">Обычный</option>
                      <option value="high">Высокий</option>
                      <option value="urgent">Срочный</option>
                    </select>
                  </div>
                  <div>
                    <label className="gov-label">Подразделение *</label>
                    <select className="gov-select" value={dept} onChange={e=>{setDept(e.target.value);setDeptName(DEPTS.find(d=>d.id===e.target.value)?.name??'');}}>
                      {DEPTS.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="gov-label">Способ закупки и площадка *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {([
                        { key:'eat_kotировки', icon:'🟢', short:'ЕАТ «Берёзка»', sub:'Запрос котировок в электронной форме. Поставщики подают ценовые предложения, побеждает наименьшая цена. Без публикации в ЕИС.' },
                        { key:'eis_auction',   icon:'🔵', short:'ЕИС + Сбер-АСТ', sub:'Сначала извещение на ЕИС, затем электронный аукцион на Сбер-АСТ. Торги на понижение в реальном времени.' },
                        { key:'eis_konkurs',   icon:'🟡', short:'ЕИС — конкурс', sub:'Конкурсная документация на ЕИС. Победитель по совокупности критериев: цена и квалификация.' },
                        { key:'single',        icon:'⚪', short:'Единственный поставщик', sub:'Без конкурентных процедур. Обоснование по ст. 93 44-ФЗ. Уведомление/отчёт в ЕИС.' },
                      ] as const).map(p => (
                        <button key={p.key} type="button"
                          onClick={() => { setProcedure(p.key); setMethod(p.short); }}
                          className={`text-left p-3 border rounded-lg transition-all ${procedure === p.key ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base">{p.icon}</span>
                            <span className={`text-xs font-bold ${procedure === p.key ? 'text-blue-700' : 'text-gray-800'}`}>{p.short}</span>
                            {procedure === p.key && <span className="ml-auto text-xs text-blue-600 font-bold">✓ Выбрано</span>}
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed">{p.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Позиции */}
            <div className="gov-card">
              <div className="gov-section-title flex items-center justify-between">
                <span>2. Позиции закупки</span>
                <button onClick={addItem} className="gov-btn gov-btn-ghost gov-btn-sm normal-case font-normal"><Plus size={11}/> Добавить</button>
              </div>
              <div className="p-3 overflow-x-auto">
                <table className="gov-table">
                  <thead><tr><th>№</th><th>Наименование *</th><th>Ед.изм.</th><th>Кол-во</th><th>Цена, руб.</th><th className="text-right">Сумма</th><th className="w-8"></th></tr></thead>
                  <tbody>
                    {items.map((item,idx) => (
                      <tr key={item.id}>
                        <td className="text-xs text-gray-400 text-center">{idx+1}</td>
                        <td><input className="gov-input" placeholder="Наименование..." value={item.name} onChange={e=>updateItem(item.id,'name',e.target.value)}/></td>
                        <td><select className="gov-select w-20" value={item.unit} onChange={e=>updateItem(item.id,'unit',e.target.value)}><option>шт.</option><option>уп.</option><option>мес.</option><option>усл.</option><option>лиц.</option><option>кг</option><option>м²</option></select></td>
                        <td><input type="number" className="gov-input w-16" value={item.qty} min={1} onChange={e=>updateItem(item.id,'qty',Number(e.target.value))}/></td>
                        <td><input type="number" className="gov-input w-28" value={item.price} min={0} onChange={e=>updateItem(item.id,'price',Number(e.target.value))}/></td>
                        <td className="text-xs font-bold text-right text-blue-700 whitespace-nowrap">{(item.qty*item.price).toLocaleString('ru-RU')} ₽</td>
                        <td>{items.length>1&&<button onClick={()=>removeItem(item.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={12}/></button>}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td colSpan={5} className="text-xs font-bold text-right">ИТОГО (плановая стоимость):</td>
                      <td className="text-sm font-bold text-blue-800 text-right whitespace-nowrap">{totalSum.toLocaleString('ru-RU')} ₽</td>
                      <td/>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Финансирование и сроки */}
            <div className="gov-card">
              <div className="gov-section-title">3. Финансирование и сроки</div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="gov-label">Плановая дата начала *</label>
                  <input type="date" className={`gov-input ${errors.some(e=>e.includes('начала'))?'border-red-400':''}`} value={startDate} onChange={e=>setStartDate(e.target.value)}/>
                </div>
                <div>
                  <label className="gov-label">Плановая дата окончания *</label>
                  <input type="date" className={`gov-input ${errors.some(e=>e.includes('окончания'))?'border-red-400':''}`} value={endDate} onChange={e=>setEndDate(e.target.value)}/>
                </div>
                <div>
                  <label className="gov-label">КБК *</label>
                  <input className="gov-input font-mono" value={kbk} onChange={e=>setKbk(e.target.value)} placeholder="321 0113 4590100002 244"/>
                </div>
                <div>
                  <label className="gov-label">КОСГУ *</label>
                  <select className="gov-select" value={kosgu} onChange={e=>setKosgu(e.target.value)}>
                    <option value="244">244 — Прочая закупка</option>
                    <option value="310">310 — Нефинансовые активы</option>
                    <option value="226">226 — Прочие работы/услуги</option>
                    <option value="225">225 — Содержание имущества</option>
                    <option value="340">340 — Материальные запасы</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Правая панель */}
          <div className="space-y-3">
            <div className="gov-card p-3">
              <div className="text-xs font-bold text-gray-700 mb-2">📋 Чек-лист</div>
              <div className="space-y-1.5">
                {[
                  {label:'Наименование', done:!!title.trim()},
                  {label:'Подразделение', done:!!dept},
                  {label:'Позиции добавлены', done:items.some(i=>!!i.name.trim())},
                  {label:'Сумма указана', done:totalSum>0},
                  {label:'Сроки установлены', done:!!startDate&&!!endDate},
                  {label:'КБК/КОСГУ указаны', done:!!kbk.trim()},
                  {label:'Способ закупки выбран', done:!!procedure},
                ].map(ch=>(
                  <div key={ch.label} className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${ch.done?'bg-green-500 text-white':'bg-gray-200 text-gray-400'}`}>
                      {ch.done?'✓':'○'}
                    </span>
                    <span className={`text-xs ${ch.done?'text-green-700 font-bold':'text-gray-500'}`}>{ch.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Документы по процедуре */}
            <div className="gov-card p-3">
              <div className="text-xs font-bold text-gray-700 mb-2">
                📄 Документы для {{
                  'eat_kotировки': 'ЕАТ «Берёзка»',
                  'eis_auction': 'ЕИС + Сбер-АСТ',
                  'eis_konkurs': 'ЕИС Конкурс',
                  'single': 'Единственного поставщика',
                }[procedure] ?? procedure}
              </div>
              <div className="space-y-1">
                {(procedure === 'eis_auction' ? [
                  {doc:'Включение в план-график ЕИС', required:true},
                  {doc:'ТЗ (без брендов, с рос. ценами)', required:true},
                  {doc:'Обоснование НМЦК (≥2 метода)', required:true},
                  {doc:'Проект контракта', required:true},
                  {doc:'Требования к участникам (ст.43)', required:true},
                  {doc:'Размер обеспечения заявки (0,5–5%)', required:true},
                ] : procedure === 'eat_kotировки' ? [
                  {doc:'Техническое задание', required:true},
                  {doc:'3 коммерческих предложения', required:true},
                  {doc:'Обоснование НМЦК', required:true},
                  {doc:'Проект договора', required:true},
                ] : procedure === 'single' ? [
                  {doc:'Обоснование по ст. 93 44-ФЗ', required:true},
                  {doc:'Расчёт цены договора', required:true},
                  {doc:'Проект договора', required:true},
                ] : [
                  {doc:'Техническое задание', required:true},
                  {doc:'Обоснование НМЦК', required:true},
                  {doc:'Проект контракта', required:true},
                ]).map((item, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="text-blue-400 flex-shrink-0 mt-0.5">📌</span>
                    <span className="text-xs text-gray-600">{item.doc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="gov-card p-3">
              <div className="text-xs font-bold text-gray-700 mb-1">💰 Итоговая сумма</div>
              <div className="text-2xl font-bold text-blue-700">{totalSum.toLocaleString('ru-RU')} ₽</div>
              <div className="text-xs text-gray-400 mt-0.5">Плановая стоимость закупки</div>
            </div>

            <div className="gov-card p-3">
              <div className="text-xs font-bold text-gray-700 mb-2">📐 Шаблоны документов</div>
              <div className="space-y-1">
                {['Служебная записка','Техническое задание','Обоснование НМЦК','Проект договора'].map(t=>(
                  <button key={t} className="w-full text-left text-xs py-1.5 px-2 text-blue-600 hover:bg-blue-50 rounded border border-transparent hover:border-blue-200 transition-colors">
                    📄 {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="gov-card p-3">
              <div className="text-xs font-bold text-gray-700 mb-2">📎 Прикрепить документы</div>
              <div className="border-2 border-dashed border-gray-200 rounded p-3 text-center cursor-pointer hover:border-blue-300 transition-colors">
                <div className="text-xl mb-1">📄</div>
                <div className="text-xs text-gray-400">Перетащите файлы<br/>или нажмите для выбора</div>
              </div>
              <div className="text-xs text-gray-400 mt-1 text-center">PDF, DOCX, XLSX — до 50 МБ</div>
            </div>

            <div className="flex gap-2">
              <button onClick={handleSave} className="gov-btn gov-btn-ghost gov-btn-sm flex-1 justify-center">
                <Save size={12}/> Черновик
              </button>
              <button onClick={handleSubmit} className="gov-btn gov-btn-primary gov-btn-sm flex-1 justify-center">
                <Send size={12}/> Отправить
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
