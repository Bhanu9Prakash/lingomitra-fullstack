import { useToast, ToastProps } from "@/hooks/use-toast";
import React from "react";

// Toast component to display toasts
function ToastContainer({ toasts, dismiss }: { toasts: ToastProps[], dismiss: (id: string) => void }) {
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

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return <ToastContainer toasts={toasts} dismiss={dismiss} />;
}