import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Badge 
      variant={isOnline ? "default" : "destructive"}
      className="fixed top-4 right-4 z-50"
    >
      {isOnline ? (
        <>
          <Wifi className="w-3 h-3 mr-1" />
          En línea
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3 mr-1" />
          Sin conexión
        </>
      )}
    </Badge>
  );
};