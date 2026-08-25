import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
interface SubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: number;
    username: string;
    subscriptionTier: string | null;
    subscriptionExpiry: Date | string | null;
  };
  onSave: (userId: number, subscriptionTier: string, subscriptionExpiry?: Date) => Promise<void>;
}

const SUBSCRIPTION_TIERS = [
  { value: 'free', label: 'Free' },
  { value: 'basic', label: 'Basic' },
  { value: 'premium', label: 'Premium' },
  { value: 'pro', label: 'Professional' }
];

export default function SubscriptionDialog({ isOpen, onClose, user, onSave }: SubscriptionDialogProps) {
  const [subscriptionTier, setSubscriptionTier] = useState<string>(user?.subscriptionTier || 'free');
  const [subscriptionExpiry, setSubscriptionExpiry] = useState<Date | undefined>(
    user?.subscriptionExpiry ? new Date(user.subscriptionExpiry) : undefined
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await onSave(user.id, subscriptionTier, subscriptionExpiry);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update subscription');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Subscription</DialogTitle>
          <DialogDescription>
            Change the subscription tier and expiry date for {user?.username}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subscription-tier" className="text-right">
              Tier
            </Label>
            <Select 
              value={subscriptionTier} 
              onValueChange={setSubscriptionTier}
            >
              <SelectTrigger id="subscription-tier" className="col-span-3">
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                {SUBSCRIPTION_TIERS.map(tier => (
                  <SelectItem key={tier.value} value={tier.value}>
                    {tier.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="expiry-date" className="text-right">
              Expiry
            </Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="expiry-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !subscriptionExpiry && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {subscriptionExpiry ? (
                      format(subscriptionExpiry, "PPP")
                    ) : (
                      <span>No expiry (unlimited)</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={subscriptionExpiry}
                    onSelect={setSubscriptionExpiry}
                    initialFocus
                  />
                  <div className="p-3 border-t border-border">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSubscriptionExpiry(undefined)}
                    >
                      Clear Date (No Expiry)
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/15 border border-destructive text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}