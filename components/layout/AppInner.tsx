'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastBridge } from '@/components/ui/ToastBridge';
import { useDeadlineChecker } from '@/lib/useDeadlineChecker';
import { DemoScenario } from '@/components/ui/DemoScenario';
import { cn } from '@/lib/utils';

const SESSION_KEY = 'epp_demo_step';

export function AppInner({ children }: { children: React.ReactNode }) {
  useDeadlineChecker();
  const [sidebarCollapsed, setSidebarCollapsed]   = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Показываем DemoScenario если есть сохранённый шаг в sessionStorage
  const [demoOpen, setDemoOpen] = useState(false);

  useEffect(() => {
    // После монтирования проверяем - был ли активен сценарий
    const savedStep = sessionStorage.getItem(SESSION_KEY);
    if (savedStep !== null) {
      setDemoOpen(true);
    }

    // Слушаем кастомное событие для запуска сценария
    const handler = () => setDemoOpen(true);
    window.addEventListener('epp:demo:start', handler);
    return () => window.removeEventListener('epp:demo:start', handler);
  }, []);

  const handleClose = () => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('epp_demo_playing');
    setDemoOpen(false);
  };

  return (
    <>
      <ToastBridge />

      <div className="flex h-screen overflow-hidden">
        {mobileSidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setMobileSidebarOpen(false)} />
        )}

        <div className={cn(
          'hidden md:flex flex-col flex-shrink-0 transition-all duration-200',
          sidebarCollapsed ? 'w-12' : 'w-56'
        )} style={{ height: '100vh' }}>
          <Sidebar collapsed={sidebarCollapsed} />
        </div>

        <div className={cn(
          'fixed left-0 top-0 bottom-0 z-40 md:hidden transition-transform duration-200',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )} style={{ width: '224px' }}>
          <Sidebar collapsed={false} />
        </div>

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
            demoOpen ? 'pb-36' : ''
          )}>
            {children}
          </main>
        </div>
      </div>

      {/* DemoScenario живёт здесь — на уровне layout, не внутри страниц */}
      {demoOpen && <DemoScenario onClose={handleClose} />}
    </>
  );
}
