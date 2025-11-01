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
      style={[rowStyles.card, low && rowStyles.cardLow]}
    >
      <View style={rowStyles.iconWrap}>
        {item.thumbUrl ? (
          <Image source={{ uri: item.thumbUrl }} style={rowStyles.thumb} />
        ) : (
          <Ionicons name="star-outline" size={20} color="rgba(62, 40, 35, 0.6)" />
        )}
      </View>

      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
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

      <View style={rowStyles.actions}>
        <Pressable
          onPress={async () => {
            const curr = item.quantity ?? 0;
            const next = Math.max(0, curr - 1);

            if (
              item.autoAddToList &&
              typeof item.min === "number" &&
              next <= item.min &&
              curr > item.min
            ) {
              showToast(`Added “${item.name}” to your shopping list`);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const uid = getAuth().currentUser?.uid;
              if (uid) {
                await addItem(uid, {
                  title: item.name,
                  quantity: 1,
                });
              }
            }

            await updateItem(categoryId, item.id, { quantity: next });
          }}
          style={rowStyles.stepBtn}
        >
          <Text style={rowStyles.stepText}>–</Text>
        </Pressable>
        <Text style={rowStyles.qty}>{item.quantity}</Text>
        <Pressable
          onPress={async () => {
            await updateItem(categoryId, item.id, { quantity: (item.quantity ?? 0) + 1 });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={rowStyles.stepBtn}
        >
          <Text style={rowStyles.stepText}>+</Text>
        </Pressable>
        <Pressable
          onPress={async () => {
            await deleteItem(categoryId, item.id);
          }}
          style={rowStyles.deleteBtn}
        >
          <Ionicons name="trash-outline" size={16} color="#C26A77" />
        </Pressable>
      </View>
      <ToastHost />
    </Pressable>
  );
}

const rowStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 24,
    gap: 14,
    shadowColor: "#3E2823",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 6,
  },
  cardLow: {
    backgroundColor: "rgba(212,178,167,0.15)",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3ece9",
  },
  thumb: {
    width: 30,
    height: 30,
    borderRadius: 10,
  },
  name: {
    fontFamily: "Poppins",
    fontWeight: "600",
    color: "#3E2823",
    fontSize: 14,
  },
  meta: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "rgba(62, 40, 35, 0.7)",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(212, 178, 167, 0.25)",
  },
  stepText: {
    fontFamily: "Poppins",
    fontSize: 18,
    fontWeight: "400",
    color: "#3E2823",
  },
  qty: {
    minWidth: 30,
    textAlign: "center",
    fontFamily: "Poppins",
    fontWeight: "600",
    color: "#3E2823",
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(194, 106, 119, 0.12)",
  },
  lowPill: {
    backgroundColor: "#C26A77",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  lowPillText: {
    color: "#FDF3F0",
    fontWeight: "600",
    fontSize: 10,
    fontFamily: "Poppins",
  },
});
