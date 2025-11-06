import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  PanResponder,
  Pressable
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { BackButton } from '../components/BackButton';
import { RootStackParamList } from '../types/navigation';
import { getRecentTimers, RecentTimer } from '../utils/recents';


type TimerMenuNavProp = StackNavigationProp<RootStackParamList, 'TimerMenu'>;


function AddButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.addButton} activeOpacity={0.9} onPress={onPress}>
      <LinearGradient colors={['#f9b6beff', '#f9decfff']} style={styles.addButtonGradient}>
        <Svg width="24" height="24" viewBox="0 0 16 16" fill="none">
          <Path
            d="M15 7H9V1C9 0.73 8.89 0.48 8.71 0.29C8.52 0.11 8.27 0 8 0C7.73 0 7.48 0.11 7.29 0.29C7.11 0.48 7 0.73 7 1V7H1C0.73 7 0.48 7.11 0.29 7.29C0.11 7.48 0 7.73 0 8C0 8.27 0.11 8.52 0.29 8.71C0.48 8.89 0.73 9 1 9H7V15C7 15.27 7.11 15.52 7.29 15.71C7.48 15.89 7.73 16 8 16C8.27 16 8.52 15.89 8.71 15.71C8.89 15.52 9 15.27 9 15V9H15C15.27 9 15.52 8.89 15.71 8.71C15.89 8.52 16 8.27 16 8C16 7.73 15.89 7.48 15.71 7.29C15.52 7.11 15.27 7 15 7Z"
            fill="#fff"
          />
        </Svg>
      </LinearGradient>
    </TouchableOpacity>
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

