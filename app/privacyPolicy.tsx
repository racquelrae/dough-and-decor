// app/privacy-policy.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { BackButton } from "@/components/BackButton";

export default function PrivacyPolicyScreen() {
  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.title}>Privacy Policy</Text>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.text}>
          Last updated: August 2025{"\n\n"}
          Dough & Decor ("we", "our", or "us") respects your privacy. This
          Privacy Policy explains how we collect, use, and protect your
          information when you use our mobile app.{"\n\n"}
          -{"\n\n"}
          1. Information We Collect{"\n"}
          • Account Information: username, email, and optional profile picture.{"\n"}
          • Usage Data: features you interact with (e.g., recipes, inventory,
          gallery).{"\n"}
          • Images: any photos you upload (stored via Cloudinary).{"\n\n"}
          We do not collect payment data or sensitive personal identifiers.{"\n\n"}
          -{"\n\n"}
          2. How We Use Your Information{"\n"}
          • To provide core app features like recipes, gallery, and inventory.{"\n"}
          • To personalize your experience (e.g., profile photo, username).{"\n"}
          • To maintain and improve the app’s performance and reliability.{"\n\n"}
          We do not sell your personal data.{"\n\n"}
          -{"\n\n"}
          3. Data Storage{"\n"}
          • Firebase: securely stores your profile and app content.{"\n"}
          • Cloudinary: stores uploaded images.{"\n"}
          • Expo/Firebase Auth: manages login and authentication.{"\n\n"}
          Your data is stored securely and only used within the app’s
          functionality.{"\n\n"}
          -{"\n\n"}
          4. Data Retention{"\n"}
          • Your information is retained while your account is active.{"\n"}
          • You may request deletion anytime by using the "Delete Account" option
          in the app.{"\n"}
          • Deleting your account will remove your data from Firebase and
          Cloudinary (where applicable).{"\n\n"}
          -{"\n\n"}
          5. Third-Party Services{"\n"}
          The app relies on trusted third-party providers:{"\n"}
          • Firebase (Google LLC) – authentication, database, storage.{"\n"}
          • Cloudinary – image hosting.{"\n"}
          • Expo – app framework services.{"\n\n"}
          Each provider maintains its own privacy practices.{"\n\n"}
          -{"\n\n"}
          6. Your Rights{"\n"}
          • Access & Update: You may update your profile at any time in-app.{"\n"}
          • Delete: You may delete your account at any time.{"\n\n"}
          -{"\n\n"}
          7. Changes{"\n"}
          We may update this Privacy Policy from time to time. Significant
          changes will be communicated in-app.{"\n\n"}
          -{"\n\n"}
          📧 Contact Us{"\n"}
          If you have questions about this Privacy Policy, please email:
           racquelrbeebe@gmail.com{"\n\n"}
          🍪 Thank you for trusting Dough & Decor!{"\n\n"}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fffaf8", padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16, marginTop: 64, color: "#4b3832" },
  scroll: { flex: 1 },
  text: { fontSize: 14, lineHeight: 20, color: "#333" },
});
