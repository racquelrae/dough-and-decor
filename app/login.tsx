import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { auth, db } from '../firebase/config';
import { theme } from '../styles/theme';
import { Stack } from 'expo-router';

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
      <Stack.Screen options = {{ headerShown: false}}/>
    <View style={theme.screenContainer}>
      <View style={theme.headerContainer}>
        <Text style={theme.heading}>
          {`Login`}
        </Text>
      </View>
      <View style={theme.formContainer}>
        <View style={theme.fieldsContainer}>
          <Text style={theme.label}>
            {`Email`}
          </Text>
          <TextInput
            style={theme.textInput}
            placeholder="example@example.com"
            placeholderTextColor="#1C0F0D99"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <Text style={theme.label}>
            {`Password`}
          </Text>
          <View style={theme.passwordInputWrapper}>
            <TextInput
              style={[theme.textInput, { paddingRight: 40 }]}
              placeholder="Password"
              placeholderTextColor="#1C0F0D99"
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
                // Eye open (no slash)
                <Svg width="28" height="24" viewBox="0 0 66 54" fill="none">
                  <Path d="M3 16.78C3 16.78 16.36 3 32.85 3C49.34 3 62.7001 16.78 62.7001 16.78M56.81 25.3898C56.8405 25.4377 56.8672 25.488 56.89 25.54C63.08 36.6 51.26 45.5398 41.89 48.8998C35.9522 51.0505 29.4583 51.1108 23.4816 49.0707C17.505 47.0306 12.4034 43.0123 9.01996 37.6799C3.49996 28.8999 10.5699 20.9599 18.0999 16.6799C30.4399 9.61986 49.41 12.3998 56.81 25.3898ZM42.44 31.52C42.44 36.7888 38.1688 41.06 32.9 41.06C27.6312 41.06 23.36 36.7888 23.36 31.52C23.36 26.2512 27.6312 21.98 32.9 21.98C38.1688 21.98 42.44 26.2512 42.44 31.52Z" stroke="#3E2823" strokeOpacity="0.45" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              ) : (
                // Eye with slash
                <Svg width="28" height="24" viewBox="0 0 28 24" fill="none" >
                  <Path d="M8.16365 20.002C6.49202 19.0878 5.08334 17.7595 4.07274 16.1443C1.81865 12.5484 4.70687 9.30023 7.79142 7.55341C9.39197 6.68841 11.158 6.17327 12.9726 6.04209C14.7872 5.91092 16.609 6.16665 18.3173 6.79246M21.1318 8.32248C22.1305 9.0783 22.9655 10.0289 23.5864 11.1166L23.6191 11.178C26.1514 15.7026 21.3119 19.3598 17.4828 20.7302C15.2974 21.5098 12.9275 21.611 10.6836 21.0207M23.3492 5.39342C23.3492 5.39342 25.2054 6.75967 26.0042 7.59029M1.57727 7.59029C1.57727 7.59029 7.04686 1.953 13.7928 1.953C16.2891 2.01153 18.7336 2.67706 20.915 3.89209M10.9046 16.2425C10.401 15.6811 10.0709 14.9859 9.95416 14.2408C9.83741 13.4958 9.939 12.7328 10.2467 12.0443C10.5544 11.3557 11.0551 10.7712 11.688 10.3612C12.3209 9.95113 13.0591 9.73328 13.8133 9.73393C14.4328 9.73239 15.0434 9.88111 15.5927 10.1675M17.716 13.6244C17.7149 14.6591 17.3034 15.6511 16.5717 16.3827C15.84 17.1144 14.848 17.5259 13.8132 17.527M22.1219 2.70979L6.60095 22.3012" stroke="#3E2823" strokeOpacity="0.45" strokeWidth="2.04545" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              )}
            </TouchableOpacity>
          </View>
        </View>
        {error ? (
          <Text style={theme.errorText}>{error}</Text>
        ) : null}
        {loading ? (
          <ActivityIndicator size="small" color="#EDC7BA" style={{ marginBottom: 8 }} />
        ) : null}
        <View style={theme.buttonRow}>
          <TouchableOpacity style={[theme.button, { flex: 1, marginHorizontal: 0 }]} onPress={handleLogin} disabled={loading}>
            <Text style={theme.buttonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={theme.bottomContainer}>
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={theme.forgotPassword}>
            {`Forgot Password?`}
          </Text>
        </TouchableOpacity>
        <Text style={theme.bottomText}>
          {`Don't have an account? `}
          <Text style={theme.link} onPress={() => navigation.navigate('Signup')}>Sign up</Text>
        </Text>
      </View>
    </View>
    </>
  )
}