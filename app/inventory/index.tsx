import { BackButton } from "@/components/BackButton";
import { ItemRow } from "@/components/inventory/itemRow";
import { addCategory, deleteCategory, watchCategories, watchItems } from "@/firebase/inventory";
import type { InventoryCategory, InventoryItem } from "@/types/inventory";
import type { RootStackParamList } from '@/types/navigation';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    FlatList, Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    Platform,
    KeyboardAvoidingView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InventoryIndex() {
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // listen to tabs
  useEffect(() => {
    const unsub = watchCategories(cs => {
      setCategories(cs);
      if (!activeCatId && cs.length) setActiveCatId(cs[0].id);
    });
    return () => unsub();
  }, [activeCatId]);

  // listen to items of active tab
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
      { text: "Delete", style: "destructive", onPress: async () => {
        await deleteCategory(cat.id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } }
    ]);
  }, []);

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFDF9" }}>
        <BackButton />
        <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 72 : 0}
        >
        <FlatList
            data={items}
            keyExtractor={(it) => it.id}
            renderItem={({ item }) => <ItemRow item={item} categoryId={activeCatId!} />}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
            <View style={{ paddingTop: 8 }}>
                <Text style={styles.header}>Inventory</Text>

                {/* Tab bar (chips) */}
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
                        onPress={() => { Haptics.selectionAsync(); setActiveCatId(cat.id); }}
                        onLongPress={() => removeGroup(cat)}
                        style={[styles.chip, active && styles.chipActive]}
                    >
                        <Text allowFontScaling={false} style={[styles.chipText, active && styles.chipTextActive]}>
                        {cat.name}
                        </Text>
                    </Pressable>
                    );
                })}
                <Pressable onPress={() => setShowNewGroup(true)} style={styles.addChip}>
                    <Ionicons name="add" size={16} />
                    <Text allowFontScaling={false} style={styles.addChipText}>Add Group</Text>
                </Pressable>
                </ScrollView>
            </View>
            }
            ListHeaderComponentStyle={{ marginBottom: 8 }}
            ListEmptyComponent={
            <View style={{ paddingVertical: 40, opacity: 0.6, alignItems: "center" }}>
                <Text>No items yet. Tap “Add”.</Text>
            </View>
            }
        />

        {!!activeCatId && (
        <Pressable
            onPress={() => navigation.navigate("InventoryNew", { categoryId: activeCatId })}
            style={styles.fab}
            hitSlop={8}
        >   
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.fabText}>Add</Text>
        </Pressable>
        )}

        {/* New Group modal */}
        <Modal
            visible={showNewGroup}
            transparent
            animationType="fade"
            onRequestClose={() => setShowNewGroup(false)}
            >
            {/* Dimmed backdrop */}
            <View style={styles.modalBackdrop}>
                {/* Backdrop tap to dismiss */}
                <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowNewGroup(false)} />

                {/* This KAV is what pushes the sheet above the keyboard */}
                <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? -8 : 0} // tweak if needed
                style={styles.modalKAV}
                >
                <ScrollView
                    bounces={false}
                    keyboardShouldPersistTaps="always"
                    contentContainerStyle={{ justifyContent: "flex-end", flexGrow: 1, paddingBottom: 8 }}
                >
                    <View style={styles.modalCard}>
                    <Text style={styles.modalTitle}>New Group</Text>
                    <TextInput
                        placeholder="e.g., Sprinkles, Tools"
                        value={newGroupName}
                        onChangeText={setNewGroupName}
                        style={styles.input}
                        autoFocus
                        returnKeyType="done"
                        blurOnSubmit
                    />
                    <View style={styles.modalRow}>
                        <Pressable onPress={() => setShowNewGroup(false)} style={styles.btnSecondary}><Text>Cancel</Text></Pressable>
                        <Pressable onPress={createGroup} style={styles.btnPrimary}><Text style={{ color: "#fff" }}>Create</Text></Pressable>
                    </View>
                    </View>
                </ScrollView>
                </KeyboardAvoidingView>
            </View>
            </Modal>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  header: { fontSize: 20, fontWeight: "700", fontFamily: "Poppins", paddingHorizontal: 16, marginTop: 64, marginBottom: 8 },
  tabBar: { height: 40, paddingHorizontal: 12, paddingBottom: 8, alignItems: "center" },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 14, backgroundColor: "#EEE7E3", marginRight: 8 },
  chipActive: { backgroundColor: "#E2C9C0" },
  chipText: { fontWeight: "600", opacity: 0.8 },
  chipTextActive: { opacity: 1 },
  addChip: { flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 14, backgroundColor: "#EAD4CC" },
  addChipText: { marginLeft: 4, fontWeight: "700" },

  fab: { position: "absolute", right: 16, bottom: 24, flexDirection: "row", alignItems: "center", backgroundColor: "#D8A79B", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24, shadowOpacity: 0.2, shadowRadius: 8 },
  fabText: { color: "#fff", marginLeft: 6, fontWeight: "700" },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.2)", justifyContent: "flex-end" },
  modalKAV: { flex: 1, justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#fff", padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalTitle: { fontWeight: "800", fontSize: 16, marginBottom: 8 },
  input: { backgroundColor: "#fff", borderRadius: 12, padding: 10, borderWidth: 1, borderColor: "#eee" },
  modalRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 12, gap: 12 },
  btnSecondary: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: "#eee" },
  btnPrimary: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: "#C99084" },
});
