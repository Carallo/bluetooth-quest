# Guía de Integración del Plugin BluetoothServer

Has solicitado un plugin de servidor BLE funcional. He creado el código fuente por ti, pero debido a que no puedo ejecutar comandos ni modificar directamente la configuración de tu proyecto, debes seguir estos pasos para integrarlo.

## Resumen de Archivos Creados

1.  `android/src/main/java/com/example/bluetoothserver/BluetoothServerPlugin.kt`: El código nativo del plugin para Android.
2.  `src/plugins/bluetoothServer.ts`: La interfaz del plugin para tu código web (React/Vue/Angular).
3.  `android/app/src/main/AndroidManifest.xml`: Un **ejemplo** del manifiesto de Android con los permisos correctos.

## Pasos para la Integración

### Paso 1: Generar la Estructura del Plugin

Si aún no lo has hecho, el método oficial para añadir un plugin es usar la CLI de Capacitor. Abre una terminal en la raíz de tu proyecto y ejecuta:

```bash
npx @capacitor/cli plugin:generate
```

Cuando te pregunte, dale los siguientes datos:
- **name**: `BluetoothServer`
- **package id**: `com.example.bluetoothserver` (o el que prefieras)
- **class name**: `BluetoothServerPlugin`

Esto creará una carpeta para el plugin, normalmente fuera de tu proyecto.

### Paso 2: Copiar el Código Fuente

Ahora, copia los archivos que he creado en la estructura que generó la CLI:

1.  **Copia el contenido de `android/src/main/java/com/example/bluetoothserver/BluetoothServerPlugin.kt`** que te he proporcionado y pégalo dentro del archivo con el mismo nombre que se generó en la carpeta de tu nuevo plugin (ej: `bluetooth-server/android/src/main/java/.../BluetoothServerPlugin.kt`).
2.  **Copia el contenido de `src/plugins/bluetoothServer.ts`** y pégalo en el archivo `src/web.ts` del plugin generado. Renombra los métodos si es necesario para que coincidan.

### Paso 3: Instalar el Plugin y Sincronizar

1.  Instala tu plugin local en tu proyecto. Desde la raíz de tu proyecto Capacitor, ejecuta:
    ```bash
    # Reemplaza la ruta con la ubicación real de tu plugin generado
    npm install ./ruta/hacia/tu/plugin/bluetooth-server
    ```

2.  Sincroniza tu proyecto Capacitor para que los cambios nativos se apliquen:
    ```bash
    npx cap sync
    ```

### Paso 4: Verificar Permisos en `AndroidManifest.xml`

Abre el `AndroidManifest.xml` **de tu proyecto** (`android/app/src/main/AndroidManifest.xml`) y asegúrate de que contiene los permisos que te proporcioné en el archivo de ejemplo. Los más importantes son:

```xml
<uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

### Paso 5: Actualizar tu Aplicación React

Finalmente, actualiza tu código de React para solicitar los permisos antes de intentar iniciar el servidor.

```jsx
import React from 'react';
import BluetoothServer from '../plugins/bluetoothServer'; // Ajusta la ruta si es necesario

export default function App() {

  const requestPermsAndStart = async () => {
    try {
      // Primero, solicita permisos
      await BluetoothServer.requestBluetoothPermissions();
      console.log('Permisos concedidos.');

      // Si se conceden, inicia el servidor
      const res = await BluetoothServer.startServer();
      console.log('Servidor BLE iniciado:', res);
      alert('Servidor BLE iniciado con éxito');

    } catch (error) {
      console.error('Error en el proceso de inicio:', error);
      alert(`Error: ${error}`);
    }
  };

  const stop = async () => {
    // ... (el código para detener no cambia)
  };

  return (
    <div>
      <button onClick={requestPermsAndStart}>Iniciar Servidor BLE</button>
      {/* ... más UI ... */}
    </div>
  );
}
```

¡Y eso es todo! Después de seguir estos pasos, tu plugin debería estar completamente integrado y funcional.
