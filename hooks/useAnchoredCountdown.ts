import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

type Status = 'idle' | 'running' | 'paused' | 'stopped' | 'done';

const TICK_MS = 250;

export function useAnchoredCountdown(initialSeconds: number) {
  const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);
  const [status, setStatus] = useState<Status>('idle');
  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const recompute = () => {
    if (endTimeRef.current == null) return;
    const now = Date.now();
    const msLeft = Math.max(0, endTimeRef.current - now);
    setSecondsLeft(Math.ceil(msLeft / 1000));
    if (msLeft <= 0) {
      clear();
      endTimeRef.current = null;
      setStatus('done');
    }
  };

  const start = (totalSeconds?: number) => {
    const base =
      typeof totalSeconds === 'number' ? totalSeconds : secondsLeft || initialSeconds;
    if (base <= 0) return;
    endTimeRef.current = Date.now() + base * 1000;
    setStatus('running');
    clear();
    intervalRef.current = setInterval(recompute, TICK_MS);
    recompute();
  };

  const pause = () => {
    if (status !== 'running') return;
    recompute();
    clear();
    endTimeRef.current = null; // freeze remainder
    setStatus('paused');
  };

  const resume = () => {
    if (status !== 'paused' || secondsLeft <= 0) return;
    endTimeRef.current = Date.now() + secondsLeft * 1000;
    setStatus('running');
    clear();
    intervalRef.current = setInterval(recompute, TICK_MS);
    recompute();
  };

  const stop = () => {
    clear();
    endTimeRef.current = null;
    setStatus('stopped');
  };

  const reset = (toSeconds: number = initialSeconds) => {
    clear();
    endTimeRef.current = null;
    setSecondsLeft(toSeconds);
    setStatus('idle');
  };

  // Stay accurate after backgrounding
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active' && (status === 'running' || status === 'paused')) recompute();
    });
    return () => sub.remove();
  }, [status]);

  // Cleanup on unmount
  useEffect(() => () => clear(), []);

  return { secondsLeft, status, start, pause, resume, stop, reset, setSecondsLeft };
}
