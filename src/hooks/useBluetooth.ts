import { useState, useCallback, useEffect } from 'react';
import { BleClient, numbersToDataView, textToDataView } from '@capacitor-community/bluetooth-le';
import { Capacitor } from '@capacitor/core';
import { useOfflineData } from './useOfflineData';
import BluetoothServer from '@/plugins/bluetoothServer'; // Import the custom plugin
import { PluginListenerHandle } from '@capacitor/core';

// UUIDs now match the custom native plugin
const SERVICE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';
const CHARACTERISTIC_UUID = '00002a37-0000-1000-8000-00805f9b34fb';

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
  const [isServerRunning, setIsServerRunning] = useState(false);

  // Listener handle for cleanup
  useEffect(() => {
    let listener: PluginListenerHandle | null = null;
    if (isServerRunning) {
      BluetoothServer.addListener('bleDataReceived', (data) => {
        console.log('Data received from native:', data.value);
        const success = importData(data.value);
        if (!success) {
            console.error("Failed to import received data.");
        }
      }).then(l => listener = l);
    }
    return () => {
      listener?.remove();
    };
  }, [isServerRunning, importData]);


  const initializeBluetooth = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      console.warn('Bluetooth is only available on native platforms.');
      return false;
    }
    try {
      await BleClient.initialize({ androidNeverForLocation: false });
      return true;
    } catch (error: any) {
      console.error('Error initializing Bluetooth:', error);
      if (error.message.includes('permissions')) {
        throw new Error('Location permissions are required to find Bluetooth devices.');
      }
      throw new Error('Please enable Bluetooth to continue.');
    }
  }, []);

  const scanForDevices = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      setDevices([{ id: 'sim1', name: 'Simulated Device 1', rssi: -45 }]);
      return;
    }
    try {
      await initializeBluetooth();
      setIsScanning(true);
      setDevices([]);
      // Scan for the specific service UUID from our custom plugin
      await BleClient.requestLEScan({ services: [SERVICE_UUID] }, (result) => {
        setDevices(prev => !prev.some(d => d.id === result.device.deviceId) ? [...prev, { id: result.device.deviceId, name: result.device.name || 'Unknown Device', rssi: result.rssi }] : prev);
      });
      setTimeout(async () => {
        await BleClient.stopLEScan();
        setIsScanning(false);
      }, 10000);
    } catch (error: any) {
      setIsScanning(false);
      console.error('Error scanning:', error);
      throw new Error(`Error scanning: ${error.message}`);
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
      setConnectedDevice(device || { id: deviceId, name: 'Connected Device' });
      setIsConnected(true);
    } catch (error) {
      console.error('Error connecting:', error);
      throw new Error('Could not connect to the device.');
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
      console.error('Error disconnecting:', error);
    } finally {
      setConnectedDevice(null);
      setIsConnected(false);
    }
  }, [connectedDevice]);

  // --- NEW Server and Data Transfer Logic using Custom Plugin ---

  const startServer = async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await BluetoothServer.requestBluetoothPermissions();
      await BluetoothServer.startServer();
      setIsServerRunning(true);
      console.log('Custom Bluetooth Server started successfully.');
    } catch (error) {
      console.error('Failed to start custom server:', error);
      throw error;
    }
  };

  const stopServer = async () => {
    if (!Capacitor.isNativePlatform() || !isServerRunning) return;
    try {
      await BluetoothServer.stopServer();
      setIsServerRunning(false);
      console.log('Custom Bluetooth Server stopped.');
    } catch (error) {
      console.error('Failed to stop custom server:', error);
    }
  };

  const shareDataOverBLE = async (data: object) => {
    if (!connectedDevice || !Capacitor.isNativePlatform()) {
      throw new Error("Not connected to any device.");
    }
    try {
      const jsonString = JSON.stringify(data);
      // The client uses BleClient to write to the server's characteristic
      await BleClient.write(
        connectedDevice.id,
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        textToDataView(jsonString)
      );
      console.log('Data shared successfully via BLE.');
    } catch (error) {
      console.error('Failed to share data over BLE:', error);
      throw new Error('Data transfer failed.');
    }
  };

  return {
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
    initializeBluetooth,
  };
}