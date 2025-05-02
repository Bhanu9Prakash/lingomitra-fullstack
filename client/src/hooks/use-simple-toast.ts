import { useToast as useToastContext, ToastVariant } from '@/components/ui/toast-context';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export function useSimpleToast() {
  const { addToast, removeToast, removeAllToasts } = useToastContext();
  
  const toast = (options: ToastOptions) => {
    addToast(options);
  };
  
  // Helper for success toasts
  const success = (title: string, description?: string, duration = 3000) => {
    addToast({
      title,
      description,
      variant: 'default',
      duration,
    });
  };
  
  // Helper for error toasts
  const error = (title: string, description?: string, duration = 4000) => {
    console.log('DEBUG: Error toast called with title:', title, 'and description:', description);
    addToast({
      title,
      description,
      variant: 'destructive',
      duration,
    });
  };
  
  return {
    toast,
    success,
    error,
    dismiss: removeToast,
    dismissAll: removeAllToasts,
  };
}