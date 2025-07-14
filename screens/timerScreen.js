import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

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

function PauseButton({ isPaused, onPress }) {
  return (
    <TouchableOpacity style={styles.pauseButton} onPress={onPress} activeOpacity={0.8}>
      <Svg width="60" height="60" viewBox="0 0 60 60" fill="none">
        <Circle cx="30" cy="30" r="30" fill="#EDC7BA" fillOpacity="0.3" />
      </Svg>
      <View style={styles.pauseIconContainer}>
        {isPaused ? (
          // Ionicons play icon
          <Ionicons name="play" size={32} color="#1C0F0D" style={{ opacity: 0.7 }} />
        ) : (
          // Pause icon (bars)
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

function QuitButton({ isStopped, onPress }) {
  return (
    <TouchableOpacity style={styles.quitButton} onPress={onPress} activeOpacity={0.8}>
      <Svg width="60" height="60" viewBox="0 0 60 60" fill="none">
        <Circle cx="30" cy="30" r="30" fill="#EDC7BA" fillOpacity="0.3" />
      </Svg>
      <View style={styles.quitIconContainer}>
        {isStopped ? (
          // Ionicons refresh icon
          <Ionicons name="refresh" size={32} color="#1C0F0D" style={{ opacity: 0.7 }} />
        ) : (
          // Stop icon (rectangle)
          <Svg width="28" height="32" viewBox="0 0 28 32" fill="none">
            <Rect x="3" y="4" width="22" height="24" rx="4" fill="#1C0F0D" fillOpacity="0.7" />
          </Svg>
        )}
      </View>
      <Text style={styles.quitLabel}>{isStopped ? 'Restart' : 'Stop'}</Text>
    </TouchableOpacity>
  );
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `00:${m}:${s}`;
}

export default function TimerScreen() {
  const navigation = useNavigation();
  const initialSeconds = 10 * 60;
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  // Persist timer state and last active timestamp
  useEffect(() => {
    if (loading) return;
    const persistState = async () => {
      await AsyncStorage.setItem(
        'timerState',
        JSON.stringify({ secondsLeft, isPaused, isStopped })
      );
      if (!isPaused && !isStopped && secondsLeft > 0) {
        await AsyncStorage.setItem('timerLastActive', Date.now().toString());
      }
    };
    persistState();
  }, [secondsLeft, isPaused, isStopped, loading]);


  // Load timer state on mount and when screen is focused
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadTimerState = async () => {
        const saved = await AsyncStorage.getItem('timerState');
        let loaded = false;
        if (saved) {
          let { secondsLeft: savedSeconds, isPaused: savedPaused, isStopped: savedStopped } = JSON.parse(saved);
          // If timer is running, adjust for elapsed time
          if (!savedPaused && !savedStopped && savedSeconds > 0) {
            const lastActive = await AsyncStorage.getItem('timerLastActive');
            if (lastActive) {
              const now = Date.now();
              const elapsed = Math.floor((now - parseInt(lastActive, 10)) / 1000);
              savedSeconds = Math.max(savedSeconds - elapsed, 0);
              // If timer ran out while away, mark as stopped
              if (savedSeconds === 0) {
                savedStopped = true;
              }
            }
          }
          if (isActive) {
            setSecondsLeft(savedSeconds);
            setIsPaused(savedPaused);
            setIsStopped(savedStopped);
            loaded = true;
          }
        }
        if (isActive) setLoading(false);
        // If no saved state, ensure loading is false
        if (isActive && !loaded) {
          setSecondsLeft(initialSeconds);
          setIsPaused(false);
          setIsStopped(false);
        }
      };
      loadTimerState();
      return () => { isActive = false; };
    }, [])
  );

  useEffect(() => {
    if (loading) return;
    if (!isPaused && !isStopped && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev > 1) {
            // Save last active timestamp on every tick
            AsyncStorage.setItem('timerLastActive', Date.now().toString());
            return prev - 1;
          } else {
            // Timer finished, clear state
            return 0;
          }
        });
      }, 1000);
    } else if ((isPaused || isStopped) && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused, isStopped, secondsLeft, loading]);

  const handlePausePress = () => {
    if (!isStopped) {
      setIsPaused((prev) => !prev);
    }
  };
           

  const handleQuitPress = async () => {
    if (!isStopped) {
      setIsStopped(true);
      setIsPaused(false);
    } else {
      setSecondsLeft(initialSeconds);
      setIsStopped(false);
      setIsPaused(false);
      await AsyncStorage.removeItem('timerState');
    }
  };

  if (loading) {
    return null;
  }
  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.header}>Timer</Text>
      <View style={styles.timerCircleContainer} pointerEvents='box-none'>
        {/* Background ellipse */}
        <Svg style={styles.ellipseLight} width="320" height="320" viewBox="0 0 320 320" fill="none" pointerEvents='none'>
          <Path d="M320 160C320 248.365 248.365 320 160 320C71.635 320 0 248.365 0 160C0 71.635 71.635 0 160 0C248.365 0 320 71.635 320 160ZM40 160C40 229.705 90.295 280 160 280C229.705 280 280 229.705 280 160C280 90.295 229.705 40 160 40C90.295 40 40 90.295 40 160Z" fill="#EDC7BA" fillOpacity="0.3"/>
        </Svg>
        {/* Animated progress ellipse (darker) */}
        <Svg style={styles.ellipseDark} width="320" height="320" viewBox="0 0 320 320" fill="none" pointerEvents='none'>
          <Circle
            cx="160"
            cy="160"
            r="140"
            stroke="#BB9D93"
            strokeWidth="35"
            fill="none"
            strokeDasharray={2 * Math.PI * 140}
            strokeDashoffset={
              secondsLeft === initialSeconds
                ? 0
                : (1 - secondsLeft / initialSeconds) * 2 * Math.PI * 140
            }
            strokeLinecap="round"
            transform="rotate(-90 160 160)"
          />
        </Svg>
        <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
      </View>
      <View style={styles.buttonRow}>
        <PauseButton isPaused={isPaused} onPress={handlePausePress} />
        <QuitButton isStopped={isStopped} onPress={handleQuitPress} />
      </View>
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
    marginLeft: 16,
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    color: '#1C0F0D',
  },
  timerCircleContainer: {
    marginTop: 32,
    marginBottom: 12,
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
    width: 160,
    height: 40,
    marginLeft: -80,
    marginTop: -20,
    textAlign: 'center',
    color: '#070417',
    fontFamily: 'Poppins',
    fontSize: 32,
    fontWeight: '400',
    letterSpacing: 2,
    lineHeight: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 48,
    marginHorizontal: 32,
  },
  pauseButton: {
    alignItems: 'center',
    marginRight: 32,
  },
  pauseIconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    zIndex: 1,
  },
  pauseLabel: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#1C0F0D',
    textAlign: 'center',
    marginTop: 16,
  },
  quitButton: {
    alignItems: 'center',
  },
  quitIconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    zIndex: 1,
  },
  quitLabel: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#1C0F0D',
    textAlign: 'center',
    marginTop: 16,
  },
  ellipseLight: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 320,
    height: 320,
  },
  ellipseDark: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 320,
    height: 320,
  },
});