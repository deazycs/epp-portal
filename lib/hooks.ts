'use client';

/**
 * Переиспользуемые хуки для работы с данными
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/index';
import { WORKFLOW_STATUS_ORDER } from '@/lib/constants';
import type { Procurement, ProcurementStatus } from '@/types';

// ─── Хук фильтрации закупок ─────────────────────────────────
export interface ProcurementFilters {
  search: string;
  statuses: string[];
  departmentId: string;
  onlyOverdue: boolean;
  riskLevel: string;
}

export const DEFAULT_FILTERS: ProcurementFilters = {
  search: '',
  statuses: [],
  departmentId: '',
  onlyOverdue: false,
  riskLevel: '',
};

export function useFilteredProcurements(filters: ProcurementFilters) {
  const { procurements } = useAppStore();

  return useMemo(() => {
    let d = [...procurements];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      d = d.filter(p =>
        p.registryNumber.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        (p.supplierName?.toLowerCase().includes(q) ?? false) ||
        (p.supplierInn?.includes(q) ?? false)
      );
    }

    if (filters.statuses.length > 0) {
      d = d.filter(p => filters.statuses.includes(p.status));
    }

    if (filters.departmentId) {
      d = d.filter(p => p.departmentId === filters.departmentId);
    }

    if (filters.onlyOverdue) {
      d = d.filter(p => p.isOverdue);
    }

    if (filters.riskLevel) {
      d = d.filter(p => p.riskLevel === filters.riskLevel);
    }

    return d;
  }, [procurements, filters]);
}

// ─── Хук пагинации ──────────────────────────────────────────
export function usePagination<T>(data: T[], pageSize = 10) {
  const [page, setPage] = useState(1);

  // Сбрасываем на первую страницу при изменении данных
  useEffect(() => { setPage(1); }, [data.length]);

  const pages = Math.max(1, Math.ceil(data.length / pageSize));
  const paged = data.slice((page - 1) * pageSize, page * pageSize);

  const goNext = useCallback(() => setPage(p => Math.min(p + 1, pages)), [pages]);
  const goPrev = useCallback(() => setPage(p => Math.max(p - 1, 1)), []);
  const goTo   = useCallback((p: number) => setPage(Math.max(1, Math.min(p, pages))), [pages]);

  return { page, pages, paged, goNext, goPrev, goTo, setPage };
}

// ─── Хук сортировки ─────────────────────────────────────────
export function useSort<T>(data: T[], defaultField: keyof T, defaultDir: 'asc'|'desc' = 'desc') {
  const [field, setField] = useState<keyof T>(defaultField);
  const [dir, setDir]     = useState<'asc'|'desc'>(defaultDir);

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const av = String(a[field] ?? '');
      const bv = String(b[field] ?? '');
      return dir === 'asc' ? av.localeCompare(bv, 'ru') : bv.localeCompare(av, 'ru');
    });
  }, [data, field, dir]);

  const toggleSort = useCallback((f: keyof T) => {
    if (field === f) setDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setField(f); setDir('desc'); }
  }, [field]);

  return { sorted, sortField: field, sortDir: dir, toggleSort };
}

// ─── Хук статистики закупок ─────────────────────────────────
export function useProcurementStats() {
  const { procurements } = useAppStore();

  return useMemo(() => {
    const active   = procurements.filter(p => !['archive','cancelled'].includes(p.status));
    const overdue  = procurements.filter(p => p.isOverdue);
    const archived = procurements.filter(p => p.status === 'archive');

    const totalPlanned  = procurements.reduce((s,p) => s + p.plannedSum, 0);
    const totalContract = procurements.reduce((s,p) => s + (p.contractSum ?? 0), 0);
    const totalPaid     = procurements.reduce((s,p) => s + (p.paidSum ?? 0), 0);
    const economy       = totalPlanned - totalContract;
    const economyPct    = totalPlanned > 0 ? ((economy / totalPlanned) * 100) : 0;

    // По статусам
    const byStatus = WORKFLOW_STATUS_ORDER.reduce((acc, status) => {
      acc[status] = procurements.filter(p => p.status === status).length;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: procurements.length,
      active: active.length,
      overdue: overdue.length,
      archived: archived.length,
      totalPlanned,
      totalContract,
      totalPaid,
      economy,
      economyPct,
      byStatus,
    };
  }, [procurements]);
}

// ─── Хук данных для дашборда ────────────────────────────────
export function useDashboardData() {
  const { procurements, tasks, notifications } = useAppStore();

  return useMemo(() => {
    const urgentProcurements = procurements
      .filter(p => p.isOverdue || p.priority === 'urgent')
      .slice(0, 5);

    const myTasks = tasks
      .filter(t => t.assigneeId === 'u1' && ['new','in_progress','overdue'].includes(t.status));

    const unreadNotifications = notifications.filter(n => !n.isRead);

    const recentActivity = procurements
      .sort((a,b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 7);

    return {
      urgentProcurements,
      myTasks,
      unreadNotifications,
      recentActivity,
      unreadCount: unreadNotifications.length,
      taskCount: myTasks.length,
    };
  }, [procurements, tasks, notifications]);
}

// ─── Хук локального поиска ──────────────────────────────────
export function useLocalSearch<T>(
  data: T[],
  searchFn: (item: T, query: string) => boolean,
  debounceMs = 200
) {
  const [query, setQuery]       = useState('');
  const [debouncedQ, setDebQ]   = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebQ(query), debounceMs);
    return () => clearTimeout(t);
  }, [query, debounceMs]);

  const results = useMemo(() => {
    if (!debouncedQ.trim()) return data;
    return data.filter(item => searchFn(item, debouncedQ.toLowerCase()));
  }, [data, debouncedQ, searchFn]);

  return { query, setQuery, results, isSearching: !!debouncedQ };
}
