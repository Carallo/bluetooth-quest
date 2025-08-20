import { registerPlugin } from '@capacitor/core';

// Define the interface for the plugin
// This mirrors the methods exposed in the native Kotlin code (@PluginMethod)
export interface BluetoothServerPlugin {
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
}

// Register the plugin with Capacitor
const BluetoothServer = registerPlugin<BluetoothServerPlugin>('BluetoothServer');

export default BluetoothServer;
