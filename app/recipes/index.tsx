import { BackButton } from "@/components/BackButton";
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Stack } from "expo-router";
import React from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from '../../types/navigation';
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { db } from "@/firebase/config";

    const recipes = [
    { id: "1", title: "Sugar Cookies", time: "30min", image: require("../../assets/images/cookies.jpg") },
    { id: "2", title: "Royal Icing", time: "15min", image: require("../../assets/images/icing.jpg") },
];

export function useRecipes() {
  const [data, setData] = useState<{ id: string; title: string; time: string; photo?: string|null }[]>([]);
  useEffect(() => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) return;

    const q = query(
      collection(db, `users/${uid}/recipes`),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setData(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
      );
    });
    return unsub;
  }, []);
  return data;
}

export default function Recipes() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const recipes = useRecipes();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            <BackButton style={{ marginLeft: -12 }} />
            <Text style={styles.header}>Recipes</Text>
          </>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate('RecipeDetails', { id: item.id })}>
            {item.photo ? (
            <Image source={{ uri: item.photo }} style={styles.image} />
            ) : (
            <View style={[styles.image, { alignItems: "center", justifyContent: "center", backgroundColor: "#f4f2f1" }]}>
                <Text style={{ color: "#9a8f8d" }}>No photo</Text>
            </View>
            )} 
            <View style={styles.info}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </Pressable>
        )}
        ListFooterComponent={
          <Pressable style={styles.addButton} onPress={() => navigation.navigate('NewRecipe')}> 
            <Text style={styles.addText}>＋ Add Recipe</Text>
          </Pressable>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { marginTop: 140, marginLeft: 16, fontFamily: 'Poppins', fontSize: 24, fontWeight: '700', color: '#1C0F0D', marginBottom: 16 },
  card: { marginBottom: 16, borderWidth: 1, borderColor: "#eee", borderRadius: 12, overflow: "hidden" },
  image: { width: "100%", height: 150 },
  info: { padding: 8 },
  title: { fontSize: 18, fontWeight: "600" },
  time: { fontSize: 14, color: "#777" },
  addButton: { padding: 12, backgroundColor: "#f8d7d1", borderRadius: 12, alignItems: "center", marginTop: 12 },
  addText: { fontWeight: "600", color: "#333" }
});
