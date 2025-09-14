import { ToastHost, showToast } from '@/components/Toast';
import { deleteItem, updateItem } from "@/firebase/inventory";
import { addItem } from "@/firebase/shoppingList";
import type { InventoryItem } from "@/types/inventory";
import type { RootStackParamList } from "@/types/navigation";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { getAuth } from "firebase/auth";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export function ItemRow({ item, categoryId }: { item: InventoryItem; categoryId: string }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  function isLow(it: InventoryItem) {
    return !!it.autoAddToList && typeof it.min === "number" && (it.quantity ?? 0) <= it.min;
  }

  const low = isLow(item);

  return (
    <Pressable
      onPress={() => navigation.navigate("InventoryEdit", { id: item.id, categoryId })}
      style={[rowStyles.card, low && rowStyles.cardLow]}  // ← optional tint
    >
      <View style={rowStyles.iconWrap}>
        {item.thumbUrl ? (
          <Image source={{ uri: item.thumbUrl }} style={rowStyles.thumb} />
        ) : (
          <Ionicons name="star-outline" size={20} />
        )}
      </View>

      <View style={{ flex: 1 }}>
        {/* name + LOW pill on one line */}
        <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
          <Text style={rowStyles.name}>{item.name}</Text>
          {low && (
            <View style={rowStyles.lowPill} accessible accessibilityLabel="Low stock">
              <Text style={rowStyles.lowPillText}>LOW</Text>
            </View>
          )}
        </View>

        <Text style={rowStyles.meta}>
          Qty: {item.quantity}
          {item.expires ? ` • exp ${item.expiryDate?.toDate?.()?.toLocaleDateString?.() ?? ""}` : ""}
        </Text>
      </View>

      <Pressable
        onPress={async () => {
            const curr = item.quantity ?? 0;
            const next = Math.max(0, curr - 1);

            // Show a toast exactly when we cross into "low"
            if (item.autoAddToList && typeof item.min === "number" && next <= item.min && curr > item.min) {
              showToast(`Added “${item.name}” to your shopping list`);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // Add to shopping list in Firestore
                const uid = getAuth().currentUser?.uid;
                if (uid) {
                  await addItem(uid, {
                    title: item.name,
                    quantity: 1, // default to 1 when auto-adding
                  });
                }
            }

            await updateItem(categoryId, item.id, { quantity: next });
        }}
        style={rowStyles.chip}
        >
        <Text>-</Text>
      </Pressable>

      <Pressable
        onPress={async () => {
          await updateItem(categoryId, item.id, { quantity: (item.quantity ?? 0) + 1 });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        style={rowStyles.chip}
      >
        <Text>+</Text>
      </Pressable>

      <Pressable
        onPress={async () => { await deleteItem(categoryId, item.id); }}
        style={[rowStyles.chip, { marginLeft: 8 }]}
      >
        <Ionicons name="trash-outline" size={16} />
      </Pressable>
          <ToastHost />
    </Pressable>
  );
}

const rowStyles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 12, borderRadius: 14, marginVertical: 6 },
  // optional low-state tint
  cardLow: { backgroundColor: "rgba(212,178,167,0.15)" },

  iconWrap: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", marginRight: 10, backgroundColor: "#f3ece9" },
  thumb: { width: 24, height: 24, borderRadius: 6 },
  name: { fontWeight: "600" },
  meta: { opacity: 0.6, fontSize: 12 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#f1e4df", borderRadius: 10, marginLeft: 6 },

  lowPill: {
    backgroundColor: "#D4B2A7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  lowPillText: { color: "#fff", fontWeight: "700", fontSize: 10 },
});