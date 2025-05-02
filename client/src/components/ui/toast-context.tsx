import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

// Define the toast types
export type ToastVariant = 'default' | 'destructive';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  removeAllToasts: () => void;
}

// Create the context with a default value
const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutRefs = React.useRef<Record<string, number>>({});

  // Clear timeouts when component unmounts
  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(clearTimeout);
    };
  }, []);

  // Add a toast
  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    // Generate a unique ID
    const id = Math.random().toString(36).substring(2, 9);
    const duration = toast.duration ?? 5000;
    const newToast = { ...toast, id };

    console.log('DEBUG: Adding toast:', id, 'with title:', toast.title, 'and duration:', duration);
    
    // Add the toast to the state
    setToasts((prev) => [...prev, newToast]);

    // Set a timeout to remove the toast
    if (duration !== Infinity) {
      timeoutRefs.current[id] = window.setTimeout(() => {
        console.log('Auto-removing toast:', id);
        removeToast(id);
      }, duration);
    }
  }, []);

  // Remove a toast
  const removeToast = useCallback((id: string) => {
    console.log('Removing toast:', id);
    
    // Clear the timeout if it exists
    if (timeoutRefs.current[id]) {
      clearTimeout(timeoutRefs.current[id]);
      delete timeoutRefs.current[id];
    }
    
    // Remove the toast from the state
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Remove all toasts
  const removeAllToasts = useCallback(() => {
    // Clear all timeouts
    Object.values(timeoutRefs.current).forEach(clearTimeout);
    timeoutRefs.current = {};
    
    // Clear all toasts
    setToasts([]);
  }, []);

  // Create the context value
  const contextValue = useMemo(() => {
    return { toasts, addToast, removeToast, removeAllToasts };
  }, [toasts, addToast, removeToast, removeAllToasts]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
};

// Custom hook to use the toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};