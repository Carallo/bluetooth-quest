import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bluetooth, Search, Wifi, WifiOff, Share } from 'lucide-react';
import { useBluetooth } from '@/hooks/useBluetooth';
import { useToast } from '@/hooks/use-toast';

interface BluetoothManagerProps {
  data?: any;
  filename?: string;
}

export const BluetoothManager = ({ data, filename = 'dnd-data.json' }: BluetoothManagerProps) => {
  const { toast } = useToast();
  const {
    isScanning,
    devices,
    isConnected,
    connectedDevice,
    scanForDevices,
    connectToDevice,
    disconnectDevice,
    shareDataViaBluetooth,
    initializeBluetooth
  } = useBluetooth();

  const handleInit = async () => {
    const success = await initializeBluetooth();
    if (success) {
      toast({
        title: "Bluetooth inicializado",
        description: "Bluetooth habilitado correctamente"
      });
    } else {
      toast({
        title: "Error de Bluetooth",
        description: "No se pudo inicializar Bluetooth",
        variant: "destructive"
      });
    }
  };

  const handleScan = async () => {
    await scanForDevices();
    toast({
      title: "Buscando dispositivos",
      description: "Escaneando dispositivos Bluetooth cercanos..."
    });
  };

  const handleShare = async () => {
    if (data) {
      await shareDataViaBluetooth(data, filename);
      toast({
        title: "Compartiendo datos",
        description: "Archivo listo para enviar"
      });
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
      </div>

      <div className="space-y-4">
        {/* Controles principales */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleInit} variant="outline">
            <Bluetooth className="w-4 h-4 mr-2" />
            Inicializar
          </Button>
          
          <Button 
            onClick={handleScan} 
            disabled={isScanning}
            variant="outline"
          >
            <Search className="w-4 h-4 mr-2" />
            {isScanning ? 'Buscando...' : 'Buscar Dispositivos'}
          </Button>

          {data && (
            <Button onClick={handleShare} variant="default">
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