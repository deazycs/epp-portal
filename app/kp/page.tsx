'use client';

import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { useAppStore } from '@/store/index';
import { formatCurrency } from '@/lib/utils';
import { Plus, Trash2, TrendingDown, CheckCircle, FileText, Download } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface KPItem { name: string; unit: string; qty: number; }
interface KP { id: string; supplier: string; inn: string; date: string; items: { price: number }[]; total: number; file?: string; }

// Начальные КП для демо
const DEMO_ITEMS: KPItem[] = [
  { name: 'Картридж HP LaserJet CF217A', unit: 'шт.', qty: 28 },
  { name: 'Картридж Canon 725',           unit: 'шт.', qty: 20 },
  { name: 'Тонер Samsung MLT-D111S',      unit: 'шт.', qty: 14 },
  { name: 'Картридж Epson C13T66414A',    unit: 'шт.', qty: 12 },
];

const DEMO_KPS: KP[] = [
  { id:'kp1', supplier:'ООО «ТехноОфис»',   inn:'7701234567', date:'2026-04-05', items:[{price:1850},{price:1200},{price:890},{price:1100}], total:156400, file:'КП_ТехноОфис_05042026.pdf' },
  { id:'kp2', supplier:'ООО «КанцМастер»',  inn:'7702345678', date:'2026-04-06', items:[{price:1950},{price:1250},{price:920},{price:1150}], total:164200, file:'КП_КанцМастер_06042026.pdf' },
  { id:'kp3', supplier:'ИП Соколов Р.И.',   inn:'770312345678',date:'2026-04-06', items:[{price:1920},{price:1230},{price:910},{price:1120}], total:161500, file:'КП_Соколов_06042026.pdf' },
];

