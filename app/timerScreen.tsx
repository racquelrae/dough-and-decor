import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAnchoredCountdown } from '../hooks/useAnchoredCountdown';
import { addRecentTimer } from '../utils/recents';
import { BackButton } from '../components/BackButton';
import { Stack } from 'expo-router';

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
    <TouchableOpacity style={styles.pauseButton} onPress={onPress} activeOpacity={0.8}>
      <Svg width="60" height="60" viewBox="0 0 60 60" fill="none">
        <Circle cx="30" cy="30" r="30" fill="#EDC7BA" fillOpacity="0.3" />
      </Svg>
      <View style={styles.pauseIconContainer}>
        {isPaused ? (
          <Ionicons name="play" size={32} color="#1C0F0D" style={{ opacity: 0.7 }} />
        ) : (
          <Svg width="28" height="32" viewBox="0 0 28 32" fill="none">
            <Rect x="3" y="4" width="7" height="24" rx="2" fill="#1C0F0D" fillOpacity="0.7" />
            <Rect x="18" y="4" width="7" height="24" rx="2" fill="#1C0F0D" fillOpacity="0.7" />
          </Svg>
        )}
      </View>
      <Text style={styles.pauseLabel}>{isPaused ? 'Start' : 'Pause'}</Text>
    </TouchableOpacity>
  );
}

function QuitButton({ isStopped, onPress }: { isStopped: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.quitButton} onPress={onPress} activeOpacity={0.8}>
      <Svg width="60" height="60" viewBox="0 0 60 60" fill="none">
        <Circle cx="30" cy="30" r="30" fill="#EDC7BA" fillOpacity="0.3" />
      </Svg>
      <View style={styles.quitIconContainer}>
        {isStopped ? (
          <Ionicons name="refresh" size={32} color="#1C0F0D" style={{ opacity: 0.7 }} />
        ) : (
          <Svg width="28" height="32" viewBox="0 0 28 32" fill="none">
            <Rect x="3" y="4" width="22" height="24" rx="4" fill="#1C0F0D" fillOpacity="0.7" />
          </Svg>
        )}
      </View>
      <Text style={styles.quitLabel}>{isStopped ? 'Restart' : 'Stop'}</Text>
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

  const { secondsLeft, status, start, pause, resume, stop, reset, setSecondsLeft } =
    useAnchoredCountdown(initialSecondsRef.current);

  // Keep notification id to cancel when stopping/resetting
  const notifIdRef = useRef<string | null>(null);

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
      })
    ).catch(() => {});
  }, [secondsLeft, status]);

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

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Timer finished!',
          body: `Your ${Math.round(secs / 60)}-minute timer is up.`,
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
    start(startFrom);
    await scheduleEndNotification(startFrom);
    addRecentTimer(initialSecondsRef.current);
  }
};

  const handleQuitPress = async () => {
    if (status !== 'stopped') {
      stop();
      await cancelEndNotification();
    } else {
      // Restart to original duration
      reset(initialSecondsRef.current);
      start(initialSecondsRef.current);
      await scheduleEndNotification(initialSecondsRef.current);
      addRecentTimer(initialSecondsRef.current);
    }
  };

  // If timer reaches done state, clear pending notification (it already fired)
  useEffect(() => {
    if (status === 'done') {
      cancelEndNotification();
    }
  }, [status]);

  // UI
  const isRunning = status === 'running'
  const isStopped = status === 'stopped';

  return (
    <>
        <Stack.Screen options = {{ headerShown: false}}/>
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.header}>Timer</Text>
      <View style={styles.timerCircleContainer} pointerEvents="box-none">
        {/* Light ring */}
        <Svg style={styles.ellipseLight} width="320" height="320" viewBox="0 0 320 320" fill="none" pointerEvents="none">
          <Path d="M320 160C320 248.365 248.365 320 160 320C71.635 320 0 248.365 0 160C0 71.635 71.635 0 160 0C248.365 0 320 71.635 320 160ZM40 160C40 229.705 90.295 280 160 280C229.705 280 280 229.705 280 160C280 90.295 229.705 40 160 40C90.295 40 40 90.295 40 160Z" fill="#EDC7BA" fillOpacity="0.3"/>
        </Svg>

        {/* Progress ring (remaining portion) */}
        <Svg style={styles.ellipseDark} width="320" height="320" viewBox="0 0 320 320" fill="none" pointerEvents="none">
          <Circle
            cx="160"
            cy="160"
            r="140"
            stroke="#BB9D93"
            strokeWidth="35"
            fill="none"
            strokeDasharray={2 * Math.PI * 140}
            strokeDashoffset={(1 - secondsLeft / initialSecondsRef.current) * 2 * Math.PI * 140}
            strokeLinecap="round"
            transform="rotate(-90 160 160)"
          />
        </Svg>

        <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
      </View>

      <View style={styles.buttonRow}>
        <PauseButton isPaused={!isRunning} onPress={handleStartPause} />
        <QuitButton isStopped={isStopped} onPress={handleQuitPress} />
      </View>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF9', padding: 24, position: 'relative' },
  header: { marginTop: 90, marginLeft: 16, fontFamily: 'Inter', fontSize: 24, fontWeight: '700', color: '#1C0F0D' },
  timerCircleContainer: { marginTop: 32, marginBottom: 12, alignSelf: 'center', width: 320, height: 320, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  timerText: { position: 'absolute', top: '50%', left: '50%', width: 160, height: 40, marginLeft: -80, marginTop: -20, textAlign: 'center', color: '#070417', fontFamily: 'Poppins', fontSize: 32, fontWeight: '400', letterSpacing: 2, lineHeight: 40 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 48, marginHorizontal: 32 },
  pauseButton: { alignItems: 'center', marginRight: 32 },
  pauseIconContainer: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center', height: 60, zIndex: 1 },
  pauseLabel: { fontFamily: 'Poppins', fontSize: 14, color: '#1C0F0D', textAlign: 'center', marginTop: 16 },
  quitButton: { alignItems: 'center' },
  quitIconContainer: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center', height: 60, zIndex: 1 },
  quitLabel: { fontFamily: 'Poppins', fontSize: 14, color: '#1C0F0D', textAlign: 'center', marginTop: 16 },
  ellipseLight: { position: 'absolute', top: 0, left: 0, width: 320, height: 320 },
  ellipseDark: { position: 'absolute', top: 0, left: 0, width: 320, height: 320 },
});
