'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/index';

const WARN_DAYS = 5;

function daysBetween(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / 86_400_000);
}

export function useDeadlineChecker() {
  const ran = useRef(false);

  useEffect(() => {
    // Запускаем СТРОГО ОДИН РАЗ — используем ref чтобы StrictMode не дублировал
    if (ran.current) return;
    ran.current = true;

    // Читаем состояние напрямую из store (не через хук) чтобы избежать зависимостей
    const state = useAppStore.getState();
    const { procurements, tasks, notifications, addNotification } = state;

    const existingIds = new Set(notifications.map(n => n.entityId));
    const now = new Date().toISOString();

    procurements.forEach(p => {
      if (['archive', 'cancelled'].includes(p.status)) return;

      if (p.plannedEndDate) {
        const days = daysBetween(p.plannedEndDate);
        const notifId = `deadline-${p.id}-end`;

        if (days < 0 && !existingIds.has(p.id + '-overdue')) {
          addNotification({
            id: `n-auto-${Date.now()}-${p.id}`,
            userId: 'u1',
            type: 'error',
            category: 'deadline',
            title: `Просрочка: ${p.registryNumber}`,
            message: `Срок окончания закупки «${p.title.slice(0, 60)}» истёк ${Math.abs(days)} дн. назад.`,
            link: `/zakupki/${p.id}`,
            entityId: p.id + '-overdue',
            entityType: 'procurement',
            isRead: false,
            createdAt: now,
          });
        } else if (days >= 0 && days <= WARN_DAYS && !existingIds.has(notifId)) {
          addNotification({
            id: `n-auto-${Date.now()}-${p.id}-warn`,
            userId: 'u1',
            type: 'warning',
            category: 'deadline',
            title: `Срок истекает через ${days} дн.: ${p.registryNumber}`,
            message: `До окончания «${p.title.slice(0, 60)}» осталось ${days} дн.`,
            link: `/zakupki/${p.id}`,
            entityId: notifId,
            entityType: 'procurement',
            isRead: false,
            createdAt: now,
          });
        }
      }

      if (p.status === 'payment' && p.contractEndDate) {
        const days = daysBetween(p.contractEndDate);
        const notifId = `payment-${p.id}`;
        if (days <= WARN_DAYS && !existingIds.has(notifId)) {
          addNotification({
            id: `n-auto-${Date.now()}-pay-${p.id}`,
            userId: 'u1',
            type: days < 0 ? 'error' : 'warning',
            category: 'payment',
            title: days < 0
              ? `Просрочен платёж: ${p.registryNumber}`
              : `Срок оплаты через ${days} дн.: ${p.registryNumber}`,
            message: `Необходимо инициировать оплату по договору.`,
            link: `/zakupki/${p.id}`,
            entityId: notifId,
            entityType: 'procurement',
            isRead: false,
            createdAt: now,
          });
        }
      }
    });

    tasks.forEach(t => {
      if (t.status === 'done' || t.status === 'cancelled' || !t.dueDate) return;
      const days = daysBetween(t.dueDate);
      const notifId = `task-overdue-${t.id}`;
      if (days < 0 && !existingIds.has(notifId)) {
        addNotification({
          id: `n-auto-${Date.now()}-task-${t.id}`,
          userId: 'u1',
          type: 'warning',
          category: 'task',
          title: `Просроченная задача: ${t.title.slice(0, 50)}`,
          message: `Задача просрочена на ${Math.abs(days)} дн. Исполнитель: ${t.assigneeName}.`,
          link: '/zadachi',
          entityId: notifId,
          entityType: 'task',
          isRead: false,
          createdAt: now,
        });
      }
    });
  }, []); // пустой массив — только при монтировании
}
