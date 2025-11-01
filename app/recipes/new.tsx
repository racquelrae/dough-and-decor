import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../types/navigation";
import {
  View,
  TextInput,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Platform,
  ActionSheetIOS,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/firebase/config";
import type { Recipe } from "../../types/recipe";
import { BackButton } from "@/components/BackButton";
import { LinearGradient } from "expo-linear-gradient";

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
        (i) => {
          if (i === 0) pickImage(true);
          if (i === 1) pickImage(false);
        }
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
      Alert.alert("Error", e?.message ?? "Could not save recipe.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient colors={["#F9E8DE", "#D9B6AB"]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 32 : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.card}>
                <BackButton />
                <View style={styles.headerBlock}>
                  <Text style={styles.title}>New Recipe</Text>
                  <Text style={styles.subtitle}>
                    Capture your ingredients, steps, and timing in one cozy place. Photos bake the story even sweeter.
                  </Text>
                </View>

                <View style={styles.photoRow}>
                  <View style={styles.photoFrame}>
                    {localImageUri ? (
                      <>
                        <Image source={{ uri: localImageUri }} style={styles.photo} />
                        {saving && (
                          <View style={styles.photoOverlay}>
                            <ActivityIndicator color="#D4B2A7" />
                          </View>
                        )}
                      </>
                    ) : (
                      <View style={styles.photoPlaceholder}>
                        <Text style={styles.photoPlaceholderText}>Add an image</Text>
                      </View>
                    )}
                  </View>
                  <Pressable
                    style={[styles.addPhotoBtn, saving && { opacity: 0.6 }]}
                    onPress={showImagePickerOptions}
                    disabled={saving}
                  >
                    <Text style={styles.addPhotoText}>{localImageUri ? "Change photo" : "Upload photo"}</Text>
                  </Pressable>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Title</Text>
                  <TextInput
                    placeholder="e.g., Soft Sugar Cookies"
                    placeholderTextColor="rgba(62, 40, 35, 0.35)"
                    value={title}
                    onChangeText={setTitle}
                    style={styles.input}
                    editable={!saving}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    placeholder="Tell yourself what makes this bake special"
                    placeholderTextColor="rgba(62, 40, 35, 0.35)"
                    value={desc}
                    onChangeText={setDesc}
                    style={[styles.input, styles.inputMultiline]}
                    editable={!saving}
                    multiline
                  />
                </View>

                <View style={styles.inlineFields}>
                  <View style={styles.fieldGroupInline}>
                    <Text style={styles.label}>Time</Text>
                    <TextInput
                      placeholder="30 min"
                      placeholderTextColor="rgba(62, 40, 35, 0.35)"
                      value={time}
                      onChangeText={setTime}
                      style={styles.input}
                      editable={!saving}
                    />
                  </View>
                  <View style={styles.fieldGroupInline}>
                    <Text style={styles.label}>Servings</Text>
                    <TextInput
                      placeholder="4"
                      placeholderTextColor="rgba(62, 40, 35, 0.35)"
                      value={servings}
                      onChangeText={setServings}
                      style={styles.input}
                      editable={!saving}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>

                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Ingredients</Text>
                  <Pressable onPress={addIngredient} style={styles.sectionAdd} disabled={saving}>
                    <Text style={styles.sectionAddText}>＋ Add</Text>
                  </Pressable>
                </View>
                {ingredients.map((ing, i) => (
                  <View key={i} style={styles.listRow}>
                    <Text style={styles.listIndex}>{i + 1}.</Text>
                    <TextInput
                      placeholder={`Ingredient ${i + 1}`}
                      placeholderTextColor="rgba(62, 40, 35, 0.35)"
                      style={[styles.input, styles.listInput]}
                      value={ing}
                      onChangeText={(t) => updateIngredient(i, t)}
                      editable={!saving}
                    />
                    <Pressable
                      onPress={() => removeIngredient(i)}
                      style={[styles.removeChip, saving && { opacity: 0.4 }]}
                      disabled={saving}
                    >
                      <Text style={styles.removeChipText}>✕</Text>
                    </Pressable>
                  </View>
                ))}

                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Steps</Text>
                  <Pressable onPress={addStep} style={styles.sectionAdd} disabled={saving}>
                    <Text style={styles.sectionAddText}>＋ Add</Text>
                  </Pressable>
                </View>
                {steps.map((step, i) => (
                  <View key={i} style={styles.listRow}>
                    <Text style={styles.listIndex}>{i + 1}.</Text>
                    <TextInput
                      placeholder={`Step ${i + 1}`}
                      placeholderTextColor="rgba(62, 40, 35, 0.35)"
                      style={[styles.input, styles.listInput]}
                      value={step}
                      onChangeText={(t) => updateStep(i, t)}
                      editable={!saving}
                      multiline
                    />
                    <Pressable
                      onPress={() => removeStep(i)}
                      style={[styles.removeChip, saving && { opacity: 0.4 }]}
                      disabled={saving}
                    >
                      <Text style={styles.removeChipText}>✕</Text>
                    </Pressable>
                  </View>
                ))}

                <Pressable
                  style={[styles.saveButton, saving && { opacity: 0.7 }]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  <Text style={styles.saveButtonText}>{saving ? "Saving…" : "Save recipe"}</Text>
                </Pressable>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  card: {
    backgroundColor: "rgba(255, 253, 249, 0.95)",
    borderRadius: 28,
    padding: 24,
    paddingTop: 72,
    margin: 12,
    gap: 16,
    shadowColor: "#46302B",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 10,
  },
  headerBlock: {
    gap: 10,
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
    fontSize: 28,
    fontWeight: "700",
    color: "#3E2823",
  },
  subtitle: {
    fontFamily: "Poppins",
    fontSize: 13,
    color: "rgba(62, 40, 35, 0.7)",
    lineHeight: 19,
  },
  photoRow: {
    alignItems: "center",
    gap: 12,
  },
  photoFrame: {
    width: "100%",
    height: 220,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(212, 178, 167, 0.15)",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  photoPlaceholderText: {
    fontFamily: "Poppins",
    color: "rgba(62, 40, 35, 0.55)",
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  addPhotoBtn: {
    marginTop: 6,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#d4b2a7b5",
  },
  addPhotoText: {
    fontFamily: "Poppins",
    fontWeight: "600",
    color: "#3E2823",
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
  },
  sectionHeader: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontFamily: "Poppins",
    fontSize: 16,
    fontWeight: "600",
    color: "#3E2823",
  },
  sectionAdd: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#d4b2a7b5",
  },
  sectionAddText: {
    fontFamily: "Poppins",
    fontWeight: "600",
    color: "#3E2823",
  },
  listRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 8,
  },
  listIndex: {
    width: 18,
    textAlign: "right",
    marginTop: 14,
    fontFamily: "Poppins",
    color: "rgba(62, 40, 35, 0.55)",
  },
  listInput: {
    flex: 1,
    minHeight: 44,
  },
  removeChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d4b2a79a",
    marginTop: 6,
  },
  removeChipText: {
    fontFamily: "Poppins",
    fontWeight: "600",
    color: "#3E2823",
  },
  saveButton: {
    marginTop: 12,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#D4B2A7",
    shadowColor: "#3E2823",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 6,
  },
  saveButtonText: {
    fontFamily: "Poppins",
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
