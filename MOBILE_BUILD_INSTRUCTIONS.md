# 📱 Instrucciones de Compilación Móvil - D&D 5e Manager

## 🚀 Configuración Inicial

### 1. Exportar e Instalar Dependencias
```bash
# 1. Exporta el proyecto a tu GitHub usando el botón "Export to Github"
# 2. Clona tu repositorio
git clone [tu-repositorio-url]
cd [nombre-del-proyecto]

# 3. Instala dependencias
npm install
```

### 2. Inicializar Capacitor
```bash
# Inicializar proyecto Capacitor
npx cap init

# Agregar plataformas
npx cap add android
npx cap add ios  # Solo en Mac con Xcode
```

### 3. Compilar para Móvil
```bash
# Construir la aplicación
npm run build

# Sincronizar con plataformas nativas
npx cap sync

# Actualizar dependencias nativas
npx cap update android
npx cap update ios  # Solo en Mac
```

## 📱 Ejecutar en Dispositivos

### Android
```bash
# Ejecutar en emulador/dispositivo Android
npx cap run android

# O abrir en Android Studio
npx cap open android
```

### iOS (Solo Mac)
```bash
# Ejecutar en simulador/dispositivo iOS
npx cap run ios

# O abrir en Xcode
npx cap open ios
```

## 🛠️ Funcionalidades Móviles Implementadas

### ✅ Almacenamiento Local Completo
- **Hook**: `useOfflineData` para gestión completa offline
- **Datos guardados**: Personajes, campañas, inventarios, logs de combate, configuraciones
- **Persistencia**: Uso de Capacitor Preferences para almacenamiento nativo
- **Gestión**: Exportación/importación, backup automático
- **Compatibilidad**: Web y móvil nativo

### ✅ Bluetooth
- **Componente**: `BluetoothManager`
- **Funciones**: 
  - Escanear dispositivos cercanos
  - Conectar/desconectar
  - Compartir archivos JSON (personajes, campañas)
- **Permisos necesarios**: Bluetooth, ubicación

### ✅ Modo Offline
- **Indicador**: Badge visual del estado de conexión
- **Cache**: QueryClient configurado para uso offline
- **Funcionalidad**: App completamente funcional sin internet

### ✅ Gestión Offline Avanzada
- **Formato**: JSON con datos completos de D&D
- **Métodos**: Bluetooth LE, compartir nativo, archivos locales
- **Contenido**: Personajes, campañas, inventarios, logs, configuraciones
- **Funciones**: Auto-backup, detección de estado offline/online
- **Interfaz**: Gestor dedicado con estadísticas de datos almacenados

## 📋 Permisos Android Requeridos

### android/app/src/main/AndroidManifest.xml
```xml
<!-- Permisos Bluetooth -->
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- Almacenamiento -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

## 🔧 Configuración de Desarrollo vs Producción

### Desarrollo (Hot Reload)
Para desarrollo con conexión a Lovable:
- Mantener `server.url` en `capacitor.config.ts`
- URL: `https://4b0923ec-74b8-456d-a7d9-1d2becc421ed.lovableproject.com`
- Los cambios se reflejan automáticamente en el dispositivo

### Producción (Completamente Offline)
Para apps que funcionan sin internet:
1. Comentar la sección `server` en `capacitor.config.ts`
2. Ejecutar `npm run build` antes de `npx cap sync`
3. La app funcionará completamente offline con datos locales

### Debugging
```bash
# Ver logs de Android
npx cap run android --livereload --external

# Ver logs de iOS
npx cap run ios --livereload --external
```

## 📦 Build de Producción

### Android APK
```bash
# Build de producción
npm run build
npx cap sync android

# Generar APK firmado
cd android
./gradlew assembleRelease
```

### iOS App Store
```bash
# Build de producción
npm run build
npx cap sync ios

# Abrir en Xcode para build de distribución
npx cap open ios
```

## 🎯 Funcionalidades Clave de la App

### 🎲 Completamente Offline
- Creación y gestión de personajes
- Sistema de dados virtuales
- Bestiario completo (20+ criaturas)
- Tienda con 50+ items
- Sistema de combate e iniciativa
- Gestión de campañas

### 📡 Conectividad
- Compartir personajes vía Bluetooth
- Exportar/importar campañas
- Indicador de estado de red
- Sincronización automática cuando hay conexión

### 🎨 UI Móvil Optimizada
- Diseño responsive
- Tema medieval con modo oscuro/claro
- Animaciones optimizadas para táctil
- Componentes adaptados a móvil

## 🚨 Requisitos del Sistema

### Para Desarrollo Android
- Android Studio instalado
- SDK Android 24+ (Android 7.0)
- Java 8+ / JDK 11+

### Para Desarrollo iOS
- macOS con Xcode instalado
- iOS 13.0+
- Cuenta de desarrollador Apple (para dispositivos físicos)

## 📖 Documentación Adicional

Para más información sobre desarrollo móvil con Capacitor:
- [Documentación Capacitor](https://capacitorjs.com/docs)
- [Guía Android](https://capacitorjs.com/docs/android)
- [Guía iOS](https://capacitorjs.com/docs/ios)