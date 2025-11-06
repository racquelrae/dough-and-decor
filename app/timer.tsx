import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform, ScrollView, TextInput } from 'react-native';
import Svg, {
  Circle,
  Path,
  Rect,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAnchoredCountdown } from '../hooks/useAnchoredCountdown';
import { addRecentTimer } from '../utils/recents';
import { BackButton } from '../components/BackButton';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';

// Foreground behavior (optional: show even if app is open)
(Notifications as any).setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensurePermissions() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }
}

async function ensureAndroidChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('timer-default', {
      name: 'Timer',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',               
      enableVibrate: true,            
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }
}

function PauseButton({ isPaused, onPress }: { isPaused: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.controlButton} onPress={onPress} activeOpacity={0.85}>
      <Svg width="70" height="70" viewBox="0 0 70 70" fill="none">
        <Circle cx="35" cy="35" r="35" fill="#EDC7BA" fillOpacity="0.32" />
      </Svg>
      <View style={styles.controlIconContainer}>
        {isPaused ? (
          <Ionicons name="play" size={32} color="#3E2823" style={{ opacity: 0.8 }} />
        ) : (
          <Svg width="28" height="32" viewBox="0 0 28 32" fill="none">
            <Rect x="3" y="4" width="7" height="24" rx="2" fill="#3E2823" fillOpacity="0.75" />
            <Rect x="18" y="4" width="7" height="24" rx="2" fill="#3E2823" fillOpacity="0.75" />
          </Svg>
        )}
      </View>
      <Text style={styles.controlLabel}>{isPaused ? 'Start' : 'Pause'}</Text>
    </TouchableOpacity>
  );
}

function QuitButton({ isStopped, onPress }: { isStopped: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.controlButton} onPress={onPress} activeOpacity={0.85}>
      <Svg width="70" height="70" viewBox="0 0 70 70" fill="none">
        <Circle cx="35" cy="35" r="35" fill="#ECADB4" fillOpacity="0.32" />
      </Svg>
      <View style={styles.controlIconContainer}>
        {isStopped ? (
          <Ionicons name="refresh" size={32} color="#3E2823" style={{ opacity: 0.8 }} />
        ) : (
          <Svg width="28" height="32" viewBox="0 0 28 32" fill="none">
            <Rect x="3" y="4" width="22" height="24" rx="4" fill="#3E2823" fillOpacity="0.75" />
          </Svg>
        )}
      </View>
      <Text style={styles.controlLabel}>{isStopped ? 'Restart' : 'Stop'}</Text>
    </TouchableOpacity>
  );
}

