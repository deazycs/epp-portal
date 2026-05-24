'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastBridge } from '@/components/ui/ToastBridge';
import { useDeadlineChecker } from '@/lib/useDeadlineChecker';
import { DemoScenario } from '@/components/ui/DemoScenario';
import { cn } from '@/lib/utils';

// Глобальное состояние демо-сценария — живёт на уровне layout,
// не исчезает при навигации между страницами
export function AppInner({ children }: { children: React.ReactNode }) {
  useDeadlineChecker();
  const [sidebarCollapsed, setSidebarCollapsed]   = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [demoOpen, setDemoOpen]                   = useState(false);

  // Передаём функцию открытия сценария через data-атрибут на body
  // чтобы кнопка на Dashboard могла его запустить
  if (typeof window !== 'undefined') {
    (window as any).__openDemoScenario = () => setDemoOpen(true);
  }

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
              setSidebarCollapsed(!sidebarCollapsed);
              setMobileSidebarOpen(!mobileSidebarOpen);
            }}
            sidebarCollapsed={sidebarCollapsed}
          />
          {/* Отступ снизу когда демо-сценарий активен */}
          <main className={cn(
            'flex-1 overflow-y-auto bg-gray-100 transition-all',
            demoOpen ? 'pb-36' : ''
          )}>
            {children}
          </main>
        </div>
      </div>

      {/* Демо-сценарий — живёт здесь, НЕ внутри страниц */}
      {demoOpen && (
        <DemoScenario onClose={() => setDemoOpen(false)} />
      )}
    </>
  );
}
