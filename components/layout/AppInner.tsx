'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastBridge } from '@/components/ui/ToastBridge';
import { useDeadlineChecker } from '@/lib/useDeadlineChecker';
import { DemoRunner } from '@/components/ui/DemoRunner';
import { cn } from '@/lib/utils';

const SESS_KEY = 'epp_tour2_step';

export function AppInner({ children }: { children: React.ReactNode }) {
  useDeadlineChecker();
  const [sidebarCollapsed, setSidebarCollapsed]   = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  useEffect(() => {
    // Восстанавливаем если тур был активен до навигации
    if (sessionStorage.getItem(SESS_KEY) !== null) {
      setDemoOpen(true);
    }
    // Слушаем запуск тура с любой страницы
    const handler = () => {
      sessionStorage.removeItem(SESS_KEY);
      setDemoOpen(true);
    };
    window.addEventListener('epp:demo:run', handler);
    return () => window.removeEventListener('epp:demo:run', handler);
  }, []);

  const handleClose = () => {
    sessionStorage.removeItem(SESS_KEY);
    sessionStorage.removeItem('epp_tour2_playing');
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
          <main className={cn('flex-1 overflow-y-auto bg-gray-100', demoOpen ? 'pb-40' : '')}>
            {children}
          </main>
        </div>
      </div>
      {demoOpen && <DemoRunner onClose={handleClose} />}
    </>
  );
}
