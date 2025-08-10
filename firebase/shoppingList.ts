// src/firestore/shoppingList.ts
import { db } from "./config"; 
import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query,
  serverTimestamp, updateDoc,
} from "firebase/firestore";

export type ItemDoc = {
  id: string;
  title: string;
  done: boolean;
  quantity: number;
  unit?: string;
  createdAt?: any;
  updatedAt?: any;
};

const colRef = (uid: string) => collection(db, "users", uid, "shoppingList");

export function subscribeItems(uid: string, cb: (items: ItemDoc[]) => void) {
  const q = query(colRef(uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ItemDoc, "id">) })));
  });
}

export async function addItem(
  uid: string,
  data: { title: string; quantity: number; unit?: string }
) {
  await addDoc(colRef(uid), {
    title: data.title,
    quantity: data.quantity,
    unit: data.unit ?? "",
    done: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function toggleItem(uid: string, it: ItemDoc) {
  await updateDoc(doc(db, "users", uid, "shoppingList", it.id), {
    done: !it.done,
    updatedAt: serverTimestamp(),
  });
}

export async function updateQty(uid: string, it: ItemDoc, qty: number) {
  await updateDoc(doc(db, "users", uid, "shoppingList", it.id), {
    quantity: qty,
    updatedAt: serverTimestamp(),
  });
}

export async function removeItem(uid: string, id: string) {
  await deleteDoc(doc(db, "users", uid, "shoppingList", id));
}
