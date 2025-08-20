import { BackButton } from "@/components/BackButton";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** ---------- Units & Conversion ---------- */
/** Base unit: milliliter (volume) and gram (weight) */
type UnitCategory = "volume" | "weight";

type UnitKey =
  | "tsp"
  | "tbsp"
  | "floz"
  | "cup"
  | "pint"
  | "quart"
  | "liter"
  | "ml"
  | "gallon"
  | "g"
  | "kg"
  | "oz"
  | "lb";

type UnitDef = { key: UnitKey; label: string; baseFactor: number };

const VOLUME_UNITS: UnitDef[] = [
  { key: "tsp", label: "tsp", baseFactor: 4.92892159375 },
  { key: "tbsp", label: "Tbsp", baseFactor: 14.78676478125 },
  { key: "floz", label: "fl oz", baseFactor: 29.5735295625 },
  { key: "cup", label: "cup", baseFactor: 236.5882365 },
  { key: "pint", label: "pint", baseFactor: 473.176473 },
  { key: "quart", label: "quart", baseFactor: 946.352946 },
  { key: "liter", label: "L", baseFactor: 1000 },
  { key: "ml", label: "mL", baseFactor: 1 },
  { key: "gallon", label: "gal", baseFactor: 3785.411784 },
];

const WEIGHT_UNITS: UnitDef[] = [
  { key: "g", label: "g", baseFactor: 1 },
  { key: "kg", label: "kg", baseFactor: 1000 },
  { key: "oz", label: "oz", baseFactor: 28.3495 },
  { key: "lb", label: "lb", baseFactor: 453.592 },
];

function convert(value: number, from: UnitDef, to: UnitDef): number {
  if (!isFinite(value)) return 0;
  const base = value * from.baseFactor;
  return base / to.baseFactor;
}

function formatNumber(n: number): string {
  if (!isFinite(n)) return "0";
  const abs = Math.abs(n);
  const digits =
    abs >= 100 ? 0 : abs >= 10 ? 1 : abs >= 1 ? 2 : abs >= 0.1 ? 3 : 4;
  return Number(n.toFixed(digits)).toString();
}

/** ---------- Unit Picker Modal ---------- */

