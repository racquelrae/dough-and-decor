import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Image,
  Switch,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { uploadToCloudinary, thumb } from "@/lib/cloudinary";

export type ItemFormValues = {
  name: string;
  quantity: number;
  expires: boolean;
  expiryDate: Date | null;
  imageUrl?: string | null;
  thumbUrl?: string | null;
  notes?: string;
  autoAddToList: boolean;
  min: number | null;
};

function clampIntOrNull(s: string) {
  const n = Number(s.replace(/[^0-9]/g, ""));
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : null;
}

export function ItemForm({
  mode,
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
  const [expiryDate, setExpiryDate] = useState<Date | null>(initial?.expiryDate ?? null);
  const [imageUrl, setImageUrl] = useState<string | undefined | null>(initial?.imageUrl ?? null);
  const [thumbUrl, setThumbUrl] = useState<string | undefined | null>(initial?.thumbUrl ?? null);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [dateOpen, setDateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [autoAddToList, setAutoAddToList] = useState(initial?.autoAddToList ?? false);
  const [min, setMin] = useState<number | null>(initial?.min ?? null);

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
    setAutoAddToList(!!initial.autoAddToList);
    setMin(
      initial.min === 0 || typeof initial.min === "number"
        ? Math.max(0, Math.floor(Number(initial.min)))
        : null
    );
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
        expiryDate: expires ? expiryDate ?? null : null,
        imageUrl: imageUrl ?? null,
        thumbUrl: thumbUrl ?? null,
        notes,
        autoAddToList,
        min: autoAddToList ? (min ?? 0) : null,
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
      setExpiryDate(null);
      setDateOpen(false);
    } else {
      setTimeout(() => setDateOpen(true), 0);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 16 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View style={styles.headerRow}>
              {onCancel ? (
                <Pressable onPress={onCancel} disabled={saving}>
                  <Text style={styles.headerAction}>Cancel</Text>
                </Pressable>
              ) : (
                <View style={{ width: 60 }} />
              )}
              <Text style={styles.header}>{mode === "create" ? "New Inventory Item" : "Edit Item"}</Text>
              <Pressable onPress={save} disabled={saving || uploading}>
                {saving ? <ActivityIndicator size="small" color="#D4B2A7" /> : <Text style={styles.headerAction}>Save</Text>}
              </Pressable>
            </View>

            <Pressable onPress={pick} style={styles.photoFrame} disabled={uploading || saving}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.photo} />
              ) : uploading ? (
                <ActivityIndicator color="#D4B2A7" />
              ) : (
                <Text style={styles.photoPlaceholder}>Tap to add photo</Text>
              )}
            </Pressable>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g., Rainbow sprinkles"
                placeholderTextColor="rgba(62, 40, 35, 0.35)"
                style={styles.input}
                editable={!saving}
              />
            </View>

            <View style={styles.inlineFields}>
              <View style={styles.fieldGroupInline}>
                <Text style={styles.label}>Quantity</Text>
                <View style={styles.qtyControls}>
                  <Pressable
                    onPress={() => setQty((q) => Math.max(0, q - 1))}
                    style={styles.stepBtn}
                    disabled={saving}
                  >
                    <Text style={styles.stepText}>–</Text>
                  </Pressable>
                  <Text style={styles.qtyValue}>{qty}</Text>
                  <Pressable
                    onPress={() => setQty((q) => q + 1)}
                    style={styles.stepBtn}
                    disabled={saving}
                  >
                    <Text style={styles.stepText}>+</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.fieldGroupInline}>
                <Text style={styles.label}>Auto-add when low</Text>
                <Switch
                  value={autoAddToList}
                  onValueChange={(v) => {
                    Haptics.selectionAsync();
                    setAutoAddToList(v);
                    if (!v) setMin(null);
                  }}
                />
              </View>
            </View>

            <View style={[styles.fieldGroup, { opacity: autoAddToList ? 1 : 0.4 }]}> 
              <Text style={styles.label}>Low stock threshold</Text>
              <TextInput
                editable={autoAddToList}
                keyboardType="number-pad"
                placeholder="e.g., 2"
                placeholderTextColor="rgba(62, 40, 35, 0.35)"
                value={min == null ? "" : String(min)}
                onChangeText={(t) => setMin(clampIntOrNull(t))}
                style={styles.input}
              />
              <Text style={styles.helperText}>
                When quantity drops below this number, the item is marked low and added to your shopping list.
              </Text>
            </View>

            <View style={styles.inlineFields}>
              <Text style={styles.label}>Expires</Text>
              <Switch value={expires} onValueChange={onToggleExpires} />
            </View>

            {expires && (
              <Pressable onPress={() => setDateOpen(true)} style={styles.fieldGroup}>
                <Text style={styles.label}>Expiry date</Text>
                <View style={styles.datePill}>
                  <Text style={styles.dateText}>
                    {expiryDate ? expiryDate.toDateString() : "Pick a date"}
                  </Text>
                </View>
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

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Optional details"
                placeholderTextColor="rgba(62, 40, 35, 0.35)"
                style={[styles.input, styles.inputMultiline]}
                editable={!saving}
                multiline
              />
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 120,
  },
  card: {
    backgroundColor: "rgba(255, 253, 249, 0.95)",
    borderRadius: 28,
    padding: 24,
    gap: 18,
    shadowColor: "#46302B",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: {
    fontFamily: "Poppins",
    fontSize: 20,
    fontWeight: "700",
    color: "#3E2823",
  },
  headerAction: {
    fontFamily: "Poppins",
    fontSize: 15,
    fontWeight: "600",
    color: "#3E2823",
  },
  photoFrame: {
    height: 200,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(236, 197, 210, 0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    fontFamily: "Poppins",
    color: "rgba(62, 40, 35, 0.55)",
  },
  fieldGroup: {
    gap: 6,
  },
  fieldGroupInline: {
    flex: 1,
    gap: 6,
  },
  label: {
    fontFamily: "Poppins",
    fontSize: 14,
    fontWeight: "600",
    color: "#3E2823",
  },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(236, 197, 210, 0.5)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    fontFamily: "Poppins",
    fontSize: 15,
    color: "#3E2823",
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  inlineFields: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  qtyControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(212, 178, 167, 0.28)",
  },
  stepText: {
    fontFamily: "Poppins",
    fontSize: 18,
    fontWeight: "600",
    color: "#3E2823",
  },
  qtyValue: {
    minWidth: 30,
    textAlign: "center",
    fontFamily: "Poppins",
    fontWeight: "600",
    color: "#3E2823",
  },
  helperText: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "rgba(62, 40, 35, 0.6)",
  },
  datePill: {
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(236, 197, 210, 0.5)",
  },
  dateText: {
    fontFamily: "Poppins",
    fontSize: 14,
    color: "#3E2823",
  },
});
