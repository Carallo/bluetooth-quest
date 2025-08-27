# 📝 Guía para Generar APK en Windows 11

Esta guía te ayudará a generar un archivo APK de depuración (`.apk`) de la aplicación en tu propio computador con Windows 11 y PowerShell.

## 1. Prerrequisitos

Antes de empezar, asegúrate de tener instalado lo siguiente:

1.  **Git**: Para clonar el repositorio. Puedes descargarlo desde [git-scm.com](https://git-scm.com/).
2.  **Node.js**: Necesario para ejecutar los comandos del proyecto. Descárgalo desde [nodejs.org](https://nodejs.org/).
3.  **Bun**: Es el gestor de paquetes que usa este proyecto. Instálalo abriendo PowerShell y ejecutando:
    ```powershell
    irm bun.sh/install.ps1 | iex
    ```
4.  **Android Studio**: Necesario para el SDK de Android. Descárgalo e instálalo desde el [sitio oficial de Android](https://developer.android.com/studio).
    *   Durante la instalación, asegúrate de instalar el **Android SDK** y las **Command-line Tools**.

## 2. Clonar el Repositorio

Abre PowerShell y sigue estos pasos para descargar el código fuente desde GitHub.

```powershell
# 1. Navega a la carpeta donde quieras guardar el proyecto (ej: C:\Users\TuUsuario\Documents)
cd $env:USERPROFILE\Documents

# 2. Clona el repositorio desde GitHub (reemplaza la URL con la de tu repositorio)
git clone https://github.com/tu-usuario/tu-repositorio.git

# 3. Accede a la carpeta del proyecto
cd tu-repositorio
```

## 3. Instalar Dependencias

Una vez dentro de la carpeta del proyecto, instala todas las dependencias necesarias con Bun.

```powershell
# Ejecuta este comando en la raíz del proyecto
bun install
```

## 4. Generar el APK de Depuración

Sigue estos pasos para compilar la aplicación y generar el archivo `.apk`.

```powershell
# 1. Compila la aplicación web. Esto creará una carpeta `dist`.
npm run build

# 2. Sincroniza los archivos web con el proyecto nativo de Android.
npx cap sync android

# 3. Navega a la carpeta de Android.
cd android

# 4. Ejecuta el script de Gradle para construir el APK de depuración.
#    (Nota: Usa `gradlew.bat` que es el ejecutable para Windows)
./gradlew.bat assembleDebug
```

## 5. Localizar el APK

¡Felicidades! Si todo ha ido bien, el archivo `.apk` se habrá creado.

*   **Ubicación del APK**: Lo encontrarás en la siguiente ruta dentro de tu proyecto:
    `android\app\build\outputs\apk\debug\app-debug.apk`
*   Puedes copiar este archivo a tu dispositivo Android e instalarlo directamente.

## 🔌 Nota sobre el Plugin de Bluetooth

El plugin de comunicación por Bluetooth (`@capacitor-community/bluetooth-le`) ya está integrado y configurado en el proyecto. Los permisos necesarios ya están declarados en el archivo `AndroidManifest.xml`, por lo que no necesitas realizar ninguna configuración adicional para que funcione. Al instalar el APK, el sistema operativo te pedirá los permisos necesarios cuando la app intente usar el Bluetooth.
