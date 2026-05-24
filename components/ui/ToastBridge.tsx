'use client';

import { useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import { useAppStore } from '@/store/index';

export function ToastBridge() {
  const toast = useToast();
  const registerToast = useAppStore(s => s.registerToast);

  useEffect(() => {
    registerToast((type, title, msg) => {
      if (type === 'success') toast.success(title, msg);
      else if (type === 'error') toast.error(title, msg);
      else if (type === 'warning') toast.warning(title, msg);
      else toast.info(title, msg);
    });
  }, [registerToast, toast]);

  return null;
}
