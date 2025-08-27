import { registerPlugin } from '@capacitor/core';

// Define the interface for the plugin
// This mirrors the methods exposed in the native Kotlin code (@PluginMethod)
import { PluginListenerHandle } from '@capacitor/core';

export interface BluetoothServerPlugin {
  /**
   * Requests necessary Bluetooth permissions from the user.
   * This is required on Android 12+ before starting the server.
   * @returns A promise that resolves if permissions are granted.
   */
  requestBluetoothPermissions(): Promise<{ granted: boolean }>;

  /**
   * Starts the BLE GATT server.
   * @returns A promise that resolves with an object containing the server status.
   */
  startServer(): Promise<{ status: string }>;

  /**
   * Stops the BLE GATT server.
   * @returns A promise that resolves with an object containing the server status.
   */
  stopServer(): Promise<{ status: string }>;

  /**
   * Listens for data received from a client device.
   * @param eventName The event to listen for (`bleDataReceived`).
   * @param listenerFunc The function to execute when data is received.
   * @returns A promise that resolves with a listener handle.
   */
  addListener(
    eventName: 'bleDataReceived',
    listenerFunc: (data: { value: string }) => void,
  ): Promise<PluginListenerHandle>;
}

// Register the plugin with Capacitor
const BluetoothServer = registerPlugin<BluetoothServerPlugin>('BluetoothServer');

export default BluetoothServer;
