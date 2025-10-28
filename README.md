# 💊⏳ LifeCapsule

**LifeCapsule** es una aplicación móvil desarrollada con **React Native + Expo + Firebase** (Firestore y Storage) que permite crear, guardar y explorar **cápsulas del tiempo digitales**.  
Los usuarios pueden almacenar imágenes, videos, audios y texto, marcar sus cápsulas favoritas y personalizar la forma en que cada cápsula se abre (por fecha, PIN, o ubicación).

La aplicación está pensada para **conectar emociones con tecnología**, permitiendo revivir recuerdos y momentos especiales de manera interactiva y segura.

---

## 🖼️ Vista Previa de la Aplicación

> *(capturas de pantalla o GIFs de la app en funcionamiento)*

---

## 🚀 Características

- 💊 **Crear cápsulas del tiempo:**  
  Permite registrar cápsulas con texto, imágenes, videos o audios.

- 🕰️ **Programación de apertura:**  
  Cada cápsula puede configurarse para abrirse en una fecha específica o bajo condiciones definidas por el usuario.

- 🔐 **Apertura segura:**  
  Soporte para métodos de acceso mediante PIN personal, huella dactilar o ubicación GPS.

- 🧭 **Ubicación de recuerdos:**  
  Permite registrar la posición geográfica donde se creó una cápsula.

- ⭐ **Favoritos:**  
  Marca cápsulas destacadas para acceder a ellas rápidamente.

- 🧠 **Interfaz intuitiva y emocional:**  
  Animaciones y transiciones fluidas implementadas con la librería **Lottie**, utilizando archivos `.json` para enriquecer la experiencia visual.

- 📸 **Multimedia completa:**  
  Soporte para imágenes, videos y audios con vista previa y reproducción dentro de la app.

- 🔔 **Recordatorios automáticos:**  
  Envía notificaciones cuando se aproxima la fecha de apertura de una cápsula.

- 🔐 **Autenticación de usuarios:**  
  Registro, inicio de sesión y recuperación de contraseña con **Firebase Authentication**.

- ☁️ **Almacenamiento seguro:**  
  Uso de **Firebase Firestore** y **Cloudinary** para mantener los datos y archivos protegidos en la nube.


---

## 🧩 Tecnologías Utilizadas

- **Frontend:** React Native + Expo  
- **Backend:** Firebase Firestore  
- **Autenticación:** Firebase Auth  
- **Almacenamiento multimedia:** Cloudinary  
- **Animaciones:** Lottie (.json) y videos en formato **.mp4** 
- **Manejo multimedia:** expo-av y expo-image-picker  
- **Almacenamiento local:** Async Storage  

**Librerías adicionales:**
- @react-native-async-storage/async-storage  
- react-native-safe-area-context  
- lottie-react-native  
- expo-av  
- expo-image-picker  

---

## ⚙️ Requisitos Previos

Antes de instalar y ejecutar el proyecto, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) y npm  
- [Expo Go](https://expo.dev/client) en tu dispositivo móvil  
  - [Descargar Expo Go para Android](https://play.google.com/store/apps/details?id=host.exp.exponent)  
  - [Descargar Expo Go para iOS](https://apps.apple.com/app/expo-go/id982107779)

Verifica tus versiones con:
```bash
node -v
npm -v
```
---
### 💻📲 Instalación y Ejecución

Sigue estos pasos para ejecutar LifeCapsule correctamente:

1️. Clonar el repositorio:

```bash
git clone https://github.com/AndreaCubillos11/LifeCapsule.git
cd LifeCapsule
```

2️. Instalar dependencias:
```bash
npm install
```

- Nota:
  Si aparecen errores relacionados con módulos faltantes, instálalos manualmente con los siguientes comandos
  ```bash
  npm install @react-native-async-storage/async-storage
  npm install expo-av
  npm install expo-image-picker
  npm install lottie-react-native
  ```

3️. Ejecutar la aplicación:
```bash
npx expo start
```
Esto abrirá la interfaz de Expo Developer Tools en tu terminal o navegador, donde podrás ver el código QR para probar la app con Expo Go.

4️. Probar la aplicación en tu dispositivo:

 - Abre la app Expo Go en tu celular.

 - Escanea el código QR que aparece en la terminal.

 - Espera unos segundos y la app se cargará automáticamente.

⚠️ Importante:
Asegúrate de que tu teléfono y el computador estén conectados a la misma red Wi-Fi.

---
## 💾 Funcionalidades Futuras

- Compartir cápsulas públicas con otros usuarios.

- Autenticación con Google y redes sociales.

- Notificaciones push más personalizables.

- Mapa interactivo para ver cápsulas según ubicación.

- Apertura de cápsulas mediante realidad aumentada (AR).



