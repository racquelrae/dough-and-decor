// app/settings.tsx
import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/types/navigation";
import * as Haptics from "expo-haptics";
import { getAuth, signOut, deleteUser } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { BackButton } from "@/components/BackButton";

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
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.title}>Settings</Text>

      <SettingRow
        icon="person-circle-outline"
        label="Update Profile"
        onPress={() => navigation.navigate("UpdateProfile", {mode:"edit"})}
      />
      <SettingRow
        icon="document-text-outline"
        label="Privacy Policy"
        onPress={() => navigation.navigate("PrivacyPolicy")}
      />
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

      {/* Logout Modal */}
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

      {/* Delete Modal */}
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
    </View>
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
    <Pressable style={styles.row} onPress={onPress}>
      <Ionicons name={icon} size={22} color={destructive ? "#c06" : "#8a6e63"} />
      <Text style={[styles.rowText, destructive && { color: "#c06" }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#bbb" />
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
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMsg}>{message}</Text>
          <View style={styles.modalBtns}>
            <Pressable style={[styles.btn, styles.cancelBtn]} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[
                styles.btn,
                destructive ? styles.deleteBtn : styles.confirmBtn,
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffaf8",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    marginTop: 64,
    color: "#4b3832",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  rowText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: "#4b3832",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  modalMsg: {
    fontSize: 14,
    marginBottom: 16,
    color: "#444",
  },
  modalBtns: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  cancelBtn: {
    backgroundColor: "#eee",
  },
  confirmBtn: {
    backgroundColor: "#8a6e63",
  },
  deleteBtn: {
    backgroundColor: "#c06",
  },
  cancelText: {
    color: "#555",
    fontWeight: "600",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "600",
  },
});
