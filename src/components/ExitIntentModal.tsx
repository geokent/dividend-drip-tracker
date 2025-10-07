import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gift, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExitIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExitIntentModal = ({ isOpen, onClose }: ExitIntentModalProps) => {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check - if filled, silently reject (bot detected)
    if (honeypot) {
      console.log('Bot detected via honeypot');
      onClose();
      return;
    }
    
    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }
    
    if (!emailRegex.test(trimmedEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('https://fdvpmommvnakoxggnjvt.supabase.co/functions/v1/exit-intent-capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmedEmail.toLowerCase(),
          userAgent: navigator.userAgent,
          ipAddress: null,
          honeypot: honeypot
        })
      });

      const data = await response.json();

      // Handle rate limiting
      if (response.status === 429) {
        const retryMinutes = data.retry_after_minutes || 60;
        toast({
          title: "Rate limit exceeded",
          description: `Too many requests. Please try again in ${retryMinutes} minutes.`,
          variant: "destructive"
        });
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send guide');
      }

      toast({
        title: "Success!",
        description: data.message || "Check your email for the free dividend investing guide"
      });
      
      // Track conversion
      if (typeof (window as any).gtag !== 'undefined') {
        (window as any).gtag('event', 'lead_capture', {
          event_category: 'conversion',
          event_label: 'exit_intent_guide'
        });
      }
      
      onClose();
      
    } catch (error: any) {
      console.error('Exit intent capture error:', error);
      toast({
        title: "Something went wrong",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Gift className="h-6 w-6 text-primary" />
            <DialogTitle className="text-xl">Wait! Don't Miss Out</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            Get our <strong>free guide</strong> to building a $100k dividend portfolio. 
            Learn the exact strategies successful dividend investors use.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-primary/5 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">What you'll learn:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Top 10 dividend stocks for beginners</li>
              <li>• How to analyze dividend safety</li>
              <li>• Portfolio allocation strategies</li>
              <li>• Tax-efficient dividend investing</li>
            </ul>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Honeypot field - hidden from users, catches bots */}
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              style={{ position: 'absolute', left: '-9999px' }}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Me The Guide'}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </form>
          
          <p className="text-xs text-muted-foreground text-center">
            No spam. Unsubscribe anytime. Your email is safe with us.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};