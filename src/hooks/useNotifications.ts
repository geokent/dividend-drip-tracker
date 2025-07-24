import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('Notification' in window);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support notifications",
        variant: "destructive"
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast({
          title: "Notifications enabled",
          description: "You'll receive dividend reminders and updates"
        });
        return true;
      } else {
        toast({
          title: "Notifications disabled",
          description: "Enable notifications to get dividend reminders",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      new Notification(title, {
        icon: '/lovable-uploads/180d1766-7c58-4527-890f-63957bc5fc9f.png',
        badge: '/lovable-uploads/180d1766-7c58-4527-890f-63957bc5fc9f.png',
        ...options
      });
    }
  };

  const scheduleDividendReminder = (stock: string, exDate: string, amount: number) => {
    const exDateObj = new Date(exDate);
    const reminderDate = new Date(exDateObj);
    reminderDate.setDate(reminderDate.getDate() - 1); // Remind 1 day before

    const now = new Date();
    const timeUntilReminder = reminderDate.getTime() - now.getTime();

    if (timeUntilReminder > 0) {
      setTimeout(() => {
        showNotification(`Dividend Alert - ${stock}`, {
          body: `Ex-dividend date tomorrow! Expected: $${amount.toFixed(2)}`,
          tag: `dividend-${stock}`,
          requireInteraction: true
        });
      }, timeUntilReminder);
    }
  };

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    scheduleDividendReminder
  };
};