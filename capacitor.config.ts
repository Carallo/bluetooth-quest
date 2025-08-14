import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.4b0923ec74b8456da7d91d2becc421ed',
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
        scanning: "Buscando dispositivos...",
        cancel: "Cancelar",
        availableDevices: "Dispositivos disponibles",
        noDeviceFound: "No se encontraron dispositivos"
      }
    }
  }
};

export default config;