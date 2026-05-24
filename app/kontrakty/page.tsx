'use client';

import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs, StatusBadge } from '@/components/ui/index';
import { useAppStore } from '@/store/index';
import { formatCurrency, formatDate } from '@/lib/utils';
import { FileText, TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// Договор существует только если закупка дошла до подписания
const CONTRACT_STATUSES = ['contract_signed','execution','payment','eis_reporting','archive'];

export default function KontraktyPage() {
  const { procurements } = useAppStore();
  const [sf, setSf] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string|null>(null);

  // Договоры = закупки с подписанным договором — берём из store в реальном времени
  const contracts = useMemo(() =>
    procurements
      .filter(p => CONTRACT_STATUSES.includes(p.status) && p.contractSum)
      .sort((a,b) => (b.contractDate ?? b.createdAt).localeCompare(a.contractDate ?? a.createdAt)),
    [procurements]
  );

  const filtered = useMemo(() => contracts.filter(p => {
    const okS  = !search || p.title.toLowerCase().includes(search.toLowerCase())
                         || p.registryNumber.includes(search)
                         || (p.supplierName ?? '').toLowerCase().includes(search.toLowerCase());
    const okSt = sf === 'all' || p.status === sf;
    return okS && okSt;
  }), [contracts, search, sf]);

  const sel = contracts.find(p => p.id === selected);

  const totalSum     = contracts.reduce((s,p) => s+(p.contractSum??0), 0);
  const totalPaid    = contracts.reduce((s,p) => s+(p.paidSum??0), 0);
  const totalEconomy = contracts.reduce((s,p) => s+(p.plannedSum-(p.contractSum??p.plannedSum)), 0);
  const inExecution  = contracts.filter(p => p.status === 'execution').length;

  const ST_LABELS: Record<string,string> = {
    contract_signed:'Договор подписан', execution:'Исполнение',
    payment:'Оплата', eis_reporting:'Отчётность ЕИС', archive:'Архив',
  };

  return (
    <AppLayout>
      <div className="p-3 sm:p-4">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Договоры'}]}/>

        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Реестр договоров</h1>
            <p className="text-xs text-gray-500">
              Автоматически формируется из закупок где подписан договор
            </p>
          </div>
        </div>

        {/* Подсказка */}
        <div className="gov-alert gov-alert-info mb-3 text-xs">
          <FileText size={13} className="flex-shrink-0 mt-0.5"/>
          <span>
            Договор появляется здесь автоматически когда закупка переходит на этап
            «Договор подписан (ЭЦП)». Создайте новую закупку и проведите её до подписания —
            она появится в этом реестре.
          </span>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          {[
            {icon:<FileText size={16}/>, label:'Договоров', val:contracts.length, cls:'text-blue-700'},
            {icon:<TrendingUp size={16}/>, label:'Исполняется', val:inExecution, cls:'text-yellow-700'},
            {icon:<CheckCircle size={16}/>, label:'Сумма договоров', val:formatCurrency(totalSum), cls:'text-gray-800'},
            {icon:<TrendingUp size={16}/>, label:'Экономия', val:formatCurrency(totalEconomy), cls:'text-green-700'},
          ].map(s=>(
            <div key={s.label} className="gov-card p-3">
              <div className={`text-lg font-bold ${s.cls}`}>{s.val}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Список */}
          <div className="lg:col-span-2 space-y-2">
            <div className="gov-card p-2 flex gap-2 flex-wrap">
              <input className="gov-input flex-1 text-xs min-w-32"
                placeholder="Поиск по названию, номеру, поставщику..."
                value={search} onChange={e=>setSearch(e.target.value)}/>
              {['all',...Object.keys(ST_LABELS)].map(s=>(
                <button key={s} onClick={()=>setSf(s)}
                  className={`gov-btn gov-btn-sm ${sf===s?'gov-btn-primary':'gov-btn-ghost'}`}>
                  {s==='all'?'Все':ST_LABELS[s]}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="gov-card p-8 text-center text-gray-400">
                <FileText size={32} className="mx-auto mb-2 opacity-20"/>
                <p className="text-sm font-medium">Договоров нет</p>
                <p className="text-xs mt-1">
                  {contracts.length === 0
                    ? 'Создайте закупку и доведите её до этапа «Договор подписан»'
                    : 'Нет договоров по выбранному фильтру'}
                </p>
              </div>
            ) : (
              filtered.map(p=>(
                <div key={p.id}
                  onClick={()=>setSelected(p.id===selected?null:p.id)}
                  className={`gov-card p-3 cursor-pointer hover:shadow transition-all ${selected===p.id?'border-blue-400 border-2':''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-mono font-bold text-blue-600">{p.registryNumber}</span>
                        <StatusBadge status={p.status}/>
                        {p.isOverdue && (
                          <span className="gov-badge bg-red-50 text-red-700 border-red-300 flex items-center gap-1">
                            <AlertTriangle size={10}/> Просрочка
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-gray-800 mb-0.5">{p.title}</div>
                      <div className="text-xs text-gray-500">
                        {p.supplierName} · ИНН {p.supplierInn}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Договор от {formatDate(p.contractDate??'')} · до {formatDate(p.contractEndDate??'')}
                        · Отв.: {p.responsibleName}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-blue-700">{formatCurrency(p.contractSum??0)}</div>
                      {p.paidSum ? (
                        <div className="text-xs text-green-600">Оплачено: {formatCurrency(p.paidSum)}</div>
                      ) : (
                        <div className="text-xs text-gray-400">Не оплачен</div>
                      )}
                    </div>
                  </div>

                  {/* Прогресс оплаты */}
                  {p.contractSum && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                        <span>Оплата</span>
                        <span>{p.paidSum ? Math.round(p.paidSum/p.contractSum*100) : 0}%</span>
                      </div>
                      <div className="gov-progress">
                        <div className="gov-progress-bar"
                          style={{width:`${p.paidSum ? Math.round(p.paidSum/p.contractSum*100) : 0}%`,
                            background: p.paidSum===p.contractSum ? '#16a34a' : '#2563eb'}}/>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Детали */}
          <div className="sticky top-4 space-y-3">
            {sel ? (
              <div className="gov-card overflow-hidden">
                <div className="gov-section-title">📄 Детали договора</div>
                <div className="p-3 space-y-2.5">
                  <div>
                    <div className="gov-label">Предмет договора</div>
                    <div className="text-xs font-bold text-gray-800">{sel.title}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><div className="gov-label">Поставщик</div><div className="text-xs font-bold">{sel.supplierName}</div></div>
                    <div><div className="gov-label">ИНН</div><div className="text-xs font-mono">{sel.supplierInn}</div></div>
                    <div><div className="gov-label">Дата договора</div><div className="text-xs font-bold">{formatDate(sel.contractDate??'')}</div></div>
                    <div><div className="gov-label">Срок исполнения</div><div className="text-xs font-bold">{formatDate(sel.contractEndDate??'')}</div></div>
                    <div><div className="gov-label">Сумма договора</div><div className="text-xs font-bold text-blue-700">{formatCurrency(sel.contractSum??0)}</div></div>
                    <div><div className="gov-label">Оплачено</div><div className={`text-xs font-bold ${sel.paidSum?'text-green-700':'text-gray-400'}`}>{formatCurrency(sel.paidSum??0)}</div></div>
                    <div><div className="gov-label">Плановая НМЦК</div><div className="text-xs">{formatCurrency(sel.plannedSum)}</div></div>
                    <div><div className="gov-label">Экономия</div><div className="text-xs font-bold text-green-600">{formatCurrency(sel.plannedSum-(sel.contractSum??sel.plannedSum))}</div></div>
                  </div>
                  <div><div className="gov-label">КБК</div><div className="text-xs font-mono text-gray-600">{sel.kbk}</div></div>
                  <div><div className="gov-label">Статус</div><StatusBadge status={sel.status}/></div>
                  <Link href={`/zakupki/${sel.id}`}
                    className="gov-btn gov-btn-primary gov-btn-sm w-full justify-center">
                    → Открыть карточку закупки
                  </Link>
                </div>
              </div>
            ) : (
              <div className="gov-card p-6 text-center text-gray-400">
                <FileText size={28} className="mx-auto mb-2 opacity-20"/>
                <p className="text-xs">Выберите договор для деталей</p>
              </div>
            )}

            {/* Как попадают договоры */}
            <div className="gov-card overflow-hidden">
              <div className="gov-section-title">ℹ️ Как работает реестр</div>
              <div className="p-3 space-y-2 text-xs text-gray-600">
                {[
                  {step:'1', text:'Закупка создана → появляется в реестре закупок'},
                  {step:'2', text:'Торги завершены → победитель определён'},
                  {step:'3', text:'Согласования пройдены → договор подписан ЭЦП'},
                  {step:'✓', text:'Договор автоматически появляется здесь', green:true},
                  {step:'4', text:'Исполнение → прогресс в реестре обновляется'},
                  {step:'5', text:'Оплата → 100% в прогресс-баре'},
                ].map(s=>(
                  <div key={s.step} className={`flex items-start gap-2 ${s.green?'text-green-700 font-bold':''}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${s.green?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>{s.step}</span>
                    <span>{s.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
