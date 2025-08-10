import React, { useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, useWindowDimensions } from "react-native";
import ColorTiles, { Swatch } from "../components/ColorTiles"; 
import { BackButton } from "../components/BackButton"; 
import { AMERICOLOR_SWATCHES } from "@/data/icingSwatches";
import { Stack } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';

export default function IcingColorGuide() {
  const { width, height } = useWindowDimensions();
  const cols = width > 720 ? 4 : width > 480 ? 3 : 2;
  const fadeHeight = Math.min(height * 0.55, 520);
  const [selected, setSelected] = useState<Swatch | null>(null);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={[
            "#FFF5F7",                    // softer, slightly warmer pink at the top
            "rgba(255,245,247,0.85)",      // very gentle blush
            "rgba(255,250,250,0.65)",      // almost white with a hint of pink
            "rgba(255,255,255,0.35)",      // whisper white
            "rgba(255,255,255,0)",         // fully clear
        ]}
        locations={[0, 0.12, 0.26, 0.42, 1]} 
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: fadeHeight,
          zIndex: -1,
        }}
      />

      <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
        <BackButton />
        <View>
          <Text style={styles.title}>Icing Color Blending Guide</Text>
          <Text style={[styles.subtitle, { color: "#1C0F0D" }]}>
            Tap a tile to see the name, hex, and mixing ratios.
          </Text>
          <Text style={styles.subtitle}>
            Ratios are shown in “parts,” using AmeriColor Soft Gel Paste names. Colors deepen as they rest — adjust for your recipe.
          </Text>
        </View>
        <ColorTiles
          data={AMERICOLOR_SWATCHES}
          columns={cols}
          onSelect={(swatch) => setSelected(swatch)}
        />

        {selected && (
          <View style={styles.selectionBar}>
            <View style={[styles.preview, { backgroundColor: selected.hex }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.selectedName}>{selected.name}</Text>
              <Text style={styles.selectedHex}>{selected.hex}</Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerGradient: {
    paddingTop: 0,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  title: { fontFamily: 'Poppins', color: '#1C0F0D', fontSize: 20, fontWeight: "700", marginTop:64, marginLeft: 16 },
  subtitle: { fontFamily: 'Poppins', marginTop: 4, color: "#6b7280", marginLeft: 16, marginRight: 16 },
  selectionBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fafafa",
  },
  preview: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  selectedName: { fontWeight: "600" },
  selectedHex: { color: "#6b7280", fontSize: 12 },
});
