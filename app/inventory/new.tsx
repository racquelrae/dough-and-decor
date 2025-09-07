import { ItemForm, ItemFormValues } from "@/components/inventory/itemForm";
import { addItem } from "@/firebase/inventory";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Timestamp } from "firebase/firestore";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InventoryNew() {
  const navigation = useNavigation();
  const route = useRoute();
  // @ts-ignore
  const { categoryId } = route.params as { categoryId: string };

  const handleSubmit = async (v: ItemFormValues) => {
    await addItem(categoryId, {
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFDF9" }}>
      <ItemForm mode="create" initial={{ autoAddToList: false, min: null }} onSubmit={handleSubmit} onCancel={() => navigation.goBack()} />
    </SafeAreaView>
  );
}
