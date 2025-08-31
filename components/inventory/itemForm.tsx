import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, Image, Switch, Platform, ActivityIndicator, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard } from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { uploadToCloudinary, thumb } from "@/lib/cloudinary";

export type ItemFormValues = {
  name: string;
  quantity: number;
  expires: boolean;
  expiryDate?: Date | null;
  imageUrl?: string | null;
  thumbUrl?: string | null;
  notes?: string;
};

export function ItemForm({
  mode,                     // "create" | "edit"
  initial,
  onSubmit,
  onCancel,
}: {
  mode: "create" | "edit";
  initial?: Partial<ItemFormValues>;
  onSubmit: (values: ItemFormValues) => Promise<void> | void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [qty, setQty] = useState(initial?.quantity ?? 1);
  const [expires, setExpires] = useState(initial?.expires ?? false);
  const [expiryDate, setExpiryDate] = useState<Date | null>(
    initial?.expiryDate ?? null
  );
  const [imageUrl, setImageUrl] = useState<string | undefined | null>(initial?.imageUrl ?? null);
  const [thumbUrl, setThumbUrl] = useState<string | undefined | null>(initial?.thumbUrl ?? null);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [dateOpen, setDateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!initial) return;
    setName(initial.name ?? "");
    setQty(initial.quantity ?? 1);
    setExpires(!!initial.expires);
    setExpiryDate(initial.expiryDate ?? null); 
    setImageUrl(initial.imageUrl ?? null);
    setThumbUrl(initial.thumbUrl ?? null);
    setNotes(initial.notes ?? "");
    setDateOpen(false);
  }, [initial]);

  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (res.canceled) return;
    setUploading(true);
    try {
      const up = await uploadToCloudinary(res.assets[0].uri);
      setImageUrl(up.secure_url);
      setThumbUrl(thumb(up.secure_url));
      Haptics.selectionAsync();
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        quantity: qty,
        expires,
        expiryDate: expires ? (expiryDate ?? null) : null,
        imageUrl: imageUrl ?? null,
        thumbUrl: thumbUrl ?? null,
        notes,
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } finally {
      setSaving(false);
    }
  };

  const onToggleExpires = (value: boolean) => {
  Haptics.selectionAsync();
  setExpires(value);
  if (!value) {
    // turning OFF: clear any previously selected date & close picker
    setExpiryDate(null);
    setDateOpen(false);
  } else {
    // turning ON: optionally auto-open the date picker (remove if you don't want this)
    setTimeout(() => setDateOpen(true), 0);
  }
};

  return (
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    // bump this if a fixed header sits above; 56–80 usually good
    keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
  >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Header */}
        <View style={styles.headerRow}>
          {onCancel ? (
            <Pressable onPress={onCancel}><Text style={{fontFamily:"Poppins", fontSize: 16}}>Cancel</Text></Pressable>
          ) : <View style={{ width: 48 }} />}
          <Text style={styles.header}>{mode === "create" ? "Add Item" : "Edit Item"}</Text>
          <Pressable onPress={save} disabled={saving}>
            {saving ? <ActivityIndicator /> : <Text style={{ fontWeight: "500", fontFamily:"Poppins", fontSize: 16 }}>Save</Text>}
          </Pressable>
        </View>

        {/* Photo */}
        <Pressable onPress={pick} style={styles.photoBox}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.photo} />
          ) : uploading ? (
            <ActivityIndicator />
          ) : (
            <Text>Tap to add photo</Text>
          )}
        </Pressable>

        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g., Hearts"
            style={styles.input}
            returnKeyType="done"
            blurOnSubmit
            onSubmitEditing={Keyboard.dismiss}
          />
        </View>

        {/* Quantity */}
        <View style={styles.inline}>
          <Text style={styles.label}>Quantity</Text>
          <View style={styles.qtyRow}>
            <Pressable onPress={() => setQty(q => Math.max(0, q - 1))} style={styles.qtyBtn}><Text>-</Text></Pressable>
            <Text style={{ marginHorizontal: 10, minWidth: 20, textAlign: "center" }}>{qty}</Text>
            <Pressable onPress={() => setQty(q => q + 1)} style={styles.qtyBtn}><Text>+</Text></Pressable>
          </View>
        </View>

        {/* Expiry */}
        <View style={styles.inline}>
          <Text style={styles.label}>Expires</Text>
          <Switch value={expires} onValueChange={onToggleExpires} />
        </View>

        {expires && (
          <Pressable onPress={() => setDateOpen(true)} style={styles.field}>
            <Text style={styles.label}>Expiry Date</Text>
            <Text style={styles.pill}>
              {expiryDate ? expiryDate.toDateString() : "Pick a date"}
            </Text>
          </Pressable>
        )}
        {dateOpen && (
          <DateTimePicker
            mode="date"
            value={expiryDate ?? new Date()}
            onChange={(_, d) => {
              if (Platform.OS !== "ios") setDateOpen(false);
              if (d) setExpiryDate(d);
            }}
          />
        )}

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional details"
            style={[styles.input, { height: 100, textAlignVertical: "top" }]}
            multiline
            returnKeyType="default"
          />
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
);
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  header: { fontWeight: "700", fontFamily:"Poppins", fontSize: 20 },
  photoBox: { height: 150, borderRadius: 16, backgroundColor: "#f4e8e3", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  photo: { width: "100%", height: "100%", borderRadius: 16 },
  field: { marginVertical: 8 },
  label: { fontWeight: "600", marginBottom: 6 },
  input: { backgroundColor: "#fff", borderRadius: 12, padding: 10, borderWidth: 1, borderColor: "#eee" },
  inline: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 10 },
  qtyRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, padding: 6 },
  qtyBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#f1e4df", borderRadius: 10 },
  pill: { backgroundColor: "#fff", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
});
