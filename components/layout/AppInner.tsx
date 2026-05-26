'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DemoRunner, DemoButton } from '@/components/ui/DemoRunner';
import { ToastProvider } from '@/components/ui/Toast';
import { Menu, X } from 'lucide-react';

const SESS_OPEN    = 'epp_demo_open';
const SESS_STEP    = 'epp_demo_step';
const SESS_PLAYING = 'epp_demo_playing';

function ToastBridge() {
  return null;
}

export function AppInner({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(() =>
    typeof window !== 'undefined'
      ? sessionStorage.getItem(SESS_OPEN) === 'true'
      : false
  );
  const [demoPanelCollapsed, setDemoPanelCollapsed] = useState(false);

  useEffect(() => {
    const handler = () => {
      sessionStorage.setItem(SESS_OPEN, 'true');
      setDemoOpen(true);
      setDemoPanelCollapsed(false);
    };
    window.addEventListener('epp:demo:run', handler);
    return () => window.removeEventListener('epp:demo:run', handler);
  }, []);

  const handleDemoClose = useCallback(() => {
    sessionStorage.removeItem(SESS_STEP);
    sessionStorage.removeItem(SESS_PLAYING);
    sessionStorage.removeItem(SESS_OPEN);
    setDemoOpen(false);
  }, []);

  return (
    <ToastProvider>
      {/* Overlay мобильного сайдбара */}
      {mobileSidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

        {/* Сайдбар — только на desktop (md+) */}
        <div
          className="hidden md:flex flex-col flex-shrink-0"
          style={{ width: sidebarCollapsed ? 48 : 220, height: '100%', transition: 'width 0.2s' }}>
          <Sidebar collapsed={sidebarCollapsed} />
        </div>

        {/* Сайдбар — мобильный (slide-in) */}
        <div
          style={{
            position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50,
            width: 220, transform: mobileSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.2s ease',
          }}>
          <Sidebar collapsed={false} />
        </div>

        {/* Основной контент */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <Header
            onMenuToggle={() => {
              if (window.innerWidth < 768) {
                setMobileSidebarOpen(o => !o);
              } else {
                setSidebarCollapsed(c => !c);
              }
            }}
            sidebarCollapsed={sidebarCollapsed}
          />

          {/* Главная область — padding снизу только если демо открыто И не свёрнуто */}
          <main
            style={{
              flex: 1, overflowY: 'auto', background: '#f4f6f9',
              paddingBottom: demoOpen && !demoPanelCollapsed ? 160 : 0,
              minHeight: 0,
            }}>
            {children}
          </main>
        </div>
      </div>

      {/* Кнопка Демо — только когда демо закрыто */}
      {!demoOpen && <DemoButton variant="floating" />}

      {/* Демо-панель */}
      {demoOpen && (
        <DemoRunner
          onClose={handleDemoClose}
          collapsed={demoPanelCollapsed}
          onToggleCollapse={() => setDemoPanelCollapsed(c => !c)}
        />
      )}
    </ToastProvider>
  );
}
