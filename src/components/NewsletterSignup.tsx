import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Valid email required",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('newsletter-signup', {
        body: { 
          email: email.toLowerCase().trim(),
          source: 'website'
        }
      });

      if (error) {
        // Check if it's a rate limit error
        if (error.message && error.message.includes('Too many requests')) {
          toast({
            title: "Rate limit exceeded",
            description: "Too many signup attempts. Please try again in an hour.",
            variant: "destructive"
          });
          return;
        }
        console.error('Newsletter signup error:', error);
        throw error;
      }
      
      setIsSubscribed(true);
      setEmail('');
      toast({
        title: "Success!",
        description: data.message || "You've been subscribed to our dividend investing newsletter"
      });
      
      // Track conversion event
      if (typeof (window as any).gtag !== 'undefined') {
        (window as any).gtag('event', 'newsletter_signup', {
          event_category: 'engagement',
          event_label: 'header_newsletter'
        });
      }
      
    } catch (error) {
      console.error('Newsletter signup error:', error);
      toast({
        title: "Subscription failed",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium text-primary">Successfully subscribed!</p>
            <p className="text-xs text-muted-foreground">Check your email for confirmation</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Free Dividend Insights</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Get weekly dividend stock picks and income strategies
        </p>
        <form onSubmit={handleSubmit} className="space-y-2">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-8 text-xs"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="sm" 
            className="w-full h-8 text-xs"
            disabled={isLoading}
          >
            {isLoading ? 'Subscribing...' : 'Get Free Insights'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};