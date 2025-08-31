// firebase/inventory.ts
import {
  addDoc, getDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query,
  serverTimestamp, setDoc, updateDoc
} from "firebase/firestore";
import { db } from "./config"; 
import { getAuth } from "firebase/auth";
import type { InventoryCategory, InventoryItem, CategoryType } from "@/types/inventory";

// --- Paths ---
const catsCol = (uid: string) => collection(db, "users", uid, "inventoryCategories");
const catDoc  = (uid: string, categoryId: string) => doc(db, "users", uid, "inventoryCategories", categoryId);
const itemsCol = (uid: string, categoryId: string) => collection(db, "users", uid, "inventoryCategories", categoryId, "items");
const itemDoc  = (uid: string, categoryId: string, itemId: string) => doc(db, "users", uid, "inventoryCategories", categoryId, "items", itemId);

// --- Categories ---
export function watchCategories(cb: (cats: InventoryCategory[]) => void) {
  const uid = getAuth().currentUser?.uid!;
  const q = query(catsCol(uid), orderBy("order", "asc"));
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
  });
}

export async function ensureDefaultCategories() {
  const uid = getAuth().currentUser?.uid!;
  const defaults: Array<[string, CategoryType, number]> = [
    ["Cookie Cutters", "cookie_cutters", 0],
    ["Ingredients", "ingredients", 1],
    ["Other", "other", 2],
  ];
  await Promise.all(defaults.map(async ([name, type, order]) => {
    const ref = doc(catsCol(uid));
    await setDoc(ref, { name, type, order, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
  }));
}

export async function addCategory(name: string) {
  const uid = getAuth().currentUser?.uid!;
  const ref = await addDoc(catsCol(uid), {
    name, type: "custom", order: Date.now(), createdAt: serverTimestamp(), updatedAt: serverTimestamp()
  });
  return ref.id;
}

export async function renameCategory(categoryId: string, name: string) {
  const uid = getAuth().currentUser?.uid!;
  await updateDoc(catDoc(uid, categoryId), { name, updatedAt: serverTimestamp() });
}

export async function deleteCategory(categoryId: string) {
  const uid = getAuth().currentUser?.uid!;
  await deleteDoc(catDoc(uid, categoryId));
}

// --- Items ---
export function watchItems(categoryId: string, cb: (items: InventoryItem[]) => void) {
  const uid = getAuth().currentUser?.uid!;
  const q = query(itemsCol(uid, categoryId), orderBy("createdAt", "desc"));
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
  });
}

export async function addItem(categoryId: string, data: Partial<InventoryItem>) {
  const uid = getAuth().currentUser?.uid!;
  const ref = await addDoc(itemsCol(uid, categoryId), {
    name: data.name ?? "",
    quantity: data.quantity ?? 1,
    imageUrl: data.imageUrl ?? null,
    thumbUrl: data.thumbUrl ?? null,
    expires: data.expires ?? false,
    expiryDate: data.expiryDate ?? null,
    notes: data.notes ?? "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateItem(categoryId: string, itemId: string, patch: Partial<InventoryItem>) {
  const uid = getAuth().currentUser?.uid!;
  await updateDoc(itemDoc(uid, categoryId, itemId), { ...patch, updatedAt: serverTimestamp() });
}

export async function deleteItem(categoryId: string, itemId: string) {
  const uid = getAuth().currentUser?.uid!;
  await deleteDoc(itemDoc(uid, categoryId, itemId));
}

export async function getItemOnce(categoryId: string, itemId: string) {
  const uid = getAuth().currentUser?.uid!;
  const ref = itemDoc(uid, categoryId, itemId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as any) };
}
