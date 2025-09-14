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
```
DoughAndDecor/
│
├── app/                        # Core navigation and screens 
│   ├── recipes/ 		           # Recipes feature 
│   ├── inventory/		        # Inventory feature 
│   ├── gallery.tsx             # Inspiration gallery feature  
│   ├── icingColorGuide.tsx     # Icing Color Blending Guide feature 
│   ├── index.tsx               # Home screen 
│   ├── launch.tsx              # Launch screen 
│   ├── login.tsx               # Login screen 
│   ├── measurementConverter.tsx   # Measurement Conversion feature 
│   ├── privacyPolicy.tsx 	     # Privacy Policy screen 
│   ├── settings.tsx		        # Settings Screen 
│   ├── shoppingList.tsx        # Shopping list feature 
│   ├── signUp.tsx              # Sign-Up screen 
│   ├── timer.tsx               # Timer feature 
│   ├── timerMenu.tsx           # Timer menu screen 
│   └── updateProfile.tsx       # Update Profile screen 
│
├── components/                 # Reusable UI components
│   ├── BackButton.tsx
│   ├── ColorTile.tsx
│   └── ...
│
├── firebase/                   # Firebase configuration and helper functions
│   ├── config.ts
│   ├── shoppingList.ts
│   └── ...
│
├── assets/                     # Images, icons, and design assets
│
├── tests/                      # Test cases (manual and automated)
│
├── package.json                # Dependencies and scripts
└── README.md                   # Setup instructions
```


---

## Key Features Implemented
- **User Authentication:** Sign-up, log-in, and log-out with Firebase Auth.
- **Navigation:** Expo Router with nested navigation for future scalability.
- **Timer:** Persistent state between app sessions.
- **Shopping List:** Add items with quantity/unit, swipe-to-delete, Firestore sync.
- **Icing Color Blending Guide:** Visual color tiles with labeled names, customizable mixing ratios, and user-friendly selection interface.
- **Inventory Manager:** CRUD operations for items, quantity adjustments, low-stock threshold indicators, and auto-add to shopping list 
- **Measurement Conversions:** Unit converter for baking measurements 
- **Recipe Manager:** Full CRUD for recipes with ingredients, steps, yield, and optional images. 
- **Inspiration Gallery:** Upload, view, and delete images with Firestore metadata and secure storage paths 

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

## Development

This project contains two separate Node.js projects:

1. Expo Mobile App (root directory)

Contains all React Native/Expo code for the Dough & Decor mobile app.

Uses package.json in the root folder.

Start the app:

npm install
npx expo start

Environment variables are stored in a .env file (not committed to Git). See .env.example for reference.

2. Firebase Cloud Functions (functions/ folder)

Contains server-side code that runs on Firebase.

Uses functions/package.json for its own dependencies.

To run functions locally:

cd functions
npm install
npm run serve

To deploy to Firebase:

cd functions
npm run deploy

Cloud Functions do not share dependencies with the Expo app — this separation is intentional.

**Note**: The functions folder may be empty or partially implemented depending on the milestone. If not in use for this milestone, it is safe to ignore when running the mobile app locally.

---

## Known Issues & Future Improvements

Fine-tuning Firebase security rules for production.

Implementing inventory and gallery features.

Expanding unit and integration test coverage.

---

## Author

Racquel Beebe – Master’s Capstone Project, 2025
