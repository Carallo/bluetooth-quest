import { registerPlugin } from '@capacitor/core';

import type { BluetoothServerPlugin } from './definitions';

const BluetoothServer = registerPlugin<BluetoothServerPlugin>(
  'BluetoothServer',
  {
    web: () => import('./web').then(m => new m.BluetoothServerWeb()),
  },
);

export * from './definitions';
export { BluetoothServer };
