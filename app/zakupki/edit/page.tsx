'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { useAppStore } from '@/store/index';
import type { Procurement } from '@/types';
import { Save, X, CheckCircle } from 'lucide-react';
import { MOCK_PROCUREMENTS } from '@/mock/data/procurements';

export const dynamic = 'force-dynamic';

function EditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id') ?? '';
  const { procurements, updateProcurement } = useAppStore();

  const proc = procurements.find(p => p.id === id)
    ?? MOCK_PROCUREMENTS.find(p => p.id === id);

  const [title, setTitle] = useState(proc?.title ?? '');
  const [description, setDescription] = useState(proc?.description ?? '');
  const [priority, setPriority] = useState<'low'|'normal'|'high'|'urgent'>(proc?.priority ?? 'normal');
  const [endDate, setEndDate] = useState(proc?.plannedEndDate ?? '');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (proc) {
      setTitle(proc.title);
      setDescription(proc.description);
      setPriority(proc.priority);
      setEndDate(proc.plannedEndDate);
    }
  }, [id]);

  if (!proc) {
    return (
      <div className="p-4">
        <div className="gov-alert gov-alert-danger">
          <span>⚠</span><span>Закупка с ID «{id}» не найдена.</span>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    if (!title.trim()) { setError('Введите наименование закупки'); return; }
    setError('');
    updateProcurement(id, {
      title: title.trim(),
      description: description.trim(),
      priority: priority as Procurement['priority'],
      plannedEndDate: endDate,
    });
    setSaved(true);
    setTimeout(() => router.push(`/zakupki/${id}`), 1200);
  };

  if (saved) {
    return (
      <div className="p-8 flex flex-col items-center justify-center">
        <CheckCircle size={48} className="text-green-500 mb-3" />
        <h2 className="text-base font-bold text-gray-800">Изменения сохранены</h2>
        <p className="text-xs text-gray-500 mt-1">Возвращаемся в карточку закупки...</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4">
      <Breadcrumbs items={[
        { label: 'Рабочий стол', href: '/dashboard' },
        { label: 'Реестр закупок', href: '/zakupki' },
        { label: proc.registryNumber, href: `/zakupki/${id}` },
        { label: 'Редактировать' },
      ]} />

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-base font-bold">Редактирование закупки</h1>
          <p className="text-xs text-gray-500">{proc.registryNumber}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push(`/zakupki/${id}`)}
            className="gov-btn gov-btn-ghost gov-btn-sm"><X size={12} /> Отмена</button>
          <button onClick={handleSave} className="gov-btn gov-btn-primary gov-btn-sm">
            <Save size={12} /> Сохранить
          </button>
        </div>
      </div>

      {error && (
        <div className="gov-alert gov-alert-danger mb-3 text-xs">
          <span>⚠</span><span>{error}</span>
        </div>
      )}

      <div className="gov-card max-w-2xl">
        <div className="gov-section-title">Редактируемые поля</div>
        <div className="p-4 space-y-4">
          <div>
            <label className="gov-label">Наименование закупки *</label>
            <input className="gov-input" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="gov-label">Описание / обоснование</label>
            <textarea className="gov-input min-h-20 resize-none" value={description}
              onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="gov-label">Приоритет</label>
              <select className="gov-select" value={priority} onChange={e => setPriority(e.target.value as 'low'|'normal'|'high'|'urgent')}>
                <option value="low">Низкий</option>
                <option value="normal">Обычный</option>
                <option value="high">Высокий</option>
                <option value="urgent">Срочный</option>
              </select>
            </div>
            <div>
              <label className="gov-label">Плановый срок окончания</label>
              <input type="date" className="gov-input" value={endDate}
                onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Для изменения суммы, КБК, поставщика и статуса — обратитесь к контрактному управляющему.
              Все изменения фиксируются в журнале.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="p-8 text-center text-xs text-gray-400">Загрузка...</div>}>
        <EditContent />
      </Suspense>
    </AppLayout>
  );
}
