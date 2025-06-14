## Contact

Pour toute question ou suggestion, n'hésitez pas à nous contacter :

- Kévin : [kevin.boillon.pro@gmail.com](mailto:kevin.boillon.pro@gmail.com)
- Kelyfane : [kelyfane@gmail.com](mailto:kelyfane@gmail.com)

## Prérequis

- **Node.js** (LTS recommandé) ➜ [Télécharger ici](https://nodejs.org/en/download)
- **Git** ➜ [Télécharger ici](https://git-scm.com/downloads)
- **Expo CLI** ➜ `npm install -g expo-cli`
- **Expo Go** (sur votre téléphone) ➜ Disponible sur **[iOS](https://apps.apple.com/app/expo-go/id982107779)** et **[Android](https://play.google.com/store/apps/details?id=host.exp.exponent)**

### 1. Cloner le projet depuis GitHub

Ouvrez un terminal et clonez le dépôt GitHub en utilisant la commande suivante :
```bash
git clone https://github.com/vKnie/bnssa-training.git
cd bnssa-training
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Démarrer l'application avec Expo
```bash
npx expo start
```

### 4. Scanner le QR Code avec Expo Go
- **Sur Android** : Ouvrez l’application Expo Go et scannez le QR code affiché dans votre terminal ou navigateur.
- **Sur iOS** : Ouvrez l'appareil photo de votre téléphone et scannez le QR code pour ouvrir l'application dans Expo Go.

- npx expo prebuild --clean
npx expo run:android --variant debug --device

- npx expo run:android --variant release --no-install

ou

- cd android
- ./gradlew assembleRelease

npx expo prebuild --clean