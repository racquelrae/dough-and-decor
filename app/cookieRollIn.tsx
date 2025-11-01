import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle, Ellipse, G, Rect } from 'react-native-svg';

type Props = {
  /** Rendered width/height in px (the SVG scales cleanly). */
  size?: number;
  /** Base cookie color. */
  cookieColor?: string;
  /** Royal icing color. */
  icingColor?: string;
  /** Chocolate chip / crumb accent color. */
  chipColor?: string;
  /** How long the roll-in animation lasts (ms). */
  durationMs?: number;
  /** Delay before animation starts (ms). */
  delayMs?: number;
  /** Optional style override for the wrapper. */
  style?: StyleProp<ViewStyle>;
};

const bezier = Easing.bezier(0.2, 0.8, 0.2, 1);
const SPRINKLES = [
  { x: 130, y: 75, h: 12, rotate: 25, color: '#FF69B4' },
  { x: 165, y: 70, h: 14, rotate: -15, color: '#FF1493' },
  { x: 185, y: 85, h: 11, rotate: 45, color: '#FFB6C1' },
  { x: 145, y: 92, h: 13, rotate: -35, color: '#FF69B4' },
  { x: 85, y: 120, h: 12, rotate: 60, color: '#FFB6C1' },
  { x: 105, y: 135, h: 14, rotate: -20, color: '#FF1493' },
  { x: 90, y: 155, h: 11, rotate: 15, color: '#FF69B4' },
  { x: 140, y: 125, h: 13, rotate: -50, color: '#FFB6C1' },
  { x: 158, y: 140, h: 12, rotate: 30, color: '#FF69B4' },
  { x: 145, y: 155, h: 14, rotate: -10, color: '#FF1493' },
  { x: 170, y: 160, h: 11, rotate: 55, color: '#FFB6C1' },
  { x: 205, y: 115, h: 13, rotate: -40, color: '#FF69B4' },
  { x: 215, y: 140, h: 12, rotate: 20, color: '#FFB6C1' },
  { x: 200, y: 165, h: 14, rotate: -25, color: '#FF1493' },
  { x: 120, y: 180, h: 12, rotate: 35, color: '#FFB6C1' },
  { x: 155, y: 190, h: 13, rotate: -45, color: '#FF69B4' },
  { x: 175, y: 195, h: 11, rotate: 10, color: '#FF1493' },
  { x: 135, y: 200, h: 14, rotate: 50, color: '#FFB6C1' },
  { x: 190, y: 185, h: 12, rotate: -30, color: '#FF69B4' },
  { x: 115, y: 110, h: 11, rotate: 70, color: '#FF1493' },
  { x: 180, y: 115, h: 13, rotate: -60, color: '#FFB6C1' },
  { x: 125, y: 160, h: 12, rotate: 5, color: '#FF69B4' },
  { x: 195, y: 130, h: 11, rotate: 40, color: '#FFB6C1' },
  { x: 160, y: 210, h: 13, rotate: -55, color: '#FF1493' },
];

const TEXTURE_SPOTS = [
  { cx: 90, cy: 95, rx: 18, ry: 14, opacity: 0.35 },
  { cx: 210, cy: 110, rx: 20, ry: 15, opacity: 0.3 },
  { cx: 110, cy: 205, rx: 14, ry: 18, opacity: 0.35 },
  { cx: 210, cy: 190, rx: 18, ry: 14, opacity: 0.4 },
  { cx: 150, cy: 240, rx: 16, ry: 12, opacity: 0.3 },
];

const CRUMBS = [
  { cx: 112, cy: 118, r: 4 },
  { cx: 190, cy: 130, r: 5 },
  { cx: 175, cy: 210, r: 4.5 },
  { cx: 125, cy: 230, r: 3.5 },
  { cx: 215, cy: 160, r: 3.8 },
  { cx: 95, cy: 175, r: 4.2 },
];

export default function CookieRollIn({
  size = 240,
  cookieColor = '#F4E4C1',
  icingColor = '#FFFDF7',
  chipColor = '#7A4C2E',
  durationMs = 1200,
  delayMs = 200,
  style,
}: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: durationMs,
      delay: delayMs,
      easing: bezier,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, durationMs, delayMs]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-size * 1.4, 0],
  });
  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['-720deg', '0deg'],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0.85, 1],
  });

  return (
    <Animated.View
      accessibilityRole="image"
      accessibilityLabel="Decorated sugar cookie rolling in"
      style={[
        styles.container,
        { width: size, height: size, opacity, transform: [{ translateX }, { rotate }] },
        style,
      ]}
    >
      <Svg viewBox="0 0 300 300" width={size} height={size}>

        <G>
          <Circle cx={150} cy={150} r={120} fill={cookieColor ?? '#F4E4C1'} stroke="#E8D4A8" strokeWidth={3} />
          {CRUMBS.map(({ cx, cy, r }, index) => (
            <Circle key={index} cx={cx} cy={cy} r={r} fill={chipColor} opacity={0.45} />
          ))}
          {TEXTURE_SPOTS.map(({ cx, cy, rx, ry, opacity: spotOpacity }, index) => (
            <Ellipse key={index} cx={cx} cy={cy} rx={rx} ry={ry} fill="#E8D4A8" opacity={spotOpacity} />
          ))}
        </G>

        <G>
          <Circle cx={150} cy={150} r={102} fill={icingColor} stroke="#F5F0E8" strokeWidth={2} opacity={0.95} />
          <Ellipse cx={130} cy={110} rx={45} ry={35} fill="#FFFFFF" opacity={0.3} />
          <Ellipse cx={115} cy={95} rx={25} ry={18} fill="#FFFFFF" opacity={0.4} />
        </G>

        <G>
          {SPRINKLES.map(({ x, y, h, rotate, color }, index) => (
            <Rect
              key={index}
              x={x}
              y={y}
              width={6}
              height={h}
              rx={1.5}
              transform={`rotate(${rotate} ${x + 3} ${y + h / 2})`}
              fill={color}
            />
          ))}
        </G>
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'visible',
  },
});
