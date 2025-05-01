import { useToast, ToastContainer } from "@/hooks/use-toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return <ToastContainer toasts={toasts} dismiss={dismiss} />;
}