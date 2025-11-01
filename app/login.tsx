import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { auth, db } from '../firebase/config';
import { theme } from '../styles/theme';

export default function LoginScreen({ navigation }: { navigation: any }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState(null); 

  // Remove Google sign-in state and effect

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password to log in.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      // Fetch Firestore user doc
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserRole(userData.role || null); // Save role in state if needed
      }
      navigation.navigate('Home'); // Navigate to Home after successful login
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Login failed');
      } else {
        setError('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) { 
      Alert.alert('Enter your email', 'Please enter your email address above to reset your password.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Password Reset', 'A password reset email has been sent.');
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert('Error', err.message || 'Could not send reset email.');
      } else {
        Alert.alert('Error', 'Could not send reset email.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#F9E8DE', '#D9B6AB']} style={styles.gradient}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={[theme.heading, styles.title]}>Welcome!</Text>
                <Text style={styles.subtitle}>Login to your account</Text>
              </View>
              <View style={styles.fields}>
                <Text style={theme.label}>Email</Text>
                <TextInput
                  style={[theme.textInput, styles.textInput]}
                  placeholder="example@example.com"
                  placeholderTextColor="#1C0F0D80"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
                <Text style={theme.label}>Password</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={[theme.textInput, styles.textInput, styles.passwordInput]}
                    placeholder="Password"
                    placeholderTextColor="#1C0F0D80"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    style={theme.eyeIcon}
                    onPress={() => setShowPassword((prev) => !prev)}
                    activeOpacity={0.7}
                  >
                      {showPassword ? (
                        // Eye icon (visible)
                        <Svg width="28" height="24" viewBox="0 0 256 256" fill="#1C0F0D80">
                          <Path
                            d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"
                            stroke="#3E2823"
                            strokeOpacity="0.45"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </Svg>
                      ) : (
                        // Eye-off icon (hidden)
                        <Svg width="28" height="24" viewBox="0 0 256 256" fill="#1C0F0D80">
                          <Path
                            d="M53.92,34.62A8,8,0,1,0,42.08,45.38L61.32,66.55C25,88.84,9.38,123.2,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208a127.11,127.11,0,0,0,52.07-10.83l22,24.21a8,8,0,1,0,11.84-10.76Zm47.33,75.84,41.67,45.85a32,32,0,0,1-41.67-45.85ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.16,133.16,0,0,1,25,128c4.69-8.79,19.66-33.39,47.35-49.38l18,19.75a48,48,0,0,0,63.66,70l14.73,16.2A112,112,0,0,1,128,192Zm6-95.43a8,8,0,0,1,3-15.72,48.16,48.16,0,0,1,38.77,42.64,8,8,0,0,1-7.22,8.71,6.39,6.39,0,0,1-.75,0,8,8,0,0,1-8-7.26A32.09,32.09,0,0,0,134,96.57Zm113.28,34.69c-.42.94-10.55,23.37-33.36,43.8a8,8,0,1,1-10.67-11.92A132.77,132.77,0,0,0,231.05,128a133.15,133.15,0,0,0-23.12-30.77C185.67,75.19,158.78,64,128,64a118.37,118.37,0,0,0-19.36,1.57A8,8,0,1,1,106,49.79,134,134,0,0,1,128,48c34.88,0,66.57,13.26,91.66,38.35,18.83,18.83,27.3,37.62,27.65,38.41A8,8,0,0,1,247.31,131.26Z"
                            stroke="#3E2823"
                            strokeOpacity="0.45"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </Svg>
                      )}
                  </TouchableOpacity>
                </View>
              </View>
              {error ? <Text style={[theme.errorText, styles.error]}>{error}</Text> : null}
              {loading ? (
                <ActivityIndicator size="small" color="#EDC7BA" style={styles.loader} />
              ) : null}
              <TouchableOpacity
                style={[theme.button, styles.button]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.9}
              >
                <Text style={theme.buttonText}>Log In</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleForgotPassword} disabled={loading} activeOpacity={0.7}>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>
              <Text style={styles.bottomText}>
                {`Don't have an account? `}
                <Text style={theme.link} onPress={() => navigation.navigate('Signup')}>
                  Sign up
                </Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  card: {
    backgroundColor: 'rgba(255, 253, 249, 0.92)',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#46302B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    alignSelf: 'stretch',
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#3E2823',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: 'rgba(62, 40, 35, 0.7)',
    textAlign: 'center',
  },
  fields: {
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(62, 40, 35, 0.08)',
    shadowColor: '#3E2823',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 8,
  },
  passwordInput: {
    paddingRight: 52,
  },
  error: {
    textAlign: 'center',
    marginBottom: 4,
  },
  loader: {
    marginBottom: 8,
  },
  button: {
    shadowColor: '#2E1C18',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 12,
    marginTop: 8,
  },
  forgotPassword: {
    marginTop: 16,
    color: '#3E2823',
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomText: {
    marginTop: 12,
    color: '#3E2823',
    fontFamily: 'Poppins',
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
  },
});
