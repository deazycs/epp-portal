'use client';

export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { useAppStore } from '@/store/index';
import { formatDateTime, formatTimeAgo } from '@/lib/utils';
import Link from 'next/link';

const TYPE_ICONS: Record<string,string> = { warning:'⚠️', error:'🔴', success:'✅', info:'ℹ️' };
const CAT_LBL: Record<string,string> = { deadline:'Сроки', approval:'Согласование', task:'Задачи', system:'Система', document:'Документы', payment:'Платежи' };

export default function UvedomleniyaPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppStore();
  const [filter, setFilter] = useState<'all'|'unread'>('all');
  const unreadCount = notifications.filter(n=>!n.isRead).length;
  const displayed = filter==='unread' ? notifications.filter(n=>!n.isRead) : notifications;

  return (
    <AppLayout>
      <div className="p-3 sm:p-4">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Уведомления'}]}/>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Уведомления</h1>
            <p className="text-xs text-gray-500">Непрочитанных: <span className="font-bold text-blue-600">{unreadCount}</span></p>
          </div>
          <button onClick={markAllNotificationsRead} className="gov-btn gov-btn-ghost gov-btn-sm">
            <CheckCheck size={12}/> Прочитать все
          </button>
        </div>

        <div className="flex gap-2 mb-3">
          {(['all','unread'] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              className={`gov-btn gov-btn-sm ${filter===f?'gov-btn-primary':'gov-btn-ghost'}`}>
              {f==='all'?`Все (${notifications.length})`:`Непрочитанные (${unreadCount})`}
            </button>
          ))}
        </div>

        <div className="gov-card overflow-hidden">
          {displayed.length===0 ? (
            <div className="text-center py-12 text-gray-400">
              <Bell size={32} className="mx-auto mb-2 opacity-30"/>
              <p className="text-sm">Нет уведомлений</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {displayed.map(n=>(
                <div key={n.id}
                  className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${!n.isRead?'bg-blue-50':''}`}
                  onClick={()=>markNotificationRead(n.id)}>
                  <span className="text-lg flex-shrink-0 mt-0.5">{TYPE_ICONS[n.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      {!n.isRead&&<span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"/>}
                      <span className="text-xs font-bold text-gray-800">{n.title}</span>
                      <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{CAT_LBL[n.category]}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">{formatDateTime(n.createdAt)}</span>
                      {n.link&&<Link href={n.link} className="text-xs text-blue-600 hover:underline" onClick={e=>e.stopPropagation()}>Перейти →</Link>}
                    </div>
                  </div>
                  {n.isRead&&<span className="text-xs text-gray-300 flex-shrink-0">✓</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
