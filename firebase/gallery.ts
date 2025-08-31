// firebase/gallery.ts
import { addDoc, collection, deleteDoc, updateDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "./config"; 

export type GalleryItem = {
  id: string;
  url: string;
  thumbnailUrl?: string;
  width: number;
  height: number;
  tags: string[];
  note?: string;
  createdAt?: any;
};

export async function updateGalleryItemTags(uid: string, id: string, tags: string[]) {
  const ref = doc(db, "users", uid, "gallery", id);
  await updateDoc(ref, { tags });
}

export function galleryCol(uid: string) {
  return collection(db, "users", uid, "gallery");
}

export function watchGallery(uid: string, cb: (items: GalleryItem[]) => void) {
  const q = query(galleryCol(uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const rows: GalleryItem[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    cb(rows);
  });
}

export async function addGalleryItem(uid: string, payload: Omit<GalleryItem, "id"|"createdAt">) {
  await addDoc(galleryCol(uid), { ...payload, createdAt: serverTimestamp() });
}

export async function deleteGalleryItem(uid: string, id: string) {
  await deleteDoc(doc(db, "users", uid, "gallery", id));
}
