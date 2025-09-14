import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../types/navigation";
import {
  View, TextInput, Text, Pressable, StyleSheet, ScrollView,
  Image, Alert, Platform, ActionSheetIOS, ActivityIndicator,
  KeyboardAvoidingView
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { BackButton } from "../../components/BackButton";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/firebase/config"; 
import type { Recipe } from "../../types/recipe";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

async function saveRecipe(newRecipe: Omit<Recipe, "createdAt" | "updatedAt">) {
  const uid = getAuth().currentUser?.uid;
  if (!uid) throw new Error("Not signed in");

  const ref = collection(db, `users/${uid}/recipes`);
  await addDoc(ref, {
    ...newRecipe,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export default function NewRecipe() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [time, setTime] = useState("");
  const [servings, setServings] = useState("");
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [steps, setSteps] = useState<string[]>([""]);

  const pickImage = async (fromCamera = false) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert("Permission required", `Please allow ${fromCamera ? "camera" : "library"} access.`);
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

    if (!result.canceled && result.assets?.length) {
      setLocalImageUri(result.assets[0].uri);
    }
  };

  const showImagePickerOptions = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ["Take Photo", "Choose from Library", "Cancel"], cancelButtonIndex: 2 },
        (i) => { if (i === 0) pickImage(true); if (i === 1) pickImage(false); }
      );
    } else {
      Alert.alert("Recipe Photo", "Select an option", [
        { text: "Take Photo", onPress: () => pickImage(true) },
        { text: "Choose from Library", onPress: () => pickImage(false) },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const uploadToCloudinary = async (imageUri: string) => {
    const manipulated = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 1200 } }],
      { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
    );

    const form = new FormData();
    form.append("file", {
      uri: manipulated.uri,
      type: "image/jpeg",
      name: "recipe.jpg",
    } as any);
    form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_URL, { method: "POST", body: form });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result?.error?.message ?? "Upload failed");
    }
    return result.secure_url as string;
  };

  // ingredient handlers
  const updateIngredient = (index: number, value: string) => {
    setIngredients((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };
  const addIngredient = () => setIngredients((prev) => [...prev, ""]);
  const removeIngredient = (index: number) =>
    setIngredients((prev) => prev.filter((_, i) => i !== index));

  // step handlers
  const updateStep = (index: number, value: string) => {
    setSteps((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };
  const addStep = () => setSteps((prev) => [...prev, ""]);
  const removeStep = (index: number) => setSteps((prev) => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please enter a recipe title.");
      return;
    }

    try {
      setSaving(true);

      let photoUrl: string | null = null;
      if (localImageUri) {
        photoUrl = await uploadToCloudinary(localImageUri);
      }

      const newRecipe = {
        title: title.trim(),
        description: desc.trim(),
        time: time.trim(),
        servings: servings.trim(),
        photo: photoUrl,
        ingredients: ingredients.map((i) => i.trim()).filter(Boolean),
        steps: steps.map((s) => s.trim()).filter(Boolean),
        createdAt: Date.now(),
      };

      await saveRecipe({
        title: title.trim(),
        description: desc.trim(),
        time: time.trim(),
        servings: servings.trim(),
        photo: photoUrl ?? null,
        ingredients: ingredients.map((i) => i.trim()).filter(Boolean),
        steps: steps.map((s) => s.trim()).filter(Boolean),
      });
      navigation.goBack();
    } catch (e: any) {
      console.log("Save error:", e);
      Alert.alert("Error", e?.message ?? "Could not save recipe.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={insets.top + 60} 
    >
    <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 240 }]} keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"} showsVerticalScrollIndicator={false}>
      <BackButton />
      <Text style={styles.header}>New Recipe</Text>

      {/* Photo picker */}
      <View style={styles.photoRow}>
        <View style={{ position: "relative" }}>
          {localImageUri ? (
            <>
              <Image source={{ uri: localImageUri }} style={styles.photo} />
              {saving && (
                <View style={styles.photoOverlay}>
                  <ActivityIndicator />
                </View>
              )}
            </>
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <Text style={{ color: "#9a8f8d" }}>No photo</Text>
            </View>
          )}
        </View>
      </View>
        <View style={{ flex: 1 }}>
          <Pressable style={styles.secondaryBtn} onPress={showImagePickerOptions} disabled={saving}>
            <Text style={styles.secondaryBtnText}>{localImageUri ? "Change Photo" : "Add Photo"}</Text>
          </Pressable>
        </View>

      {/* Basics */}
      <TextInput placeholder="Recipe Title" style={styles.input} value={title} onChangeText={setTitle} editable={!saving} />
      <TextInput
        placeholder="Description"
        style={[styles.input, { minHeight: 80, textAlignVertical: "top" }]}
        value={desc}
        onChangeText={setDesc}
        editable={!saving}
        multiline
      />
      <TextInput placeholder="Time (e.g., 30min)" style={styles.input} value={time} onChangeText={setTime} editable={!saving} />
      <TextInput placeholder="Servings (e.g., 4)" style={styles.input} value={servings} onChangeText={setServings} editable={!saving} keyboardType="numeric" />

      {/* Ingredients */}
      <Text style={styles.sectionTitle}>Ingredients</Text>
      {ingredients.map((ing, i) => (
        <View key={i} style={styles.itemRow}>
          <Text style={styles.itemNum}>{i + 1}.</Text>
          <TextInput
            placeholder={`Ingredient ${i + 1}...`}
            style={[styles.input, styles.itemInput]}
            value={ing}
            onChangeText={(t) => updateIngredient(i, t)}
            editable={!saving}
          />
          <Pressable onPress={() => removeIngredient(i)} style={[styles.removeBtn, saving && { opacity: 0.5 }]} disabled={saving}>
            <Text style={styles.removeBtnText}>✕</Text>
          </Pressable>
        </View>
      ))}
      <Pressable style={[styles.addBtn, saving && { opacity: 0.6 }]} onPress={addIngredient} disabled={saving}>
        <Text style={styles.addText}>＋ Add Ingredient</Text>
      </Pressable>

      {/* Steps */}
      <Text style={styles.sectionTitle}>Steps</Text>
      {steps.map((s, i) => (
        <View key={i} style={styles.itemRow}>
          <Text style={styles.itemNum}>{i + 1}.</Text>
          <TextInput
            placeholder={`Step ${i + 1}...`}
            style={[styles.input, styles.itemInput]}
            value={s}
            onChangeText={(t) => updateStep(i, t)}
            editable={!saving}
            multiline
          />
          <Pressable onPress={() => removeStep(i)} style={[styles.removeBtn, saving && { opacity: 0.5 }]} disabled={saving}>
            <Text style={styles.removeBtnText}>✕</Text>
          </Pressable>
        </View>
      ))}
      <Pressable style={[styles.addBtn, saving && { opacity: 0.6 }]} onPress={addStep} disabled={saving}>
        <Text style={styles.addText}>＋ Add Step</Text>
      </Pressable>

      {/* Save */}
      <Pressable style={[styles.button, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? "Saving..." : "Save"}</Text>
      </Pressable>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: "#fff" },
  header: { marginTop: 120, marginLeft: 16, fontFamily: "Poppins", fontSize: 24, fontWeight: "700", color: "#1C0F0D" },

  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 12, marginVertical: 8, color: "#1C0F0D" },

  photoRow: { alignItems: "center", gap: 12, marginVertical: 8 },
  photo: { width: 300, height: 200, borderRadius: 12, backgroundColor: "#f4f2f1" },
  photoPlaceholder: { alignItems: "center", justifyContent: "center" },
  photoOverlay: {
    position: "absolute", inset: 0, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.6)", borderRadius: 12,
  },

  secondaryBtn: {
    paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: "#f8d7d1",
    borderWidth: 1, borderColor: "#eee", marginBottom: 8, alignItems: "center",
    width: 300, alignSelf: "center",
  },
  secondaryBtnText: { fontWeight: "600", color: "#1C0F0D" },

  sectionTitle: { fontSize: 18, fontWeight: "600", marginTop: 16, marginBottom: 4, color: "#1C0F0D" },

  itemRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 6 },
  itemNum: { width: 18, textAlign: "right", marginTop: 14, color: "#9a8f8d" },
  itemInput: { flex: 1, marginVertical: 0, minHeight: 44 },

  removeBtn: {
    width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center",
    backgroundColor: "#f8d7d1", marginTop: 8,
  },
  removeBtnText: { fontWeight: "700", color: "#1C0F0D" },

  addBtn: { padding: 12, borderRadius: 12, backgroundColor: "#f8d7d1", alignItems: "center", marginTop: 4, marginBottom: 8 },
  addText: { fontWeight: "600", color: "#333" },

  button: { backgroundColor: "#f8d7d1", padding: 16, borderRadius: 12, marginTop: 12, alignItems: "center" },
  buttonText: { fontWeight: "600", color: "#333" },
});
