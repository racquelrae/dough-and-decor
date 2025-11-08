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
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

/** ---------- Types ---------- */
type Item = { id: string; title: string; done: boolean; quantity: number; unit?: string };

const UNIT_OPTIONS = [
  "",
  "pcs",
  "dozen",
  "cup",
  "cups",
  "tsp",
  "tbsp",
  "oz",
  "lb",
  "g",
  "kg",
  "ml",
  "L",
  "pkg",
  "gal",
] as const;

type Unit = (typeof UNIT_OPTIONS)[number];

/** ---------- Bottom Sheet ---------- */
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
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(48)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 22,
          stiffness: 260,
          mass: 0.7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 48,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, opacity, translateY]);

  if (!mounted) return null;

  const sheetBody = (
    <View style={{ flex: 1, justifyContent: "flex-end" }}>
      <Pressable onPress={onClose} style={StyleSheet.absoluteFill}>
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              opacity,
              backgroundColor: "rgba(28, 15, 13, 0.2)",
            },
          ]}
        >
          <LinearGradient
            colors={["rgba(249,232,222,0.0)", "rgba(249,232,222,0.35)", "rgba(217,182,171,0.55)"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />
        </Animated.View>
      </Pressable>

      <Animated.View style={{ transform: [{ translateY }] }}>{children}</Animated.View>
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
          {sheetBody}
        </KeyboardAvoidingView>
      ) : (
        sheetBody
      )}
    </Modal>
  );
}

/** ---------- Data Hook ---------- */
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

