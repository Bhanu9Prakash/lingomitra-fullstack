import { useState, useEffect, ReactNode } from 'react';

export type ToastVariant = 'default' | 'destructive' | 'success';

export type ToastProps = {
  id?: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastState = {
  toasts: ToastProps[];
  toast: (props: ToastProps) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
};

const DEFAULT_TOAST_DURATION = 5000; // 5 seconds

export function useToast(): ToastState {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = (props: ToastProps) => {
    const id = props.id || `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const duration = props.duration || DEFAULT_TOAST_DURATION;
    
    setToasts((prev) => [...prev, { ...props, id, duration }]);
    
    // Auto dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const dismissAll = () => {
    setToasts([]);
  };

  return {
    toasts,
    toast,
    dismiss,
    dismissAll
  };
}

// ToastComponent to display toasts
export function ToastContainer({ toasts, dismiss }: { toasts: ToastProps[], dismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;
  
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={`toast ${toast.variant || 'default'}`}
        >
          <div className="toast-content">
            <h4 className="toast-title">{toast.title}</h4>
            {toast.description && <p className="toast-description">{toast.description}</p>}
          </div>
          <button onClick={() => dismiss(toast.id!)} className="toast-close">×</button>
        </div>
      ))}
    </div>
  );
}

// Context provider for global toast usage will be added later if needed