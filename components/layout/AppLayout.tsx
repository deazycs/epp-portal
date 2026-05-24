'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ToastProvider } from '@/components/ui/Toast';
import { ToastBridge } from '@/components/ui/ToastBridge';
import { useDeadlineChecker } from '@/lib/useDeadlineChecker';
import { Header } from './Header';
import { cn } from '@/lib/utils';

export function AppLayout({ children }: { children: React.ReactNode }) {
  useDeadlineChecker();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <ToastProvider>
    <ToastBridge />
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar — desktop */}
      <div
        className={cn(
          'hidden md:flex flex-col flex-shrink-0 transition-all duration-200',
          sidebarCollapsed ? 'w-12' : 'w-56'
        )}
        style={{ height: '100vh' }}
      >
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      {/* Sidebar — mobile */}
      <div
        className={cn(
          'fixed left-0 top-0 bottom-0 z-40 md:hidden transition-transform duration-200',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ width: '224px' }}
      >
        <Sidebar collapsed={false} />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          onMenuToggle={() => {
            setSidebarCollapsed(!sidebarCollapsed);
            setMobileSidebarOpen(!mobileSidebarOpen);
          }}
          sidebarCollapsed={sidebarCollapsed}
        />

        <main className="flex-1 overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
    </ToastProvider>
  );
}
