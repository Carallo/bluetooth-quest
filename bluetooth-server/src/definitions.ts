export interface BluetoothServerPlugin {
  requestBluetoothPermissions(): Promise<{ granted: boolean }>;
  startServer(): Promise<{ status: string }>;
  stopServer(): Promise<{ status: string }>;
  addListener(eventName: 'bleDataReceived', listenerFunc: (data: { value: string }) => void): Promise<any>;
}