/** ---------- Screen ---------- */
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
      rowBg: "rgba(237, 233, 227, 0.3)",
      rowBgChecked: "rgba(237, 199, 186, 0.80)",
      border: "#EAECEF",
      borderChecked: "#D4B2A7",
      text: "#344054",
      muted: "#BB9D93",
      accent: "#D4B2A7",
    }),
    []
  );

  const confirmRemove = (it: api.ItemDoc) =>
    Alert.alert("Delete item", `Remove “${it.title}”?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          remove(it.id);
        },
      },
    ]);

  const renderRightActions = (
    it: api.ItemDoc,
    _dragX: Animated.AnimatedInterpolation<string | number>,
    _progress: Animated.AnimatedInterpolation<string | number>,
    close?: () => void
  ) => (
    <View style={styles.rightActionWrap}>
      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          close?.();
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
        ref={(r) => {
          swipeRef = r;
        }}
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
              backgroundColor: checked ? Palette.rowBgChecked : Palette.rowBg,
              borderColor: checked ? Palette.borderChecked : Palette.border,
            },
          ]}
        >
          <Pressable
            onPress={() => toggle(item)}
            onLongPress={() => confirmRemove(item)}
            style={styles.rowLeft}
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: checked ? Palette.borderChecked : Palette.border,
                },
              ]}
            >
              {checked ? <View style={styles.checkboxDot} /> : null}
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.rowText,
                  {
                    color: checked ? Palette.muted : Palette.text,
                    textDecorationLine: checked ? "line-through" : "none",
                  },
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text style={[styles.rowSub, checked && { color: "rgba(62, 40, 35, 0.3)" }]}>
                {item.quantity} {item.unit ? item.unit : ""}
              </Text>
            </View>
          </Pressable>

          <View
            style={[
              styles.stepperWrap,
              checked && { backgroundColor: "rgba(236, 197, 210, 0.35)" },
            ]}
          >
            <Pressable
              onPress={() => setQty(item, Math.max(0, item.quantity - 1))}
              style={[styles.stepBtn, item.quantity <= 0 && { opacity: 0.4 }]}
            >
              <Text style={styles.stepBtnText}>–</Text>
            </Pressable>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <Pressable
              onPress={() => setQty(item, item.quantity + 1)}
              style={styles.stepBtn}
            >
              <Text style={styles.stepBtnText}>+</Text>
            </Pressable>
          </View>
        </View>
      </Swipeable>
    );
  };

  const gradientStops = useMemo(() => ["#F9E8DE", "#D9B6AB"], []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <LinearGradient colors={['#F9E8DE', '#D9B6AB']} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            style={styles.safeAreaInner}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <BackButton />
            <View style={styles.card}>
              <View style={styles.headerRow}>
                <View style={styles.headerText}>
                  <Text style={styles.title}>Shopping List</Text>
                  <Text style={styles.subtitle}>
                    Keep track of everything you need for the next bake. Check off finished items, adjust quantities, and stay organized.
                  </Text>
                </View>
                <Pressable
                  onPress={() => setShowAddSheet(true)}
                  style={({ pressed }) => [styles.addFloating, pressed && styles.addFloatingPressed]}
                  hitSlop={10}
                >
                  <Ionicons name="add" size={22} color="#3E2823" />
                </Pressable>
              </View>

              <ScrollView
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
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
                    <Pressable onPress={() => setShowAddSheet(true)} style={styles.emptyButton}>
                      <Text style={styles.emptyButtonText}>Add your first item</Text>
                    </Pressable>
                  </View>
                ) : (
                  <>
                    {items.map((it) => (
                      <View key={it.id} style={styles.rowContainer}>
                        {renderItem({ item: it })}
                      </View>
                    ))}
                    <View style={styles.addBarWrap}>
                      <Pressable style={styles.addFullWidth} onPress={() => setShowAddSheet(true)}>
                        <Text style={styles.addBtnText}>Add item</Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
        </LinearGradient>
      </GestureHandlerRootView>

      <BottomSheet
        visible={showAddSheet}
        onClose={() => {
          setShowAddSheet(false);
          setUnitMode(false);
        }}
      >
        {unitMode ? (
          <View style={styles.unitSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Choose unit</Text>
              <Pressable onPress={() => setUnitMode(false)}>
                <Ionicons name="close" size={20} color="#3E2823" />
              </Pressable>
            </View>
            <ScrollView style={styles.unitScroll}>
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
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Add item</Text>
            <View style={[styles.inputWrap, { marginTop: 14 }]}>
              <TextInput
                placeholder="Item name"
                placeholderTextColor="rgba(62, 40, 35, 0.35)"
                value={newItem}
                onChangeText={setNewItem}
                returnKeyType="next"
                style={styles.input}
              />
            </View>
            <View style={[styles.qtyAddRow, { marginTop: 14 }]}>
              <View style={styles.qtyInputWrap}>
                <Text style={styles.qtyLabel}>Qty</Text>
                <TextInput
                  keyboardType="number-pad"
                  value={newQty}
                  onChangeText={(t) => setNewQty(t.replace(/[^0-9]/g, ""))}
                  style={styles.qtyInput}
                  placeholder="1"
                  placeholderTextColor="rgba(62, 40, 35, 0.35)"
                  returnKeyType="done"
                />
              </View>
              <Pressable onPress={() => setUnitMode(true)} style={styles.unitBtn}>
                <Text style={styles.unitBtnText}>{newUnit || "unit"}</Text>
                <Ionicons name="chevron-down" size={16} color="rgba(62, 40, 35, 0.5)" />
              </Pressable>
            </View>
            <View style={styles.sheetActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setShowAddSheet(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.addConfirmBtn}
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
    </>
  );
}

/** ---------- Styles ---------- */
const styles = StyleSheet.create({
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  safeAreaInner: {
    flex: 1,
  },
  card: {
    flex: 1,
    marginTop: 12,
    backgroundColor: "rgba(255, 253, 249, 0.92)",
    borderRadius: 28,
    padding: 24,
    paddingTop: 60,
    shadowColor: "#46302B",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
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
  addFloating: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    shadowColor: "#3E2823",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 6,
  },
  addFloatingPressed: {
    opacity: 0.85,
  },
  listContent: {
    paddingTop: 18,
    paddingBottom: 96,
  },
  rowContainer: {
    marginBottom: 14,
    backgroundColor: "transparent",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: "#3E2823",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  checkboxDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#D4B2A7",
  },
  rowText: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Poppins",
    color: "#3E2823",
  },
  rowSub: {
    fontSize: 12,
    color: "rgba(62, 40, 35, 0.55)",
    marginTop: 2,
    fontFamily: "Poppins",
  },
  stepperWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(212, 178, 167, 0.25)",
  },
  stepBtnText: {
    fontSize: 20,
    lineHeight: 20,
    fontWeight: "400",
    fontFamily: "Poppins",
    color: "#3E2823",
    marginTop: 8,
  },
  qtyText: {
    minWidth: 28,
    textAlign: "center",
    fontWeight: "600",
    fontFamily: "Poppins",
    color: "#3E2823",
  },
  addBarWrap: {
    marginTop: 20,
  },
  addFullWidth: {
    borderRadius: 999,
    backgroundColor: "#D4B2A7",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    shadowColor: "#3E2823",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 6,
  },
  addBtnText: {
    fontFamily: "Poppins",
    fontWeight: "600",
    color: "#FDF3F0",
  },
  emptyWrap: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 72,
    gap: 12,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(212, 178, 167, 0.18)",
  },
  emptyIconText: {
    fontSize: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3E2823",
    fontFamily: "Poppins",
  },
  emptyText: {
    fontSize: 13,
    color: "rgba(62, 40, 35, 0.65)",
    textAlign: "center",
    fontFamily: "Poppins",
  },
  emptyButton: {
    marginTop: 10,
    borderRadius: 999,
    backgroundColor: "#D4B2A7",
    paddingHorizontal: 22,
    paddingVertical: 12,
    shadowColor: "#3E2823",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 6,
  },
  emptyButtonText: {
    fontFamily: "Poppins",
    fontWeight: "600",
    color: "#FDF3F0",
  },
  sheet: {
    backgroundColor: "rgba(255, 253, 249, 0.98)",
    padding: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#46302B",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -8 },
    elevation: 16,
    gap: 12,
  },
  unitSheet: {
    backgroundColor: "rgba(255, 253, 249, 0.98)",
    padding: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#46302B",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -8 },
    elevation: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3E2823",
    fontFamily: "Poppins",
  },
  inputWrap: {
    borderWidth: 1,
    borderColor: "rgba(236, 197, 210, 0.5)",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  input: {
    fontSize: 15,
    color: "#3E2823",
    fontFamily: "Poppins",
  },
  qtyAddRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  qtyInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(236, 197, 210, 0.5)",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
  },
  qtyLabel: {
    marginRight: 8,
    color: "#3E2823",
    fontFamily: "Poppins",
  },
  qtyInput: {
    width: 56,
    fontSize: 15,
    color: "#3E2823",
    fontFamily: "Poppins",
  },
  unitBtn: {
    minWidth: 110,
    borderWidth: 1,
    borderColor: "rgba(236, 197, 210, 0.5)",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
  },
  unitBtnText: {
    fontSize: 15,
    color: "#3E2823",
    fontFamily: "Poppins",
  },
  sheetActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  cancelBtnText: {
    fontFamily: "Poppins",
    fontWeight: "600",
    color: "#3E2823",
  },
  addConfirmBtn: {
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
  unitScroll: {
    marginTop: 12,
    maxHeight: 320,
  },
  unitMenuItem: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  unitMenuText: {
    fontSize: 15,
    color: "#3E2823",
    fontFamily: "Poppins",
  },
  rightActionWrap: {
    width: 96,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 12,
  },
  rightActionButton: {
    backgroundColor: "#C26A77",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: "#3E2823",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 4,
  },
  rightActionText: {
    color: "#FDF3F0",
    fontWeight: "600",
    fontFamily: "Poppins",
  },
});
