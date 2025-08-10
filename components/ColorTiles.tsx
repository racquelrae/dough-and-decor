import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  Modal,
  StyleSheet,
  Animated,
  PanResponder,
  ListRenderItemInfo,
} from "react-native";

// ---------- Types ----------
export type Part = number | "touch";
export type Recipe = Record<string, Part>;
export type Swatch = { name: string; hex: string; recipe?: Recipe; tags?: string[] };

// ---------- Helpers ----------
const partsToLabel = (recipe?: Recipe) => {
  if (!recipe) return null;

  // sort by size (treat "touch" as tiny)
  const entries = Object.entries(recipe).sort((a, b) => {
    const va = a[1] === "touch" ? 0.25 : (a[1] as number);
    const vb = b[1] === "touch" ? 0.25 : (b[1] as number);
    return vb - va;
  });

  const total = entries.reduce(
    (sum, [, v]) => sum + (v === "touch" ? 0 : (v as number)),
    0
  );

  const parts = entries.map(([k, v]) =>
    v === "touch" ? `touch of ${k}` : `${v} part${(v as number) > 1 ? "s" : ""} ${k}`
  );

  return { parts: parts.join(", "), total };
};

// ---------- Component ----------
export default function ColorTiles({
  data,             
  onSelect,
  columns = 3,
  listHeader,
}: {
  data: Swatch[];
  onSelect?: (s: Swatch) => void;
  columns?: number;
  listHeader?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Swatch | null>(null);

  // Animations
  const translateY = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const openSheet = () => {
    translateY.setValue(400);
    backdropOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0.35,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 6,
      }),
    ]).start();
  };

  const closeSheet = (cb?: () => void) => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 400,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => cb?.());
  };

  // Drag to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dy) > 4,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_e, g) => {
        if (g.dy > 0) translateY.setValue(g.dy); // drag down only
      },
      onPanResponderRelease: (_e, g) => {
        const shouldClose = g.dy > 120 || g.vy > 1.2;
        if (shouldClose) {
          closeSheet(() => {
            setOpen(false);
            translateY.setValue(0);
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 6,
          }).start();
        }
      },
    })
  ).current;

  // When open flips to true, run the open animation
  useEffect(() => {
    if (open) openSheet();
  }, [open]);

  // Render item
  const renderItem = ({ item }: ListRenderItemInfo<Swatch>) => (
    <Pressable
      onPress={() => {
        setSelected(item);
        setOpen(true);
        onSelect?.(item);
      }}
      style={({ pressed }) => [
        styles.card,
        { opacity: pressed ? 0.85 : 1, borderColor: "#e5e7eb" },
      ]}
    >
      <View style={[styles.swatch, { backgroundColor: item.hex }]} />
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.hex}>{item.hex}</Text>
    </Pressable>
  );

  return (
    <View>
      <FlatList
        data={data}
        keyExtractor={(s) => s.name}
        renderItem={renderItem}
        numColumns={columns}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 12, padding: 12, paddingBottom: 170 }}
        ListHeaderComponent={listHeader ? () => <>{listHeader}</> : undefined}
      />

      <Modal
        visible={open}
        transparent
        animationType="none" // we animate backdrop/sheet manually
        onRequestClose={() => closeSheet(() => setOpen(false))}
      >
        <View style={{ flex: 1, justifyContent: "flex-end" }} pointerEvents="box-none">
          <Pressable
            onPress={() => closeSheet(() => setOpen(false))}
            style={StyleSheet.absoluteFill}
            pointerEvents="auto"
          >
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                { backgroundColor: "#000", opacity: backdropOpacity },
              ]}
            />
          </Pressable>

          {/* Draggable sheet (slides up) */}
          <Animated.View
            style={[styles.sheet, { transform: [{ translateY }] }]}
            {...panResponder.panHandlers}
          >
            <View style={styles.handle} />

            {selected && (
              <>
                <View
                  style={[styles.preview, { backgroundColor: selected.hex }]}
                />
                <Text style={styles.title}>{selected.name}</Text>
                <Text style={styles.subtitle}>{selected.hex}</Text>

                {(() => {
                  const rp = partsToLabel(selected.recipe);
                  if (!rp) return null;
                  return (
                    <Text style={styles.recipe}>
                      {rp.parts}{" "}
                      <Text style={{ opacity: 0.7 }}>({rp.total} total)</Text>
                    </Text>
                  );
                })()}

                <Pressable
                  style={styles.closeBtn}
                  onPress={() => closeSheet(() => setOpen(false))}
                >
                  <Text style={styles.closeLabel}>Close</Text>
                </Pressable>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 10,
    backgroundColor: "white",
  },
  swatch: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  name: { marginTop: 8, fontWeight: "600", fontFamily: "Poppins" },
  hex: { fontSize: 12, color: "#6b7280", fontFamily: "Poppins" },

  sheet: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 28,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    marginBottom: 12,
  },
  preview: {
    width: "100%",
    height: 140,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  title: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Poppins",
    color: "#1C0F0D",
  },
  subtitle: { color: "#6b7280", marginTop: 2, fontFamily: "Poppins" },
  recipe: { marginTop: 10, color: "#1C0F0D", fontFamily: "Poppins" },

  closeBtn: {
    alignSelf: "flex-end",
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#EDC7BA",
  },
  closeLabel: { color: "white", fontWeight: "600", fontFamily: "Poppins" },
});
