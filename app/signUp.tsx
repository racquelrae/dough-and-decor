import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
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
import { LinearGradient } from 'expo-linear-gradient';
import { auth, db } from '../firebase/config';
import { theme } from '../styles/theme';

export default function SignupScreen({ navigation }: { navigation: any }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      // Optionally update displayName in Auth profile
      await updateProfile(userCredential.user, { displayName: fullName });
      // Create Firestore user doc
      await setDoc(doc(db, 'users', uid), {
        email,
        displayName: fullName,
        mobile,
        dateOfBirth,
        role: 'user',
        createdAt: serverTimestamp(),
      });
      Alert.alert('Success', 'Account created!');
      navigation.navigate('UpdateProfile');
    } catch (err) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError((err as { message?: string }).message || 'Sign up failed');
      } else {
        setError('Sign up failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Format date as DD/MM/YYYY with slashes as user types
  const formatDOB = (text: string) => {
    // Remove all non-digits
    let cleaned = text.replace(/\D/g, '');
    // Limit to 8 digits
    cleaned = cleaned.slice(0, 8);
    let formatted = '';
    if (cleaned.length > 0) {
      formatted = cleaned.slice(0, 2);
    }
    if (cleaned.length > 2) {
      formatted += '/' + cleaned.slice(2, 4);
    }
    if (cleaned.length > 4) {
      formatted += '/' + cleaned.slice(4, 8);
    }
    return formatted;
  };

  return (
    <LinearGradient colors={['#F9E8DE', '#D9B6AB']} style={styles.gradient}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={[theme.heading, styles.title]}>Create your account</Text>
              <Text style={styles.subtitle}>
                Join the kitchen and start saving your sweetest ideas.
              </Text>
            </View>
            <View style={styles.fields}>
              <Text style={theme.label}>Full name</Text>
              <TextInput
                style={[theme.textInput, styles.textInput]}
                placeholder="John Doe"
                placeholderTextColor="#1C0F0D80"
                value={fullName}
                onChangeText={setFullName}
              />
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
              <Text style={theme.label}>Mobile Number</Text>
              <TextInput
                style={[theme.textInput, styles.textInput]}
                placeholder="+ 123 456 789"
                placeholderTextColor="#1C0F0D80"
                keyboardType="phone-pad"
                value={mobile}
                onChangeText={setMobile}
              />
              <Text style={theme.label}>Date of birth</Text>
              <TextInput
                style={[theme.textInput, styles.textInput]}
                placeholder="DD / MM / YYYY"
                placeholderTextColor="#1C0F0D80"
                value={dateOfBirth}
                keyboardType="number-pad"
                maxLength={10}
                onChangeText={(text) => setDateOfBirth(formatDOB(text))}
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
              <Text style={theme.label}>Confirm Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[theme.textInput, styles.textInput, styles.passwordInput]}
                  placeholder="Confirm Password"
                  placeholderTextColor="#1C0F0D80"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  style={theme.eyeIcon}
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  activeOpacity={0.7}
                >
                   {showConfirmPassword ? (
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
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.9}
            >
              <Text style={theme.buttonText}>Sign up</Text>
            </TouchableOpacity>
            <Text style={styles.bottomText}>
              Already have an account?{' '}
              <Text style={theme.link} onPress={() => navigation.navigate('Login')}>
                Log In
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
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
    shadowRadius: 24,
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
    marginTop: 4,
  },
  fields: {
    marginBottom: 16,
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
    marginTop: 4,
  },
  loader: {
    marginVertical: 6,
  },
  button: {
    shadowColor: '#2E1C18',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 12,
    marginTop: 8,
  },
  bottomText: {
    marginTop: 16,
    color: '#3E2823',
    fontFamily: 'Poppins',
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
  },
});
