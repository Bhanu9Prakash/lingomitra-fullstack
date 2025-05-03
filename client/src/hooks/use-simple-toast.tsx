import { useToast } from "@/hooks/use-toast";
import { Toast } from "@/components/ui/toast";

export function useSimpleToast() {
  return useToast();
}