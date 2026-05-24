'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastBridge } from '@/components/ui/ToastBridge';
import { useDeadlineChecker } from '@/lib/useDeadlineChecker';
import { DemoScenario } from '@/components/ui/DemoScenario';
import { demoState } from '@/lib/demoState';
import { cn } from '@/lib/utils';

export function AppInner({ children }: { children: React.ReactNode }) {
  useDeadlineChecker();

  const [sidebarCollapsed, setSidebarCollapsed]   = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  // Читаем текущее состояние из глобального модуля
  const [demoOpen, setDemoOpen] = useState(() => demoState.open);

  // Подписываемся на изменения глобального состояния
  useEffect(() => {
    const unsub = demoState.subscribe(open => setDemoOpen(open));
    return unsub;
  }, []);

  return (
    <>
      <ToastBridge />

      <div className="flex h-screen overflow-hidden">
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar desktop */}
        <div
          className={cn(
            'hidden md:flex flex-col flex-shrink-0 transition-all duration-200',
            sidebarCollapsed ? 'w-12' : 'w-56'
          )}
          style={{ height: '100vh' }}
        >
          <Sidebar collapsed={sidebarCollapsed} />
        </div>

        {/* Sidebar mobile */}
        <div
          className={cn(
            'fixed left-0 top-0 bottom-0 z-40 md:hidden transition-transform duration-200',
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          style={{ width: '224px' }}
        >
          <Sidebar collapsed={false} />
        </div>

        {/* Основной контент */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header
            onMenuToggle={() => {
              setSidebarCollapsed(s => !s);
              setMobileSidebarOpen(m => !m);
            }}
            sidebarCollapsed={sidebarCollapsed}
          />
          <main className={cn(
            'flex-1 overflow-y-auto bg-gray-100',
            demoOpen ? 'pb-40' : ''
          )}>
            {children}
          </main>
        </div>
      </div>

      {/* Демо-сценарий — рендерится здесь но управляется глобальным состоянием */}
      {demoOpen && (
        <DemoScenario onClose={() => demoState.stop()} />
      )}
    </>
  );
}
