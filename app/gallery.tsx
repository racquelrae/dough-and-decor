// app/(tabs)/gallery.tsx  or wherever you route it
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Image, Pressable, Alert, TextInput, ScrollView, Modal, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getAuth } from "firebase/auth";
import { addGalleryItem, deleteGalleryItem, GalleryItem, watchGallery, updateGalleryItemTags } from "@/firebase/gallery";
import { uploadToCloudinary, thumb } from "@/lib/cloudinary";
import { Ionicons } from "@expo/vector-icons";
import { BackButton } from "@/components/BackButton";
import * as Haptics from 'expo-haptics';

function normalizeTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

function useTagPrompt() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [initialValue, setInitialValue] = React.useState("");
  const resolverRef = React.useRef<{ resolve: (v: string[]) => void } | null>(null);

  // now accepts an optional initial string
  const prompt = (initial?: string) =>
    new Promise<string[]>((resolve) => {
      resolverRef.current = { resolve };
      const init = initial ?? "";
      setValue(init);
      setInitialValue(init);
      setOpen(true);
    });

  const resolveAndClose = (tags: string[]) => {
    resolverRef.current?.resolve(tags);
    resolverRef.current = null;
    setOpen(false);
  };

  const onCancel = () =>
    resolveAndClose(
      initialValue
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
    );
    
  const onSave = () =>
    resolveAndClose(
      value
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 10) // optional: cap at 10 tags
    );

  const node = (
    <Modal visible={open} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Edit tags</Text>
          <Text style={styles.modalHint}>Comma-separated (e.g., flowers, royal icing, pink)</Text>
          <TextInput
            placeholder="flowers, royal icing, pink"
            value={value}
            onChangeText={setValue}
            style={styles.modalInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.modalActions}>
            <Pressable onPress={onCancel} style={[styles.modalBtn, styles.modalBtnGhost]}>
              <Text style={[styles.modalBtnText, { color: "#1C0F0D" }]}>Cancel</Text>
            </Pressable>
            <Pressable onPress={onSave} style={styles.modalBtn}>
              <Text style={styles.modalBtnText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );

  return { prompt, node };
}