function formatTime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function TimerScreen() {
  const route = useRoute<any>();
  const selectedSeconds = useMemo(() => Number(route.params?.seconds ?? 10 * 60), [route.params]);
  const initialSecondsRef = useRef(selectedSeconds);
  const [description, setDescription] = useState(() => route.params?.description ?? '');
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    setDescription(route.params?.description ?? '');
  }, [route.params?.description]);

  const { secondsLeft, status, start, pause, resume, stop, reset, setSecondsLeft } =
    useAnchoredCountdown(initialSecondsRef.current);

  // Keep notification id to cancel when stopping/resetting
  const notifIdRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          interruptionModeIOS: InterruptionModeIOS.DuckOthers,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const { sound } = await Audio.Sound.createAsync(
          require('../assets/sounds/timer-sound.mp3'),
          { isLooping: true, volume: 1, shouldPlay: false }
        );

        if (mounted) {
          soundRef.current = sound;
        } else {
          await sound.unloadAsync();
        }
      } catch (e) {
        console.log('[Timer] sound init error', e);
      }
    })();

    return () => {
      mounted = false;
      const sound = soundRef.current;
      if (sound) {
        sound.stopAsync().catch(() => {});
        sound.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, []);

  const stopAlarmSound = useCallback(async () => {
    const sound = soundRef.current;
    if (!sound) return;
    try {
      const status = await sound.getStatusAsync();
      if (status.isLoaded && (status.isPlaying || status.positionMillis > 0)) {
        await sound.stopAsync();
      }
    } catch (e) {
      console.log('[Timer] stop sound error', e);
    }
  }, []);

  // One-time setup
  useEffect(() => {
  (async () => {
    await ensurePermissions();
    await ensureAndroidChannel();

    // Clear any pending/delivered notifications from past runs
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.dismissAllNotificationsAsync(); // iOS/Android: clears shown banners/center
    } catch {}

    // Show the chosen duration but keep status 'idle'
    setSecondsLeft(initialSecondsRef.current);
    reset(initialSecondsRef.current);
  })();
}, []);

  // Persist lightweight state 
  useEffect(() => {
    AsyncStorage.setItem(
      'timerState',
      JSON.stringify({
        remaining: secondsLeft,
        status,
        initial: initialSecondsRef.current,
        description,
      })
    ).catch(() => {});
  }, [secondsLeft, status, description]);

  // When user pauses/resumes/stops, manage notifications
  const scheduleEndNotification = async (durationSeconds: number) => {
    try {
      // cancel any previous single-id we may have
      if (notifIdRef.current) {
        await Notifications.cancelScheduledNotificationAsync(notifIdRef.current);
        notifIdRef.current = null;
      }

      // extra safety: nuke stragglers (dev convenience)
      await Notifications.cancelAllScheduledNotificationsAsync();

      const secs = Math.max(2, Math.floor(durationSeconds || 0)); // clamp to >= 2s
      console.log('[Timer] scheduling notification in', secs, 'seconds');

      const trigger = Platform.select({
        android: { type: 'timeInterval', seconds: secs, repeats: false, channelId: 'timer-default' },
        ios:     { type: 'timeInterval', seconds: secs, repeats: false },
      }) as Notifications.NotificationTriggerInput;

      const label = description.trim();
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Timer finished!',
          body: label
            ? `Your ${label} timer is complete.`
            : `Your ${Math.round(secs / 60)}-minute timer is up.`,
          sound: Platform.OS === 'ios' ? 'chime' : undefined,
        },
        trigger,
      });

      notifIdRef.current = id;
    } catch (e) {
      console.log('[Timer] schedule error', e);
    }
  };

  const cancelEndNotification = async () => {
    try {
      if (notifIdRef.current) {
        await Notifications.cancelScheduledNotificationAsync(notifIdRef.current);
        notifIdRef.current = null;
      }
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch {}
  };

  const handleStartPause = async () => {
    if (status === 'running') {
      pause();
      await cancelEndNotification();
    } else if (status === 'paused') {
      resume();
      await scheduleEndNotification(secondsLeft);
    } else {
      // idle | stopped | done → start from the current display (or preset)
      const startFrom = secondsLeft > 0 ? secondsLeft : initialSecondsRef.current;
      await stopAlarmSound();
      start(startFrom);
      await scheduleEndNotification(startFrom);
      addRecentTimer(initialSecondsRef.current, description);
    }
  };

  const handleQuitPress = async () => {
    await stopAlarmSound();
    if (status !== 'stopped') {
      stop();
      await cancelEndNotification();
    } else {
      // Restart to original duration
      reset(initialSecondsRef.current);
      start(initialSecondsRef.current);
      await scheduleEndNotification(initialSecondsRef.current);
      addRecentTimer(initialSecondsRef.current, description);
    }
  };

  // If timer reaches done state, clear pending notification (it already fired)
  useEffect(() => {
    if (status === 'done') {
      cancelEndNotification();
    }
  }, [status]);

  useEffect(() => {
    const sound = soundRef.current;
    if (!sound) return;

    if (status === 'done') {
      (async () => {
        try {
          const playbackStatus = await sound.getStatusAsync();
          if (playbackStatus.isLoaded) {
            await sound.setPositionAsync(0);
            await sound.playAsync();
          }
        } catch (e) {
          console.log('[Timer] play sound error', e);
        }
      })();
    } else {
      stopAlarmSound();
    }
  }, [status, stopAlarmSound]);

  // UI
  const isRunning = status === 'running';
  const isStopped = status === 'stopped';
  const statusDotStyle =
    status === 'running'
      ? styles.statusDotRunning
      : status === 'paused'
      ? styles.statusDotPaused
      : status === 'done'
      ? styles.statusDotDone
      : styles.statusDotIdle;
  const statusLabel =
    status === 'running'
      ? 'Counting'
      : status === 'paused'
      ? 'Paused'
      : status === 'done'
      ? 'Finished'
      : 'Ready';

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
            <Text style={styles.header}>Timer</Text>
            <Text style={styles.subheader}>Stay focused and let us watch the clock.</Text>
          </View>
          <View style={styles.descriptionBlock}>
            <Text style={styles.descriptionLabel}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="e.g., Bake cookies, icing set, dough rest"
              placeholderTextColor="rgba(62, 40, 35, 0.35)"
              style={styles.descriptionInput}
              maxLength={60}
            />
          </View>

          <View style={styles.timerCircleContainer} pointerEvents="box-none">
            <Svg
              style={styles.ellipseLight}
              width="320"
              height="320"
              viewBox="0 0 320 320"
              fill="none"
              pointerEvents="none"
            >
              <Path
                d="M320 160C320 248.365 248.365 320 160 320C71.635 320 0 248.365 0 160C0 71.635 71.635 0 160 0C248.365 0 320 71.635 320 160ZM40 160C40 229.705 90.295 280 160 280C229.705 280 280 229.705 280 160C280 90.295 229.705 40 160 40C90.295 40 40 90.295 40 160Z"
                fill="#EDC7BA"
                fillOpacity="0.2"
              />
            </Svg>

            <Svg
              style={styles.ellipseDark}
              width="320"
              height="320"
              viewBox="0 0 320 320"
              fill="none"
              pointerEvents="none"
            >
              <Circle
                cx="160"
                cy="160"
                r="140"
                stroke="url(#timerGradient)"
                strokeWidth="35"
                fill="none"
                strokeDasharray={2 * Math.PI * 140}
                strokeDashoffset={(1 - secondsLeft / initialSecondsRef.current) * 2 * Math.PI * 140}
                strokeLinecap="round"
                transform="rotate(-90 160 160)"
              />
              <Defs>
                <SvgLinearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0" stopColor="#BB9D93" stopOpacity="0.85" />
                  <Stop offset="1" stopColor="#ECADB4" stopOpacity="0.95" />
                </SvgLinearGradient>
              </Defs>
            </Svg>

            <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
            <View style={styles.statusPill}>
              <View style={[styles.statusDot, statusDotStyle]} />
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <PauseButton isPaused={!isRunning} onPress={handleStartPause} />
            <QuitButton isStopped={isStopped} onPress={handleQuitPress} />
          </View>
        </View>
        </ScrollView>
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
    flex: 1,
    marginTop: 40,
    backgroundColor: 'rgba(255, 253, 249, 0.92)',
    borderRadius: 28,
    padding: 28,
    paddingTop: 62,
    shadowColor: '#46302B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
  },
  headerRow: {
    marginTop: 16,
    marginBottom: 12,
  },
  badge: {
    alignSelf: 'flex-start',
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
  timerCircleContainer: {
    marginTop: 24,
    marginBottom: 32,
    alignSelf: 'center',
    width: 320,
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  timerText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 200,
    marginLeft: -100,
    marginTop: -32,
    textAlign: 'center',
    color: '#3E2823',
    fontFamily: 'Poppins',
    fontSize: 36,
    fontWeight: '600',
    letterSpacing: 2,
  },
  statusPill: {
    position: 'relative',
    marginTop: 450,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(236, 197, 210, 0.4)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusDotRunning: {
    backgroundColor: '#EC888D',
  },
  statusDotPaused: {
    backgroundColor: '#D4B2A7',
  },
  statusDotDone: {
    backgroundColor: '#7EA87C',
  },
  statusDotIdle: {
    backgroundColor: 'rgba(62, 40, 35, 0.4)',
  },
  statusText: {
    fontFamily: 'Poppins',
    fontSize: 13,
    color: '#3E2823',
    marginTop: -8,
    marginBottom: -8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    columnGap: 48,
    marginTop: 72,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlIconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 70,
    zIndex: 1,
  },
  controlLabel: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#3E2823',
    textAlign: 'center',
    marginTop: 16,
  },
  ellipseLight: { position: 'absolute', top: 0, left: 0, width: 320, height: 320 },
  ellipseDark: { position: 'absolute', top: 0, left: 0, width: 320, height: 320 },
  descriptionBlock: {
    marginTop: 12,
  },
  descriptionLabel: {
    fontFamily: 'Poppins',
    fontSize: 13,
    color: 'rgba(62, 40, 35, 0.7)',
    marginBottom: 6,
  },
  descriptionInput: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#3E2823',
    backgroundColor: 'rgba(236, 197, 210, 0.25)',
  },
});
