import { BackButton } from "@/components/BackButton";
import { ItemRow } from "@/components/inventory/itemRow";
import { addCategory, deleteCategory, watchCategories, watchItems } from "@/firebase/inventory";
import type { InventoryCategory, InventoryItem } from "@/types/inventory";
import type { RootStackParamList } from "@/types/navigation";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

export default function InventoryIndex() {
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const unsub = watchCategories((cs) => {
      setCategories(cs);
      if (!activeCatId && cs.length) setActiveCatId(cs[0].id);
    });
    return () => unsub();
  }, [activeCatId]);

  useEffect(() => {
    if (!activeCatId) return;
    const unsub = watchItems(activeCatId, setItems);
    return () => unsub();
  }, [activeCatId]);

  const createGroup = useCallback(async () => {
    const name = newGroupName.trim();
    if (!name) return;
    const id = await addCategory(name);
    setNewGroupName("");
    setShowNewGroup(false);
    setActiveCatId(id);
    Haptics.selectionAsync();
  }, [newGroupName]);

  const removeGroup = useCallback((cat: InventoryCategory) => {
    Alert.alert("Delete Tab", `Remove “${cat.name}” (and its items)?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteCategory(cat.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        },
      },
    ]);
  }, []);

  const gradientStops = useMemo(() => ["#F9E8DE", "#D9B6AB"], []);

  return (
    <>
      <LinearGradient colors={['#F9E8DE', '#D9B6AB']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.kav}
          keyboardVerticalOffset={Platform.OS === "ios" ? 32 : 0}
        >
          <View style={styles.card}>
            <BackButton />
            <View style={styles.headerBlock}>
              <View style={styles.headerText}>
                <Text style={styles.title}>Inventory</Text>
                <Text style={styles.subtitle}>
                  Track baking staples, tools, and décor in one place. Use tabs to group items and long-press a tab to rename or delete it.
                </Text>
              </View>
              <Pressable
                onPress={() => setShowNewGroup(true)}
                style={({ pressed }) => [styles.addGroup, pressed && styles.addGroupPressed]}
              >
                <Ionicons name="add" size={20} color="#3E2823" />
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabBar}
            >
              {categories.map((cat) => {
                const active = cat.id === activeCatId;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setActiveCatId(cat.id);
                    }}
                    onLongPress={() => removeGroup(cat)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {cat.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <ScrollView
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {items.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Ionicons name="cube-outline" size={42} color="#D4B2A7" />
                  <Text style={styles.emptyTitle}>Nothing stocked</Text>
                  <Text style={styles.emptyText}>
                    Add your first item to keep tabs on what’s in the pantry.
                  </Text>
                </View>
              ) : (
                items.map((it) => (
                  <View key={it.id} style={styles.rowHolder}>
                    <ItemRow item={it} categoryId={activeCatId!} />
                  </View>
                ))
              )}
            </ScrollView>

            {activeCatId ? (
              <Pressable
                onPress={() => navigation.navigate("InventoryNew", { categoryId: activeCatId })}
                style={({ pressed }) => [styles.addFab, pressed && styles.addFabPressed]}
                hitSlop={10}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.addFabText}>Add item</Text>
              </Pressable>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      </LinearGradient>

      <Modal
        visible={showNewGroup}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNewGroup(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowNewGroup(false)}>
            <LinearGradient
              colors={[
                "rgba(249,232,222,0.0)",
                "rgba(249,232,222,0.35)",
                "rgba(217,182,171,0.55)",
              ]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />
          </Pressable>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalSheetWrap}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Create a new category</Text>
              <TextInput
                placeholder="e.g., Sprinkles, Tools"
                placeholderTextColor="rgba(62, 40, 35, 0.45)"
                value={newGroupName}
                onChangeText={setNewGroupName}
                style={styles.modalInput}
                autoFocus
              />
              <View style={styles.modalButtons}>
                <Pressable onPress={() => setShowNewGroup(false)} style={styles.modalBtnSecondary}>
                  <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={createGroup} style={styles.modalBtnPrimary}>
                  <Text style={styles.modalBtnPrimaryText}>Create</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  kav: {
    flex: 1,
  },
  card: {
    flex: 1,
    marginTop: 12,
    backgroundColor: "rgba(255, 253, 249, 0.92)",
    borderRadius: 28,
    padding: 24,
    paddingTop: 72,
    shadowColor: "#46302B",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
  },
  headerBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
    gap: 8,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(236, 176, 152, 0.35)",
    color: "#3E2823",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    fontFamily: "Poppins",
    fontSize: 12,
  },
  title: {
    fontFamily: "Poppins",
    fontSize: 28,
    fontWeight: "700",
    color: "#3E2823",
  },
  subtitle: {
    fontFamily: "Poppins",
    fontSize: 13,
    color: "rgba(62, 40, 35, 0.7)",
    lineHeight: 19,
  },
  addGroup: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#3E2823",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 6,
  },
  addGroupPressed: {
    opacity: 0.85,
  },
  tabBar: { 
    height: 40, 
    alignItems: "center"
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#EEE7E3",
    marginRight: 8
  },
  chipActive: {
    backgroundColor: "#E2C9C0"
  },
  chipText: {
    fontFamily: "Poppins",
    fontSize: 14,
    color: "#3E2823",
  },
  chipTextActive: {
    fontWeight: "500",
  },
  listContent: {
    paddingBottom: 350,
    gap: 12,
  },
  rowHolder: {
    borderRadius: 24,
  },
  addFab: {
    marginTop: 16,
    alignSelf: "center",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#D4B2A7",
    shadowColor: "#3E2823",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 6,
  },
  addFabPressed: {
    opacity: 0.85,
  },
  addFabText: {
    fontFamily: "Poppins",
    fontWeight: "600",
    color: "#FDF3F0",
  },
  emptyWrap: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 12,
  },
  emptyTitle: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: 16,
    color: "#3E2823",
  },
  emptyText: {
    fontFamily: "Poppins",
    fontSize: 13,
    color: "rgba(62, 40, 35, 0.7)",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 32,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalSheetWrap: {
    justifyContent: "flex-end",
    flex: 1,
  },
  modalCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 24,
    padding: 24,
    backgroundColor: "rgba(255, 253, 249, 0.98)",
    shadowColor: "#46302B",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 14,
    gap: 14,
  },
  modalTitle: {
    fontFamily: "Poppins",
    fontSize: 18,
    fontWeight: "700",
    color: "#3E2823",
  },
  modalInput: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(236, 197, 210, 0.5)",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    fontFamily: "Poppins",
    fontSize: 15,
    color: "#3E2823",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalBtnSecondary: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  modalBtnSecondaryText: {
    fontFamily: "Poppins",
    fontWeight: "600",
    color: "#3E2823",
  },
  modalBtnPrimary: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#D4B2A7",
    shadowColor: "#3E2823",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 6,
  },
  modalBtnPrimaryText: {
    fontFamily: "Poppins",
    fontWeight: "600",
    color: "#FDF3F0",
  },
});
