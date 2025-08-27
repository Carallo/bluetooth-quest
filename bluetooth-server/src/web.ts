import { WebPlugin } from '@capacitor/core';
import type { BluetoothServerPlugin } from './definitions';

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async addListener(eventName: 'bleDataReceived', listenerFunc: (data: { value: string }) => void): Promise<any> {
    throw this.unimplemented('Not implemented on web.');
  }
}
