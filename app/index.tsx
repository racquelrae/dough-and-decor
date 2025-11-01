import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

function niceName(raw?: string | null) {
  if (!raw) return '';
  return raw
    .split(/[\s._-]+/)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user, userData } = useUser() as { user: any; userData: any };

  const userName = useMemo(() => {
    const fromFirestore = niceName(userData?.username);
    const fromAuth = user?.displayName ? niceName(user.displayName) : '';
    return fromFirestore || fromAuth || 'Baker';
  }, [user, userData]);

  const tiles = [
    { label: 'Recipes', style: styles.cardRecipes, route: 'Recipes' },
    { label: 'Inventory', style: styles.cardInventory, route: 'Inventory' },
    { label: 'Shopping List', style: styles.cardShoppingList, route: 'ShoppingList' },
    { label: 'Inspiration Gallery', style: styles.cardInspiration, route: 'InspirationGallery' },
    { label: 'Icing Color Blending Guide', style: styles.cardIcingGuide, route: 'IcingColorGuide' },
    { label: 'Measurement Converter', style: styles.cardMeasurement, route: 'MeasurementConverter' },
    { label: 'Timer', style: styles.cardTimer, route: 'TimerMenu' },
    { label: 'Settings', style: styles.cardSettings, route: 'Settings' },
  ] as const;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#F9E8DE', '#D9B6AB']} style={styles.gradient}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.greeting}>Hi, {userName}!</Text>
              <Text style={styles.subGreeting}>What are you creating today?</Text>
            </View>

            <View style={styles.tiles}>
              {tiles.map((tile) => (
                <HomeCard
                  key={tile.label}
                  label={tile.label}
                  style={tile.style}
                  onPress={() => navigation.navigate(tile.route as never)}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </>
  );
}

type HomeCardProps = { label: string; style?: any; onPress?: () => void };
function HomeCard({ label, style, onPress }: HomeCardProps) {
  if (onPress) {
    return (
      <TouchableOpacity style={[styles.tile, style]} onPress={onPress} activeOpacity={0.88}>
        <Text style={styles.tileLabel}>{label}</Text>
        <Svg width={20} height={20} viewBox="0 0 256 256" style={styles.tileIcon}>
          <Path
            d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"
            stroke="#3E2823"
            opacity={0.7}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </TouchableOpacity>
    );
  }
  return (
    <View style={[styles.tile, style]}>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 48,
  },
  card: {
    backgroundColor: 'rgba(255, 253, 249, 0.92)',
    borderRadius: 28,
    marginTop: 60,
    padding: 28,
    shadowColor: '#46302B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  badge: {
    backgroundColor: 'rgba(236, 176, 152, 0.35)',
    color: '#3E2823',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    fontFamily: 'Poppins',
    fontSize: 12,
    marginBottom: 12,
  },
  greeting: {
    fontFamily: 'Poppins',
    fontSize: 30,
    color: '#1C0F0D',
    fontWeight: '600',
    marginBottom: 6,
  },
  subGreeting: {
    fontFamily: 'Poppins',
    fontSize: 16,
    color: 'rgba(28, 15, 13, 0.75)',
    fontWeight: '400',
  },
  tiles: {
    marginTop: 8,
  },
  tile: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 22,
    marginBottom: 16,
    shadowColor: '#3E2823',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tileLabel: {
    color: '#3E2823',
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  tileIcon: {
    opacity: 0.65,
  },
  cardRecipes: { backgroundColor: '#EDC7BA' },
  cardInventory: { backgroundColor: '#EDC7BA' },
  cardShoppingList: { backgroundColor: '#EDC7BA' },
  cardInspiration: { backgroundColor: '#EDC7BA' },
  cardIcingGuide: { backgroundColor: '#EDC7BA' },
  cardMeasurement: { backgroundColor: '#EDC7BA' },
  cardTimer: { backgroundColor: '#EDC7BA' },
  cardSettings: { backgroundColor: '#EDC7BA' },
});
