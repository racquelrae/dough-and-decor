import { BackButton } from "@/components/BackButton";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { Stack } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { RootStackParamList } from "../../types/navigation";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/firebase/config";
import { LinearGradient } from "expo-linear-gradient";

export function useRecipes() {
  const [data, setData] = useState<{ id: string; title: string; time: string; photo?: string | null }[]>([]);
  useEffect(() => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;

    const q = query(collection(db, `users/${uid}/recipes`), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
    return unsub;
  }, []);
  return data;
}

export default function Recipes() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const recipes = useRecipes();
  const gradientStops = useMemo(() => ["#F9E8DE", "#D9B6AB"], []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#F9E8DE', '#D9B6AB']} style={styles.gradient}>
      <View style={styles.safeArea}>
        <View style={styles.card}>
          <BackButton />
          <View style={styles.headerBlock}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Recipes</Text>
              <Text style={styles.subtitle}>
                Collect your favorite bakes, note prep time, and keep ingredients handy for the next batch.
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
              onPress={() => navigation.navigate("NewRecipe")}
            >
              <Text style={styles.addButtonText}>＋ New</Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {recipes.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyIcon}>🍰</Text>
                <Text style={styles.emptyTitle}>No recipes yet</Text>
                <Text style={styles.emptyText}>Add your first recipe to build your baking journal.</Text>
              </View>
            ) : (
              recipes.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.recipeCard}
                  onPress={() => navigation.navigate("RecipeDetails", { id: item.id })}
                >
                  {item.photo ? (
                    <Image source={{ uri: item.photo }} style={styles.recipeImage} />
                  ) : (
                    <View style={styles.recipePlaceholder}>
                      <Text style={styles.recipePlaceholderText}>No photo</Text>
                    </View>
                  )}
                  <View style={styles.recipeInfo}>
                    <Text style={styles.recipeTitle}>{item.title}</Text>
                    {!!item.time && <Text style={styles.recipeMeta}>⏱ {item.time}</Text>}
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  card: {
    flex: 1,
    marginTop: 60,
    backgroundColor: "rgba(255, 253, 249, 0.92)",
    borderRadius: 28,
    padding: 24,
    paddingTop: 72,
    shadowColor: "#46302B",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
  },
  headerBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 18,
  },
  headerText: {
    flex: 1,
    gap: 8,
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
  addButton: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "#D4B2A7",
    shadowColor: "#3E2823",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 6,
  },
  addButtonPressed: {
    opacity: 0.85,
  },
  addButtonText: {
    fontFamily: "Poppins",
    fontWeight: "600",
    color: "#FFFFFF",
  },
  listContent: {
    paddingBottom: 90,
    gap: 16,
  },
  emptyWrap: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontFamily: "Poppins",
    fontSize: 18,
    fontWeight: "700",
    color: "#3E2823",
  },
  emptyText: {
    fontFamily: "Poppins",
    fontSize: 13,
    color: "rgba(62, 40, 35, 0.7)",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  recipeCard: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    shadowColor: "#3E2823",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  recipeImage: {
    width: "100%",
    height: 180,
  },
  recipePlaceholder: {
    width: "100%",
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(236, 197, 210, 0.25)",
  },
  recipePlaceholderText: {
    fontFamily: "Poppins",
    color: "rgba(62, 40, 35, 0.6)",
  },
  recipeInfo: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 6,
  },
  recipeTitle: {
    fontFamily: "Poppins",
    fontSize: 18,
    fontWeight: "600",
    color: "#3E2823",
  },
  recipeMeta: {
    fontFamily: "Poppins",
    fontSize: 13,
    color: "rgba(62, 40, 35, 0.65)",
  },
});
