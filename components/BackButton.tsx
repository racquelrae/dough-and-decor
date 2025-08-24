import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Svg, { Path } from 'react-native-svg';

export function BackButton({ style }: { style?: any }) {
  const navigation = useNavigation();
  return (
    <TouchableOpacity style={[styles.backButton, style]} onPress={() => navigation.goBack()}>
      <Svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <Path d="M10.6667 5.99992H1.33333M1.33333 5.99992L6 10.6666M1.33333 5.99992L6 1.33325" stroke="#D4B2A7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </Svg>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
    backButton: { position: 'absolute', top: 76, left: 16, backgroundColor: 'rgba(237, 199, 186, 0.3)', borderRadius: 32, padding: 8, zIndex: 2 },
});
