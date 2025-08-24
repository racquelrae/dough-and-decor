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
            <View style={styles.iconRow}>
              <CircleIcon style={{ marginRight: 8 }}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1l-2-2Z"
                  stroke="#FFFDF9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                />
                </Svg>
              </CircleIcon>

              <CircleIcon style={{ marginRight: 8 }}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                    stroke="#FFFDF9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                  />
                </Svg>
              </CircleIcon>

              <CircleIcon size={28} style={{ marginRight: 8 }}>
              {/* User */}
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                    stroke="#FFFDF9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                  />
                </Svg>
              </CircleIcon>

              <CircleIcon size={28}>
                {/* Settings */}
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.06-.92l2.11-1.65-2-3.46-2.52.74a7.4 7.4 0 0 0-.8-.47l-.38-2.6H9.25l-.38 2.6c-.27.14-.54.3-.8.47l-2.52-.74-2 3.46 2.11 1.65a7.4 7.4 0 0 0 0 1.84L3.55 14.5l2 3.46 2.52-.74c.26.18.53.33.8.47l.38 2.6h4.34l.38-2.6c.27-.14.54-.29.8-.47l2.52.74 2-3.46-2.11-1.65c.04-.3.06-.61.06-.92Z"
                    stroke="#FFFDF9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                  />
                </Svg>
              </CircleIcon>
            </View>
          </View>
          <HomeCard label="Recipes" style={styles.cardRecipes} onPress={() => navigation.navigate('Recipes' as never)} />
          <HomeCard label="Inventory" style={styles.cardInventory} />
          <HomeCard label="Shopping List" style={styles.cardShoppingList} onPress={() => navigation.navigate('ShoppingList' as never)} />
          <HomeCard label="Inspiration Gallery" style={styles.cardInspiration} />
          <HomeCard label="Icing Color Blending Guide" style={styles.cardIcingGuide} onPress={() => navigation.navigate('IcingColorGuide' as never)} />
          <HomeCard label="Measurement Converter" style={styles.cardMeasurement} onPress={() => navigation.navigate('MeasurementConverter' as never)} />
          <HomeCard label="Timer" style={styles.cardTimer} onPress={() => navigation.navigate('TimerMenu' as never)} />
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
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 0,
  },
  notificationIcon: {
    width: 28,
    height: 28,
    backgroundColor: '#BB9D93',
    borderRadius: 14,
    marginRight: 8,
  },
  searchIcon: {
    width: 28,
    height: 28,
    backgroundColor: '#BB9D93',
    borderRadius: 14,
    marginRight: 8,
  },
  userIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  cardRecipes: { marginTop: 16, },
  cardInventory: {},
  cardShoppingList: {},
  cardInspiration: {},
  cardIcingGuide: {},
  cardMeasurement: {},
  cardTimer: {},
});
