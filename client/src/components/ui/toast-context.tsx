import type { ReactNode } from 'react';
import { toast } from 'sonner';

export type ToastVariant = 'default' | 'destructive';
export interface Toast { id: string; title: string; description?: string; variant?: ToastVariant; duration?: number }

// Compatibility for existing callers. Sonner owns rendering, focus, timing and dismissal.
export function ToastProvider({ children }: { children: ReactNode }) { return <>{children}</>; }
const notifications = {
  addToast: ({ title, description, variant, duration }: Omit<Toast, 'id'>) => {
    const notify = variant === 'destructive' ? toast.error : toast;
    return notify(title, { description, duration: duration ?? 5000 });
  },
  removeToast: (id: string) => toast.dismiss(id),
  removeAllToasts: () => toast.dismiss(),
};
export function useToast() { return notifications; }
