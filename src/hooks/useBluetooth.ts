import { useState, useCallback } from 'react';
import { BleClient, BleDevice } from '@capacitor-community/bluetooth-le';
import { Share } from '@capacitor/share';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { useOfflineData } from './useOfflineData';

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

  const shareDataViaBluetooth = useCallback(async (data: any, filename: string) => {
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
    initializeBluetooth
  };
}