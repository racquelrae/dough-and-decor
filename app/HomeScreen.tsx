import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.background}>
          <View style={styles.greetingRow}>
            <Text style={styles.greeting}>Hi, Test User!</Text>
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
                  <Path d="M16.1667 12.5C16.0557 12.7514 16.0227 13.0302 16.0717 13.3005C16.1207 13.5709 16.2496 13.8203 16.4417 14.0167L16.4917 14.0667C16.6466 14.2215 16.7696 14.4053 16.8534 14.6076C16.9373 14.81 16.9805 15.0268 16.9805 15.2459C16.9805 15.4649 16.9373 15.6818 16.8534 15.8841C16.7696 16.0864 16.6466 16.2702 16.4917 16.425C16.3369 16.58 16.1531 16.7029 15.9507 16.7868C15.7484 16.8707 15.5315 16.9139 15.3125 16.9139C15.0935 16.9139 14.8766 16.8707 14.6743 16.7868C14.4719 16.7029 14.2881 16.58 14.1333 16.425L14.0833 16.375C13.8869 16.1829 13.6375 16.0541 13.3672 16.005C13.0968 15.956 12.818 15.9891 12.5667 16.1C12.3202 16.2057 12.11 16.3811 11.9619 16.6047C11.8139 16.8282 11.7344 17.0902 11.7333 17.3584V17.5C11.7333 17.9421 11.5577 18.366 11.2452 18.6786C10.9326 18.9911 10.5087 19.1667 10.0667 19.1667C9.62465 19.1667 9.20073 18.9911 8.88817 18.6786C8.5756 18.366 8.40001 17.9421 8.40001 17.5V17.425C8.39356 17.1492 8.30427 16.8817 8.14377 16.6573C7.98326 16.4329 7.75896 16.2619 7.50001 16.1667C7.24866 16.0558 6.96985 16.0227 6.69952 16.0717C6.42919 16.1207 6.17974 16.2496 5.98334 16.4417L5.93334 16.4917C5.77855 16.6467 5.59474 16.7696 5.39241 16.8535C5.19008 16.9373 4.9732 16.9805 4.75418 16.9805C4.53515 16.9805 4.31827 16.9373 4.11594 16.8535C3.91361 16.7696 3.7298 16.6467 3.57501 16.4917C3.42005 16.3369 3.29712 16.1531 3.21324 15.9508C3.12937 15.7484 3.0862 15.5316 3.0862 15.3125C3.0862 15.0935 3.12937 14.8766 3.21324 14.6743C3.29712 14.472 3.42005 14.2882 3.57501 14.1334L3.62501 14.0834C3.81712 13.887 3.946 13.6375 3.99501 13.3672C4.04403 13.0969 4.01094 12.8181 3.90001 12.5667C3.79437 12.3202 3.61897 12.11 3.3954 11.962C3.17182 11.8139 2.90983 11.7344 2.64168 11.7334H2.50001C2.05798 11.7334 1.63406 11.5578 1.3215 11.2452C1.00894 10.9327 0.833344 10.5087 0.833344 10.0667C0.833344 9.62468 1.00894 9.20076 1.3215 8.8882C1.63406 8.57564 2.05798 8.40004 2.50001 8.40004H2.57501C2.85084 8.39359 3.11835 8.30431 3.34276 8.1438C3.56717 7.98329 3.73811 7.75899 3.83334 7.50004C3.94427 7.24869 3.97736 6.96988 3.92835 6.69955C3.87933 6.42922 3.75046 6.17977 3.55834 5.98337L3.50834 5.93337C3.35338 5.77859 3.23045 5.59477 3.14658 5.39244C3.0627 5.19011 3.01953 4.97323 3.01953 4.75421C3.01953 4.53518 3.0627 4.3183 3.14658 4.11597C3.23045 3.91364 3.35338 3.72983 3.50834 3.57504C3.66313 3.42008 3.84695 3.29715 4.04928 3.21327C4.25161 3.1294 4.46848 3.08623 4.68751 3.08623C4.90654 3.08623 5.12341 3.1294 5.32574 3.21327C5.52807 3.29715 5.71189 3.42008 5.86668 3.57504L5.91668 3.62504C6.11308 3.81715 6.36252 3.94603 6.63285 3.99504C6.90318 4.04406 7.182 4.01097 7.43334 3.90004H7.50001C7.74648 3.7944 7.95669 3.619 8.10475 3.39543C8.25282 3.17185 8.33227 2.90986 8.33334 2.64171V2.50004C8.33334 2.05801 8.50894 1.63409 8.8215 1.32153C9.13406 1.00897 9.55798 0.833374 10 0.833374C10.442 0.833374 10.866 1.00897 11.1785 1.32153C11.4911 1.63409 11.6667 2.05801 11.6667 2.50004V2.57504C11.6677 2.8432 11.7472 3.10519 11.8953 3.32876C12.0433 3.55234 12.2535 3.72774 12.5 3.83337C12.7514 3.9443 13.0302 3.97739 13.3005 3.92838C13.5708 3.87936 13.8203 3.75049 14.0167 3.55837L14.0667 3.50837C14.2215 3.35341 14.4053 3.23048 14.6076 3.14661C14.8099 3.06273 15.0268 3.01956 15.2458 3.01956C15.4649 3.01956 15.6817 3.06273 15.8841 3.14661C16.0864 3.23048 16.2702 3.35341 16.425 3.50837C16.58 3.66316 16.7029 3.84698 16.7868 4.04931C16.8706 4.25164 16.9138 4.46851 16.9138 4.68754C16.9138 4.90657 16.8706 5.12344 16.7868 5.32577C16.7029 5.5281 16.58 5.71192 16.425 5.86671L16.375 5.91671C16.1829 6.11311 16.054 6.36255 16.005 6.63288C15.956 6.90321 15.9891 7.18203 16.1 7.43337V7.50004C16.2056 7.74651 16.381 7.95672 16.6046 8.10478C16.8282 8.25285 17.0902 8.3323 17.3583 8.33337H17.5C17.942 8.33337 18.366 8.50897 18.6785 8.82153C18.9911 9.13409 19.1667 9.55801 19.1667 10C19.1667 10.4421 18.9911 10.866 18.6785 11.1786C18.366 11.4911 17.942 11.6667 17.5 11.6667H17.425C17.1569 11.6678 16.8949 11.7472 16.6713 11.8953C16.4477 12.0434 16.2723 12.2536 16.1667 12.5Z" stroke="#EDE9E3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
          <HomeCard label="Timer" style={styles.cardTimer} onPress={() => navigation.navigate('Timer Menu' as never)} />
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
