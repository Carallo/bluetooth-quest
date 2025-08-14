import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EpicButton } from "@/components/ui/epic-button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useOfflineData } from "@/hooks/useOfflineData";
import { useBluetooth } from "@/hooks/useBluetooth";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  Upload, 
  Trash2, 
  Users, 
  Sword, 
  Package, 
  Settings,
  Wifi,
  WifiOff,
  Bluetooth
} from "lucide-react";

export const OfflineManager = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { data, exportData, importData, clearAllData } = useOfflineData();
  const { shareDataViaBluetooth, isConnected } = useBluetooth();
  const { toast } = useToast();

  // Detectar estado de conexión
  useState(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });

  const handleExportData = async () => {
    try {
      const dataString = exportData();
      if (isConnected) {
        await shareDataViaBluetooth(JSON.parse(dataString), 'dnd_backup.json');
        toast({
          title: "Datos enviados",
          description: "Los datos se han enviado via Bluetooth correctamente."
        });
      } else {
        // Crear archivo para descarga local
        const blob = new Blob([dataString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dnd_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Backup creado",
          description: "El archivo de respaldo se ha descargado."
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron exportar los datos.",
        variant: "destructive"
      });
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (importData(content)) {
            toast({
              title: "Datos importados",
              description: "Los datos se han restaurado correctamente."
            });
          } else {
            toast({
              title: "Error",
              description: "El archivo no tiene un formato válido.",
              variant: "destructive"
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClearData = () => {
    if (confirm('¿Estás seguro de que quieres borrar todos los datos? Esta acción no se puede deshacer.')) {
      clearAllData();
      toast({
        title: "Datos borrados",
        description: "Todos los datos locales han sido eliminados."
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Estado de conexión */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOnline ? <Wifi className="w-5 h-5 text-green-500" /> : <WifiOff className="w-5 h-5 text-red-500" />}
            Estado de Conexión
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant={isOnline ? "default" : "destructive"}>
              {isOnline ? "Online" : "Offline"}
            </Badge>
            <Badge variant={isConnected ? "default" : "secondary"} className="flex items-center gap-1">
              <Bluetooth className="w-3 h-3" />
              Bluetooth {isConnected ? "Conectado" : "Desconectado"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de datos almacenados */}
      <Card>
        <CardHeader>
          <CardTitle>Datos Almacenados Localmente</CardTitle>
          <CardDescription>
            Información guardada en tu dispositivo para uso offline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm">
                {data.characters.length} Personajes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Sword className="w-4 h-4 text-primary" />
              <span className="text-sm">
                {data.campaigns.length} Campañas
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <span className="text-sm">
                {data.inventory.length} Items
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              <span className="text-sm">
                Configuración guardada
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones de gestión de datos */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Datos</CardTitle>
          <CardDescription>
            Exporta, importa o elimina tus datos locales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <EpicButton 
            onClick={handleExportData} 
            className="w-full"
            variant="default"
          >
            <Download className="w-4 h-4 mr-2" />
            {isConnected ? "Enviar via Bluetooth" : "Exportar Backup"}
          </EpicButton>
          
          <EpicButton 
            onClick={handleImportData} 
            className="w-full"
            variant="outline"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar Backup
          </EpicButton>
          
          <Separator />
          
          <EpicButton 
            onClick={handleClearData} 
            className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Borrar Todos los Datos
          </EpicButton>
        </CardContent>
      </Card>

      {/* Información sobre uso offline */}
      <Card>
        <CardHeader>
          <CardTitle>Modo Offline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• Todos los datos se guardan automáticamente en tu dispositivo</p>
            <p>• La aplicación funciona completamente sin conexión</p>
            <p>• Puedes compartir datos via Bluetooth con otros dispositivos</p>
            <p>• Los backups te permiten restaurar datos en otros dispositivos</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};