import { useNavigation } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';



function BackButton() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
      <Svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <Path d="M10.6667 5.99992H1.33333M1.33333 5.99992L6 10.6666M1.33333 5.99992L6 1.33325" stroke="#D4B2A7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </Svg>
    </TouchableOpacity>
  );
}


function AddButton() {
  return (
    <View style={styles.addButton}>
      <Svg width="44" height="44" viewBox="0 0 44 44" fill="none">
        <Circle cx="22" cy="22" r="22" fill="#D4B2A7" />
      </Svg>
      <View style={styles.plusIcon}>
        <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <Path d="M15 7H9V1C9 0.734784 8.89464 0.48043 8.70711 0.292893C8.51957 0.105357 8.26522 0 8 0C7.73478 0 7.48043 0.105357 7.29289 0.292893C7.10536 0.48043 7 0.734784 7 1V7H1C0.734784 7 0.48043 7.10536 0.292893 7.29289C0.105357 7.48043 0 7.73478 0 8C0 8.26522 0.105357 8.51957 0.292893 8.70711C0.48043 8.89464 0.734784 9 1 9H7V15C7 15.2652 7.10536 15.5196 7.29289 15.7071C7.48043 15.8946 7.73478 16 8 16C8.26522 16 8.51957 15.8946 8.70711 15.7071C8.89464 15.5196 9 15.2652 9 15V9H15C15.2652 9 15.5196 8.89464 15.7071 8.70711C15.8946 8.51957 16 8.26522 16 8C16 7.73478 15.8946 7.48043 15.7071 7.29289C15.5196 7.10536 15.2652 7 15 7Z" fill="white" />
        </Svg>
      </View>
    </View>
  );
}


function TimerCard({ title, time, onPress }) {
  const navigation = useNavigation();
  return (
    <TouchableOpacity style={styles.timerCard} onPress={() => navigation.navigate('Timer')} activeOpacity={0.8}>
      <View style={styles.timerCardBackground} />
      <Text style={styles.timerCardTitle}>{title}</Text>
      <Text style={styles.timerCardTime}>{time}</Text>
      <View style={styles.timerCardArrow}>
        <Svg width="8" height="14" viewBox="0 0 8 14" fill="none">
          <Path d="M7.5 6.2L1.8 0.6C1.4 0.2 0.8 0.2 0.4 0.6C0 1 0 1.6 0.4 2L5.3 7L0.4 12C0 12.4 0 13 0.4 13.4C0.6 13.6 0.8 13.7 1.1 13.7C1.4 13.7 1.6 13.6 1.8 13.4L7.5 7.8C7.9 7.3 7.9 6.7 7.5 6.2C7.5 6.3 7.5 6.3 7.5 6.2Z" fill="black" />
        </Svg>
      </View>
    </TouchableOpacity>
  );
}


function ActivityCard({ label, time, icon }) {
  return (
    <View style={styles.activityCard}>
      <View style={styles.activityCardBackground} />
      <View style={styles.activityCardIcon}>{icon}</View>
      <Text style={styles.activityCardTime}>{time}</Text>
      <Text style={styles.activityCardLabel}>{label}</Text>
    </View>
  );
}


export default function TimerMenuScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.header}>Timer Menu</Text>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Quick Timers</Text>
          <TimerCard title="10 Minutes" time="10:00" />
          <TimerCard title="20 Minutes" time="20:00" />
          <TimerCard title="30 Minutes" time="30:00" />
          {/* Add more TimerCards as needed */}
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <ActivityCard label="Cookies" time="12:00" icon={null} />
          <ActivityCard label="Bread" time="45:00" icon={null} />
          {/* Add more ActivityCards as needed */}
        </View>
      </ScrollView>
      <AddButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF9',
    padding: 24,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 21,
    left: 14,
    backgroundColor: 'rgba(237, 199, 186, 0.3)',
    borderRadius: 32,
    padding: 8,
    zIndex: 2,
  },
  header: {
    marginTop: 64,
    marginLeft: 8,
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    color: '#1C0F0D',
  },
  content: {
    marginTop: 48,
    marginHorizontal: 8,
  },
  sectionTitle: {
    fontFamily: 'Poppins',
    fontSize: 20,
    fontWeight: '500',
    color: '#070417',
    marginBottom: 16,
  },
  activityCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(237, 199, 186, 0.3)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  activityCardBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(237, 199, 186, 0.3)',
    borderRadius: 12,
    zIndex: -1,
  },
  activityCardIcon: {
    marginRight: 16,
  },
  activityCardTime: {
    fontFamily: 'Poppins',
    fontSize: 12,
    color: '#4F4F4F',
    marginRight: 16,
    flex: 1,
    textAlign: 'right',
  },
  activityCardLabel: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    flex: 2,
    textAlign: 'left',
  },
  timerCard: {
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(237, 199, 186, 0.3)',
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  timerCardBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(237, 199, 186, 0.3)',
    borderRadius: 12,
    zIndex: -1,
  },
  timerCardTitle: {
    fontFamily: 'Poppins',
    fontSize: 16,
    color: '#000',
    flex: 2,
    textAlign: 'left',
    fontWeight: '400',
  },
  timerCardArrow: {
    marginHorizontal: 8,
  },
  timerCardTime: {
    fontFamily: 'Poppins',
    fontSize: 32,
    fontWeight: '500',
    color: '#000',
    flex: 2,
    textAlign: 'right',
  },
  addButton: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});