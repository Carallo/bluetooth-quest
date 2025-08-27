// BluetoothManager: A reusable component for managing Bluetooth connections.
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bluetooth, Search, Wifi, WifiOff, Share, Server, ServerOff } from 'lucide-react';
import { useBluetooth } from '@/hooks/useBluetooth';
import { useToast } from '@/hooks/use-toast';

interface BluetoothManagerProps {
  data?: any;
}

export const BluetoothManager = ({ data }: BluetoothManagerProps) => {
  const { toast } = useToast();
  const {
    isScanning,
    devices,
    isConnected,
    connectedDevice,
    isServerRunning,
    scanForDevices,
    connectToDevice,
    disconnectDevice,
    startServer,
    stopServer,
    shareDataOverBLE,
  } = useBluetooth();

  const handleScan = async () => {
    try {
      await scanForDevices();
      toast({
        title: "Buscando dispositivos",
        description: "Escaneando dispositivos Bluetooth cercanos...",
      });
    } catch (error) {
      toast({ title: "Error de Escaneo", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleShare = async () => {
    if (data && isConnected) {
      try {
        await shareDataOverBLE(data);
        toast({
          title: "Datos Compartidos",
          description: "Los datos se enviaron correctamente.",
        });
      } catch (error) {
        toast({ title: "Error al Compartir", description: (error as Error).message, variant: "destructive" });
      }
    }
  };

  const handleStartServer = async () => {
    try {
      await startServer();
      toast({ title: "Servidor Iniciado", description: "El dispositivo ahora es visible para otros." });
    } catch (error) {
      toast({ title: "Error de Servidor", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleStopServer = async () => {
    try {
      await stopServer();
      toast({ title: "Servidor Detenido", description: "El dispositivo ya no es visible." });
    } catch (error) {
      toast({ title: "Error de Servidor", description: (error as Error).message, variant: "destructive" });
    }
  };


  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Bluetooth className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Bluetooth Manager</h2>
        {isConnected && (
          <Badge variant="default" className="bg-green-500">
            Conectado
          </Badge>
        )}
        {isServerRunning && (
          <Badge variant="default" className="bg-blue-500">
            Servidor Activo
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        {/* Controles principales */}
        <div className="flex gap-2 flex-wrap">
          {!isServerRunning && (
            <Button onClick={handleStartServer} variant="outline">
              <Server className="w-4 h-4 mr-2" />
              Iniciar Servidor
            </Button>
          )}
          {isServerRunning && (
            <Button onClick={handleStopServer} variant="destructive">
              <ServerOff className="w-4 h-4 mr-2" />
              Detener Servidor
            </Button>
          )}
          
          <Button 
            onClick={handleScan} 
            disabled={isScanning || isServerRunning}
            variant="outline"
          >
            <Search className="w-4 h-4 mr-2" />
            {isScanning ? 'Buscando...' : 'Buscar Dispositivos'}
          </Button>

          {data && (
            <Button onClick={handleShare} disabled={!isConnected}>
              <Share className="w-4 h-4 mr-2" />
              Compartir Datos
            </Button>
          )}
        </div>

        {/* Dispositivo conectado */}
        {connectedDevice && (
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-green-600" />
                <span className="font-medium">{connectedDevice.name}</span>
                <Badge variant="secondary">{connectedDevice.id}</Badge>
              </div>
              <Button 
                onClick={disconnectDevice}
                variant="outline"
                size="sm"
              >
                <WifiOff className="w-4 h-4 mr-1" />
                Desconectar
              </Button>
            </div>
          </Card>
        )}

        {/* Lista de dispositivos */}
        {devices.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground">
              Dispositivos encontrados ({devices.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {devices.map((device) => (
                <Card 
                  key={device.id} 
                  className="p-3 hover:bg-muted/50 cursor-pointer"
                  onClick={() => connectToDevice(device.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bluetooth className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">
                        {device.name || 'Dispositivo desconocido'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {device.rssi && (
                        <Badge variant="outline" className="text-xs">
                          {device.rssi} dBm
                        </Badge>
                      )}
                      <Button size="sm" variant="ghost">
                        Conectar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Estado de escaneo */}
        {isScanning && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">
              Buscando dispositivos Bluetooth...
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};