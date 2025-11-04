import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { config } from '../../config/environment';

interface AdminStatusIndicatorProps {
  showFullStatus?: boolean;
}

export const AdminStatusIndicator: React.FC<AdminStatusIndicatorProps> = ({ 
  showFullStatus = false 
}) => {
  const [backendStatus, setBackendStatus] = React.useState<'online' | 'offline' | 'checking'>('checking');
  const [lastCheck, setLastCheck] = React.useState<Date>(new Date());

  React.useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/health`, {
          method: 'GET',
          timeout: 5000,
        } as any);
        
        if (response.ok) {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      } catch (error) {
        setBackendStatus('offline');
      }
      setLastCheck(new Date());
    };

    // Check immediately
    checkBackendStatus();

    // Check every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!showFullStatus) {
    return (
      <Badge 
        variant={backendStatus === 'online' ? 'default' : 'secondary'}
        className="flex items-center gap-1"
      >
        {backendStatus === 'online' ? (
          <Wifi className="h-3 w-3" />
        ) : backendStatus === 'offline' ? (
          <WifiOff className="h-3 w-3" />
        ) : (
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {backendStatus === 'online' ? 'Online' : backendStatus === 'offline' ? 'Offline' : 'Checking...'}
      </Badge>
    );
  }

  return (
    <Alert className={`mb-4 ${backendStatus === 'online' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
      <div className="flex items-center gap-2">
        {backendStatus === 'online' ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : backendStatus === 'offline' ? (
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
        ) : (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        <AlertDescription className="flex-1">
          {backendStatus === 'online' && (
            <span className="text-green-800">
              <strong>Backend Online:</strong> All admin features are fully functional.
            </span>
          )}
          {backendStatus === 'offline' && (
            <span className="text-yellow-800">
              <strong>Offline Mode:</strong> Using sample data. Some features may be limited. 
              Backend will reconnect automatically when available.
            </span>
          )}
          {backendStatus === 'checking' && (
            <span className="text-gray-600">
              <strong>Checking Connection:</strong> Verifying backend status...
            </span>
          )}
        </AlertDescription>
        <div className="text-xs text-gray-500">
          Last check: {lastCheck.toLocaleTimeString()}
        </div>
      </div>
    </Alert>
  );
};