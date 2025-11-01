import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CookieRollIn from './cookieRollIn';

export default function LaunchScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 3200);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <LinearGradient colors={['#F9E8DE', '#D9B6AB']} style={styles.gradient}>
      <View style={styles.content}>
        <CookieRollIn size={cookieSize} style={styles.cookie} />
        <Text style={styles.doughDecor}>Dough & Decor</Text>
        <Text style={styles.tagline}>Bake beautifully, every batch.</Text>
      </View>
    </LinearGradient>
  );
}

const { width } = Dimensions.get('window');
const cookieSize = Math.min(width * 0.55, 260);

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  cookie: {
    marginBottom: 24,
  },
  doughDecor: {
    color: 'rgba(255, 253, 249, 1)',
    fontFamily: 'Poppins',
    fontSize: 42,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 4,
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    color: 'rgba(255, 253, 249, 0.85)',
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
});
