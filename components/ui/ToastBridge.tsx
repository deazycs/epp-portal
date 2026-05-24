'use client';

import { useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/Toast';

// Module-level callback — не вызывает ре-рендеры
let globalToastCallback: ((type: string, title: string, msg?: string) => void) | null = null;

export function getToastCallback() {
  return globalToastCallback;
}

export function ToastBridge() {
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  useEffect(() => {
    // Регистрируем callback на уровне модуля — без изменения Zustand state
    globalToastCallback = (type, title, msg) => {
      if (type === 'success') toastRef.current.success(title, msg);
      else if (type === 'error') toastRef.current.error(title, msg);
      else if (type === 'warning') toastRef.current.warning(title, msg);
      else toastRef.current.info(title, msg);
    };

    return () => { globalToastCallback = null; };
  }, []);

  return null;
}
