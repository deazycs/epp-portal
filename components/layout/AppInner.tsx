'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastBridge } from '@/components/ui/ToastBridge';
import { useDeadlineChecker } from '@/lib/useDeadlineChecker';
import { DemoRunner, DemoButton } from '@/components/ui/DemoRunner';
import { cn } from '@/lib/utils';

const SESS_STEP = 'epp_demo_step';
const SESS_OPEN = 'epp_demo_open';

export function AppInner({ children }: { children: React.ReactNode }) {
  useDeadlineChecker();
  const [sidebarCollapsed, setSidebarCollapsed]   = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Читаем начальное состояние из sessionStorage синхронно
  const [demoOpen, setDemoOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(SESS_OPEN) === 'true';
  });

  // Синхронизируем demoOpen с sessionStorage при каждом изменении
  useEffect(() => {
    sessionStorage.setItem(SESS_OPEN, String(demoOpen));
  }, [demoOpen]);

  useEffect(() => {
    // Слушаем запуск демо
    const handler = () => {
      sessionStorage.removeItem(SESS_STEP);
      sessionStorage.setItem(SESS_OPEN, 'true');
      setDemoOpen(true);
    };
    window.addEventListener('epp:demo:run', handler);
    return () => window.removeEventListener('epp:demo:run', handler);
  }, []);

  const handleClose = () => {
    sessionStorage.removeItem(SESS_STEP);
    sessionStorage.removeItem(SESS_OPEN);
    sessionStorage.removeItem('epp_demo_playing');
    setDemoOpen(false);
  };

  return (
    <>
      <ToastBridge />
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        {mobileSidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setMobileSidebarOpen(false)} />
        )}
        <div className={cn(
          'hidden md:flex flex-col flex-shrink-0 transition-all duration-200',
          sidebarCollapsed ? 'w-12' : 'w-56'
        )} style={{ height: '100%' }}>
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
          <main className={`flex-1 overflow-y-auto ${demoOpen ? 'pb-44' : ''}`} style={{ background: '#f4f6f9', minHeight: 0, paddingBottom: demoOpen ? 180 : 0 }}>
            {children}
          </main>
        </div>
      </div>
      {demoOpen && <DemoRunner onClose={handleClose} />}
      {!demoOpen && <DemoButton variant="floating" />}
    </>
  );
}