type ActivityCardProps = {
  label: string;
  time: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  meta?: string;
};
function ActivityCard({ label, time, onPress, icon, meta }: ActivityCardProps) {
  const Comp: any = onPress ? TouchableOpacity : View;
  return (
    <Comp style={styles.activityCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.activityCardBackground} />
      <View style={styles.activityCardIcon}>{icon ?? null}</View>
      <Text style={styles.activityCardTime}>{time}</Text>
      <Text style={styles.activityCardLabel}>{label}</Text>
      {meta ? <Text style={styles.activityCardMeta}>{meta}</Text> : null}
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
  const [showCustom, setShowCustom] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const [customSeconds, setCustomSeconds] = useState('');
  const [customError, setCustomError] = useState('');
  const { width, height } = useWindowDimensions();
  const cols = width > 720 ? 4 : width > 480 ? 3 : 2;
  const fadeHeight = Math.min(height * 0.55, 520);
  const [backdrop] = useState(new Animated.Value(1));
  const [sheetY] = useState(new Animated.Value(height));

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      getRecentTimers().then(list => { if (mounted) setRecents(list); });
      return () => { mounted = false; };
    }, [])
  );

  const closeThreshold = 120; 

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 4,
    onPanResponderMove: (_, gesture) => {
      const next = Math.max(0, gesture.dy);
      sheetY.setValue(next);
    },
    onPanResponderRelease: (_, gesture) => {
      const shouldClose = gesture.dy > closeThreshold || gesture.vy > 0.9;
      if (shouldClose) {
        Animated.parallel([
          Animated.timing(backdrop, { toValue: 0, duration: 180, useNativeDriver: true }),
          Animated.timing(sheetY, { toValue: height, duration: 220, useNativeDriver: true }),
        ]).start(() => setShowCustom(false));
      } else {
        Animated.spring(sheetY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 6,
          speed: 14,
        }).start();
      }
    },
  });

  const openCustomModal = () => {
    setCustomMinutes('');
    setCustomSeconds('');
    setCustomError('');
    setShowCustom(true);

    // reset start positions
    backdrop.setValue(0);
    sheetY.setValue(height);

    Animated.parallel([
      Animated.timing(backdrop, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(sheetY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 8,   // lil’ bounce like icing screen
        speed: 14,
      }),
    ]).start();
  };

  const handleCloseModal = () => {
    Animated.parallel([
      Animated.timing(backdrop, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(sheetY, { toValue: height, duration: 220, useNativeDriver: true }),
    ]).start(() => setShowCustom(false));
  };

  const handleCreateCustomTimer = () => {
    const minutes = Number(customMinutes) || 0;
    const seconds = Number(customSeconds) || 0;

    if (minutes < 0 || seconds < 0) {
      setCustomError('Time cannot be negative.');
      return;
    }
    if (seconds >= 60) {
      setCustomError('Seconds should be less than 60.');
      return;
    }

    const totalSeconds = minutes * 60 + seconds;
    if (totalSeconds <= 0) {
      setCustomError('Enter at least one second.');
      return;
    }

  handleCloseModal();
  setCustomError('');
  navigation.navigate('Timer', { seconds: totalSeconds });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient colors={['#F9E8DE', '#D9B6AB']} style={styles.gradient}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
          <View style={styles.card}>
            <BackButton />
            <View style={styles.headerRow}>
              <Text style={styles.header}>Timer Menu</Text>
              <Text style={styles.subheader}>
                Choose a quick preset or revisit a recent bake.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Timers</Text>
              <TimerCard title="10 Minutes" time="10:00" seconds={10 * 60} />
              <TimerCard title="20 Minutes" time="20:00" seconds={20 * 60} />
              <TimerCard title="30 Minutes" time="30:00" seconds={30 * 60} />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent</Text>
              {recents.length === 0 ? (
                <Text style={styles.emptyState}>No recent timers yet.</Text>
              ) : (
                recents.map((r, idx) => {
                  const lastUsed = new Date(r.usedAt).toLocaleTimeString();
                  return (
                    <ActivityCard
                      key={idx}
                      label={r.description ?? `Last used ${lastUsed}`}
                      time={fmtLabel(r.seconds)}
                      meta={r.description ? `Last used ${lastUsed}` : undefined}
                      onPress={() =>
                        navigation.navigate('Timer', {
                          seconds: r.seconds,
                          description: r.description,
                        })
                      }
                      icon={
                        <Svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                          <Path
                            d="M13.6667 25.6667C20.1101 25.6667 25.3333 20.4435 25.3333 14C25.3333 7.55673 20.1101 2.3335 13.6667 2.3335C7.22334 2.3335 2 7.55673 2 14C2 20.4435 7.22334 25.6667 13.6667 25.6667Z"
                            stroke="rgba(62, 40, 35, 0.35)"
                            strokeWidth="2"
                          />
                          <Path
                            d="M13.6667 8.1665V14L17.5 15.75"
                            stroke="rgba(62, 40, 35, 0.6)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </Svg>
                      }
                    />
                  );
                })
              )}
            </View>
          </View>
        </ScrollView>
        <AddButton onPress={openCustomModal} />
        {showCustom && (
          <View
            style={StyleSheet.absoluteFill}
            pointerEvents="box-none"
          >
            {/* Backdrop */}
            <Pressable
              onPress={handleCloseModal}
              style={StyleSheet.absoluteFill}
            >
              <Animated.View
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    opacity: backdrop.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
                    backgroundColor: 'rgba(0,0,0,0.28)', // slightly darker for stronger focus
                  },
                ]}
                pointerEvents="none"
              />
            </Pressable>

            {/* Bottom sheet (draggable) */}
            <KeyboardAvoidingView
              style={styles.modalCardWrapper}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              pointerEvents="box-none"
            >
              <Animated.View
                {...panResponder.panHandlers}
                style={[
                  styles.modalCard,
                  {
                    transform: [{ translateY: sheetY }],
                    backgroundColor: 'rgba(255, 253, 249, 0.98)',
                  },
                ]}
              >
                {/* A small grabber to suggest drag */}
                <View
                  style={{
                    alignSelf: 'center',
                    width: 36,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: 'rgba(62, 40, 35, 0.22)',
                    marginBottom: 12,
                  }}
                />

                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Create Custom Timer</Text>
                  <Text style={styles.modalSubtitle}>Set the length that suits your bake.</Text>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Minutes</Text>
                    <TextInput
                      style={styles.timeInput}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor="rgba(62, 40, 35, 0.35)"
                      value={customMinutes}
                      onChangeText={text => setCustomMinutes(text.replace(/[^0-9]/g, ''))}
                      maxLength={3}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Seconds</Text>
                    <TextInput
                      style={styles.timeInput}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor="rgba(62, 40, 35, 0.35)"
                      value={customSeconds}
                      onChangeText={text => setCustomSeconds(text.replace(/[^0-9]/g, ''))}
                      maxLength={2}
                    />
                  </View>
                </View>

                {customError ? <Text style={styles.modalError}>{customError}</Text> : null}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancel]}
                    onPress={handleCloseModal}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.modalButtonText, styles.modalCancelText]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalConfirm]}
                    onPress={handleCreateCustomTimer}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.modalButtonText}>Start Timer</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </KeyboardAvoidingView>
          </View>
        )}
      </LinearGradient>
    </>
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
    marginTop: 40,
    padding: 28,
    paddingTop: 72,
    shadowColor: '#46302B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
  },
  headerRow: {
    marginBottom: 24,
    alignItems: 'flex-start',
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
  header: {
    fontFamily: 'Poppins',
    fontSize: 28,
    fontWeight: '700',
    color: '#3E2823',
  },
  subheader: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: 'rgba(62, 40, 35, 0.7)',
    marginTop: 6,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontFamily: 'Poppins',
    fontSize: 18,
    fontWeight: '600',
    color: '#3E2823',
    marginBottom: 16,
  },
  emptyState: {
    fontFamily: 'Poppins',
    fontSize: 13,
    color: 'rgba(62, 40, 35, 0.6)',
    paddingHorizontal: 12,
  },
  timerCard: {
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: 'rgba(237, 199, 186, 0.3)',
    padding: 22,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#3E2823',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 10,
  },
  timerCardBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    backgroundColor: 'rgba(237, 199, 186, 0.18)',
  },
  timerCardTitle: {
    fontFamily: 'Poppins',
    fontSize: 16,
    color: '#3E2823',
    flex: 1.4,
    fontWeight: '500',
  },
  timerCardTime: {
    fontFamily: 'Poppins',
    fontSize: 28,
    fontWeight: '600',
    color: '#3E2823',
    flex: 1,
    textAlign: 'right',
  },
  timerCardArrow: {
    marginLeft: 8,
  },
  activityCard: {
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: 'rgba(237, 199, 186, 0.3)',
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
    shadowColor: '#3E2823',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 8,
  },
  activityCardBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    backgroundColor: 'rgba(237, 199, 186, 0.18)',
  },
  activityCardIcon: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: 'rgba(237, 199, 186, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 2,
  },
  activityCardTime: {
    fontFamily: 'Poppins',
    fontSize: 13,
    color: 'rgba(62, 40, 35, 0.7)',
    textAlign: 'right',
    flex: 1,
  },
  activityCardLabel: {
    fontFamily: 'Poppins',
    fontSize: 13,
    fontWeight: '600',
    color: '#3E2823',
    flex: 1,
  },
  activityCardMeta: {
    fontFamily: 'Poppins',
    fontSize: 11,
    color: 'rgba(62, 40, 35, 0.5)',
    marginTop: 2,
  },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 58,
    height: 58,
    borderRadius: 29,
    shadowColor: '#2E1C18',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 12,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flex: 1,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255,245,247,0.06)',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  modalCardWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    backgroundColor: 'rgba(255, 253, 249, 0.98)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    shadowColor: '#46302B',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 16,
  },
  modalHeader: {
    marginBottom: 20,
    gap: 6,
  },
  modalTitle: {
    fontFamily: 'Poppins',
    fontSize: 20,
    fontWeight: '600',
    color: '#3E2823',
  },
  modalSubtitle: {
    fontFamily: 'Poppins',
    fontSize: 13,
    color: 'rgba(62, 40, 35, 0.65)',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontFamily: 'Poppins',
    fontSize: 12,
    color: 'rgba(62, 40, 35, 0.7)',
    marginBottom: 6,
  },
  timeInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontFamily: 'Poppins',
    fontSize: 16,
    color: '#3E2823',
    borderWidth: 1,
    borderColor: 'rgba(62, 40, 35, 0.1)',
  },
  modalError: {
    marginTop: 12,
    fontFamily: 'Poppins',
    fontSize: 13,
    color: '#C26A77',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#2E1C18',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 8,
  },
  modalCancel: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  modalConfirm: {
    backgroundColor: '#EDC7BA',
  },
  modalButtonText: {
    fontFamily: 'Poppins',
    fontSize: 15,
    fontWeight: '600',
    color: '#3E2823',
  },
  modalCancelText: {
    color: '#3E2823',
  },
});
