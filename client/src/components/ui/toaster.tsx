import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { useEffect } from "react";

// Define the ToastProps type locally
type ToastProps = {
  id?: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
};

function ToastContainer({ toasts, dismiss }: { toasts: ToastProps[], dismiss: (id: string) => void }) {
  return (
    <div className="fixed top-0 right-0 z-50 flex flex-col p-4 space-y-4 max-h-screen overflow-hidden pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto flex w-full max-w-md overflow-hidden rounded-lg shadow-lg ring-1 
            ring-black ring-opacity-5 transition-all duration-300 ease-in-out transform translate-x-0
            ${toast.variant === 'destructive' ? 'bg-destructive text-destructive-foreground' : 
              'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'}
          `}
        >
          <div className="flex-1 p-4">
            <div className="flex items-start">
              <div className="flex-1">
                <p className="text-sm font-medium">{toast.title}</p>
                {toast.description && (
                  <p className="mt-1 text-sm opacity-90">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(toast.id || '')}
                className="ml-4 inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
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
}

export function Toaster() {
  const { toasts, dismiss } = useToast();
  
  return <ToastContainer toasts={toasts} dismiss={dismiss} />;
}