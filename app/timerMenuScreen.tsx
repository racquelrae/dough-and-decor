import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { getRecentTimers, RecentTimer } from '../utils/recents';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../app/types/navigation';


type TimerMenuNavProp = StackNavigationProp<RootStackParamList, 'TimerMenu'>;


function BackButton() {
  const navigation = useNavigation<TimerMenuNavProp>();
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
          <Path d="M15 7H9V1C9 0.73 8.89 0.48 8.71 0.29C8.52 0.11 8.27 0 8 0C7.73 0 7.48 0.11 7.29 0.29C7.11 0.48 7 0.73 7 1V7H1C0.73 7 0.48 7.11 0.29 7.29C0.11 7.48 0 7.73 0 8C0 8.27 0.11 8.52 0.29 8.71C0.48 8.89 0.73 9 1 9H7V15C7 15.27 7.11 15.52 7.29 15.71C7.48 15.89 7.73 16 8 16C8.27 16 8.52 15.89 8.71 15.71C8.89 15.52 9 15.27 9 15V9H15C15.27 9 15.52 8.89 15.71 8.71C15.89 8.52 16 8.27 16 8C16 7.73 15.89 7.48 15.71 7.29C15.52 7.11 15.27 7 15 7Z" fill="white" />
        </Svg>
      </View>
    </View>
  );
}

type TimerCardProps = { title: string; time: string; seconds: number };
function TimerCard({ title, time, seconds }: TimerCardProps) {
  const navigation = useNavigation<TimerMenuNavProp>();
  return (
    <TouchableOpacity
      style={styles.timerCard}
      onPress={() => navigation.navigate('Timer', { seconds })}
      activeOpacity={0.8}
    >
      <View style={styles.timerCardBackground} />
      <Text style={styles.timerCardTitle}>{title}</Text>
      <Text style={styles.timerCardTime}>{time}</Text>
      <View style={styles.timerCardArrow}>
        <Svg width="8" height="14" viewBox="0 0 8 14" fill="none">
          <Path d="M7.5 6.2L1.8 0.6C1.4 0.2 0.8 0.2 0.4 0.6C0 1 0 1.6 0.4 2L5.3 7L0.4 12C0 12.4 0 13 0.4 13.4C0.6 13.6 0.8 13.7 1.1 13.7C1.4 13.7 1.6 13.6 1.8 13.4L7.5 7.8C7.9 7.3 7.9 6.7 7.5 6.2Z" fill="black" />
        </Svg>
      </View>
    </TouchableOpacity>
  );
}

type ActivityCardProps = { label: string; time: string; onPress?: () => void; icon?: React.ReactNode };
function ActivityCard({ label, time, onPress, icon }: ActivityCardProps) {
  const Comp: any = onPress ? TouchableOpacity : View;
  return (
    <Comp style={styles.activityCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.activityCardBackground} />
      <View style={styles.activityCardIcon}>{icon ?? null}</View>
      <Text style={styles.activityCardTime}>{time}</Text>
      <Text style={styles.activityCardLabel}>{label}</Text>
    </Comp>
  );
}

function fmtLabel(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s ? `${m}m ${s}s` : `${m} min`;
}

export default function TimerMenuScreen() {
  const navigation = useNavigation<TimerMenuNavProp>();
  const [recents, setRecents] = useState<RecentTimer[]>([]);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      getRecentTimers().then(list => { if (mounted) setRecents(list); });
      return () => { mounted = false; };
    }, [])
  );

  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.header}>Timer Menu</Text>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          <Text style={styles.sectionTitle}>Quick Timers</Text>
          <TimerCard title="10 Minutes" time="10:00" seconds={10 * 60} />
          <TimerCard title="20 Minutes" time="20:00" seconds={20 * 60} />
          <TimerCard title="30 Minutes" time="30:00" seconds={30 * 60} />

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent</Text>
          {recents.length === 0 ? (
            <Text style={{ opacity: 0.6, marginBottom: 8, marginLeft: 8 }}>No recent timers yet.</Text>
          ) : (
            recents.map((r, idx) => (
              <ActivityCard
                key={idx}
                label={fmtLabel(r.seconds)}
                time={new Date(r.usedAt).toLocaleTimeString()}
                onPress={() => navigation.navigate('Timer', { seconds: r.seconds })} 
              />
            ))
          )}
        </View>
      </ScrollView>
      <AddButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF9', padding: 24, position: 'relative' },
  backButton: { position: 'absolute', top: 21, left: 14, backgroundColor: 'rgba(237, 199, 186, 0.3)', borderRadius: 32, padding: 8, zIndex: 2 },
  header: { marginTop: 64, marginLeft: 8, fontFamily: 'Inter', fontSize: 24, fontWeight: '700', color: '#1C0F0D' },
  content: { marginTop: 48, marginHorizontal: 8 },
  sectionTitle: { fontFamily: 'Poppins', fontSize: 20, fontWeight: '500', color: '#070417', marginBottom: 16 },
  activityCard: { marginBottom: 16, borderRadius: 12, overflow: 'hidden', backgroundColor: 'rgba(237, 199, 186, 0.3)', padding: 16, flexDirection: 'row', alignItems: 'center', position: 'relative' },
  activityCardBackground: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(237, 199, 186, 0.3)', borderRadius: 12, zIndex: -1 },
  activityCardIcon: { marginRight: 16 },
  activityCardTime: { fontFamily: 'Poppins', fontSize: 12, color: '#4F4F4F', marginRight: 16, flex: 1, textAlign: 'right' },
  activityCardLabel: { fontFamily: 'Poppins', fontSize: 14, fontWeight: '500', color: '#000', flex: 2, textAlign: 'left' },
  timerCard: { marginBottom: 24, borderRadius: 12, backgroundColor: 'rgba(237, 199, 186, 0.3)', padding: 24, flexDirection: 'row', alignItems: 'center', position: 'relative' },
  timerCardBackground: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(237, 199, 186, 0.3)', borderRadius: 12, zIndex: -1 },
  timerCardTitle: { fontFamily: 'Poppins', fontSize: 16, color: '#000', flex: 2, textAlign: 'left', fontWeight: '400' },
  timerCardArrow: { marginHorizontal: 8 },
  timerCardTime: { fontFamily: 'Poppins', fontSize: 32, fontWeight: '500', color: '#000', flex: 2, textAlign: 'right' },
  addButton: { position: 'absolute', bottom: 32, alignSelf: 'center', width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  plusIcon: { position: 'absolute', top: 10, left: 10, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
});
