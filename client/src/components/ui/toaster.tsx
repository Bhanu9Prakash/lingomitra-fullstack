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
    <div className="fixed top-0 right-0 z-[99999] flex flex-col p-4 space-y-4 max-h-screen overflow-hidden pointer-events-none sm:max-w-[100%] max-w-full w-full sm:w-auto" style={{ zIndex: 99999 }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto flex w-full max-w-md overflow-hidden rounded-lg shadow-lg ring-1 
            ring-black ring-opacity-5 transition-all duration-300 ease-in-out transform translate-x-0
            ${toast.variant === 'destructive' ? 'bg-red-600 text-white dark:bg-red-700' : 
              'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'}
            animate-in slide-in-from-top-full sm:slide-in-from-top-full
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
  
  // Cast the toasts to the expected type
  return <ToastContainer 
    toasts={toasts as unknown as ToastProps[]} 
    dismiss={dismiss} 
  />;
}