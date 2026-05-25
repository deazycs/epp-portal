'use client';

import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { formatCurrency } from '@/lib/utils';
import { Plus, Trash2, AlertTriangle, CheckCircle, Download, Info } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PriceSource {
  id: string;
  supplier: string;
  inn: string;
  date: string;
  price: number;
  source: 'kp' | 'eis' | 'catalog' | 'other';
  comment: string;
}

const SOURCE_LABELS: Record<string, string> = {
  kp:      'Коммерческое предложение',
  eis:     'Реестр контрактов ЕИС',
  catalog: 'Прайс-лист / каталог',
  other:   'Иной источник',
};

export default function NmckPage() {
  const [objectName, setObjectName] = useState('Поставка картриджей для принтеров и МФУ');
  const [unit, setUnit]             = useState('шт.');
  const [qty, setQty]               = useState('74');
  const [method, setMethod]         = useState<'market'|'normative'|'tariff'>('market');

  const [sources, setSources] = useState<PriceSource[]>([
    { id:'s1', supplier:'ООО «ТехноОфис»',  inn:'7701234567', date:'2026-04-05', price:2114,  source:'kp',  comment:'Запрос КП исх. №МТО-123' },
    { id:'s2', supplier:'ООО «КанцМастер»', inn:'7702345678', date:'2026-04-06', price:2219,  source:'kp',  comment:'Запрос КП исх. №МТО-123' },
    { id:'s3', supplier:'ИП Соколов Р.И.',  inn:'770312345678',date:'2026-04-06',price:2182,  source:'kp',  comment:'Запрос КП исх. №МТО-123' },
  ]);

  const [newSrc, setNewSrc] = useState<Partial<PriceSource>>({ source: 'kp' });
  const [showAdd, setShowAdd] = useState(false);

  // Расчёт по Приказу №567 п.3.21
  const calc = useMemo(() => {
    if (sources.length < 3) return null;
    const prices = sources.map(s => s.price);
    const n = prices.length;

    // Средняя цена единицы
    const avg = prices.reduce((s, p) => s + p, 0) / n;

    // Среднеквадратичное отклонение
    const variance = prices.reduce((s, p) => s + Math.pow(p - avg, 2), 0) / n;
    const stddev = Math.sqrt(variance);

    // Коэффициент вариации (п.3.20.2 Приказа №567)
    const cv = (stddev / avg) * 100;

    // НМЦК = avg * qty
    const nmck = avg * Number(qty);

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    return { avg, stddev, cv, nmck, min, max, n };
  }, [sources, qty]);

  const addSource = () => {
    if (!newSrc.supplier || !newSrc.price || !newSrc.date) return;
    const s: PriceSource = {
      id: `s-${Date.now()}`,
      supplier: newSrc.supplier ?? '',
      inn: newSrc.inn ?? '',
      date: newSrc.date ?? '',
      price: Number(newSrc.price),
      source: (newSrc.source as 'kp') ?? 'kp',
      comment: newSrc.comment ?? '',
    };
    setSources(prev => [...prev, s]);
    setNewSrc({ source: 'kp' });
    setShowAdd(false);
  };

  const removeSource = (id: string) => setSources(prev => prev.filter(s => s.id !== id));

  const exportCalc = () => {
    if (!calc) return;
    const lines = [
      `РАСЧЁТ НМЦК — ${objectName}`,
      `Дата: ${new Date().toLocaleDateString('ru-RU')}`,
      `Метод: анализа рынка (ст.22 44-ФЗ, Приказ Минэкономразвития №567)`,
      `Количество: ${qty} ${unit}`,
      '',
      'ЦЕНОВЫЕ ПРЕДЛОЖЕНИЯ:',
      ...sources.map((s, i) => `${i+1}. ${s.supplier} (ИНН ${s.inn}) — ${s.price.toLocaleString('ru-RU')} руб./ед. (${SOURCE_LABELS[s.source]}, ${s.date})`),
      '',
      `Средняя цена ед.: ${calc.avg.toFixed(2)} руб.`,
      `Коэффициент вариации: ${calc.cv.toFixed(2)}%${calc.cv > 33 ? ' ⚠ ПРЕВЫШАЕТ 33%' : ' ✓'}`,
      `НМЦК = ${calc.avg.toFixed(2)} × ${qty} = ${formatCurrency(calc.nmck)}`,
      '',
      `Вывод: НМЦК для закупки "${objectName}" составляет ${formatCurrency(calc.nmck)}.`,
      `Цены ${calc.cv <= 33 ? 'однородны (V ≤ 33%), расчёт корректен.' : 'неоднородны (V > 33%), рекомендуется запросить дополнительные КП.'}`,
    ];
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Расчёт НМЦК ${objectName.slice(0,30)}.txt`;
    a.click();
  };

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 fade-in">
        <Breadcrumbs items={[{ label: 'Рабочий стол', href: '/dashboard' }, { label: 'Калькулятор НМЦК' }]}/>

        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Калькулятор НМЦК</h1>
            <p className="text-xs text-gray-500">
              Метод анализа рынка · ст.22 44-ФЗ · Приказ Минэкономразвития №567 от 02.10.2013
            </p>
          </div>
          {calc && (
            <button onClick={exportCalc} className="gov-btn gov-btn-ghost gov-btn-sm">
              <Download size={12}/> Выгрузить расчёт
            </button>
          )}
        </div>

        <div className="gov-alert gov-alert-info mb-3 text-xs">
          <Info size={13} className="flex-shrink-0 mt-0.5"/>
          <span>
            <strong>Метод анализа рынка</strong> — приоритетный метод по ч.6 ст.22 44-ФЗ.
            Нужно минимум <strong>3 ценовых предложения</strong> от разных поставщиков
            (запрос направляется не менее чем 5 участникам рынка).
            Если коэффициент вариации &gt;33% — цены неоднородны, запросите дополнительные КП.
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Параметры расчёта */}
          <div className="space-y-3">
            <div className="gov-card overflow-hidden">
              <div className="gov-section-title">⚙️ Параметры закупки</div>
              <div className="p-3 space-y-2">
                <div>
                  <label className="gov-label">Объект закупки *</label>
                  <textarea className="gov-input text-xs resize-none" rows={2}
                    value={objectName} onChange={e => setObjectName(e.target.value)}/>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="gov-label">Количество *</label>
                    <input type="number" className="gov-input text-xs" value={qty}
                      onChange={e => setQty(e.target.value)} min="1"/>
                  </div>
                  <div>
                    <label className="gov-label">Ед. измерения</label>
                    <input className="gov-input text-xs" value={unit} onChange={e => setUnit(e.target.value)}/>
                  </div>
                </div>
                <div>
                  <label className="gov-label">Метод определения НМЦК</label>
                  <select className="gov-select text-xs" value={method}
                    onChange={e => setMethod(e.target.value as typeof method)}>
                    <option value="market">Метод сопоставимых рыночных цен (приоритетный)</option>
                    <option value="normative">Нормативный метод</option>
                    <option value="tariff">Тарифный метод</option>
                  </select>
                </div>
                {method !== 'market' && (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                    ⚠ Нормативный и тарифный методы применяются только при невозможности использования
                    метода анализа рынка. Обоснование необходимо.
                  </div>
                )}
              </div>
            </div>

            {/* Итог расчёта */}
            {calc && (
              <div className="gov-card overflow-hidden">
                <div className="gov-section-title">📊 Результат расчёта</div>
                <div className="p-3 space-y-2">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <div className="text-xs text-blue-600 mb-0.5">НМЦК</div>
                    <div className="text-2xl font-bold text-blue-700">{formatCurrency(calc.nmck)}</div>
                    <div className="text-xs text-blue-500 mt-0.5">= {calc.avg.toFixed(2)} × {qty} {unit}</div>
                  </div>

                  <div className="space-y-1 text-xs">
                    {[
                      { label: 'Источников', value: `${calc.n} КП` },
                      { label: 'Средняя цена/ед.', value: `${calc.avg.toFixed(2)} руб.` },
                      { label: 'Минимальная', value: `${calc.min.toLocaleString('ru-RU')} руб.` },
                      { label: 'Максимальная', value: `${calc.max.toLocaleString('ru-RU')} руб.` },
                      { label: 'Ср.кв. отклонение (σ)', value: `${calc.stddev.toFixed(2)}` },
                    ].map(r => (
                      <div key={r.label} className="flex justify-between border-b border-gray-100 pb-0.5">
                        <span className="text-gray-500">{r.label}</span>
                        <span className="font-bold">{r.value}</span>
                      </div>
                    ))}
                    {/* Коэффициент вариации */}
                    <div className={`flex justify-between items-center p-1.5 rounded ${calc.cv <= 33 ? 'bg-green-50' : 'bg-red-50'}`}>
                      <span className={calc.cv <= 33 ? 'text-green-700' : 'text-red-700'}>
                        Коэф. вариации (V)
                      </span>
                      <div className="flex items-center gap-1">
                        {calc.cv <= 33
                          ? <CheckCircle size={12} className="text-green-500"/>
                          : <AlertTriangle size={12} className="text-red-500"/>
                        }
                        <span className={`font-bold text-sm ${calc.cv <= 33 ? 'text-green-700' : 'text-red-700'}`}>
                          {calc.cv.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`p-2 rounded text-xs ${calc.cv <= 33 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {calc.cv <= 33
                      ? '✓ Цены однородны (V ≤ 33%). Расчёт НМЦК корректен.'
                      : '⚠ Цены неоднородны (V > 33%). Запросите дополнительные КП или обоснуйте отклонение.'}
                  </div>
                </div>
              </div>
            )}

            {sources.length < 3 && (
              <div className="gov-card p-3 border-2 border-orange-300 bg-orange-50">
                <div className="text-xs text-orange-700 font-bold mb-1">⚠ Недостаточно источников</div>
                <div className="text-xs text-orange-600">
                  Добавьте минимум {3 - sources.length} ещё {3 - sources.length === 1 ? 'источник' : 'источника'} для расчёта НМЦК.
                  По п.3.14 Приказа №567 нужно не менее 3 ценовых предложений.
                </div>
              </div>
            )}
          </div>

          {/* Таблица источников */}
          <div className="lg:col-span-2 space-y-3">
            <div className="gov-card overflow-hidden">
              <div className="gov-section-title flex items-center justify-between">
                <span>📋 Ценовые предложения ({sources.length})</span>
                <button onClick={() => setShowAdd(s => !s)}
                  className="gov-btn gov-btn-primary gov-btn-sm">
                  <Plus size={12}/> Добавить КП
                </button>
              </div>

              {/* Форма добавления */}
              {showAdd && (
                <div className="p-3 border-b border-gray-100 bg-blue-50">
                  <div className="text-xs font-bold text-blue-700 mb-2">+ Новый источник ценовой информации</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                    <div>
                      <label className="gov-label">Поставщик / Источник *</label>
                      <input className="gov-input text-xs" placeholder="Наименование"
                        value={newSrc.supplier ?? ''}
                        onChange={e => setNewSrc(p => ({ ...p, supplier: e.target.value }))}/>
                    </div>
                    <div>
                      <label className="gov-label">ИНН</label>
                      <input className="gov-input text-xs font-mono" placeholder="7700000000"
                        value={newSrc.inn ?? ''}
                        onChange={e => setNewSrc(p => ({ ...p, inn: e.target.value }))}/>
                    </div>
                    <div>
                      <label className="gov-label">Дата *</label>
                      <input type="date" className="gov-input text-xs"
                        value={newSrc.date ?? ''}
                        onChange={e => setNewSrc(p => ({ ...p, date: e.target.value }))}/>
                    </div>
                    <div>
                      <label className="gov-label">Цена за ед. (руб.) *</label>
                      <input type="number" className="gov-input text-xs" placeholder="0.00"
                        value={newSrc.price ?? ''}
                        onChange={e => setNewSrc(p => ({ ...p, price: Number(e.target.value) }))}/>
                    </div>
                    <div>
                      <label className="gov-label">Тип источника</label>
                      <select className="gov-select text-xs"
                        value={newSrc.source ?? 'kp'}
                        onChange={e => setNewSrc(p => ({ ...p, source: e.target.value as 'kp' }))}>
                        {Object.entries(SOURCE_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="gov-label">Исходящий номер запроса</label>
                      <input className="gov-input text-xs" placeholder="исх. №МТО-XXX"
                        value={newSrc.comment ?? ''}
                        onChange={e => setNewSrc(p => ({ ...p, comment: e.target.value }))}/>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addSource}
                      disabled={!newSrc.supplier || !newSrc.price || !newSrc.date}
                      className="gov-btn gov-btn-primary gov-btn-sm disabled:opacity-40">
                      Добавить
                    </button>
                    <button onClick={() => setShowAdd(false)} className="gov-btn gov-btn-ghost gov-btn-sm">
                      Отмена
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th>№</th>
                      <th>Поставщик / Источник</th>
                      <th>Тип</th>
                      <th>Дата</th>
                      <th className="text-right">Цена ед., руб.</th>
                      <th className="text-right">Сумма ({qty} {unit})</th>
                      <th>Примечание</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sources.map((s, i) => {
                      const isMin = calc && s.price === calc.min;
                      const isMax = calc && s.price === calc.max;
                      return (
                        <tr key={s.id} className={isMin ? 'bg-green-50' : ''}>
                          <td className="text-xs font-bold text-gray-400">{i + 1}</td>
                          <td>
                            <div className="text-xs font-bold">{s.supplier}</div>
                            {s.inn && <div className="text-xs font-mono text-gray-400">ИНН {s.inn}</div>}
                          </td>
                          <td className="text-xs text-gray-500">{SOURCE_LABELS[s.source]}</td>
                          <td className="text-xs text-gray-500">{s.date}</td>
                          <td className="text-right">
                            <div className={`text-xs font-bold ${isMin ? 'text-green-700' : isMax ? 'text-red-500' : ''}`}>
                              {s.price.toLocaleString('ru-RU')}
                              {isMin && <span className="ml-1 text-green-600">↓min</span>}
                              {isMax && <span className="ml-1 text-red-500">↑max</span>}
                            </div>
                          </td>
                          <td className="text-right text-xs font-bold text-blue-700">
                            {formatCurrency(s.price * Number(qty))}
                          </td>
                          <td className="text-xs text-gray-400">{s.comment}</td>
                          <td>
                            <button onClick={() => removeSource(s.id)}
                              className="text-red-400 hover:text-red-600 p-1">
                              <Trash2 size={12}/>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {calc && (
                    <tfoot>
                      <tr className="bg-blue-50 font-bold">
                        <td colSpan={4} className="text-xs text-blue-700">Среднеарифметическое (НМЦК/ед.)</td>
                        <td className="text-right text-xs font-bold text-blue-700">{calc.avg.toFixed(2)}</td>
                        <td className="text-right text-sm font-bold text-blue-700">{formatCurrency(calc.nmck)}</td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* Обоснование */}
            {calc && calc.cv <= 33 && (
              <div className="gov-card overflow-hidden">
                <div className="gov-section-title">📝 Обоснование НМЦК (для документов закупки)</div>
                <div className="p-3">
                  <div className="text-xs leading-relaxed text-gray-700 p-3 bg-gray-50 border border-gray-200 rounded-lg font-mono">
                    <p>
                      Обоснование начальной (максимальной) цены контракта<br/>
                      Объект закупки: <strong>{objectName}</strong><br/>
                      Количество: {qty} {unit}<br/><br/>
                      Метод определения: сопоставимых рыночных цен (анализ рынка)<br/>
                      Основание: ч.6 ст.22 Федерального закона от 05.04.2013 №44-ФЗ,<br/>
                      Приказ Минэкономразвития России от 02.10.2013 №567.<br/><br/>
                      Источники ценовой информации ({sources.length} КП):
                    </p>
                    {sources.map((s, i) => (
                      <p key={s.id}>
                        {i + 1}. {s.supplier} (ИНН {s.inn || '—'}) —{' '}
                        {s.price.toLocaleString('ru-RU')} руб./ед.
                        ({SOURCE_LABELS[s.source]}, {s.date})
                      </p>
                    ))}
                    <p><br/>
                      Средняя цена единицы: {calc.avg.toFixed(2)} руб.<br/>
                      Коэффициент вариации: {calc.cv.toFixed(2)}% (не превышает 33% — ценовая совокупность однородна).<br/><br/>
                      <strong>НМЦК = {calc.avg.toFixed(2)} × {qty} = {formatCurrency(calc.nmck)}</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
