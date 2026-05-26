'use client';

import { Suspense } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { PoiskContent } from './PoiskContent';

export const dynamic = 'force-dynamic';

export default function PoiskPage() {
  return (
    <AppLayout>
      <div className="p-3 sm:p-4 fade-in">
        <Breadcrumbs items={[{ label:'Рабочий стол', href:'/dashboard' }, { label:'Глобальный поиск' }]} />
        <h1 className="text-base font-bold mb-4">Глобальный поиск по системе</h1>
        <Suspense fallback={<div className="gov-card p-8 text-center text-gray-400 text-sm">Загрузка...</div>}>
          <PoiskContent />
        </Suspense>
      </div>
    </AppLayout>
  );
}
