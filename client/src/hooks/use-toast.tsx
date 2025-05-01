import React, { useState, useEffect, ReactNode } from 'react';

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

// No longer using the ToastContainer here, moved to toaster.tsx

// Context provider for global toast usage will be added later if needed