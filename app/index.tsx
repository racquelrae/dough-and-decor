import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext'; 
import { Stack } from 'expo-router'; 

function niceName(raw?: string | null) {
  if (!raw) return '';
  return raw
    .split(/[\s._-]+/)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

  function CircleIcon({
    children,
    size = 28,
    bg = "#BB9D93",
    style,
  }: {
    children: React.ReactNode;
    size?: number;
    bg?: string;
    style?: any;
  }) {
    return (
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bg,
            alignItems: "center",
            justifyContent: "center",
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user, userData } = useUser() as { user: any; userData: any };

  const userName = useMemo(() => {
    // 1) Firestore users.username 
    // 2) Auth displayName
    // 3) fallback
    const fromFirestore = niceName(userData?.username);
    const fromAuth = user?.displayName ? niceName(user.displayName) : '';
    return fromFirestore || fromAuth || 'Baker';
  }, [user, userData]);

  return (
    <>
        <Stack.Screen options = {{ headerShown: false}}/>
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.background}>
          <View style={styles.greetingRow}>
            <Text style={styles.greeting}>Hi, {userName}!</Text>
            <Text style={styles.subGreeting}>What are you creating today?</Text>
          </View>
          <HomeCard label="Recipes" style={styles.cardRecipes} onPress={() => navigation.navigate('Recipes' as never)} />
          <HomeCard label="Inventory" style={styles.cardInventory} onPress={() => navigation.navigate('Inventory' as never)} />
          <HomeCard label="Shopping List" style={styles.cardShoppingList} onPress={() => navigation.navigate('ShoppingList' as never)} />
          <HomeCard label="Inspiration Gallery" style={styles.cardInspiration} onPress={() => navigation.navigate('InspirationGallery' as never)} />
          <HomeCard label="Icing Color Blending Guide" style={styles.cardIcingGuide} onPress={() => navigation.navigate('IcingColorGuide' as never)} />
          <HomeCard label="Measurement Converter" style={styles.cardMeasurement} onPress={() => navigation.navigate('MeasurementConverter' as never)} />
          <HomeCard label="Timer" style={styles.cardTimer} onPress={() => navigation.navigate('TimerMenu' as never)} />
          <HomeCard label="Settings" style={styles.cardSettings} onPress={() => navigation.navigate('Settings' as never)} />
        </View>
      </ScrollView>
    </View>
    </> 
  );
}

type HomeCardProps = { label: string; style?: any; onPress?: () => void };
function HomeCard({ label, style, onPress }: HomeCardProps) {
  if (onPress) {
    return (
      <TouchableOpacity style={[styles.homeCard, style]} onPress={onPress}>
        <Text style={styles.homeCardLabel}>{label}</Text>
      </TouchableOpacity>
    );
  }
  return (
    <View style={[styles.homeCard, style]}>
      <Text style={styles.homeCardLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF9',
    paddingTop: 50,
  },
  background: {
    flex: 1,
    borderRadius: 40,
    backgroundColor: '#FFFDF9',
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  headerStrip: {
    paddingTop: 24,
    paddingBottom: 8,
    backgroundColor: '#FFFDF9',
    alignItems: 'center',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  timeText: {
    color: '#32201C',
    fontFamily: 'League Spartan',
    fontSize: 13,
    fontWeight: '500',
  },
  greetingRow: {
    marginTop: 36,
    marginBottom: 24,
    paddingHorizontal: 38,
  },
  greeting: {
    fontFamily: 'Poppins',
    fontSize: 25,
    color: '#1C0F0D',
    fontWeight: '400',
    marginBottom: 4,
  },
  subGreeting: {
    fontFamily: 'Poppins',
    fontSize: 13,
    color: '#1C0F0D',
    fontWeight: '400',
    marginBottom: 12,
  },
  homeCard: {
    backgroundColor: '#EDC7BA',
    marginHorizontal: 50,
    marginVertical: 10,
    borderRadius: 13,
    shadowColor: 'rgba(0,0,0,0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
    paddingHorizontal: 15,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeCardLabel: {
    color: '#1C0F0D',
    fontFamily: 'Poppins',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  cardRecipes: { marginTop: 6, },
  cardInventory: {},
  cardShoppingList: {},
  cardInspiration: {},
  cardIcingGuide: {},
  cardMeasurement: {},
  cardTimer: {},
  cardSettings:{}
});
