'use client';

import { create } from 'zustand';
import type { Procurement, Task, Notification, HistoryEntry, ProcurementStatus } from '@/types';
import { getToastCallback } from '@/components/ui/ToastBridge';
import { WORKFLOW_STATUS_ORDER, WORKFLOW_STATUS_LABELS } from '@/lib/constants';
import { MOCK_PROCUREMENTS } from '@/mock/data/procurements';
import { MOCK_TASKS, MOCK_NOTIFICATIONS, MOCK_HISTORY } from '@/mock/data/other';

interface Comment {
  id: string;
  procurementId: string;
  author: string;
  role: string;
  text: string;
  internal: boolean;
  createdAt: string;
}

interface AppStore {
  procurements: Procurement[];
  tasks: Task[];
  notifications: Notification[];
  history: HistoryEntry[];
  comments: Comment[];
  hydrated: boolean;
  // Закупки
  addProcurement: (p: Procurement) => void;
  updateProcurement: (id: string, changes: Partial<Procurement>) => void;
  changeStatus: (id: string, status: ProcurementStatus, userId: string, userName: string) => void;
  advanceWorkflow: (id: string, userId: string, userName: string) => void;

  // Задачи
  addTask: (t: Task) => void;
  completeTask: (id: string) => void;
  updateTask: (id: string, changes: Partial<Task>) => void;

  // Уведомления
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (n: Notification) => void;

  // Комментарии
  addComment: (c: Omit<Comment, 'id' | 'createdAt'>) => void;
  getComments: (procurementId: string) => Comment[];

  // Сброс
  reset: () => void;
}

const STATUS_ORDER = WORKFLOW_STATUS_ORDER;

const STATUS_LABELS = WORKFLOW_STATUS_LABELS;

