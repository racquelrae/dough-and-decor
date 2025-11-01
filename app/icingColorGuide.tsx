import React, { useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, useWindowDimensions } from "react-native";
import ColorTiles, { Swatch } from "../components/ColorTiles";
import { BackButton } from "../components/BackButton";
import { AMERICOLOR_SWATCHES } from "@/data/icingSwatches";
import { Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function IcingColorGuide() {
  const { width, height } = useWindowDimensions();
  const cols = width > 720 ? 4 : width > 480 ? 3 : 2;
  const fadeHeight = Math.min(height * 0.55, 520);
  const [selected, setSelected] = useState<Swatch | null>(null);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={["#F9E8DE", "#D9B6AB"]} style={styles.gradient} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.card}>
          <BackButton />
          <LinearGradient
            colors={[
              "#FFF5F7",
              "rgba(255,245,247,0.85)",
              "rgba(255,250,250,0.65)",
              "rgba(255,255,255,0.35)",
              "rgba(255,255,255,0)",
            ]}
            locations={[0, 0.12, 0.26, 0.42, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.cardFade, { height: fadeHeight }]}
            pointerEvents="none"
          />

          <View style={styles.headerBlock}>
            <Text style={styles.title}>Icing Color Blending Guide</Text>
            <Text style={styles.subtitlePrimary}>
              Tap any hue to reveal its name, hex code, and AmeriColor mixing ratios.
            </Text>
            <Text style={styles.subtitleSecondary}>
              Ratios are listed in “parts.” Let colors rest to deepen, and tweak to taste for each recipe.
            </Text>
          </View>

          <View style={styles.tilesWrapper}>
              <ColorTiles
                data={AMERICOLOR_SWATCHES}
                columns={cols}
                onSelect={(swatch) => setSelected(swatch)}
              />
          </View>

          {selected && (
            <View style={styles.selectionCard}>
              <View style={[styles.preview, { backgroundColor: selected.hex }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.selectedName}>{selected.name}</Text>
                <Text style={styles.selectedHex}>{selected.hex}</Text>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
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
  card: {
    flex: 1,
    margin: 16,
    marginTop: 20,
    backgroundColor: "rgba(255, 253, 249, 0.92)",
    borderRadius: 28,
    padding: 24,
    paddingTop: 72,
    overflow: "hidden",
    shadowColor: "#46302B",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
  },
  cardFade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  headerBlock: {
    gap: 10,
    marginBottom: 20,
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
    color: "#1C0F0D",
    fontSize: 28,
    fontWeight: "700",
  },
  subtitlePrimary: {
    fontFamily: "Poppins",
    fontSize: 14,
    color: "#3E2823",
  },
  subtitleSecondary: {
    fontFamily: "Poppins",
    fontSize: 13,
    color: "rgba(62, 40, 35, 0.7)",
    lineHeight: 20,
  },
  tilesWrapper: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 12,
  },
  selectionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#3E2823",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 8,
  },
  preview: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(62, 40, 35, 0.15)",
  },
  selectedName: {
    fontFamily: "Poppins",
    fontWeight: "600",
    color: "#3E2823",
  },
  selectedHex: {
    fontFamily: "Poppins",
    color: "rgba(62, 40, 35, 0.7)",
    fontSize: 12,
  },
});
