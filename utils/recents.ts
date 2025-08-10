import AsyncStorage from '@react-native-async-storage/async-storage';

export type RecentTimer = { seconds: number; usedAt: number };

const KEY = 'recentTimers';
const LIMIT = 5;

export async function addRecentTimer(seconds: number) {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const list: RecentTimer[] = raw ? JSON.parse(raw) : [];
    const next = [{ seconds, usedAt: Date.now() }, ...list.filter(x => x.seconds !== seconds)];
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
