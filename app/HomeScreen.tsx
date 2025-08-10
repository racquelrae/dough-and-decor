import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext'; // 👈 use your context

function niceName(raw?: string | null) {
  if (!raw) return '';
  // your usernames are saved lowercase; make them pretty
  return raw
    .split(/[\s._-]+/)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.background}>
          <View style={styles.greetingRow}>
            <Text style={styles.greeting}>Hi, {userName}!</Text>
            <Text style={styles.subGreeting}>What are you creating today?</Text>
            <View style={styles.iconRow}>
              <View style={styles.notificationIcon} />
              <View style={styles.searchIcon} />
              <View style={styles.userIcon}>
                <Svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                  <Path d="M14.6667 16.5V14.8333C14.6667 13.9493 14.3155 13.1014 13.6904 12.4763C13.0652 11.8512 12.2174 11.5 11.3333 11.5H4.66668C3.78262 11.5 2.93478 11.8512 2.30965 12.4763C1.68453 13.1014 1.33334 13.9493 1.33334 14.8333V16.5M11.3333 4.83333C11.3333 6.67428 9.84096 8.16667 8.00001 8.16667C6.15906 8.16667 4.66668 6.67428 4.66668 4.83333C4.66668 2.99238 6.15906 1.5 8.00001 1.5C9.84096 1.5 11.3333 2.99238 11.3333 4.83333Z" stroke="#EDE9E3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>
              <View style={styles.settingsIcon}>
                <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <Path d="M10 12.5C11.3807 12.5 12.5 11.3808 12.5 10C12.5 8.61933 11.3807 7.50004 10 7.50004C8.6193 7.50004 7.50001 8.61933 7.50001 10C7.50001 11.3808 8.6193 12.5 10 12.5Z" stroke="#EDE9E3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>
            </View>
          </View>
          <HomeCard label="Recipes" style={styles.cardRecipes} />
          <HomeCard label="Inventory" style={styles.cardInventory} />
          <HomeCard label="Shopping List" style={styles.cardShoppingList} />
          <HomeCard label="Inspiration Gallery" style={styles.cardInspiration} />
          <HomeCard label="Icing Color Blending Guide" style={styles.cardIcingGuide} />
          <HomeCard label="Measurement Converter" style={styles.cardMeasurement} />
          <HomeCard label="Timer" style={styles.cardTimer} onPress={() => navigation.navigate('TimerMenu' as never)} />
        </View>
      </ScrollView>
    </View>
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
    padding: 0,
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
    marginTop: 32,
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
    marginBottom: 16,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
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
  cardRecipes: { marginTop: 40 },
  cardInventory: {},
  cardShoppingList: {},
  cardInspiration: {},
  cardIcingGuide: {},
  cardMeasurement: {},
  cardTimer: {},
});
