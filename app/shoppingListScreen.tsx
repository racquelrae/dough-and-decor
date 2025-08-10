import { BackButton } from "@/components/BackButton";
import { Stack } from "expo-router";
import { getAuth } from "firebase/auth";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Animated,
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
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import * as api from "../firebase/shoppingList";
import * as Haptics from "expo-haptics";


type Item = { id: string; title: string; done: boolean; quantity: number; unit?: string };

// Common kitchen units + blank
const UNIT_OPTIONS = ["", "pcs", "dozen", "cup", "cups", "tsp", "tbsp", "oz", "lb", "g", "kg", "ml", "L", "pkg", "gal"] as const;
type Unit = (typeof UNIT_OPTIONS)[number];

function BottomSheet({
  visible,
  onClose,
  children,
  avoidKeyboard = true,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  avoidKeyboard?: boolean;
}) {
  const [mounted, setMounted] = useState(visible);
  const opacity = useRef(new Animated.Value(0)).current;      // backdrop
  const translateY = useRef(new Animated.Value(24)).current;  // sheet lift

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 20,
          stiffness: 240,
          mass: 0.6,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 140, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 24, duration: 140, useNativeDriver: true }),
      ]).start(({ finished }) => finished && setMounted(false));
    }
  }, [visible, opacity, translateY]);

  if (!mounted) return null;

  const Body = (
    <View style={{ flex: 1, justifyContent: "flex-end" }}>
      {/* Backdrop */}
      <Pressable
        onPress={onClose}
        style={{ ...StyleSheet.absoluteFillObject }}
      >
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.22)",
            opacity,
          }}
        />
      </Pressable>

      {/* Sheet */}
      <Animated.View
        style={{
          transform: [{ translateY }],
        }}
      >
        {children}
      </Animated.View>
    </View>
  );

  return (
    <Modal
        transparent
        visible
        animationType="none"
        statusBarTranslucent
        presentationStyle="overFullScreen"
        onRequestClose={onClose}
    >
        {avoidKeyboard ? (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            {Body}
        </KeyboardAvoidingView>
        ) : (
        Body
        )}
    </Modal>
    );
}

export function useShoppingList(uid?: string) {
  const [items, setItems] = useState<api.ItemDoc[]>([]);
  useEffect(() => {
    if (!uid) return;
    return api.subscribeItems(uid, setItems);
  }, [uid]);

  const add = useCallback(async (title: string, qty: number, unit?: string) => {
    if (!uid || !title) return;
    await api.addItem(uid, { title, quantity: qty, unit });
  }, [uid]);

  const toggle = useCallback(async (it: api.ItemDoc) => {
    if (!uid) return;
    await api.toggleItem(uid, it);
  }, [uid]);

  const setQty = useCallback(async (it: api.ItemDoc, qty: number) => {
    if (!uid) return;
    await api.updateQty(uid, it, qty);
  }, [uid]);

  const remove = useCallback(async (id: string) => {
    if (!uid) return;
    await api.removeItem(uid, id);
  }, [uid]);

  return { items, add, toggle, setQty, remove };
}

