// components/ui/Toast.tsx
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

let pushToast: ((msg: string) => void) | null = null;

export function ToastHost() {
  const [message, setMessage] = useState<string | null>(null);
  const slide = useRef(new Animated.Value(100)).current;  // slide from bottom
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    pushToast = (msg: string) => {
      setMessage(msg);
      // animate in
      Animated.parallel([
        Animated.timing(slide, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start(() => {
        // hold + animate out
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(slide, { toValue: 100, duration: 220, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
          ]).start(() => setMessage(null));
        }, 1800);
      });
    };

    return () => { pushToast = null; };
  }, [slide, opacity]);

  if (!message) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        { transform: [{ translateY: slide }], opacity },
      ]}
    >
      <View style={styles.card}>
        <Text style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
  );
}

export function showToast(message: string) {
  pushToast?.(message);
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: 0, right: 0, bottom: 40,
    alignItems: "center",
  },
  card: {
    backgroundColor: "#1C0F0D",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  text: { color: "#fff", fontWeight: "600" },
});
