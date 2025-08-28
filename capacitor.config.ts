import type { CapacitorConfig } from '@capacitor/cli';
import i18n from './src/i18n';

const config: CapacitorConfig = {
  appId: 'com.juegodnd.app',
  appName: 'D&D 5e Manager',
  webDir: 'dist',
  server: {
    // Para desarrollo en el simulador/editor
    url: 'https://4b0923ec-74b8-456d-a7d9-1d2becc421ed.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  // Para producción offline, comentar el server arriba y descomentar la línea de abajo
  // bundledWebRuntime: false,
  plugins: {
    BluetoothLe: {
      displayStrings: {
        scanning: i18n.t('capacitor.scanning'),
        cancel: i18n.t('capacitor.cancel'),
        availableDevices: i18n.t('capacitor.availableDevices'),
        noDeviceFound: i18n.t('capacitor.noDeviceFound')
      }
    }
  }
};

export default config;