export default function KPPage() {
  const { procurements } = useAppStore();
  const [selectedProcId, setSelectedProcId] = useState('p001');
  const [items]     = useState<KPItem[]>(DEMO_ITEMS);
  const [kps, setKps] = useState<KP[]>(DEMO_KPS);
  const [newKP, setNewKP]   = useState<{supplier:string;inn:string;date:string;prices:string[]}>({
    supplier:'', inn:'', date:'', prices: items.map(()=>''),
  });
  const [showAdd, setShowAdd] = useState(false);
  const fileRef = useState<HTMLInputElement|null>(null);

  // Выбираем закупки на этапе подготовки (где нужны КП)
  const prepProcs = procurements.filter(p =>
    ['preparation','financing','sz_approval','draft'].includes(p.status)
  );

  const selProc = procurements.find(p => p.id === selectedProcId);

  // Рассчитываем НМЦК — среднеарифметическое из КП
  const nmck = useMemo(() => {
    if (kps.length === 0) return 0;
    return Math.round(kps.reduce((s, k) => s + k.total, 0) / kps.length);
  }, [kps]);

  const minKP = kps.reduce((m, k) => k.total < m.total ? k : m, kps[0]);
  const economy = minKP ? nmck - minKP.total : 0;
  const economyPct = nmck > 0 ? (economy / nmck * 100) : 0;

  const addKP = () => {
    const prices = newKP.prices.map(Number);
    const total = items.reduce((s, item, i) => s + item.qty * (prices[i]||0), 0);
    const kp: KP = {
      id: `kp-${Date.now()}`,
      supplier: newKP.supplier,
      inn: newKP.inn,
      date: newKP.date,
      items: prices.map(p => ({ price: p })),
      total,
    };
    setKps(prev => [...prev, kp]);
    setNewKP({ supplier:'', inn:'', date:'', prices: items.map(()=>'') });
    setShowAdd(false);
  };

  const removeKP = (id: string) => setKps(prev => prev.filter(k => k.id !== id));

  const exportCSV = () => {
    const header = ['Поставщик','ИНН','Дата КП',...items.map(i=>i.name),'ИТОГО'].join(';');
    const rows = kps.map(k =>
      [k.supplier, k.inn, k.date, ...k.items.map(it=>it.price), k.total].join(';')
    );
    const csv = '\uFEFF' + [header,...rows, `НМЦК (среднее);;;${items.map(()=>'').join(';')};${nmck}`].join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Сравнение_КП.csv';
    a.click();
  };

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 fade-in">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Сравнение коммерческих предложений'}]}/>

        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Сравнение коммерческих предложений</h1>
            <p className="text-xs text-gray-500">Метод анализа рынка · Расчёт НМЦК · Приказ Минэкономразвития №567</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportCSV} className="gov-btn gov-btn-ghost gov-btn-sm"><Download size={12}/> CSV</button>
            <button onClick={()=>setShowAdd(s=>!s)} className="gov-btn gov-btn-primary gov-btn-sm"><Plus size={12}/> Добавить КП</button>
          </div>
        </div>

        <div className="gov-alert gov-alert-info mb-3 text-xs">
          <FileText size={13} className="flex-shrink-0 mt-0.5"/>
          <span>Для обоснования НМЦК методом анализа рынка необходимо не менее 3 коммерческих предложений. НМЦК рассчитывается как среднеарифметическое цен из полученных КП.</span>
        </div>

        {/* Выбор закупки */}
        <div className="gov-card p-3 mb-3">
          <label className="gov-label">Закупка</label>
          <select className="gov-select text-xs" value={selectedProcId} onChange={e=>setSelectedProcId(e.target.value)}>
            <option value="p001">РЗ-2026-00142 · Поставка картриджей для принтеров</option>
            {prepProcs.map(p => (
              <option key={p.id} value={p.id}>{p.registryNumber} · {p.title.slice(0,60)}</option>
            ))}
          </select>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {[
            { label:'КП получено',   val:`${kps.length} из 3`,              cls: kps.length>=3?'text-green-600':'text-orange-500' },
            { label:'НМЦК (ср. цена)', val:formatCurrency(nmck),              cls:'text-blue-700' },
            { label:'Минимальная цена', val:minKP?formatCurrency(minKP.total):'—', cls:'text-green-700' },
            { label:'Экономия',      val:`${formatCurrency(economy)} (${economyPct.toFixed(1)}%)`, cls:'text-green-700' },
          ].map(s=>(
            <div key={s.label} className="gov-card p-3">
              <div className={`text-lg font-bold leading-tight ${s.cls}`}>{s.val}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Форма добавления КП */}
        {showAdd && (
          <div className="gov-card p-4 mb-4 border-2 border-blue-300">
            <div className="text-xs font-bold text-blue-700 mb-3">+ Новое коммерческое предложение</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="gov-label">Поставщик *</label>
                <input className="gov-input text-xs" placeholder="Наименование организации"
                  value={newKP.supplier} onChange={e=>setNewKP(p=>({...p,supplier:e.target.value}))}/>
              </div>
              <div>
                <label className="gov-label">ИНН</label>
                <input className="gov-input text-xs font-mono" placeholder="7701234567"
                  value={newKP.inn} onChange={e=>setNewKP(p=>({...p,inn:e.target.value}))}/>
              </div>
              <div>
                <label className="gov-label">Дата КП *</label>
                <input type="date" className="gov-input text-xs"
                  value={newKP.date} onChange={e=>setNewKP(p=>({...p,date:e.target.value}))}/>
              </div>
            </div>
            <div className="text-xs font-bold text-gray-700 mb-2">Цены за единицу:</div>
            <div className="space-y-2 mb-3">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1 text-xs text-gray-700">{item.name} ({item.unit})</div>
                  <div className="text-xs text-gray-400 w-16 text-right">× {item.qty}</div>
                  <input type="number" className="gov-input text-xs w-28 text-right" placeholder="0.00"
                    value={newKP.prices[i]}
                    onChange={e=>{
                      const p=[...newKP.prices];
                      p[i]=e.target.value;
                      setNewKP(prev=>({...prev,prices:p}));
                    }}/>
                  <div className="text-xs font-bold text-blue-700 w-28 text-right">
                    = {formatCurrency(item.qty*(Number(newKP.prices[i])||0))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-blue-700">
                Итого: {formatCurrency(items.reduce((s,item,i)=>s+item.qty*(Number(newKP.prices[i])||0),0))}
              </div>
              <div className="flex gap-2">
                <button onClick={()=>setShowAdd(false)} className="gov-btn gov-btn-ghost gov-btn-sm">Отмена</button>
                <button onClick={addKP} disabled={!newKP.supplier||!newKP.date}
                  className="gov-btn gov-btn-primary gov-btn-sm disabled:opacity-40">Добавить КП</button>
              </div>
            </div>
          </div>
        )}

        {/* Сравнительная таблица */}
        <div className="gov-card overflow-hidden">
          <div className="gov-section-title">📊 Сравнительная таблица коммерческих предложений</div>
          <div className="overflow-x-auto">
            <table className="gov-table">
              <thead>
                <tr>
                  <th className="min-w-48">Наименование / Параметр</th>
                  <th className="text-center text-gray-400 text-xs">Кол-во</th>
                  {kps.map(k => (
                    <th key={k.id} className={`text-right ${k.id===minKP?.id?'text-green-700 bg-green-50':''}`}>
                      <div>{k.supplier}</div>
                      <div className="font-normal text-xs opacity-70">{k.date}</div>
                      {k.file && <div className="text-xs font-normal text-blue-500 truncate max-w-24">{k.file}</div>}
                    </th>
                  ))}
                  <th className="text-right text-blue-700">НМЦК</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td className="text-xs">{item.name}<div className="text-gray-400">{item.unit}</div></td>
                    <td className="text-xs text-center text-gray-500">{item.qty}</td>
                    {kps.map(k => {
                      const price = k.items[i]?.price ?? 0;
                      const allPrices = kps.map(kk => kk.items[i]?.price ?? 0);
                      const minP = Math.min(...allPrices);
                      return (
                        <td key={k.id} className={`text-right text-xs ${price===minP?'text-green-700 font-bold bg-green-50':''}`}>
                          <div>{formatCurrency(price)}</div>
                          <div className="text-gray-400">× {item.qty} = {formatCurrency(price*item.qty)}</div>
                        </td>
                      );
                    })}
                    <td className="text-right text-xs font-bold text-blue-700">
                      {formatCurrency(Math.round(kps.reduce((s,k)=>s+(k.items[i]?.price??0),0)/kps.length))}
                    </td>
                  </tr>
                ))}
                {/* Итоги */}
                <tr className="bg-gray-50 font-bold">
                  <td className="text-xs font-bold" colSpan={2}>ИТОГО</td>
                  {kps.map(k => (
                    <td key={k.id} className={`text-right text-sm ${k.id===minKP?.id?'text-green-700 bg-green-50':''}`}>
                      {formatCurrency(k.total)}
                      {k.id===minKP?.id && <div className="text-xs font-normal flex items-center justify-end gap-1 text-green-600"><TrendingDown size={10}/> Минимум</div>}
                    </td>
                  ))}
                  <td className="text-right text-sm font-bold text-blue-700">{formatCurrency(nmck)}</td>
                </tr>
                {/* Отклонение от НМЦК */}
                <tr className="bg-gray-50">
                  <td className="text-xs text-gray-500" colSpan={2}>Отклонение от НМЦК</td>
                  {kps.map(k => {
                    const diff = k.total - nmck;
                    return (
                      <td key={k.id} className={`text-right text-xs ${diff<0?'text-green-600':diff>0?'text-red-500':'text-gray-500'}`}>
                        {diff>0?'+':''}{formatCurrency(diff)} ({(diff/nmck*100).toFixed(1)}%)
                      </td>
                    );
                  })}
                  <td className="text-right text-xs text-gray-400">—</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Вывод */}
          <div className="p-4 border-t border-gray-100 bg-blue-50">
            <div className="flex items-start gap-3">
              <CheckCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5"/>
              <div className="text-xs">
                <div className="font-bold text-blue-800 mb-1">Заключение для обоснования НМЦК</div>
                <p className="text-blue-700 leading-relaxed">
                  По результатам анализа {kps.length} коммерческих предложений методом анализа рынка
                  (Приказ Минэкономразвития №567) НМЦК составляет <strong>{formatCurrency(nmck)}</strong>.
                  Минимальная цена предложена <strong>{minKP?.supplier}</strong> — {formatCurrency(minKP?.total??0)},
                  что на <strong>{economyPct.toFixed(1)}% ниже НМЦК</strong> ({formatCurrency(economy)}).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Удаление КП */}
        <div className="flex gap-2 mt-2 flex-wrap">
          {kps.map(k => (
            <button key={k.id} onClick={()=>removeKP(k.id)}
              className="gov-btn gov-btn-ghost gov-btn-sm text-red-500 hover:bg-red-50">
              <Trash2 size={11}/> {k.supplier}
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
