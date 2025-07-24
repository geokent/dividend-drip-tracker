import { Button } from "@/components/ui/button";
import { Download, Smartphone } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";

export const PWAInstallButton = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const { permission, requestPermission } = useNotifications();
  const { toast } = useToast();

  const handleInstall = async () => {
    await installApp();
    
    // After installing, offer to enable notifications
    if (permission !== 'granted') {
      setTimeout(() => {
        toast({
          title: "Enable Notifications?",
          description: "Get dividend alerts and reminders",
          action: (
            <Button size="sm" onClick={requestPermission}>
              Enable
            </Button>
          ),
        });
      }, 2000);
    }
  };

  if (isInstalled) {
    return (
      <div className="flex items-center text-sm text-muted-foreground">
        <Smartphone className="h-4 w-4 mr-2" />
        App Installed
      </div>
    );
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleInstall}
      className="flex items-center"
    >
      <Download className="h-4 w-4 mr-2" />
      Install App
    </Button>
  );
};