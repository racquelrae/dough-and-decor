// app/privacy-policy.tsx
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { BackButton } from "@/components/BackButton";
import { LinearGradient } from "expo-linear-gradient";

export default function PrivacyPolicyScreen() {
  return (
    <LinearGradient colors={["#F9E8DE", "#D9B6AB"]} style={styles.gradient}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <BackButton />
          <View style={styles.header}>
            <Text style={styles.title}>Privacy Policy</Text>
            <Text style={styles.subtitle}>
              How we care for your data inside Dough & Decor.
            </Text>
          </View>
          <Text style={styles.text}>
            Last updated: August 2025{"\n\n"}
            Dough & Decor ("we", "our", or "us") respects your privacy. This
            Privacy Policy explains how we collect, use, and protect your
            information when you use our mobile app.{"\n\n"}
            -{"\n\n"}
            1. Information We Collect{"\n"}
            • Account Information: username, email, and optional profile picture.{"\n"}
            • Usage Data: features you interact with (e.g., recipes, inventory, gallery).{"\n"}
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
            Your data is stored securely and only used within the app’s functionality.{"\n\n"}
            -{"\n\n"}
            4. Data Retention{"\n"}
            • Your information is retained while your account is active.{"\n"}
            • You may request deletion anytime by using the "Delete Account" option in the app.{"\n"}
            • Deleting your account will remove your data from Firebase and Cloudinary (where applicable).{"\n\n"}
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
            We may update this Privacy Policy from time to time. Significant changes will be communicated in-app.{"\n\n"}
            -{"\n\n"}
            📧 Contact Us{"\n"}
            If you have questions about this Privacy Policy, please email: racquelrbeebe@gmail.com{"\n\n"}
            🍪 Thank you for trusting Dough & Decor!{"\n\n"}
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 48,
  },
  card: {
    backgroundColor: "rgba(255, 253, 249, 0.92)",
    borderRadius: 28,
    marginTop: 40,
    padding: 28,
    paddingTop: 72,
    shadowColor: "#46302B",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    marginBottom: 24,
    alignItems: "flex-start",
  },
  badge: {
    backgroundColor: "rgba(236, 176, 152, 0.35)",
    color: "#3E2823",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    fontFamily: "Poppins",
    fontSize: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#3E2823",
    fontFamily: "Poppins",
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(62, 40, 35, 0.7)",
    fontFamily: "Poppins",
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: "#3E2823",
    fontFamily: "Poppins",
  },
});
