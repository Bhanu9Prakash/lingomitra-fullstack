import { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LockIcon, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  languageCode: string;
}

export default function PaywallModal({ isOpen, onClose, lessonId, languageCode }: PaywallModalProps) {
  const [_, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubscribeClick = () => {
    // Track subscription view event
    trackEvent('subscription_view', {
      source: 'lesson_paywall',
      lesson_id: lessonId,
      language_code: languageCode
    });
    
    // Simulate loading state for better UX
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to subscribe page
      navigate('/subscribe');
      // Close modal
      onClose();
    }, 500);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <LockIcon className="h-5 w-5 text-amber-500" />
            <span>Unlock Premium Learning</span>
          </DialogTitle>
          <DialogDescription>
            You've completed 2 free lessons! Continue your language journey with premium access.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-900">
            <h3 className="font-bold text-lg text-amber-700 dark:text-amber-400 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-amber-500" />
              Premium Benefits
            </h3>
            
            <ul className="mt-3 space-y-2">
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                <span>Unlimited access to all language lessons</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                <span>Voice recognition practice with accurate feedback</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                <span>Personalized AI tutor to accelerate learning</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                <span>Download lessons for offline learning</span>
              </li>
            </ul>
          </div>
          
          <div className="py-2 px-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Current Plan</p>
                <p className="text-sm text-muted-foreground">Free (2 lessons)</p>
              </div>
              <XCircle className="h-5 w-5 text-gray-500" />
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-col gap-2 sm:gap-2">
          <Button 
            onClick={handleSubscribeClick} 
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Subscribe Now'}
          </Button>
          
          <DialogClose asChild>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                trackEvent('paywall_dismissed', {
                  lesson_id: lessonId,
                  language_code: languageCode
                });
              }}
            >
              Maybe Later
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}