import { useState, useCallback, useRef } from 'react';
import { BleClient, BleDevice } from '@capacitor-community/bluetooth-le';
import { Share } from '@capacitor/share';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { useOfflineData } from './useOfflineData';

// Publicly known service and characteristic UUIDs for the app
const COMBAT_SERVICE_UUID = '49535343-FE7D-4AE5-8FA9-9FAFD205E455';
const COMBAT_STATE_CHARACTERISTIC_UUID = '49535343-1E4D-4BD9-BA61-23C647249616';

export interface BluetoothDevice {
  id: string;
  name?: string;
  rssi?: number;
}

export function useBluetooth() {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const { importData } = useOfflineData();
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  const initializeBluetooth = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      console.warn('Bluetooth only available on native platforms');
      return false;
    }

    try {
      await BleClient.initialize();
      return true;
    } catch (error) {
      console.error('Error initializing Bluetooth:', error);
      return false;
    }
  }, []);

  const scanForDevices = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      // Simulación para web
      setDevices([
        { id: 'sim1', name: 'Dispositivo Simulado 1', rssi: -45 },
        { id: 'sim2', name: 'Dispositivo Simulado 2', rssi: -67 }
      ]);
      return;
    }

    try {
      await initializeBluetooth();
      setIsScanning(true);
      setDevices([]);

      await BleClient.requestLEScan({}, (result) => {
        setDevices(prev => {
          const exists = prev.find(d => d.id === result.device.deviceId);
          if (!exists) {
            return [...prev, {
              id: result.device.deviceId,
              name: result.device.name || 'Dispositivo desconocido',
              rssi: result.rssi
            }];
          }
          return prev;
        });
      });

      // Detener escaneo después de 10 segundos
      setTimeout(async () => {
        await BleClient.stopLEScan();
        setIsScanning(false);
      }, 10000);

    } catch (error) {
      console.error('Error scanning for devices:', error);
      setIsScanning(false);
    }
  }, [initializeBluetooth]);

  const connectToDevice = useCallback(async (deviceId: string) => {
    if (!Capacitor.isNativePlatform()) {
      // Simulación para web
      const device = devices.find(d => d.id === deviceId);
      if (device) {
        setConnectedDevice(device);
        setIsConnected(true);
      }
      return;
    }

    try {
      await BleClient.connect(deviceId);
      const device = devices.find(d => d.id === deviceId);
      setConnectedDevice(device || null);
      setIsConnected(true);
    } catch (error) {
      console.error('Error connecting to device:', error);
    }
  }, [devices]);

  const disconnectDevice = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      setConnectedDevice(null);
      setIsConnected(false);
      return;
    }

    try {
      if (connectedDevice) {
        await BleClient.disconnect(connectedDevice.id);
      }
      setConnectedDevice(null);
      setIsConnected(false);
    } catch (error) {
      console.error('Error disconnecting device:', error);
    }
  }, [connectedDevice]);

  const shareDataViaBluetooth = useCallback(async (data: unknown, filename: string) => {
    try {
      // Crear archivo temporal
      const jsonData = JSON.stringify(data, null, 2);
      
      if (Capacitor.isNativePlatform()) {
        const result = await Filesystem.writeFile({
          path: filename,
          data: jsonData,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });

        // Compartir archivo
        await Share.share({
          title: 'Compartir datos D&D',
          text: 'Datos de personaje/campaña',
          url: result.uri,
          dialogTitle: 'Enviar vía Bluetooth'
        });
      } else {
        // Fallback para web - descargar archivo
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error sharing data:', error);
    }
  }, []);

  const importDataViaBluetooth = useCallback(async () => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json,.json';
      input.onchange = (event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const content = e.target?.result as string;
              const success = importData(content);
              if(success) {
                resolve(true);
              } else {
                reject(new Error('Failed to parse JSON.'));
              }
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = reject;
          reader.readAsText(file);
        } else {
          reject(new Error('No file selected.'));
        }
      };
      input.click();
    });
  }, [importData]);

  // --- Funciones para Sincronización en Tiempo Real ---

  const startServer = async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await initializeBluetooth();
      await BleClient.createBleServer();
      await BleClient.addService(COMBAT_SERVICE_UUID, true);
      console.log('Servidor BLE iniciado');
    } catch (error) {
      console.error('Error al iniciar servidor BLE:', error);
    }
  };

  const stopServer = async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await BleClient.closeBleServer();
      console.log('Servidor BLE detenido');
    } catch (error) {
      console.error('Error al detener servidor BLE:', error);
    }
  };

  const updateCombatState = async (state: string) => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const value = new TextEncoder().encode(state);
      await BleClient.write(COMBAT_SERVICE_UUID, COMBAT_STATE_CHARACTERISTIC_UUID, value);
    } catch (error) {
      console.error('Error al actualizar estado de combate:', error);
    }
  };

  const startClient = async (deviceId: string, onUpdate: (state: string) => void) => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await connectToDevice(deviceId);
      pollingInterval.current = setInterval(async () => {
        try {
          const value = await BleClient.read(deviceId, COMBAT_SERVICE_UUID, COMBAT_STATE_CHARACTERISTIC_UUID);
          const state = new TextDecoder().decode(value);
          onUpdate(state);
        } catch (error) {
          console.error('Error de sondeo BLE:', error);
        }
      }, 2000); // Poll every 2 seconds
    } catch (error) {
      console.error('Error al iniciar cliente BLE:', error);
    }
  };

  const stopClient = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
    disconnectDevice();
  };


  return {
    isScanning,
    devices,
    isConnected,
    connectedDevice,
    scanForDevices,
    connectToDevice,
    disconnectDevice,
    shareDataViaBluetooth,
    importDataViaBluetooth,
    initializeBluetooth,
    // Real-time sync functions
    startServer,
    stopServer,
    updateCombatState,
    startClient,
    stopClient,
  };
}