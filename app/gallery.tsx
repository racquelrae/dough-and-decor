// app/(tabs)/gallery.tsx  or wherever you route it
import { BackButton } from "@/components/BackButton";
import { addGalleryItem, deleteGalleryItem, GalleryItem, updateGalleryItemTags, watchGallery } from "@/firebase/gallery";
import { thumb, uploadToCloudinary } from "@/lib/cloudinary";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { getAuth } from "firebase/auth";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
        <LinearGradient
          colors={["#FFF5F7", "rgba(255,245,247,0.78)", "rgba(255,250,250,0.4)", "rgba(255,255,255,0)"]}
          locations={[0, 0.2, 0.4, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
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
          <Text style={[styles.emptyBtnText, styles.emptyBtnTextGhost]}>Clear filters</Text>
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
  const [lightbox, setLightbox] = useState<{ open: boolean; item?: GalleryItem }>({ open: false });
  const hasActiveFilters = selectedTags.length > 0 || search.trim().length > 0;
  const { prompt: promptTags, node: tagPromptNode } = useTagPrompt();
  const { width, height } = useWindowDimensions();
  const columnCount = width >= 1200 ? 4 : width >= 900 ? 3 : 2;

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

  const masonryColumns = useMemo(() => {
    const columns = Array.from({ length: columnCount }, () => ({
      items: [] as GalleryItem[],
      height: 0,
    }));

    filtered.forEach((item) => {
      const aspect = item.height > 0 && item.width > 0 ? item.height / item.width : 1;
      const target = columns.reduce((prev, curr) => (curr.height < prev.height ? curr : prev));
      target.items.push(item);
      target.height += aspect;
    });

    return columns.map((col) => col.items);
  }, [filtered, columnCount]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  return (
    <>
      <LinearGradient colors={["#F9E8DE", "#D9B6AB"]} style={styles.gradient} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.mainCard}>
          <BackButton />
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Inspiration Gallery</Text>
              <Text style={styles.subtitle}>
                Save bakes, palettes, and piping ideas. Filter or search by tags to find sparks of creativity.
              </Text>
            </View>
            <Pressable
              onPress={onAdd}
              style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
              hitSlop={10}
            >
              <Ionicons name="add" size={24} color="#3E2823" />
            </Pressable>
          </View>

          <View style={styles.searchRow}>
            <Ionicons name="search" size={18} color="rgba(62, 40, 35, 0.6)" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search photos…"
              placeholderTextColor="rgba(62, 40, 35, 0.45)"
              style={styles.searchInput}
              autoCorrect={false}
            />
            {search ? (
              <Pressable onPress={() => setSearch("")} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color="rgba(62, 40, 35, 0.35)" />
              </Pressable>
            ) : null}
          </View>

          {allTags.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagScroller}
              style={styles.tagsBar}
            >
              <TagChip label="All" active={selectedTags.length === 0} onPress={() => setSelectedTags([])} />
              {allTags.map((t) => (
                <TagChip key={t} label={t} active={selectedTags.includes(t)} onPress={() => toggleTag(t)} />
              ))}
            </ScrollView>
          )}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.masonryScroll}
          >
            {filtered.length === 0 ? (
              <EmptyState
                hasAnyItems={items.length > 0}
                hasActiveFilters={hasActiveFilters}
                onAdd={onAdd}
                onClearFilters={onClearFilters}
              />
            ) : (
              <View style={styles.masonry}>
        {masonryColumns.map((column, idx) => (
          <View key={idx} style={styles.masonryColumn}>
            {column.map((item) => (
              <GalleryCard
                key={item.id}
                item={item}
                onDelete={(photo) => deleteGalleryItem(uid, photo.id)}
                uid={uid}
                promptTags={promptTags}
                onPreview={(selected) => setLightbox({ open: true, item: selected })}
              />
            ))}
          </View>
        ))}
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
      {tagPromptNode}

      {lightbox.open && lightbox.item ? (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setLightbox({ open: false })}
        >
          <Pressable style={styles.lightboxBackdrop} onPress={() => setLightbox({ open: false })}>
            <LinearGradient
              colors={["rgba(0,0,0,0.75)", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.75)"]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={styles.lightboxContent}
            >
              {/* Calculate image size based on window and aspect ratio, using top-level hook values */}
              {(() => {
                const imgWidth = lightbox.item?.width || 800;
                const imgHeight = lightbox.item?.height || 800;
                const aspect = imgWidth > 0 && imgHeight > 0 ? imgWidth / imgHeight : 1;
                // Max width/height for modal image
                const maxW = Math.min(width * 0.85, 800);
                const maxH = Math.min(height * 0.65, 800);
                let displayW = maxW;
                let displayH = maxW / aspect;
                if (displayH > maxH) {
                  displayH = maxH;
                  displayW = maxH * aspect;
                }
                return (
                  <Image
                    source={{ uri: lightbox.item.url }}
                    style={{
                      width: displayW,
                      height: displayH,
                      borderRadius: 24,
                      backgroundColor: "#fff",
                    }}
                    resizeMode="contain"
                  />
                );
              })()}
              <View style={styles.lightboxMeta}>
                {lightbox.item.tags?.length ? (
                  <View style={styles.lightboxTags}>
                    {lightbox.item.tags.map((t) => (
                      <View style={styles.lightboxTag} key={t}>
                        <Text style={styles.lightboxTagText}>{t}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
                {lightbox.item.note ? (
                  <Text style={styles.lightboxNote}>{lightbox.item.note}</Text>
                ) : null}
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </>
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

function GalleryCard({
  item,
  onDelete,
  uid,
  promptTags,
  onPreview,
}: {
  item: GalleryItem;
  onDelete: (item: GalleryItem) => void;
  uid: string;
  promptTags: (initial?: string) => Promise<string[]>;
  onPreview: (item: GalleryItem) => void;
}) {
  const aspectRatio = item.height > 0 && item.width > 0 ? item.width / item.height : 1;

  const confirmDelete = useCallback(async () => {
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
    <Pressable onPress={() => onPreview(item)} onLongPress={handleLongPress} style={styles.card}>
      <View style={styles.cardImageWrap}>
        <Image
          source={{ uri: item.thumbnailUrl || item.url }}
          style={[styles.cardImage, { aspectRatio }]}
        />
      </View>
    </Pressable>
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
  mainCard: {
    flex: 1,
    marginTop: 20,
    backgroundColor: "rgba(255, 253, 249, 0.92)",
    borderRadius: 28,
    padding: 24,
    paddingTop: 72,
    shadowColor: "#46302B",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#3E2823",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 6,
  },
  addButtonPressed: {
    opacity: 0.85,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 18,
    borderRadius: 18,
    backgroundColor: "rgba(255, 253, 249, 0.92)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#3E2823",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Poppins",
    fontSize: 14,
    color: "#3E2823",
    paddingVertical: 0,
  },
  tagsBar: {
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: "rgba(255, 253, 249, 0.92)",
    minHeight: 44,
  },
  tagScroller: {
    paddingHorizontal: 2,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  masonryScroll: {
    paddingTop: 18,
    paddingBottom: 80,
  },
  masonry: {
    flexDirection: "row",
    gap: 18,
    alignItems: "flex-start",
  },
  masonryColumn: {
    flex: 1,
    gap: 18,
  },
  chip: {
    marginHorizontal: 6,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(236, 197, 210, 0.6)",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    shadowColor: "#3E2823",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  chipActive: {
    backgroundColor: "#D4B2A7",
    borderColor: "transparent",
  },
  chipPressed: {
    opacity: 0.7,
  },
  chipText: {
    fontSize: 13,
    color: "#3E2823",
    fontFamily: "Poppins",
    paddingHorizontal: 10,
    paddingBottom: 0,
  },
  chipTextActive: {
    fontWeight: "600",
    paddingHorizontal: 10,
    paddingBottom: 0,
  },
  card: {
    borderRadius: 24,
    backgroundColor: "rgba(255, 253, 249, 0.92)",
    overflow: "hidden",
    shadowColor: "#3E2823",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 8,
  },
  cardImageWrap: {
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3E2823",
    fontFamily: "Poppins",
  },
  emptyText: {
    fontSize: 13,
    color: "rgba(62, 40, 35, 0.7)",
    fontFamily: "Poppins",
    textAlign: "center",
    lineHeight: 18,
  },
  emptyBtn: {
    marginTop: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#D4B2A7",
    shadowColor: "#3E2823",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 6,
  },
  emptyBtnGhost: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  emptyBtnText: {
    fontFamily: "Poppins",
    fontWeight: "600",
    color: "#FFFFFF",
  },
  emptyBtnTextGhost: {
    color: "#3E2823",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(28, 15, 13, 0.12)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "rgba(255, 253, 249, 0.98)",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#46302B",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3E2823",
    fontFamily: "Poppins",
  },
  modalHint: {
    marginTop: 6,
    fontSize: 12,
    color: "rgba(62, 40, 35, 0.65)",
    fontFamily: "Poppins",
  },
  modalInput: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(62, 40, 35, 0.1)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "Poppins",
    fontSize: 14,
    color: "#3E2823",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 18,
  },
  modalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#D4B2A7",
  },
  modalBtnGhost: {
    backgroundColor: "rgba(255, 255, 255, 0.88)",
  },
  modalBtnText: {
    color: "#3E2823",
    fontWeight: "600",
    fontFamily: "Poppins",
  },
  lightboxBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  lightboxContent: {
    maxWidth: "90%",
    alignSelf: "center",
    alignItems: "center",
    padding: 24,
  },
  lightboxImage: {
    width: "100%",
    borderRadius: 24,
    marginBottom: 16,
  },
  lightboxMeta: {
    width: "100%",
    gap: 10,
    alignItems: "center",
  },
  lightboxTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginTop: 14,
  },
  lightboxTag: {
    backgroundColor: "rgba(236, 197, 210, 0.4)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  lightboxTagText: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#FDF3F0",
    letterSpacing: 0.3,
  },
  lightboxNote: {
    fontFamily: "Poppins",
    fontSize: 14,
    color: "#FDF3F0",
    textAlign: "center",
    lineHeight: 20,
  },
});