export default function ShoppingList() {
  const uid = getAuth().currentUser?.uid;
  const { items, add, toggle, setQty, remove } = useShoppingList(uid);
  const [newItem, setNewItem] = useState("");
  const [newQty, setNewQty] = useState<string>("1");
  const [newUnit, setNewUnit] = useState<Unit>("");
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [unitMode, setUnitMode] = useState(false);

  const Palette = useMemo(
    () => ({
      bg: "#FFFDF9",
      card: "rgba(237,233,227,0.3)",
      cardChecked: "rgba(237,199,186,0.30)",
      border: "#EAECEF",
      borderChecked: "#D4B2A7",
      text: "#344054",
      textMuted: "#BB9D93",
      pill: "#D4B2A7",
      white: "#FFFFFF",
    }),
    []
  );

  const confirmRemove = (it: api.ItemDoc) =>
    Alert.alert("Delete item", `Remove “${it.title}”?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        remove(it.id);
      }},
    ]);

  const renderRightActions = (it: api.ItemDoc, _dragX: any, _progress: any, close?: () => void) => (
    <View style={styles.rightActionWrap}>
        <Pressable
        onPress={() => {
            Haptics.selectionAsync();
            close?.(); // neatly slide it back
            confirmRemove(it);
        }}
        style={styles.rightActionButton}
        >
        <Text style={styles.rightActionText}>Delete</Text>
        </Pressable>
    </View>
    );


  const renderItem = ({ item }: { item: api.ItemDoc }) => {
    let swipeRef: Swipeable | null = null;
    const checked = item.done;

    return (
    <Swipeable
      ref={(r) => {swipeRef = r;}}
      friction={2}
      rightThreshold={40}
      renderRightActions={(progress, dragX) =>
        renderRightActions(item, dragX, progress, () => swipeRef?.close())
      }
    >
      <View
        style={[
          styles.row,
          {
            backgroundColor: checked ? Palette.cardChecked : Palette.card,
            borderColor: checked ? Palette.borderChecked : Palette.border,
          },
        ]}
      >
        <Pressable onPress={() => toggle(item)} onLongPress={() => confirmRemove(item)} style={styles.rowLeft}>
          <View style={[styles.checkbox, { borderColor: checked ? Palette.textMuted : Palette.border }]}>
            {checked ? <View style={styles.checkboxDot} /> : null}
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.rowText,
                {
                  color: checked ? Palette.textMuted : Palette.text,
                  textDecorationLine: checked ? "line-through" : "none",
                },
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={styles.rowSub}>
              {item.quantity} {item.unit ? item.unit : ""}
            </Text>
          </View>
        </Pressable>

        <View style={styles.stepperWrap}>
          <Pressable onPress={() => setQty(item, Math.max(0, item.quantity - 1))} style={[styles.stepBtn, { borderColor: Palette.border }]}>
            <Text style={styles.stepBtnText}>–</Text>
          </Pressable>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <Pressable onPress={() => setQty(item, item.quantity + 1)} style={[styles.stepBtn, { borderColor: Palette.border }]}>
            <Text style={styles.stepBtnText}>+</Text>
          </Pressable>
        </View>
      </View>
    </Swipeable>
  );
};


  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={[styles.screen, { backgroundColor: Palette.bg }]}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <BackButton />
        <View style={styles.headerWrap}>
          <Text style={styles.title}>Grocery Shopping List</Text>
        </View>

        <ScrollView
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
            >
            {items.length === 0 ? (
                <View style={styles.emptyWrap}>
                <View style={styles.emptyIcon}>
                    <Text style={styles.emptyIconText}>🛒</Text>
                </View>
                <Text style={styles.emptyTitle}>No items yet</Text>
                <Text style={styles.emptyText}>
                    Add what you need for your next bake.
                </Text>

                <Pressable
                    onPress={() => setShowAddSheet(true)}
                    style={[styles.addBtn, { backgroundColor: Palette.pill, alignSelf: "stretch" }]}
                >
                    <Text style={styles.addBtnText}>Add your first item</Text>
                </Pressable>
                </View>
            ) : (
                <>
                {items.map((it) => (
                    <View key={it.id} style={{ marginBottom: 12 }}>
                    {renderItem({ item: it })}
                    </View>
                ))}

                {/* Add launcher (for non-empty lists) */}
                <View style={[styles.addBarWrap, { paddingHorizontal: 16 }]}>
                    <Pressable
                    style={[styles.addBtn, { backgroundColor: Palette.pill }]}
                    onPress={() => setShowAddSheet(true)}
                    >
                    <Text style={styles.addBtnText}>Add item</Text>
                    </Pressable>
                </View>

                <View style={{ height: 24 }} />
                </>
            )}
            </ScrollView>


        {/* Add Item Sheet */}
        <BottomSheet visible={showAddSheet} onClose={() => {
            setShowAddSheet(false);
            setUnitMode(false); // reset if they dismiss
            }}>
            {unitMode ? (
                // ===== Unit list view =====
                <View style={styles.unitSheet}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={styles.sheetTitle}>Choose unit</Text>
                    <Pressable onPress={() => setUnitMode(false)}>
                    <Text style={{ fontSize: 16 }}>✕</Text>
                    </Pressable>
                </View>

                <ScrollView style={{ marginTop: 8, maxHeight: 320 }}>
                    {UNIT_OPTIONS.map((u) => (
                    <Pressable
                        key={u || "none"}
                        onPress={() => {
                        setNewUnit(u as Unit);
                        setUnitMode(false);
                        }}
                        style={styles.unitMenuItem}
                    >
                        <Text style={styles.unitMenuText}>{u || "(none)"}</Text>
                    </Pressable>
                    ))}
                </ScrollView>
                </View>
            ) : (
                // ===== Add item form =====
                <View style={styles.sheet}>
                <Text style={styles.sheetTitle}>Add item</Text>

                {/* Name */}
                <View style={[styles.inputWrap, { borderColor: Palette.border, marginTop: 12 }]}>
                    <TextInput
                    placeholder="Item name"
                    placeholderTextColor="#98A2B3"
                    value={newItem}
                    onChangeText={setNewItem}
                    returnKeyType="next"
                    style={styles.input}
                    />
                </View>

                {/* Qty + Unit */}
                <View style={[styles.qtyAddRow, { marginTop: 12 }]}>
                    <View style={[styles.qtyInputWrap, { borderColor: Palette.border }]}>
                    <Text style={styles.qtyLabel}>Qty</Text>
                    <TextInput
                        keyboardType="number-pad"
                        value={newQty}
                        onChangeText={(t) => setNewQty(t.replace(/[^0-9]/g, ""))}
                        style={styles.qtyInput}
                        placeholder="1"
                        placeholderTextColor="#98A2B3"
                        returnKeyType="done"
                    />
                    </View>

                    <Pressable
                    onPress={() => setUnitMode(true)}
                    style={[styles.unitBtn, { borderColor: Palette.border, backgroundColor: "#FFFFFF" }]}
                    >
                    <Text style={styles.unitBtnText}>{newUnit || "unit"}</Text>
                    <Text style={styles.chev}>▾</Text>
                    </Pressable>
                </View>

                {/* Actions */}
                <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
                    <Pressable style={[styles.cancelBtn]} onPress={() => setShowAddSheet(false)}>
                    <Text style={[styles.addBtnText, { color: "#1C0F0D" }]}>Cancel</Text>
                    </Pressable>
                    <Pressable
                    style={[styles.addBtn, { flex: 1, backgroundColor: Palette.pill, marginBottom: 0 }]}
                    onPress={() => {
                        add(newItem, Number(newQty), newUnit);
                        setShowAddSheet(false);
                        setUnitMode(false);
                        setNewItem("");
                        setNewQty("1");
                        setNewUnit("");
                    }}
                    >
                    <Text style={styles.addBtnText}>Add</Text>
                    </Pressable>
                </View>
                </View>
            )}
            </BottomSheet>
        </KeyboardAvoidingView>
        </GestureHandlerRootView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerWrap: { paddingTop: 132, paddingHorizontal: 16, gap: 16, paddingBottom: 24 },
  title: { fontSize: 20, fontWeight: "700", color: "#1C0F0D", fontFamily: "Poppins" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 8 },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxDot: { width: 10, height: 10, borderRadius: 2, backgroundColor: "#BB9D93" },
  rowText: { fontSize: 14, fontWeight: "600", fontFamily: "Poppins" },
  rowSub: { fontSize: 12, color: "#98A2B3", marginTop: 2, fontFamily: "Poppins" },

  stepperWrap: { flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 8 },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnText: {
    fontSize: 18,
    lineHeight: 18,
    fontWeight: "400",
    fontFamily: "Poppins",
    textAlign: "center",
    marginTop: 7,
    color: "#1C0F0D",
  },
  qtyText: { width: 24, textAlign: "center", fontWeight: "700", fontFamily: "Poppins", color: "#1C0F0D" },

  addBarWrap: { gap: 12, paddingTop: 8, paddingBottom: 16 },
  inputWrap: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  input: { fontSize: 14, color: "#1C0F0D", fontFamily: "Poppins" },

  qtyAddRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  qtyInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  qtyLabel: { marginRight: 8, color: "#344054", fontFamily: "Poppins" },
  qtyInput: { width: 56, fontSize: 14, color: "#1C0F0D", fontFamily: "Poppins" },

  unitBtn: {
    minWidth: 84,
    height: 44,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    gap: 6,
  },
  unitBtnText: { fontSize: 14, color: "#1C0F0D", fontFamily: "Poppins" },
  chev: { fontSize: 12, color: "#98A2B3", marginLeft: 6 },

  unitMenuItem: { paddingHorizontal: 12, paddingVertical: 10 },
  unitMenuText: { fontSize: 14, color: "#1C0F0D", fontFamily: "Poppins" },

  addBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  addBtnText: { color: "#FFFFFF", fontWeight: "600", fontFamily: "Poppins" },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },
  backdropLight: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
    justifyContent: "flex-end",
  },
  sheet: {
  backgroundColor: "#FFF",
  padding: 16,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: -2 },
  elevation: 6,
  paddingBottom: 32,
  },
  unitSheet: {
  backgroundColor: "#FFF",
  padding: 16,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: -2 },
  elevation: 6,
  },
  sheetTitle: { fontSize: 16, fontWeight: "700", color: "#1C0F0D", fontFamily: "Poppins" },
  cancelBtn: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F4F7",
    flex: 1,
  },
  rightActionWrap: {
    width: 100,
    height: "100%",
    backgroundColor: "#FFFAF0",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 12,
  },
  rightActionButton: {
    backgroundColor: "#FF6347",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  rightActionText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontFamily: "Poppins",
  },
  emptyWrap: {
  alignItems: "center",
  paddingHorizontal: 16,
  paddingTop: 56,
  paddingBottom: 64,
  gap: 8,
},
emptyIcon: {
  width: 64,
  height: 64,
  borderRadius: 32,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(212,178,167,0.15)", // soft pill tint
  marginBottom: 8,
},
emptyIconText: { fontSize: 28 },
emptyTitle: { fontSize: 18, fontWeight: "700", color: "#1C0F0D", fontFamily: "Poppins" },
emptyText: { fontSize: 14, color: "#98A2B3", textAlign: "center", fontFamily: "Poppins", marginBottom: 8 },

});
