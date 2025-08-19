import { useState, useCallback } from 'react';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { Share } from '@capacitor/share';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { useOfflineData } from './useOfflineData';

const COMBAT_SERVICE_UUID = '49535343-FE7D-4AE5-8FA9-9FAFD205E455';
const COMBAT_STATE_CHARACTERISTIC_UUID = '49535343-1E4D-4BD9-BA61-23C647249616';
const CHARACTER_SHARE_SERVICE_UUID = '49535343-2E2D-4AE5-8FA9-9FAFD205E455';
const CHARACTER_DATA_CHARACTERISTIC_UUID = '49535343-3E4D-4BD9-BA61-23C647249616';

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
      console.warn('Bluetooth solo disponible en plataformas nativas.');
      return false;
    }
    try {
      await BleClient.initialize({ androidNeverForLocation: false });
      return true;
    } catch (error: any) {
      console.error('Error al inicializar Bluetooth:', error);
      if (error.message.includes('permissions')) {
        throw new Error('Se necesitan permisos de ubicación para buscar dispositivos Bluetooth.');
      }
      throw new Error('Por favor, activa el Bluetooth para continuar.');
    }
  }, []);

  const scanForDevices = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      setDevices([{ id: 'sim1', name: 'Dispositivo Simulado 1', rssi: -45 }]);
      return;
    }
    try {
      await initializeBluetooth();
      setIsScanning(true);
      setDevices([]);
      await BleClient.requestLEScan({ services: [COMBAT_SERVICE_UUID] }, (result) => {
        setDevices(prev => !prev.some(d => d.id === result.device.deviceId) ? [...prev, { id: result.device.deviceId, name: result.device.name || 'Dispositivo desconocido', rssi: result.rssi }] : prev);
      });
      setTimeout(async () => {
        await BleClient.stopLEScan();
        setIsScanning(false);
      }, 10000);
    } catch (error: any) {
      setIsScanning(false);
      console.error('Error al escanear:', error);
      throw new Error(`Error al escanear: ${error.message}`);
    }
  }, [initializeBluetooth]);

  const connectToDevice = useCallback(async (deviceId: string) => {
    if (!Capacitor.isNativePlatform()) {
      const device = devices.find(d => d.id === deviceId);
      if (device) {
        setConnectedDevice(device);
        setIsConnected(true);
      }
      return;
    }
    try {
      await BleClient.connect(deviceId, () => disconnectDevice());
      const device = devices.find(d => d.id === deviceId);
      setConnectedDevice(device || { id: deviceId, name: 'Dispositivo Conectado' });
      setIsConnected(true);
    } catch (error) {
      console.error('Error al conectar:', error);
      throw new Error('No se pudo conectar al dispositivo.');
    }
  }, [devices]);

  const disconnectDevice = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      setConnectedDevice(null);
      setIsConnected(false);
      return;
    }
    try {
      if (connectedDevice) await BleClient.disconnect(connectedDevice.id);
    } catch (error) {
      console.error('Error al desconectar:', error);
    } finally {
      setConnectedDevice(null);
      setIsConnected(false);
    }
  }, [connectedDevice]);

  const shareDataViaBluetooth = useCallback(async (data: unknown, filename: string) => {
    const jsonData = JSON.stringify(data, null, 2);
    if (Capacitor.isNativePlatform()) {
      const result = await Filesystem.writeFile({ path: filename, data: jsonData, directory: Directory.Cache, encoding: Encoding.UTF8 });
      await Share.share({ title: 'Compartir datos D&D', text: 'Datos de personaje/campaña', url: result.uri, dialogTitle: 'Enviar vía Bluetooth' });
    } else {
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
  }, []);

  const importDataViaBluetooth = useCallback(async () => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json,.json';
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const content = e.target?.result as string;
              const success = importData(content);
              if(success) resolve(true);
              else reject(new Error('Fallo al parsear el JSON.'));
            } catch (error) { reject(error); }
          };
          reader.onerror = reject;
          reader.readAsText(file);
        } else {
          reject(new Error('No se seleccionó ningún archivo.'));
        }
      };
      input.click();
    });
  }, [importData]);

  // --- Funciones para Sincronización en Tiempo Real ---

  const startServer = async (onCharacterReceived: (charData: string) => void) => {
    if (!Capacitor.isNativePlatform()) return;
    await initializeBluetooth();
    await BleClient.createBleServer();
    await BleClient.addService(COMBAT_SERVICE_UUID, true);
    await BleClient.addService(CHARACTER_SHARE_SERVICE_UUID, true);

    // Start listening for character data writes
    await BleClient.startNotifications(
        '', // deviceId is not needed for server notifications
        CHARACTER_SHARE_SERVICE_UUID,
        CHARACTER_DATA_CHARACTERISTIC_UUID,
        (value) => {
            const charData = new TextDecoder().decode(value);
            onCharacterReceived(charData);
        }
    );
  };

  const startCombatServer = async () => {
    if (!Capacitor.isNativePlatform()) return;
    await initializeBluetooth();
    await BleClient.createBleServer();
    await BleClient.addService(COMBAT_SERVICE_UUID, true);
  };

  const stopServer = async () => {
    if (!Capacitor.isNativePlatform()) return;
    await BleClient.closeBleServer();
  };

  const updateCombatState = async (state: string) => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const value = new TextEncoder().encode(state);
      await BleClient.notify({
        service: COMBAT_SERVICE_UUID,
        characteristic: COMBAT_STATE_CHARACTERISTIC_UUID,
        value,
      });
    } catch (error) {
      console.error('Error al notificar estado de combate:', error);
    }
  };

  const startClient = async (deviceId: string, onUpdate: (state: string) => void) => {
    if (!Capacitor.isNativePlatform()) return;
    await connectToDevice(deviceId);
    await BleClient.startNotifications(
      deviceId,
      COMBAT_SERVICE_UUID,
      COMBAT_STATE_CHARACTERISTIC_UUID,
      (value) => {
        const state = new TextDecoder().decode(value);
        onUpdate(state);
      }
    );
  };

  const shareCharacterOverBLE = async (characterData: string) => {
      if (!connectedDevice) throw new Error("No hay un dispositivo conectado.");
      if (!Capacitor.isNativePlatform()) return;

      const value = new TextEncoder().encode(characterData);
      await BleClient.write(
          connectedDevice.id,
          CHARACTER_SHARE_SERVICE_UUID,
          CHARACTER_DATA_CHARACTERISTIC_UUID,
          value
      );
  }

  const stopClient = async () => {
    if (connectedDevice) {
      try {
        await BleClient.stopNotifications(connectedDevice.id, COMBAT_SERVICE_UUID, COMBAT_STATE_CHARACTERISTIC_UUID);
      } catch (error) {
        console.error("Error al detener notificaciones: ", error)
      }
    }
    await disconnectDevice();
  };

  return {
    isScanning, devices, isConnected, connectedDevice,
    scanForDevices, connectToDevice, disconnectDevice,
    shareDataViaBluetooth, importDataViaBluetooth, initializeBluetooth,
    startServer, stopServer, updateCombatState, startClient, stopClient, shareCharacterOverBLE,
    startCombatServer,
  };
}