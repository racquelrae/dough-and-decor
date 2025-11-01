import { BackButton } from "@/components/BackButton";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Path, Svg } from 'react-native-svg';
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
        <LinearGradient
          colors={["#FFF5F7", "rgba(255,245,247,0.78)", "rgba(255,250,250,0.45)", "rgba(255,255,255,0)"]}
          locations={[0, 0.2, 0.4, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
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
      <LinearGradient colors={['#F9E8DE', '#D9B6AB']} style={styles.gradient}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.card}>
          <BackButton />
          <View style={styles.headerBlock}>
            <Text style={styles.header}>Measurement Converter</Text>
            <Text style={styles.subheader}>
              Flip between volume and weight units, convert instantly, and keep your ratios silky-smooth.
            </Text>
          </View>

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
                      setLeftUnit(VOLUME_UNITS[3]);
                      setRightUnit(VOLUME_UNITS[0]);
                      setLeftValue("1");
                      setRightValue(formatNumber(convert(1, VOLUME_UNITS[3], VOLUME_UNITS[0])));
                    } else {
                      setLeftUnit(WEIGHT_UNITS[1]);
                      setRightUnit(WEIGHT_UNITS[2]);
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

          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={styles.converterWrapper}
            >
              <View style={styles.converterPanel}>
                <View style={styles.valueColumn}>
                  <Text style={styles.fieldLabel}>From</Text>
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

                <Pressable onPress={swap} style={styles.swap}>
                  <Svg width="32" height="32" viewBox="0 0 256 256" fill="#8E746B">
                    <Path
                      d="M213.66,181.66l-32,32a8,8,0,0,1-11.32-11.32L188.69,184H48a8,8,0,0,1,0-16H188.69l-18.35-18.34a8,8,0,0,1,11.32-11.32l32,32A8,8,0,0,1,213.66,181.66Zm-139.32-64a8,8,0,0,0,11.32-11.32L67.31,88H208a8,8,0,0,0,0-16H67.31L85.66,53.66A8,8,0,0,0,74.34,42.34l-32,32a8,8,0,0,0,0,11.32Z"
                      stroke="#8E746B"
                      strokeWidth={0.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </Pressable>

                <View style={styles.valueColumn}>
                  <Text style={styles.fieldLabel}>To</Text>
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

              <View style={styles.helperPanel}>
                <Text style={styles.helperTitle}>Conversion Tips</Text>
                <Text style={styles.helperText}>
                  • Tap either value to edit and instantly convert.{'\n'}
                  • Unit lists are tailored to {category === "volume" ? "liquids" : "weights"}—swap tabs anytime.{'\n'}
                  • Tap the swap icon to quickly toggle directions.
                </Text>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </SafeAreaView>
      </ScrollView>
      </LinearGradient>

      <UnitPicker
        visible={pickSide !== null}
        current={(pickSide === "left" ? leftUnit : rightUnit).key}
        units={unitList}
        onClose={() => setPickSide(null)}
        onSelect={handlePick}
      />
    </>
  );
}

/** ---------- Styles ---------- */

const styles = StyleSheet.create({
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 48,
  },
  safeArea: {
    flex: 1,
  },
  card: {
    flex: 1,
    marginTop: -25,
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
    gap: 8,
    marginBottom: 24,
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
  header: {
    fontFamily: "Poppins",
    fontSize: 24,
    fontWeight: "700",
    color: "#3E2823",
  },
  subheader: {
    fontFamily: "Poppins",
    fontSize: 14,
    color: "rgba(62, 40, 35, 0.7)",
    lineHeight: 20,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },
  toggleChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#F3E0DC",
    shadowColor: "#3E2823",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 6,
  },
  toggleChipActive: {
    backgroundColor: "#D4B2A7",
  },
  toggleText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#8E746B",
    fontFamily: "Poppins",
  },
  toggleTextActive: {
    color: "#2B1E1A",
  },
  converterWrapper: {
    flex: 1,
  },
  converterPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: "rgba(234,193,183,0.18)",
    shadowColor: "#3E2823",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 10,
  },
  valueColumn: {
    flex: 1,
    alignItems: "center",
    gap: 10,
  },
  fieldLabel: {
    fontFamily: "Poppins",
    fontSize: 13,
    color: "rgba(62, 40, 35, 0.65)",
  },
  valueBox: {
    width: "100%",
    textAlign: "center",
    fontSize: 30,
    fontFamily: "Poppins",
    fontWeight: "700",
    paddingVertical: 18,
    paddingHorizontal: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    color: "#2B1E1A",
    shadowColor: "#3E2823",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 6,
  },
  unitChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#EAC1B7",
    shadowColor: "#3E2823",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 6,
  },
  unitChipText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#5A4038",
    fontFamily: "Poppins",
  },
  swap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF3EF",
    borderWidth: 1,
    borderColor: "rgba(212,178,167,0.4)",
    shadowColor: "#3E2823",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 6,
  },
  helperPanel: {
    marginTop: 20,
    borderRadius: 20,
    padding: 18,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    shadowColor: "#3E2823",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  helperTitle: {
    fontFamily: "Poppins",
    fontSize: 15,
    fontWeight: "600",
    color: "#3E2823",
    marginBottom: 8,
  },
  helperText: {
    fontFamily: "Poppins",
    fontSize: 13,
    color: "rgba(62, 40, 35, 0.7)",
    lineHeight: 18,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(28, 15, 13, 0.12)",
    padding: 24,
    justifyContent: "center",
  },
  modalCard: {
    borderRadius: 24,
    backgroundColor: "rgba(255, 253, 249, 0.98)",
    padding: 20,
    shadowColor: "#46302B",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3E2823",
    marginBottom: 10,
    fontFamily: "Poppins",
  },
  unitRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  unitRowActive: {
    backgroundColor: "rgba(236, 197, 210, 0.35)",
  },
  unitRowText: {
    fontSize: 16,
    color: "#3E2823",
    fontFamily: "Poppins",
  },
  unitRowTextActive: {
    fontWeight: "700",
  },
});
