import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Toast, useToast } from './ToastContext';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Detect and track theme changes
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
    
    const observer = new MutationObserver(() => {
      const isDarkUpdated = document.documentElement.classList.contains('dark');
      setTheme(isDarkUpdated ? 'dark' : 'light');
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="fixed top-0 right-0 z-[99999] flex flex-col p-4 space-y-4 max-h-screen overflow-hidden pointer-events-auto w-full sm:w-auto">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto flex w-full max-w-md overflow-hidden rounded-lg shadow-lg 
            transition-all duration-300 ease-in-out
            ${toast.variant === 'destructive' 
              ? 'bg-red-600 text-white dark:bg-red-700 border border-red-700 dark:border-red-800' 
              : theme === 'dark'
                ? 'bg-gray-800 text-gray-100 border border-gray-700'
                : 'bg-white text-gray-900 border border-gray-200'
            }
            animate-in slide-in-from-top-full
          `}
        >
          <div className={`w-1.5 ${toast.variant === 'destructive' ? 'bg-red-800' : 'bg-[#ff6600]'}`}></div>
          <div className="flex-1 p-4">
            <div className="flex items-start">
              <div className="flex-1">
                <p className="text-sm font-medium">{toast.title}</p>
                {toast.description && (
                  <p className="mt-1 text-sm opacity-90">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => onRemove(toast.id)}
                className={`
                  ml-4 inline-flex rounded-md focus:outline-none focus:ring-2
                  ${toast.variant === 'destructive'
                    ? 'text-white hover:text-gray-200 focus:ring-red-500'
                    : theme === 'dark'
                      ? 'text-gray-300 hover:text-white focus:ring-gray-600'
                      : 'text-gray-500 hover:text-gray-700 focus:ring-gray-300'
                  }
                `}
                aria-label="Close toast"
              >
                <span className="sr-only">Close</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const Toaster: React.FC = () => {
  const { toasts, removeToast } = useToast();
  
  return <ToastContainer toasts={toasts} onRemove={removeToast} />;
};