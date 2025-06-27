# BNSSA TRAINING
-------
_Application mobile de formation BNSSA développée avec React Native et Expo._

> Ce fichier README.md est destiné aux développeurs souhaitant modifier l’application.
> Pour une utilisation standard, il vous suffit de télécharger le fichier ```bnssa-training.apk``` depuis la dernière release.


### Contact
Pour toute question ou suggestion, n'hésitez pas à nous contacter :
- Kévin : [kevin.boillon@free.fr](mailto:kevin.boillon@free.fr)
- Kelyfane : [kelyfane@gmail.com](mailto:kelyfane@gmail.com)

### Prérequis (Pour developpement)
Avant de commencer, assurez-vous d'avoir installé les outils suivants :
* **Node.js** (version LTS recommandée) [Télécharger ici](https://nodejs.org/en/download)
* **Git** [Télécharger ici](https://git-scm.com/downloads)
* **Expo CLI** Installation via npm : `npm install -g expo-cli`
* **Expo Go** sur votre téléphone :
  - **[iOS](https://apps.apple.com/app/expo-go/id982107779)**
  - **[Android](https://play.google.com/store/apps/details?id=host.exp.exponent)**

### Installation
1. Cloner le projet
    ```sh
    git clone https://github.com/vKnie/bnssa-training.git
    cd bnssa-training
    ```
2. Installer les dépendances
    ```sh
    npm install
    ```

### Utilisation
Démarrage en mode développement
```sh
npx expo start
```
Une fois démarré, vous pouvez :
* Sur Android : Ouvrir l'application Expo Go et scanner le QR code affiché
* Sur iOS : Utiliser l'appareil photo pour scanner le QR code et ouvrir dans Expo Go

### Build pour Android

Version debug avec installation automatique :
```sh
npx expo prebuild --clean
npx expo run:android --variant debug --device
```

Version release sans installation :
```sh
npx expo run:android --variant release --no-install
```

Build avec Gradle (alternative) :
```sh
npx expo prebuild --clean
cd android
./gradlew assembleRelease
```