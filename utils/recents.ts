import AsyncStorage from '@react-native-async-storage/async-storage';

export type RecentTimer = { seconds: number; usedAt: number; description?: string };

const KEY = 'recentTimers';
const LIMIT = 5;

export async function addRecentTimer(seconds: number, description?: string) {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const list: RecentTimer[] = raw ? JSON.parse(raw) : [];
    const normalizedDescription = description?.trim() || undefined;
    const nextEntry: RecentTimer = { seconds, usedAt: Date.now(), description: normalizedDescription };
    const next = [
      nextEntry,
      ...list.filter(
        x =>
          x.seconds !== seconds ||
          (x.description ?? '') !== (normalizedDescription ?? '')
      ),
    ];
    await AsyncStorage.setItem(KEY, JSON.stringify(next.slice(0, LIMIT)));
  } catch (e) {
    // noop
  }
}

export async function getRecentTimers(): Promise<RecentTimer[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
