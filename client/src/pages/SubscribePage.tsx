import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Check, CreditCard, Zap, Star, Award, Gift } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { useSimpleToast } from '@/hooks/use-simple-toast';
import { useLocation } from 'wouter';

export default function SubscribePage() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useSimpleToast();
  const [_, navigate] = useLocation();
  
  const handleSelectPlan = (plan: 'monthly' | 'annual') => {
    setSelectedPlan(plan);
    trackEvent('subscription_plan_selected', { plan });
  };
  
  const handleSubscribe = () => {
    setIsProcessing(true);
    
    // This would normally initiate a Stripe checkout
    // For now, just simulate the process
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: 'Coming Soon',
        description: 'Payment processing is not yet implemented. Check back soon!',
        variant: 'default',
      });
      
      trackEvent('subscription_initiated', { 
        plan: selectedPlan,
        amount: selectedPlan === 'monthly' ? 9.99 : 89.99
      });
    }, 1500);
  };
  
  return (
    <div className="container py-10 max-w-5xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Choose Your Subscription Plan</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Unlock full access to all languages, voice recognition, and personalized learning with premium.
        </p>
      </div>
      
      <div className="flex gap-6 flex-col md:flex-row">
        {/* Monthly Plan */}
        <Card className={`flex-1 border-2 transition-all ${selectedPlan === 'monthly' ? 'border-primary shadow-lg' : 'border-border'}`}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">Monthly Premium</CardTitle>
                <CardDescription>Perfect for short-term learning</CardDescription>
              </div>
              <Star className={`h-6 w-6 ${selectedPlan === 'monthly' ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <span className="text-3xl font-bold">$9.99</span>
              <span className="text-muted-foreground"> /month</span>
            </div>
            
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                <span>Unlimited access to all languages</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                <span>AI-powered speaking feedback</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                <span>Personal AI tutor for each lesson</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                <span>Download lessons for offline learning</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              variant={selectedPlan === 'monthly' ? 'default' : 'outline'}
              onClick={() => handleSelectPlan('monthly')}
            >
              {selectedPlan === 'monthly' ? 'Selected' : 'Select Plan'}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Annual Plan */}
        <Card className={`flex-1 border-2 transition-all ${selectedPlan === 'annual' ? 'border-primary shadow-lg' : 'border-border'}`}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">Annual Premium</CardTitle>
                <CardDescription>Our most popular plan</CardDescription>
              </div>
              <Award className={`h-6 w-6 ${selectedPlan === 'annual' ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm px-3 py-1 rounded-full w-fit mt-2">
              Save 25%
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <span className="text-3xl font-bold">$89.99</span>
              <span className="text-muted-foreground"> /year</span>
              <div className="text-sm text-muted-foreground">Just $7.50/month, billed annually</div>
            </div>
            
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                <span>Everything in monthly plan</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                <span>Priority customer support</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                <span>Early access to new languages</span>
              </li>
              <li className="flex items-start">
                <Gift className="h-5 w-5 mr-2 text-amber-500 shrink-0 mt-0.5" />
                <span className="font-medium">1 month free</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              variant={selectedPlan === 'annual' ? 'default' : 'outline'}
              onClick={() => handleSelectPlan('annual')}
            >
              {selectedPlan === 'annual' ? 'Selected' : 'Select Plan'}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-8 flex flex-col items-center">
        <Button 
          size="lg" 
          className="px-8 py-6 text-lg font-semibold flex items-center gap-2 w-full sm:w-auto"
          onClick={handleSubscribe}
          disabled={isProcessing}
        >
          <CreditCard className="h-5 w-5" />
          {isProcessing ? 'Processing...' : `Subscribe ${selectedPlan === 'monthly' ? 'Monthly' : 'Annually'}`}
        </Button>
        
        <div className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
          <span>Secure payment</span>
          <span>•</span>
          <span>Cancel anytime</span>
          <span>•</span>
          <span>7-day money back guarantee</span>
        </div>
        
        <Button 
          variant="link" 
          className="mt-6"
          onClick={() => navigate('/')}
        >
          Continue with Free Plan
        </Button>
      </div>
    </div>
  );
}