function UnitPicker({
  visible,
  current,
  units,
  onClose,
  onSelect,
}: {
  visible: boolean;
  current: UnitKey;
  units: UnitDef[];
  onClose: () => void;
  onSelect: (u: UnitDef) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Choose unit</Text>
          <ScrollView
            style={{ maxHeight: 340 }}
            contentContainerStyle={{ paddingVertical: 4 }}
            showsVerticalScrollIndicator={false}
          >
            {units.map((u) => {
              const active = u.key === current;
              return (
                <Pressable
                  key={u.key}
                  style={[styles.unitRow, active && styles.unitRowActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    onSelect(u);
                    onClose();
                  }}
                >
                  <Text style={[styles.unitRowText, active && styles.unitRowTextActive]}>
                    {u.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
}

/** ---------- Main Screen ---------- */

export default function MeasurementConverter() {
  const [category, setCategory] = useState<UnitCategory>("volume");
  const [leftUnit, setLeftUnit] = useState<UnitDef>(VOLUME_UNITS[3]); // cup
  const [rightUnit, setRightUnit] = useState<UnitDef>(VOLUME_UNITS[0]); // tsp

  const [leftValue, setLeftValue] = useState("1");
  const [rightValue, setRightValue] = useState(() =>
    formatNumber(convert(1, VOLUME_UNITS[3], VOLUME_UNITS[0]))
  );

  const [pickSide, setPickSide] = useState<"left" | "right" | null>(null);

  const unitList = category === "volume" ? VOLUME_UNITS : WEIGHT_UNITS;

  const updateFromLeft = useCallback(
    (raw: string) => {
      setLeftValue(raw);
      const n = parseFloat(raw);
      if (isNaN(n)) {
        setRightValue("");
        return;
      }
      setRightValue(formatNumber(convert(n, leftUnit, rightUnit)));
    },
    [leftUnit, rightUnit]
  );

  const updateFromRight = useCallback(
    (raw: string) => {
      setRightValue(raw);
      const n = parseFloat(raw);
      if (isNaN(n)) {
        setLeftValue("");
        return;
      }
      setLeftValue(formatNumber(convert(n, rightUnit, leftUnit)));
    },
    [leftUnit, rightUnit]
  );

  const handlePick = useCallback(
    (unit: UnitDef) => {
      if (pickSide === "left") {
        setLeftUnit(unit);
        const n = parseFloat(leftValue) || 0;
        setRightValue(formatNumber(convert(n, unit, rightUnit)));
      } else if (pickSide === "right") {
        setRightUnit(unit);
        const n = parseFloat(leftValue) || 0;
        setRightValue(formatNumber(convert(n, leftUnit, unit)));
      }
      setPickSide(null);
    },
    [pickSide, leftValue, leftUnit, rightUnit]
  );

  const swap = useCallback(() => {
    Haptics.selectionAsync();
    setLeftUnit((prev) => {
      const newLeft = rightUnit;
      setRightUnit(prev);
      const n = parseFloat(leftValue) || 0;
      setRightValue(formatNumber(convert(n, newLeft, prev)));
      return newLeft;
    });
  }, [leftValue, rightUnit]);

  const gradientStops = useMemo(
    () => [
      "#FFF7F5",
      "rgba(255,247,245,0.85)",
      "rgba(255,247,245,0.40)",
      "#FFFDF9",
    ] as [string, string, ...string[]],
    []
  );

  return (
  <>
    <Stack.Screen options={{ headerShown: false }} />
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFDF9" }}>
      <LinearGradient colors={gradientStops} style={StyleSheet.absoluteFillObject} />

      <BackButton />
      <View style={styles.container}>
        <Text style={styles.header}>Measurement Conversion</Text>
        <View style={styles.toggleRow}>
            {(["volume", "weight"] as UnitCategory[]).map((c) => {
              const active = c === category;
              return (
                <Pressable
                  key={c}
                  style={[styles.toggleChip, active && styles.toggleChipActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setCategory(c);
                    if (c === "volume") {
                      setLeftUnit(VOLUME_UNITS[3]); // cup
                      setRightUnit(VOLUME_UNITS[0]); // tsp
                      setLeftValue("1");
                      setRightValue(formatNumber(convert(1, VOLUME_UNITS[3], VOLUME_UNITS[0])));
                    } else {
                      setLeftUnit(WEIGHT_UNITS[1]); // kg
                      setRightUnit(WEIGHT_UNITS[2]); // oz
                      setLeftValue("1");
                      setRightValue(formatNumber(convert(1, WEIGHT_UNITS[1], WEIGHT_UNITS[2])));
                    }
                  }}
                >
                  <Text style={[styles.toggleText, active && styles.toggleTextActive]}>
                    {c === "volume" ? "Volume" : "Weight"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

        {/* Body: converter panel a bit higher on screen */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
          >
            <View style={styles.contentWrapper}>
              <View style={styles.panel}>
                <View style={styles.row}>
                  {/* Left */}
                  <View style={styles.side}>
                    <TextInput
                      value={leftValue}
                      onChangeText={updateFromLeft}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor="#B9A8A1"
                      style={styles.valueBox}
                    />
                    <Pressable
                      onPress={() => { Haptics.selectionAsync(); setPickSide("left"); }}
                      style={styles.unitChip}
                    >
                      <Text style={styles.unitChipText}>{leftUnit.label}</Text>
                    </Pressable>
                  </View>

                  {/* Swap */}
                  <Pressable onPress={swap} style={styles.swap}>
                    <Text style={styles.swapIcon}>⇄</Text>
                  </Pressable>

                  {/* Right */}
                  <View style={styles.side}>
                    <TextInput
                      value={rightValue}
                      onChangeText={updateFromRight}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor="#B9A8A1"
                      style={styles.valueBox}
                    />
                    <Pressable
                      onPress={() => { Haptics.selectionAsync(); setPickSide("right"); }}
                      style={styles.unitChip}
                    >
                      <Text style={styles.unitChipText}>{rightUnit.label}</Text>
                    </Pressable>
                  </View>
                </View>

                <Text style={styles.helper}>
                  Tip: tap either value or unit to edit • {category} units only
                </Text>
              </View>
            </View>

            <UnitPicker
              visible={pickSide !== null}
              current={(pickSide === "left" ? leftUnit : rightUnit).key}
              units={unitList}
              onClose={() => setPickSide(null)}
              onSelect={handlePick}
            />
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
        </View>
    </SafeAreaView>
  </>
);
}

/** ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, position: "relative", backgroundColor: "#FFFDF9" },             
  header: {
    marginTop: 36,
    marginLeft: 8,
    marginBottom: 36,
    fontFamily: "Poppins",
    fontSize: 24,
    fontWeight: "700",
    color: "#1C0F0D",
  },

  toggleRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "flex-start",                               
    paddingTop: 8,                                              
  },
  toggleChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#F3E0DC",
  },
  toggleChipActive: {
    backgroundColor: "#EAC1B7",
  },
  toggleText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#8E746B",
  },
  toggleTextActive: {
    color: "#2B1E1A",
  },
  panel: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: "rgba(234,193,183,0.15)",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    justifyContent: "space-between",
  },
  side: { flex: 1, alignItems: "center", gap: 12 },
  valueBox: {
    width: "100%",
    textAlign: "center",
    fontSize: 32,
    fontWeight: "800",
    paddingVertical: 22,
    borderRadius: 22,
    backgroundColor: "#EAC1B7",
    color: "#2B1E1A",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  unitChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#EAC1B7",
    opacity: 0.95,
  },
  unitChipText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#5A4038",
    letterSpacing: 0.3,
  },
  swap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: "#FFEDE8",
    borderWidth: 1,
    borderColor: "rgba(234,193,183,0.65)",
  },
  swapIcon: { fontSize: 22, fontWeight: "700", color: "#3B2A25" },
  helper: { marginTop: 16, textAlign: "center", color: "#8E746B" },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)", padding: 24, justifyContent: "center" },
  modalCard: { borderRadius: 20, backgroundColor: "#FFF9F7", padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: "800", color: "#3B2A25", marginBottom: 6 },
  unitRow: { paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12 },
  unitRowActive: { backgroundColor: "#FFE5DE" },
  unitRowText: { fontSize: 16, color: "#3B2A25" },
  unitRowTextActive: { fontWeight: "700" },
});
