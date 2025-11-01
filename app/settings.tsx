// app/settings.tsx
import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/types/navigation";
import * as Haptics from "expo-haptics";
import { getAuth, signOut, deleteUser } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { BackButton } from "@/components/BackButton";
import { LinearGradient } from "expo-linear-gradient";

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showLogout, setShowLogout] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      if (auth.currentUser) {
        const uid = auth.currentUser?.uid;
        if (uid) await deleteDoc(doc(db, "users", uid));
        await deleteUser(auth.currentUser);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <LinearGradient colors={["#F9E8DE", "#D9B6AB"]} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.card}>
          <BackButton />
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Fine-tune your baking experience.</Text>
          </View>

          <View style={styles.section}>
            <SettingRow
              icon="person-circle-outline"
              label="Update Profile"
              onPress={() => navigation.navigate("UpdateProfile", { mode: "edit" })}
            />
            <SettingRow
              icon="document-text-outline"
              label="Privacy Policy"
              onPress={() => navigation.navigate("PrivacyPolicy")}
            />
          </View>

          <View style={styles.section}>
            <SettingRow
              icon="log-out-outline"
              label="Log Out"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowLogout(true);
              }}
            />
            <SettingRow
              icon="trash-outline"
              label="Delete Account"
              destructive
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setShowDelete(true);
              }}
            />
          </View>
        </View>
      </ScrollView>

      <ConfirmModal
        visible={showLogout}
        title="End Session"
        message="Are you sure you want to log out?"
        onCancel={() => setShowLogout(false)}
        onConfirm={() => {
          setShowLogout(false);
          handleLogout();
        }}
        confirmLabel="Yes, Log Out"
      />

      <ConfirmModal
        visible={showDelete}
        title="Delete Account"
        message="Are you sure you want to delete your account?"
        onCancel={() => setShowDelete(false)}
        onConfirm={() => {
          setShowDelete(false);
          handleDeleteAccount();
        }}
        confirmLabel="Delete Account"
        destructive
      />
    </LinearGradient>
  );
}

function SettingRow({
  icon,
  label,
  onPress,
  destructive,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable style={[styles.row, destructive && styles.destructiveRow]} onPress={onPress}>
      <View style={[styles.iconBadge, destructive && styles.iconBadgeDestructive]}>
        <Ionicons
          name={icon}
          size={20}
          color={destructive ? "#FDF2F5" : "#3E2823"}
        />
      </View>
      <Text style={[styles.rowText, destructive && styles.rowTextDestructive]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="rgba(62, 40, 35, 0.4)" />
    </Pressable>
  );
}

function ConfirmModal({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  confirmLabel,
  destructive,
}: {
  visible: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  destructive?: boolean;
}) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMsg}>{message}</Text>
          <View style={styles.modalButtonRow}>
            <Pressable style={[styles.modalButton, styles.modalCancel]} onPress={onCancel}>
              <Text style={[styles.modalButtonText, styles.modalCancelText]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[
                styles.modalButton,
                destructive ? styles.modalDelete : styles.modalConfirm,
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.modalButtonText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
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
    marginBottom: 28,
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
  section: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 20,
    paddingVertical: 6,
    marginBottom: 18,
    shadowColor: "#3E2823",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 14,
  },
  destructiveRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(194, 106, 119, 0.35)",
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(250, 221, 208, 0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBadgeDestructive: {
    backgroundColor: "rgba(222, 113, 129, 0.75)",
  },
  rowText: {
    flex: 1,
    fontSize: 16,
    color: "#3E2823",
    fontFamily: "Poppins",
    fontWeight: "500",
  },
  rowTextDestructive: {
    color: "#C26A77",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(28, 15, 13, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "rgba(255, 253, 249, 0.98)",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    shadowColor: "#46302B",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    color: "#3E2823",
    fontFamily: "Poppins",
  },
  modalMsg: {
    fontSize: 14,
    marginBottom: 16,
    color: "rgba(62, 40, 35, 0.7)",
    fontFamily: "Poppins",
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#2E1C18",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 10,
  },
  modalCancel: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
  },
  modalConfirm: {
    backgroundColor: "#D4B2A7",
  },
  modalDelete: {
    backgroundColor: "#C26A77",
  },
  modalButtonText: {
    color: "#3E2823",
    fontFamily: "Poppins",
    fontWeight: "600",
  },
  modalCancelText: {
    color: "#3E2823",
  },
});
