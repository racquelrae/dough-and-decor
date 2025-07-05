import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { Dimensions, ImageBackground, StyleSheet, Text, View } from 'react-native';

export default function LaunchScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.LaunchContainer}>
      <View style={styles.imageCircle}>
        <ImageBackground
          style={styles.image1}
          source={{ uri: 'https://www.nicepng.com/png/detail/5-50567_cookie-vector-png-clipart-transparent-download-black-and.png'}}
          imageStyle={{ borderRadius: width * 0.2 }}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.doughDecor}>Dough & Decor</Text>
    </View>
  );
}

const { width, height } = Dimensions.get('window');
const circleSize = width * 0.4 + 5;

const styles = StyleSheet.create({
  LaunchContainer: {
    flex: 1,
    backgroundColor: 'rgba(212, 178, 167, 1)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  doughDecor: {
    color: 'rgba(255, 253, 249, 1)',
    fontFamily: 'Poppins',
    fontSize: 40,
    fontWeight: '600',
    marginBottom: 32,
    textAlign: 'center',
  },
  imageCircle: {
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    overflow: 'hidden',
  },
  image1: {
    width: '100%',
    height: '100%',
    borderRadius: circleSize / 2,
  },
});