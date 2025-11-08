import { BackButton } from "@/components/BackButton";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, Alert } from "react-native";
import { doc, deleteDoc, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/firebase/config";
import type { RootStackParamList } from "../../types/navigation";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

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
       <LinearGradient colors={["#F9E8DE", "#D9B6AB"]} style={styles.loadingGradient}>
         <SafeAreaView style={styles.loadingSafeArea}>
           <Text style={styles.loadingText}>Loading recipe…</Text>
         </SafeAreaView>
       </LinearGradient>
     );
   }
 
   return (
     <>
       <LinearGradient colors={["#F9E8DE", "#D9B6AB"]} style={styles.gradient} />
       <SafeAreaView style={styles.safeArea}>
         <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
           <View style={styles.bodyCard}>
            <View style={styles.heroSection}>
              <BackButton style={styles.backButton} />
             {recipe.photo ? (
               <Image source={{ uri: recipe.photo }} style={styles.heroImage} />
             ) : (
               <View style={styles.heroPlaceholder}>
                 <Text style={styles.heroPlaceholderText}>No photo</Text>
               </View>
             )}
             <View style={styles.heroActions}>
               <Pressable
                 style={styles.heroActionBtn}
                 onPress={() => navigation.navigate("EditRecipe", { id })}
               >
                 <Text style={styles.heroActionText}>Edit</Text>
               </Pressable>
               <Pressable
                 style={[styles.heroActionBtn, styles.heroActionDanger]}
                 onPress={handleDelete}
               >
                 <Text style={[styles.heroActionText, { color: "#FDF3F0" }]}>Delete</Text>
               </Pressable>
             </View>
           </View>
             <Text style={styles.recipeTitle}>{recipe.title}</Text>
             {!!recipe.time && <Text style={styles.recipeMeta}>⏱ {recipe.time}</Text>}
             {!!recipe.description && <Text style={styles.recipeDescription}>{recipe.description}</Text>}
 
             {!!recipe.servings && (
               <View style={styles.section}>
                 <Text style={styles.sectionTitle}>Servings</Text>
                 <Text style={styles.sectionContent}>{recipe.servings}</Text>
               </View>
             )}
 
             {!!recipe.ingredients?.length && (
               <View style={styles.section}>
                 <Text style={styles.sectionTitle}>Ingredients</Text>
                 <View style={styles.bulletList}>
                   {recipe.ingredients.map((ing: string, i: number) => (
                     <Text key={i} style={styles.bulletItem}>• {ing}</Text>
                   ))}
                 </View>
               </View>
             )}
 
             {!!recipe.steps?.length && (
               <View style={styles.section}>
                 <Text style={styles.sectionTitle}>Steps</Text>
                 {recipe.steps.map((step: string, i: number) => {
                   const checked = !!done[i];
                   return (
                     <Pressable key={i} onPress={() => toggleStep(i)} style={styles.stepCard}>
                       <View style={[styles.stepCheckbox, checked && styles.stepCheckboxChecked]}>
                         {checked && <Text style={styles.stepCheckboxTick}>✓</Text>}
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
                     <Text style={styles.doneBadgeText}>All steps complete 🎉</Text>
                   </View>
                 )}
               </View>
             )}
           </View>
         </ScrollView>
       </SafeAreaView>
     </>
   );
 }
 
 const styles = StyleSheet.create({
   gradient: {
     ...StyleSheet.absoluteFillObject,
   },
   safeArea: {
     flex: 1,
   },
   scrollContent: {
     paddingBottom: 80,
   },
   heroSection: {
     height: 260,
     borderRadius: 28,
     overflow: "hidden",
     marginHorizontal: -24,
     marginTop: -24,
     shadowColor: "#46302B",
     shadowOffset: { width: 0, height: 12 },
     shadowOpacity: 0.22,
     shadowRadius: 24,
     elevation: 12,
   },
   heroImage: {
     width: "100%",
     height: "100%",
   },
   heroPlaceholder: {
     flex: 1,
     backgroundColor: "rgba(236, 197, 210, 0.28)",
     alignItems: "center",
     justifyContent: "center",
   },
   heroPlaceholderText: {
     fontFamily: "Poppins",
     color: "rgba(62, 40, 35, 0.6)",
   },
   heroOverlay: {
     ...StyleSheet.absoluteFillObject,
   },
   backButton: {
     position: "absolute",
     top: 60,
     left: 10,
     backgroundColor: 'rgba(235, 214, 207, 0.65)'
   },
   heroActions: {
     position: "absolute",
     bottom: 16,
     right: 16,
     flexDirection: "row",
     gap: 10,
   },
   heroActionBtn: {
     paddingHorizontal: 14,
     paddingVertical: 10,
     borderRadius: 999,
     backgroundColor: "rgba(255, 253, 249, 0.9)",
   },
   heroActionDanger: {
     backgroundColor: "rgba(194, 106, 119, 0.9)",
   },
   heroActionText: {
     fontFamily: "Poppins",
     fontWeight: "600",
     color: "#3E2823",
   },
   bodyCard: {
     marginTop: 24,
     marginHorizontal: 20,
     backgroundColor: "rgba(255, 253, 249, 0.95)",
     borderRadius: 28,
     padding: 24,
     gap: 16,
     shadowColor: "#46302B",
     shadowOffset: { width: 0, height: 12 },
     shadowOpacity: 0.18,
     shadowRadius: 22,
     elevation: 10,
   },
   recipeTitle: {
     fontFamily: "Poppins",
     fontSize: 24,
     fontWeight: "700",
     color: "#3E2823",
     marginTop: 0,
   },
   recipeMeta: {
     fontFamily: "Poppins",
     fontSize: 13,
     color: "rgba(62, 40, 35, 0.65)",
   },
   recipeDescription: {
     fontFamily: "Poppins",
     fontSize: 14,
     lineHeight: 22,
     color: "rgba(62, 40, 35, 0.85)",
   },
   section: {
     gap: 8,
   },
   sectionTitle: {
     fontFamily: "Poppins",
     fontSize: 16,
     fontWeight: "600",
     color: "#3E2823",
   },
   sectionContent: {
     fontFamily: "Poppins",
     fontSize: 14,
     color: "rgba(62, 40, 35, 0.85)",
   },
   bulletList: {
     gap: 6,
   },
   bulletItem: {
     fontFamily: "Poppins",
     fontSize: 14,
     color: "rgba(62, 40, 35, 0.85)",
   },
   stepCard: {
     flexDirection: "row",
     gap: 12,
     paddingVertical: 12,
     paddingHorizontal: 14,
     borderRadius: 18,
     backgroundColor: "rgba(255, 255, 255, 0.9)",
     marginBottom: 10,
     shadowColor: "#3E2823",
     shadowOffset: { width: 0, height: 4 },
     shadowOpacity: 0.08,
     shadowRadius: 6,
     elevation: 3,
   },
   stepCheckbox: {
     width: 26,
     height: 26,
     borderRadius: 8,
     borderWidth: 2,
     borderColor: "#d4b2a7b5",
     alignItems: "center",
     justifyContent: "center",
   },
   stepCheckboxChecked: {
     backgroundColor: "#D4B2A7",
     borderColor: "#D4B2A7",
   },
   stepCheckboxTick: {
     color: "#FDF3F0",
     fontWeight: "700",
   },
   stepNumber: {
     fontFamily: "Poppins",
     fontSize: 12,
     color: "rgba(62, 40, 35, 0.6)",
   },
   stepText: {
     fontFamily: "Poppins",
     fontSize: 14,
     color: "#3E2823",
     lineHeight: 20,
   },
   stepTextDone: {
     color: "rgba(62, 40, 35, 0.4)",
     textDecorationLine: "line-through",
   },
   doneBadge: {
     marginTop: 10,
     paddingVertical: 12,
     borderRadius: 18,
     backgroundColor: "rgba(236, 197, 210, 0.28)",
     alignItems: "center",
   },
   doneBadgeText: {
     fontFamily: "Poppins",
     fontWeight: "600",
     color: "#3E2823",
   },
   loadingGradient: {
     flex: 1,
   },
   loadingSafeArea: {
     flex: 1,
     alignItems: "center",
     justifyContent: "center",
   },
   loadingText: {
     fontFamily: "Poppins",
     fontSize: 16,
     color: "#3E2823",
   },
 });
