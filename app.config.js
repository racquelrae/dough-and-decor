import 'dotenv/config';

export default {
  expo: {
    name: "dough-and-decor",
    slug: "dough-and-decor",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "doughanddecor",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      bundleIdentifier: "com.doughanddecor.app", // <-- Add this line!
      supportsTablet: true,
      infoPlist: {
        NSPhotoLibraryUsageDescription: "Allow access to your photo library to upload a profile picture.",
        NSCameraUsageDescription: "Allow access to your camera to take a profile picture.",
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      package: "com.yourname.doughanddecor", // <-- Add this line!
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      permissions: ["CAMERA", "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"]
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      ["expo-splash-screen", {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff"
      }],
      "expo-font"
    ],
    experiments: { typedRoutes: true },

    updates: {
      url: "https://u.expo.dev/84a14436-1ed8-47db-81b6-76e00acc82a1"
    },
    runtimeVersion: {
      policy: "appVersion"
    },

    extra: {
      eas: {
        projectId: "84a14436-1ed8-47db-81b6-76e00acc82a1"
      },
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
    },
  },
};