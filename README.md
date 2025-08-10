# Dough & Decor

A mobile app for cookie decorators built with React Native, Firebase, and love 💖

## Features
- Icing color blending guide 🎨
- Inventory manager 🧁
- Measurement converters 📏
- Recipe tracker 🍪
- Timer with persistent state ⏱
- Shopping list with quantity/unit selection 🛒
- And more to come!

---

## Technologies Used
- **Frontend:** React Native (Expo Router, TypeScript)
- **Backend Services:** Firebase Authentication, Firestore Database
- **UI Libraries:** React Native Gesture Handler, ShadCN, Expo Haptics, SVG
- **Version Control:** GitHub
- **Testing:** Manual test cases and traceability mapping

---

## Project Structure
DoughAndDecor/
│
├── app/ # Core navigation and screens
│ ├── index.tsx # Home screen
│ ├── timer.tsx # Timer feature
│ ├── shoppingList.tsx # Shopping list feature
│ ├── icingColorGuide.tsx # Icing color blending guide
│ └── ...
│
├── components/ # Reusable UI components
│ ├── BackButton.tsx
│ ├── ColorTile.tsx
│ └── ...
│
├── firebase/ # Firebase configuration and helper functions
│ ├── config.ts
│ ├── auth.ts
│ ├── shoppingList.ts
│ └── ...
│
├── assets/ # Images, icons, and design assets
│
├── tests/ # Test cases (manual and automated)
│
├── package.json # Dependencies and scripts
└── README.md # Setup instructions

---

## Key Features Implemented
- **User Authentication:** Sign-up, log-in, and log-out with Firebase Auth.
- **Timer:** Persistent state between app sessions.
- **Shopping List:** Add items with quantity/unit, swipe-to-delete, Firestore sync.
- **Icing Color Blending Guide:** Visual color tiles with labeled names, customizable mixing ratios, and user-friendly selection interface.
- **Navigation:** Expo Router with nested navigation for future scalability.

---

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Create a Firebase project and add your google-services.json / config values to firebase/config.ts.

3. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

---

## Known Issues & Future Improvements
Fine-tuning Firebase security rules for production.

Implementing inventory and gallery features.

Expanding unit and integration test coverage.

---

## Author
Racquel Beebe – Master’s Capstone Project, 2025