function EmptyState({
  hasAnyItems,
  onAdd,
  onClearFilters,
  hasActiveFilters,
}: {
  hasAnyItems: boolean;
  onAdd: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}) {
  const title = hasAnyItems
    ? "No results"
    : 'No photos yet';
  const subtitle = hasAnyItems
    ? (hasActiveFilters ? "Try adjusting your tags or search." : "Try a different search.")
    : 'Tap the “＋” button to add inspiration photos.';

  return (
    <View style={styles.emptyWrap}>
      <Ionicons name="images-outline" size={40} color="#D4B2A7" />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{subtitle}</Text>

      {!hasAnyItems ? (
        <Pressable onPress={onAdd} style={styles.emptyBtn}>
          <Text style={styles.emptyBtnText}>Add a photo</Text>
        </Pressable>
      ) : hasActiveFilters ? (
        <Pressable onPress={onClearFilters} style={[styles.emptyBtn, styles.emptyBtnGhost]}>
          <Text style={[styles.emptyBtnText, { color: "#1C0F0D" }]}>Clear filters</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function InspirationGalleryScreen() {
  const uid = getAuth().currentUser?.uid!;
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const hasActiveFilters = selectedTags.length > 0 || search.trim().length > 0;
  const { prompt: promptTags, node: tagPromptNode } = useTagPrompt();

    const onAdd = useCallback(async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return Alert.alert("Permission required", "Please allow photo library access.");

      const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
      if (picked.canceled) return;

      const result = await uploadToCloudinary(picked.assets[0].uri);

      // iOS native prompt if available; otherwise our modal (Android & web)
      const tags =
        Platform.OS === "ios" && typeof Alert.prompt === "function"
          ? await new Promise<string[]>((resolve) => {
              Alert.prompt!("Add tags (comma separated)", "", (text) =>
                resolve(normalizeTags(text ?? "")), "plain-text"
              );
            })
          : await promptTags();

      await addGalleryItem(uid, {
        url: result.secure_url,
        thumbnailUrl: thumb(result.secure_url, 600),
        width: result.width,
        height: result.height,
        tags,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      Alert.alert("Upload failed", e?.message ?? String(e));
    }
  }, [uid, promptTags]);

  const onClearFilters = useCallback(() => {
    setSelectedTags([]);
    setSearch("");
  }, []);

  useEffect(() => {
    if (!uid) return;
    return watchGallery(uid, setItems);
  }, [uid]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    let data = items;
    if (selectedTags.length) {
      data = data.filter((i) => i.tags?.some((t) => selectedTags.includes(t)));
    }
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      data = data.filter((i) => (i.note || "").toLowerCase().includes(s) || i.tags?.some((t) => t.includes(s)));
    }
    return data;
  }, [items, selectedTags, search]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  return (
    <View style={styles.container}>
      <BackButton />
      <View style={styles.headerRow}>
        <Text style={styles.title}>Inspiration Gallery</Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Pressable onPress={onAdd} hitSlop={10}>
            <Ionicons name="add-circle" size={26} color="#D4B2A7" />
          </Pressable>
        </View>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search notes or tags…"
          style={styles.searchInput}
          autoCorrect={false}
        />
      </View>
     
      {allTags.length > 0 && (
        <View style={styles.tagsBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagScroller}
          >
          <TagChip
            label="All"
            active={selectedTags.length === 0}
            onPress={() => setSelectedTags([])}
          />
          {allTags.map((t) => (
            <TagChip key={t} label={t} active={selectedTags.includes(t)} onPress={() => toggleTag(t)} />
          ))}
        </ScrollView>
      </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 10 }}
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16, gap: 10, flexGrow: 1 }}
        renderItem={({ item }) => <GalleryCard item={item} onDelete={(photo) => deleteGalleryItem(uid, photo.id)} uid={uid} promptTags={promptTags} />}
        ListEmptyComponent={
          <EmptyState
            hasAnyItems={items.length > 0}
            hasActiveFilters={hasActiveFilters}
            onAdd={onAdd}
            onClearFilters={onClearFilters}
          />
        }
      />
      {tagPromptNode}
    </View>
  );
}


function TagChip({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  const handlePress = React.useCallback(() => {
    Haptics.selectionAsync();
    onPress();
  }, [onPress]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && styles.chipPressed,
      ]}
    >
      <Text numberOfLines={1} style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function GalleryCard({ item, onDelete, uid, promptTags }: { item: GalleryItem; onDelete: (item: GalleryItem) => void; uid: string; promptTags: (initial?: string) => Promise<string[]>; }) {
  // keep aspect ratio
  const ratio = item.height > 0 ? item.width / item.height : 1;

  const confirmDelete = useCallback(async () => {
  // a slightly stronger tap so it feels intentional
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

  Alert.alert(
    "Delete photo?",
    "This can’t be undone.",
    [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => onDelete(item) },
    ]
  );
}, [item, onDelete]);

  const handleLongPress = useCallback(async () => {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  Alert.alert("Photo options", undefined, [
    { text: "Cancel", style: "cancel" },
    {
      text: "Edit tags",
      onPress: async () => {
        // pre-fill with current tags joined by commas
        const newTags = await promptTags(item.tags?.join(", ") || "");
        if (newTags) {
          updateGalleryItemTags(uid, item.id, newTags);
        }
      },
    },
    {
      text: "Delete",
      style: "destructive",
      onPress: () => confirmDelete(),
    },
   ]);
 }, [item, onDelete, uid, promptTags, confirmDelete]);

  return (
    <View style={styles.card}>
      <Pressable onLongPress={handleLongPress} style={{ borderRadius: 12, overflow: "hidden" }}>
        <Image
          source={{ uri: item.thumbnailUrl || item.url }}
          style={{ width: "100%", aspectRatio: ratio }}
        />
      </Pressable>
      {item.tags?.length ? (
        <View style={styles.cardTags}>
          {item.tags.slice(0, 3).map((t) => (
            <View style={styles.cardTag} key={t}><Text style={styles.cardTagText}>{t}</Text></View>
          ))}
          {item.tags.length > 3 && <Text style={styles.moreTag}>+{item.tags.length - 3}</Text>}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, marginTop: 40 },
  title: { fontFamily: 'Poppins', color: '#1C0F0D', fontSize: 20, fontWeight: "700", marginTop:64, marginLeft: 16 },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: "#f5f5f7" },
  searchInput: { flex: 1, paddingVertical: 2 },
  tagsBar: {
    height: 40,                
    marginTop: 6,
  },
  tagScroller: {
    paddingHorizontal: 16,
    paddingVertical: 0,
    alignItems: "center",
  },
  chip: { alignSelf:"center", marginRight: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: "#e6e6ea", backgroundColor: "#fff" },
  chipActive: { backgroundColor: "#efd9d9", borderColor: "#efd9d9" },
  chipPressed: {opacity: 0.7},
  chipText: { fontSize: 13, color: "#333", lineHeight:16 },
  chipTextActive: { fontWeight: "600" },
  card: { flex: 1, backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", marginTop: 10 },
  cardTags: { flexDirection: "row", alignItems: "center", gap: 6, paddingTop: 6 },
  cardTag: { backgroundColor: "#f1eef6", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  cardTagText: { fontSize: 11, color: "#5f4b8b" },
  moreTag: { fontSize: 11, color: "#888" },

  // empty state styles
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#1C0F0D", marginTop: 8 },
  emptyText: { fontSize: 14, color: "#6b6b6b", textAlign: "center" },
  emptyBtn: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#D4B2A7",
  },
  emptyBtnGhost: {
    backgroundColor: "#f5f5f7",
  },
  emptyBtnText: { color: "#fff", fontWeight: "700" },


  // modal styles
  modalBackdrop: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.25)",
  justifyContent: "center",
  padding: 24,
  },
  modalCard: {
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: 16,
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 12,
  elevation: 4,
  },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#1C0F0D" },
  modalHint: { marginTop: 4, fontSize: 12, color: "#6b6b6b" },
  modalInput: {
  marginTop: 10,
  borderWidth: 1,
  borderColor: "#e6e6ea",
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 10,
  },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 14 },
  modalBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: "#D4B2A7" },
  modalBtnGhost: { backgroundColor: "#f5f5f7" },
  modalBtnText: { color: "#fff", fontWeight: "700" },
});