function makeHEntry(
  entityId: string, userId: string, userName: string,
  action: string, description: string, oldValue?: string, newValue?: string,
): HistoryEntry {
  return {
    id: `h-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
    entityId, entityType:'procurement', userId, userName,
    action, oldValue, newValue, description,
    createdAt: new Date().toISOString(),
    ipAddress:'10.10.1.45',
  };
}

function load() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(window.localStorage.getItem('epp-store-v2') ?? 'null'); }
  catch { return null; }
}

function save(state: Partial<AppStore>) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem('epp-store-v2', JSON.stringify({
      procurements: state.procurements,
      tasks: state.tasks,
      notifications: state.notifications,
      history: state.history,
      comments: state.comments,
    }));
  } catch { /* ignore */ }
}

const saved = load();

export const useAppStore = create<AppStore>((set, get) => ({
  procurements: saved?.procurements ?? MOCK_PROCUREMENTS,
  tasks:        saved?.tasks        ?? MOCK_TASKS,
  notifications:saved?.notifications ?? MOCK_NOTIFICATIONS,
  history:      saved?.history      ?? MOCK_HISTORY,
  comments:     saved?.comments     ?? [],
  hydrated: true,
  addProcurement: (p) => {
    set(s => {
      const now = new Date().toISOString();
      // Автозадача — начать согласование СЗ
      const autoTask = {
        id: `task-sz-${Date.now()}`,
        title: `Согласовать СЗ и начать размещение: ${p.title.slice(0, 55)}`,
        assigneeId: p.responsibleId,
        assigneeName: p.responsibleName,
        creatorId: 'system',
        creatorName: 'Система',
        status: 'new' as const,
        priority: p.priority === 'urgent' ? 'urgent' as const : 'normal' as const,
        dueDate: new Date(Date.now() + 3*86400000).toISOString().split('T')[0],
        procurementId: p.id,
        createdAt: now,
        updatedAt: now,
      };
      const next = {
        procurements: [p, ...s.procurements],
        tasks: [...s.tasks, autoTask],
        history: [
          makeHEntry(p.id, p.responsibleId ?? 'u_shv', p.responsibleName, 'CREATE',
            `Создана закупка ${p.registryNumber}: ${p.title.slice(0, 80)}`),
          ...s.history,
        ],
        notifications: [{
          id: `n-new-${Date.now()}`, userId: 'u_shv', type: 'success' as const,
          category: 'system' as const, title: `Создана: ${p.registryNumber}`,
          message: `«${p.title.slice(0, 70)}» добавлена в реестр. Задача на согласование СЗ создана.`,
          link: `/zakupki/${p.id}`, entityId: p.id, entityType: 'procurement',
          isRead: false, createdAt: now,
        }, ...s.notifications],
      };
      save({ ...s, ...next });
      getToastCallback()?.('success', 'Закупка создана', p.registryNumber);
      return next;
    });
  },

  updateProcurement: (id, changes) => {
    set(s => {
      const next = {
        procurements: s.procurements.map(p =>
          p.id === id ? { ...p, ...changes, updatedAt: new Date().toISOString() } : p
        ),
      };
      save({ ...s, ...next });
      getToastCallback()?.('success', 'Изменения сохранены');
      return next;
    });
  },

  changeStatus: (id, newStatus, userId, userName) => {
    const proc = get().procurements.find(p => p.id === id);
    if (!proc) return;
    const oldStatus = proc.status;
    const newSteps = proc.workflowSteps?.map(step => {
      const si = STATUS_ORDER.indexOf(step.status as ProcurementStatus);
      const ni = STATUS_ORDER.indexOf(newStatus);
      return {
        ...step,
        isCompleted: si < ni,
        isActive: step.status === newStatus,
        completedAt: si < ni ? new Date().toISOString() : step.completedAt,
        completedByName: si < ni ? userName : step.completedByName,
      };
    });
    set(s => {
      const next = {
        procurements: s.procurements.map(p =>
          p.id === id ? { ...p, status: newStatus, updatedAt: new Date().toISOString(), workflowSteps: newSteps } : p
        ),
        history: [
          makeHEntry(id, userId, userName, 'status_change',
            `Статус: «${STATUS_LABELS[oldStatus]}» → «${STATUS_LABELS[newStatus]}»`,
            STATUS_LABELS[oldStatus], STATUS_LABELS[newStatus]),
          ...s.history,
        ],
        notifications: [{
          id:`n-${Date.now()}`, userId:'u_shv', type:'info' as const,
          category:'system' as const, title:'Статус изменён',
          message:`${proc.registryNumber}: ${STATUS_LABELS[oldStatus]} → ${STATUS_LABELS[newStatus]}`,
          link:`/zakupki/${id}`, entityId:id, entityType:'procurement',
          isRead:false, createdAt: new Date().toISOString(),
        }, ...s.notifications],
      };
      save({ ...s, ...next });
      getToastCallback()?.('info', 'Статус изменён', `${STATUS_LABELS[oldStatus]} → ${STATUS_LABELS[newStatus]}`);
      return next;
    });
  },

  advanceWorkflow: (id, userId, userName) => {
    const proc = get().procurements.find(p => p.id === id);
    if (!proc) return;
    const idx = STATUS_ORDER.indexOf(proc.status);
    if (idx < STATUS_ORDER.length - 1) {
      get().changeStatus(id, STATUS_ORDER[idx + 1], userId, userName);
    }
  },

  addTask: (t) => {
    set(s => {
      const next = { tasks: [t, ...s.tasks] };
      save({ ...s, ...next });
      getToastCallback()?.('success', 'Задача создана', t.title);
      return next;
    });
  },

  completeTask: (id) => {
    const task = get().tasks.find(t => t.id === id);
    set(s => {
      const next = {
        tasks: s.tasks.map(t =>
          t.id === id ? { ...t, status:'done' as const, completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : t
        ),
      };
      save({ ...s, ...next });
      getToastCallback()?.('success', 'Задача выполнена', task?.title);
      return next;
    });
  },

  updateTask: (id, changes) => {
    set(s => {
      const next = { tasks: s.tasks.map(t => t.id === id ? { ...t, ...changes } : t) };
      save({ ...s, ...next });
      return next;
    });
  },

  markNotificationRead: (id) => {
    set(s => {
      const next = {
        notifications: s.notifications.map(n =>
          n.id === id ? { ...n, isRead:true, readAt: new Date().toISOString() } : n
        ),
      };
      save({ ...s, ...next });
      return next;
    });
  },

  markAllNotificationsRead: () => {
    set(s => {
      const next = {
        notifications: s.notifications.map(n =>
          ({ ...n, isRead:true, readAt: n.readAt ?? new Date().toISOString() })
        ),
      };
      save({ ...s, ...next });
      getToastCallback()?.('success', 'Все уведомления прочитаны');
      return next;
    });
  },

  addNotification: (n) => {
    set(s => {
      const next = { notifications: [n, ...s.notifications] };
      save({ ...s, ...next });
      return next;
    });
  },

  addComment: (c) => {
    const comment: Comment = {
      ...c,
      id: `cmt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set(s => {
      const next = { comments: [...s.comments, comment] };
      save({ ...s, ...next });
      getToastCallback()?.('success', 'Комментарий добавлен');
      return next;
    });
  },

  getComments: (procurementId) => {
    return get().comments.filter(c => c.procurementId === procurementId);
  },

  reset: () => {
    if (typeof window !== 'undefined') {
      try { window.localStorage.removeItem('epp-store-v2'); } catch { /* ignore */ }
    }
    set({
      procurements: MOCK_PROCUREMENTS,
      tasks: MOCK_TASKS,
      notifications: MOCK_NOTIFICATIONS,
      history: MOCK_HISTORY,
      comments: [],
    });
    getToastCallback()?.('info', 'Данные сброшены', 'Восстановлены исходные демо-данные');
  },
}));
