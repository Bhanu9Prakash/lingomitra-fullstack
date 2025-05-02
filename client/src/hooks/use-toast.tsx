import * as React from 'react';
import { useState, createContext, useContext, type ReactNode, useEffect, useRef } from 'react';

export type ToastVariant = 'default' | 'destructive';

export type ToastProps = {
  id?: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number; // in milliseconds, default is 5000 (5 seconds)
};

type ToastState = {
  toasts: ToastProps[];
  toast: (props: ToastProps) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
};

const ToastContext = createContext<ToastState | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  // Store timeouts so we can clear them if a toast is manually dismissed
  // In browser environments, setTimeout returns a number
  const timeoutsRef = useRef<Record<string, number>>({});
  
  // Cleanup timeouts when component unmounts
  useEffect(() => {
    return () => {
      Object.values(timeoutsRef.current).forEach(clearTimeout);
    };
  }, []);

  // Function to dismiss a toast
  const dismiss = React.useCallback((id: string) => {
    console.log('Dismissing toast:', id);
    
    // Clear any existing timeout for this toast
    if (timeoutsRef.current[id]) {
      clearTimeout(timeoutsRef.current[id]);
      delete timeoutsRef.current[id];
    }
    
    // Remove the toast from state
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Function to add a new toast
  const toast = React.useCallback((props: ToastProps) => {
    const id = props.id || Math.random().toString(36).substring(2, 9);
    // Default duration is 5 seconds (5000ms) unless specified
    const duration = props.duration ?? 5000;
    const newToast = { ...props, id, duration };
    
    console.log('Creating toast:', id, 'with duration:', duration);
    
    // Add the toast to state
    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Set up auto-dismiss after duration (unless it's set to Infinity)
    if (duration !== Infinity) {
      // Store the timeout so we can clear it if needed
      // Use window.setTimeout to ensure we get the correct return type for browser
      timeoutsRef.current[id] = window.setTimeout(() => {
        console.log('Auto-dismissing toast:', id);
        dismiss(id);
      }, duration);
    }
    
    return id;
  }, [dismiss]);

  // Function to dismiss all toasts
  const dismissAll = React.useCallback(() => {
    // Clear all timeouts
    Object.values(timeoutsRef.current).forEach(clearTimeout);
    timeoutsRef.current = {};
    
    // Clear all toasts
    setToasts([]);
  }, []);

  // Create a memoized value for the context
  const value = React.useMemo(() => ({
    toasts,
    toast,
    dismiss,
    dismissAll
  }), [toasts, toast, dismiss, dismissAll]);

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastState {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
}