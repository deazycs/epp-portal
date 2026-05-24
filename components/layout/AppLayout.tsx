'use client';

import { ToastProvider } from '@/components/ui/Toast';
import { AppInner } from './AppInner';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AppInner>
        {children}
      </AppInner>
    </ToastProvider>
  );
}
