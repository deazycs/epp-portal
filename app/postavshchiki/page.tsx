'use client';

import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { useAppStore } from '@/store/index';
import { formatCurrency } from '@/lib/utils';
import { Star, Shield, AlertTriangle, TrendingUp, Package, CheckCircle as CheckIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function PostavshchikiPage() {
  const { procurements } = useAppStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string|null>(null);
  const [sortBy, setSortBy] = useState<'sum'|'count'|'rating'>('sum');

  // Собираем поставщиков из реального реестра закупок
  const suppliers = useMemo(() => {
    const map = new Map<string, {
      inn: string; name: string;
      procurements: typeof procurements;
      totalSum: number; totalContract: number; totalPaid: number;
      wonCount: number; completedCount: number; overdueCount: number;
    }>();


    procurements.forEach(p => {
      if (!p.supplierInn || !p.supplierName) return;
      const key = p.supplierInn;
      if (!map.has(key)) {
        map.set(key, {
          inn: p.supplierInn, name: p.supplierName,
          procurements: [], totalSum: 0, totalContract: 0, totalPaid: 0,
          wonCount: 0, completedCount: 0, overdueCount: 0,
        });
      }
      const s = map.get(key)!;
      s.procurements.push(p);
      s.totalSum += p.plannedSum;
      s.totalContract += p.contractSum ?? 0;
      s.totalPaid += p.paidSum ?? 0;
      s.wonCount += 1;
      if (p.status === 'archive') s.completedCount += 1;
      if (p.isOverdue) s.overdueCount += 1;
    });

    return Array.from(map.values()).map(s => {
      const economy = s.totalSum > 0 ? (s.totalSum - s.totalContract) / s.totalSum : 0;
      
      // Недобросовестный если: просрочки > 30% контрактов ИЛИ просрочек >= 2
      const overdueRate = s.wonCount > 0 ? s.overdueCount / s.wonCount : 0;
      const isUnreliable = s.overdueCount >= 2 || overdueRate > 0.3;
      
      // Добросовестный: нет просрочек И выполнил все контракты
      const isReliable = s.overdueCount === 0 && s.completedCount === s.wonCount && s.wonCount >= 1;
      
      // Новый: только появился в системе
      const isNew = s.wonCount === 1 && s.completedCount === 0;
      
      let status: 'reliable'|'unreliable'|'new'|'neutral' = 'neutral';
      if (isUnreliable) status = 'unreliable';
      else if (isNew) status = 'new';
      else if (isReliable) status = 'reliable';
      
      // Рейтинг 1-5
      let rating = 3.0
        + (s.completedCount * 0.4)
        - (s.overdueCount * 1.0)
        + (economy > 0.02 ? 0.3 : 0)
        + (s.wonCount >= 3 ? 0.3 : 0)
        + (isReliable ? 0.5 : 0);
      rating = Math.max(1, Math.min(5, rating));
      
      return { ...s, rating: Math.round(rating * 10) / 10, economy, status, isUnreliable, isReliable, isNew };
    });
  }, [procurements]);

  const filtered = useMemo(() => {
    let list = suppliers.filter(s =>
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.inn.includes(search)
    );
    if (sortBy === 'sum')    list = [...list].sort((a,b) => b.totalContract - a.totalContract);
    if (sortBy === 'count')  list = [...list].sort((a,b) => b.wonCount - a.wonCount);
    if (sortBy === 'rating') list = [...list].sort((a,b) => b.rating - a.rating);
    return list;
  }, [suppliers, search, sortBy]);

  const sel = suppliers.find(s => s.inn === selected);

  function StarRating({ val }: { val: number }) {
    return (
      <div className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(i => (
          <Star key={i} size={11}
            className={i <= Math.round(val) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}/>
        ))}
        <span className="text-xs font-bold text-gray-700 ml-1">{val.toFixed(1)}</span>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="p-3 sm:p-4">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Поставщики'}]}/>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Реестр поставщиков</h1>
            <p className="text-xs text-gray-500">
              Формируется автоматически из победителей торгов · Рейтинг рассчитывается по истории
            </p>
          </div>
        </div>

        <div className="gov-alert gov-alert-info mb-3 text-xs">
          <TrendingUp size={13} className="flex-shrink-0 mt-0.5"/>
          <div>
            <strong>Как появляется поставщик:</strong> автоматически когда закупка переходит на этап
            «Победитель определён» и у неё заполнено поле «Поставщик».{' '}
            <strong>Рейтинг</strong> = базовые 3 балла + 0.5 за каждый завершённый контракт
            − 0.7 за просрочку + 0.5 за экономию больше 2%.
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            {label:'Поставщиков', val:suppliers.length, cls:'text-blue-700'},
            {label:'Общая сумма', val:formatCurrency(suppliers.reduce((s,p)=>s+p.totalContract,0)), cls:'text-gray-800'},
            {label:'Средний рейтинг', val:(suppliers.reduce((s,p)=>s+p.rating,0)/Math.max(1,suppliers.length)).toFixed(1)+' / 5', cls:'text-yellow-600'},
          ].map(s=>(
            <div key={s.label} className="gov-card p-3 text-center">
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
                placeholder="Поиск по названию или ИНН..."
                value={search} onChange={e=>setSearch(e.target.value)}/>
              <div className="flex gap-1">
                {([['sum','По сумме'],['count','По кол-ву'],['rating','По рейтингу']] as const).map(([k,l])=>(
                  <button key={k} onClick={()=>setSortBy(k)}
                    className={`gov-btn gov-btn-sm ${sortBy===k?'gov-btn-primary':'gov-btn-ghost'}`}>{l}</button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="gov-card p-8 text-center text-gray-400">
                <Package size={32} className="mx-auto mb-2 opacity-20"/>
                <p className="text-sm">Поставщиков нет</p>
                <p className="text-xs mt-1">
                  Они появятся автоматически когда закупки дойдут до этапа «Победитель определён»
                </p>
              </div>
            ) : (
              filtered.map(s => (
                <div key={s.inn}
                  onClick={()=>setSelected(s.inn===selected?null:s.inn)}
                  className={`gov-card p-3 cursor-pointer hover:shadow transition-all ${selected===s.inn?'border-blue-400 border-2':''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-bold text-gray-800">{s.name}</span>
                        {s.status === 'reliable' && (
                          <span className="gov-badge bg-green-50 text-green-700 border-green-300 flex items-center gap-1">
                            <Shield size={9}/> Добросовестный
                          </span>
                        )}
                        {s.status === 'unreliable' && (
                          <span className="gov-badge bg-red-50 text-red-700 border-red-300 flex items-center gap-1">
                            <AlertTriangle size={9}/> Риск просрочек
                          </span>
                        )}
                        {s.status === 'new' && (
                          <span className="gov-badge bg-blue-50 text-blue-600 border-blue-200">
                            Новый
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mb-1.5">ИНН {s.inn}</div>
                      <StarRating val={s.rating}/>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-blue-700">{formatCurrency(s.totalContract)}</div>
                      <div className="text-xs text-gray-400">{s.wonCount} контр.</div>
                      <div className="text-xs text-green-600">
                        Выполнено: {s.completedCount}/{s.wonCount}
                      </div>
                    </div>
                  </div>

                  {/* Рейтинг-бар */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-12">Рейтинг</span>
                    <div className="gov-progress flex-1">
                      <div className="gov-progress-bar"
                        style={{
                          width:`${s.rating/5*100}%`,
                          background: s.rating>=4?'#16a34a':s.rating>=3?'#2563eb':'#dc2626'
                        }}/>
                    </div>
                    <span className="text-xs font-bold text-gray-600">{s.rating}/5</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Детали */}
          <div className="sticky top-4 space-y-3">
            {sel ? (
              <div className="gov-card overflow-hidden">
                <div className="gov-section-title">🏢 {sel.name}</div>
                <div className="p-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div><div className="gov-label">ИНН</div><div className="text-xs font-mono">{sel.inn}</div></div>
                    <div><div className="gov-label">Контрактов</div><div className="text-xs font-bold">{sel.wonCount}</div></div>
                    <div><div className="gov-label">Завершено</div><div className="text-xs font-bold text-green-700">{sel.completedCount}</div></div>
                    <div><div className="gov-label">Просрочки</div><div className={`text-xs font-bold ${sel.overdueCount>0?'text-red-600':'text-green-700'}`}>{sel.overdueCount}</div></div>
                    <div><div className="gov-label">Сумма</div><div className="text-xs font-bold text-blue-700">{formatCurrency(sel.totalContract)}</div></div>
                    <div><div className="gov-label">Оплачено</div><div className="text-xs font-bold">{formatCurrency(sel.totalPaid)}</div></div>
                  </div>

                  <div>
                    <div className="gov-label mb-1">Рейтинг</div>
                    <StarRating val={sel.rating}/>
                    <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                      <div className="flex justify-between">
                        <span>База</span><span>3.0</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>+ завершённые контракты ({sel.completedCount}×0.5)</span>
                        <span>+{(sel.completedCount*0.5).toFixed(1)}</span>
                      </div>
                      {sel.overdueCount>0 && (
                        <div className="flex justify-between text-red-600">
                          <span>− просрочки ({sel.overdueCount}×0.7)</span>
                          <span>−{(sel.overdueCount*0.7).toFixed(1)}</span>
                        </div>
                      )}
                      {sel.economy>0.02 && (
                        <div className="flex justify-between text-green-600">
                          <span>+ экономия &gt;2%</span><span>+0.5</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold border-t pt-0.5 mt-1">
                        <span>Итого</span><span>{sel.rating}/5</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="gov-label mb-1">Закупки с этим поставщиком</div>
                    <div className="space-y-1">
                      {sel.procurements.map(p=>(
                        <a key={p.id} href={`/zakupki/${p.id}`}
                          className="flex items-center justify-between p-1.5 rounded hover:bg-gray-50 transition-colors text-xs">
                          <div>
                            <div className="font-mono text-blue-600">{p.registryNumber}</div>
                            <div className="text-gray-500 truncate max-w-32">{p.title.slice(0,35)}…</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{formatCurrency(p.contractSum??0)}</div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="gov-card p-6 text-center text-gray-400">
                <Package size={28} className="mx-auto mb-2 opacity-20"/>
                <p className="text-xs">Выберите поставщика</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
