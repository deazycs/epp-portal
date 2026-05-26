'use client';

import { AppInner } from './AppInner';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppInner>{children}</AppInner>;
}
