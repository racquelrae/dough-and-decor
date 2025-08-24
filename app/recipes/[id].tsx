import { BackButton } from "@/components/BackButton";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState, useMemo } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, Alert } from "react-native";
import { doc, deleteDoc, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/firebase/config";
import type { RootStackParamList } from "../../types/navigation";

type RecipeDetailsRouteProp = RouteProp<RootStackParamList, "RecipeDetails">;

export default function RecipeDetail() {
  const route = useRoute<RecipeDetailsRouteProp>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { id } = route.params;

  const [recipe, setRecipe] = useState<any | null>(null);
  const [done, setDone] = useState<Record<number, boolean>>({});

  const handleDelete = () => {
    Alert.alert("Delete Recipe", "Are you sure you want to delete this recipe?", [
        { text: "Cancel", style: "cancel" },
        {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
            const uid = getAuth().currentUser?.uid;
            if (!uid) return;
            await deleteDoc(doc(db, `users/${uid}/recipes/${id}`));
            navigation.goBack();
        },
        },
    ]);
    };

  useEffect(() => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;
    const ref = doc(db, `users/${uid}/recipes/${id}`);
    const unsub = onSnapshot(ref, (snap) => {
      setRecipe(snap.exists() ? { id: snap.id, ...(snap.data() as any) } : null);
    });
    return unsub;
  }, [id]);

  const toggleStep = (i: number) => setDone((d) => ({ ...d, [i]: !d[i] }));
  const allDone = useMemo(
    () => recipe?.steps?.length && recipe.steps.every((_: any, i: number) => done[i]),
    [done, recipe?.steps]
  );

  if (!recipe) {
    return (
      <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
        <Text>Loading recipe…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {recipe.photo ? (
        <Image source={{ uri: recipe.photo }} style={styles.image} />
      ) : (
        <View style={[styles.image, { alignItems: "center", justifyContent: "center", backgroundColor: "#f4f2f1" }]}>
          <Text style={{ color: "#9a8f8d" }}>No photo</Text>
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.headerRow}>
            <BackButton style={{ marginTop: -145, marginLeft: -25, position: "relative" }} />
            <View style={styles.actionsRow}>
                <Pressable
                style={[styles.actionBtn, { backgroundColor: "#f8f4f3" }]}
                onPress={() => navigation.navigate("EditRecipe", { id })}
                >
                <Text style={styles.actionText}>Edit</Text>
                </Pressable>
                <Pressable
                style={[styles.actionBtn, { backgroundColor: "#ffd9d6" }]}
                onPress={handleDelete}
                >
                <Text style={[styles.actionText, { color: "#8a1c1c" }]}>Delete</Text>
                </Pressable>
            </View>
        </View>
        <Text style={styles.title}>{recipe.title}</Text>
        {!!recipe.time && <Text style={styles.time}>⏱ {recipe.time}</Text>}
        {!!recipe.description && <Text style={styles.desc}>{recipe.description}</Text>}

        {!!recipe.servings && (
          <>
            <Text style={styles.subtitle}>Servings</Text>
            <Text style={styles.ingredient}>{recipe.servings}</Text>
          </>
        )}

        {!!recipe.ingredients?.length && (
          <>
            <Text style={styles.subtitle}>Ingredients</Text>
            {recipe.ingredients.map((ing: string, i: number) => (
              <Text key={i} style={styles.ingredient}>• {ing}</Text>
            ))}
          </>
        )}

        {!!recipe.steps?.length && (
          <>
            <Text style={[styles.subtitle, { marginTop: 16 }]}>Steps</Text>
            {recipe.steps.map((step: string, i: number) => {
              const checked = !!done[i];
              return (
                <Pressable key={i} onPress={() => toggleStep(i)} style={styles.stepRow}>
                  <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                    {checked && <Text style={styles.checkboxTick}>✓</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepNumber}>Step {i + 1}</Text>
                    <Text style={[styles.stepText, checked && styles.stepTextDone]}>{step}</Text>
                  </View>
                </Pressable>
              );
            })}
            {allDone && (
              <View style={styles.doneBadge}>
                <Text style={styles.doneText}>All steps complete 🎉</Text>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  image: { width: "100%", height: 200 },
  content: { padding: 16 },
  headerRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 6,
  marginTop: 0,
  },
  actionsRow: { flexDirection: "row", gap: 10, justifyContent: "flex-end" },
  title: { fontSize: 22, fontWeight: "700", marginTop: 24 },
  time: { marginVertical: 4, color: "#777" },
  desc: { marginVertical: 12, fontSize: 16, lineHeight: 22 },
  subtitle: { fontSize: 18, fontWeight: "600", marginTop: 12 },
  ingredient: { fontSize: 15, marginLeft: 8, marginTop: 4 },
  stepRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#f2b8a5",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: "#f8d7d1", borderColor: "#f8d7d1" },
  checkboxTick: { fontSize: 14, fontWeight: "700", color: "#1C0F0D" },
  stepNumber: { fontSize: 12, color: "#9a8f8d", marginBottom: 2 },
  stepText: { fontSize: 15, lineHeight: 22, color: "#1C0F0D" },
  stepTextDone: { color: "#9a8f8d", textDecorationLine: "line-through" },
  doneBadge: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f8f4f3",
    borderRadius: 12,
    alignItems: "center",
  },
  doneText: { fontWeight: "600", color: "#6e5d5a" },
  actionBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, alignItems: "center" },
  actionText: { fontWeight: "600", color: "#1C0F0D" },
});
