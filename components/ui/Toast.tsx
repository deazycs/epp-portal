'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

/* ─── Типы ──────────────────────────────────── */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  show: (toast: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error:   (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info:    (title: string, message?: string) => void;
}

/* ─── Context ───────────────────────────────── */
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast должен использоваться внутри ToastProvider');
  return ctx;
}

/* ─── Одиночный тост ────────────────────────── */
const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle  size={16} className="text-green-600 flex-shrink-0 mt-0.5"/>,
  error:   <XCircle      size={16} className="text-red-600   flex-shrink-0 mt-0.5"/>,
  warning: <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5"/>,
  info:    <Info          size={16} className="text-blue-600  flex-shrink-0 mt-0.5"/>,
};

const BORDERS: Record<ToastType, string> = {
  success: 'border-l-green-500',
  error:   'border-l-red-500',
  warning: 'border-l-yellow-500',
  info:    'border-l-blue-500',
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // fade in
    const t1 = setTimeout(() => setVisible(true), 20);
    // auto-remove
    const dur = toast.duration ?? 3500;
    const t2 = setTimeout(() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300); }, dur);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [toast.id, toast.duration, onRemove]);

  const dismiss = () => { setVisible(false); setTimeout(() => onRemove(toast.id), 300); };

  return (
    <div className={`
      flex items-start gap-3 bg-white rounded-lg shadow-lg border border-gray-100
      border-l-4 ${BORDERS[toast.type]}
      px-4 py-3 min-w-72 max-w-sm
      transition-all duration-300
      ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
    `}>
      {ICONS[toast.type]}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-gray-800 leading-tight">{toast.title}</div>
        {toast.message && (
          <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{toast.message}</div>
        )}
      </div>
      <button onClick={dismiss} className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0 ml-1">
        <X size={13}/>
      </button>
    </div>
  );
}

/* ─── Provider ──────────────────────────────── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const show = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
    setToasts(t => [...t.slice(-4), { ...toast, id }]); // максимум 5 тостов
  }, []);

  const success = useCallback((title: string, message?: string) => show({ type:'success', title, message }), [show]);
  const error   = useCallback((title: string, message?: string) => show({ type:'error',   title, message }), [show]);
  const warning = useCallback((title: string, message?: string) => show({ type:'warning', title, message }), [show]);
  const info    = useCallback((title: string, message?: string) => show({ type:'info',    title, message }), [show]);

  return (
    <ToastContext.Provider value={{ show, success, error, warning, info }}>
      {children}
      {/* Контейнер тостов — правый нижний угол */}
      <div
        className="fixed left-4 z-[9995] flex flex-col gap-2 pointer-events-none"
        style={{
          bottom: typeof window !== 'undefined' &&
            sessionStorage.getItem('epp_demo_open') === 'true'
            ? 200 : 24
        }}>
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={remove}/>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
