import { registerPlugin, WebPlugin } from '@capacitor/core';
import type { BluetoothServerPlugin } from './definitions';

// Define the interface for the plugin
// This mirrors the methods exposed in the native Kotlin code (@PluginMethod)
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
}

const BluetoothServer = registerPlugin<BluetoothServerPlugin>('BluetoothServer', {
  web: () => import('./web').then(m => new m.BluetoothServerWeb()),
});

export * from './definitions';
export { BluetoothServer };


export class BluetoothServerWeb extends WebPlugin implements BluetoothServerPlugin {
  async requestBluetoothPermissions(): Promise<{ granted: boolean }> {
    throw this.unimplemented('Not implemented on web.');
  }

  async startServer(): Promise<{ status: string }> {
    throw this.unimplemented('Not implemented on web.');
  }

  async stopServer(): Promise<{ status: string }> {
    throw this.unimplemented('Not implemented on web.');
  }
}
