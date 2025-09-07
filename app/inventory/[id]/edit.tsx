import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ItemForm, ItemFormValues } from "@/components/inventory/itemForm";
import { getItemOnce, updateItem } from "@/firebase/inventory";
import { Timestamp } from "firebase/firestore";

export default function InventoryEdit() {
  const navigation = useNavigation();
  const route = useRoute();
  // @ts-ignore
  const { id, categoryId } = route.params as { id: string; categoryId: string };
  const [initial, setInitial] = useState<ItemFormValues | null>(null);

  useEffect(() => {
    (async () => {
      const data = await getItemOnce(categoryId, id);
  if (!data) { navigation.goBack(); return; }
      setInitial({
        name: data.name ?? "",
        quantity: data.quantity ?? 1,
        expires: !!data.expires,
        expiryDate: data.expiryDate?.toDate?.() ?? null,
        imageUrl: data.imageUrl ?? null,
        thumbUrl: data.thumbUrl ?? null,
        notes: data.notes ?? "",
        autoAddToList: !!data.autoAddToList,
        min: (data.min === 0 || data.min) ? Number(data.min) : null,
      });
    })();
  }, [categoryId, id]);

  const handleSubmit = async (v: ItemFormValues) => {
    await updateItem(categoryId, id, {
      name: v.name,
      quantity: v.quantity ?? 0,
      expires: v.expires,
      expiryDate: v.expires && v.expiryDate ? Timestamp.fromDate(v.expiryDate) : null,
      imageUrl: v.imageUrl ?? "",
      thumbUrl: v.thumbUrl ?? "",
      notes: v.notes ?? "",
      autoAddToList: !!v.autoAddToList,
      min: v.autoAddToList ? (v.min ?? 0) : null,
    });
  navigation.goBack();
  };

  if (!initial) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFDF9" }}>
      <ItemForm mode="edit" initial={initial} onSubmit={handleSubmit} onCancel={() => navigation.goBack()} />
    </SafeAreaView>
  );
}
