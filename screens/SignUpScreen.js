import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { auth, db } from '../firebase/config';

export default function SignupScreen({ navigation }) {
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
      navigation.navigate('CompleteProfile');
    } catch (err) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.SignupContainer}>
      <View style={styles.frame25}>
        <Text style={styles.signUp}>Sign Up</Text>
      </View>
      <View style={styles.formArea}>
        <Text style={styles.fullname}>Full name</Text>
        <TextInput
          style={[styles.inputBox, { fontWeight: '400', color: '#1C0F0D' }]}
          placeholder="John Doe"
          placeholderTextColor="#1C0F0D55"
          value={fullName}
          onChangeText={setFullName}
        />
        <Text style={styles.email}>Email</Text>
        <TextInput
          style={[styles.inputBox, { fontWeight: '400', color: '#1C0F0D' }]}
          placeholder="example@example.com"
          placeholderTextColor="#1C0F0D55"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <Text style={styles.mobileNumber}>Mobile Number</Text>
        <TextInput
          style={[styles.inputBox, { fontWeight: '400', color: '#1C0F0D' }]}
          placeholder="+ 123 456 789"
          placeholderTextColor="#1C0F0D55"
          keyboardType="phone-pad"
          value={mobile}
          onChangeText={setMobile}
        />
        <Text style={styles.dateofbirth}>Date of birth</Text>
        <TextInput
          style={[styles.inputBox, { fontWeight: '400', color: '#1C0F0D' }]}
          placeholder="DD / MM / YYYY"
          placeholderTextColor="#1C0F0D55"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
        />
        <Text style={styles.password}>Password</Text>
        <View style={{ position: 'relative', width: '100%' }}>
          <TextInput
            style={[styles.inputBox, { paddingRight: 40, fontWeight: '400', color: '#1C0F0D' }]}
            placeholder="Password"
            placeholderTextColor="#1C0F0D55"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={{ position: 'absolute', right: 12, top: 8, height: 24, width: 28, justifyContent: 'center', alignItems: 'center', zIndex: 2 }}
            onPress={() => setShowPassword((prev) => !prev)}
            activeOpacity={0.7}
          >
            {showPassword ? (
              <Svg width="28" height="24" viewBox="0 0 66 54" fill="none">
                <Path d="M3 16.78C3 16.78 16.36 3 32.85 3C49.34 3 62.7001 16.78 62.7001 16.78M56.81 25.3898C56.8405 25.4377 56.8672 25.488 56.89 25.54C63.08 36.6 51.26 45.5398 41.89 48.8998C35.9522 51.0505 29.4583 51.1108 23.4816 49.0707C17.505 47.0306 12.4034 43.0123 9.01996 37.6799C3.49996 28.8999 10.5699 20.9599 18.0999 16.6799C30.4399 9.61986 49.41 12.3998 56.81 25.3898ZM42.44 31.52C42.44 36.7888 38.1688 41.06 32.9 41.06C27.6312 41.06 23.36 36.7888 23.36 31.52C23.36 26.2512 27.6312 21.98 32.9 21.98C38.1688 21.98 42.44 26.2512 42.44 31.52Z" stroke="#3E2823" strokeOpacity="0.45" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            ) : (
              <Svg width="28" height="24" viewBox="0 0 28 24" fill="none" >
                <Path d="M8.16365 20.002C6.49202 19.0878 5.08334 17.7595 4.07274 16.1443C1.81865 12.5484 4.70687 9.30023 7.79142 7.55341C9.39197 6.68841 11.158 6.17327 12.9726 6.04209C14.7872 5.91092 16.609 6.16665 18.3173 6.79246M21.1318 8.32248C22.1305 9.0783 22.9655 10.0289 23.5864 11.1166L23.6191 11.178C26.1514 15.7026 21.3119 19.3598 17.4828 20.7302C15.2974 21.5098 12.9275 21.611 10.6836 21.0207M23.3492 5.39342C23.3492 5.39342 25.2054 6.75967 26.0042 7.59029M1.57727 7.59029C1.57727 7.59029 7.04686 1.953 13.7928 1.953C16.2891 2.01153 18.7336 2.67706 20.915 3.89209M10.9046 16.2425C10.401 15.6811 10.0709 14.9859 9.95416 14.2408C9.83741 13.4958 9.939 12.7328 10.2467 12.0443C10.5544 11.3557 11.0551 10.7712 11.688 10.3612C12.3209 9.95113 13.0591 9.73328 13.8133 9.73393C14.4328 9.73239 15.0434 9.88111 15.5927 10.1675M17.716 13.6244C17.7149 14.6591 17.3034 15.6511 16.5717 16.3827C15.84 17.1144 14.848 17.5259 13.8132 17.527M22.1219 2.70979L6.60095 22.3012" stroke="#3E2823" strokeOpacity="0.45" strokeWidth="2.04545" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.confirmPassword}>Confirm Password</Text>
        <View style={{ position: 'relative', width: '100%' }}>
          <TextInput
            style={[styles.inputBox, { paddingRight: 40, fontWeight: '400', color: '#1C0F0D' }]}
            placeholder="Confirm Password"
            placeholderTextColor="#1C0F0D55"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            style={{ position: 'absolute', right: 12, top: 8, height: 24, width: 28, justifyContent: 'center', alignItems: 'center', zIndex: 2 }}
            onPress={() => setShowConfirmPassword((prev) => !prev)}
            activeOpacity={0.7}
          >
            {showConfirmPassword ? (
              <Svg width="28" height="24" viewBox="0 0 66 54" fill="none">
                <Path d="M3 16.78C3 16.78 16.36 3 32.85 3C49.34 3 62.7001 16.78 62.7001 16.78M56.81 25.3898C56.8405 25.4377 56.8672 25.488 56.89 25.54C63.08 36.6 51.26 45.5398 41.89 48.8998C35.9522 51.0505 29.4583 51.1108 23.4816 49.0707C17.505 47.0306 12.4034 43.0123 9.01996 37.6799C3.49996 28.8999 10.5699 20.9599 18.0999 16.6799C30.4399 9.61986 49.41 12.3998 56.81 25.3898ZM42.44 31.52C42.44 36.7888 38.1688 41.06 32.9 41.06C27.6312 41.06 23.36 36.7888 23.36 31.52C23.36 26.2512 27.6312 21.98 32.9 21.98C38.1688 21.98 42.44 26.2512 42.44 31.52Z" stroke="#3E2823" strokeOpacity="0.45" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            ) : (
              <Svg width="28" height="24" viewBox="0 0 28 24" fill="none" >
                <Path d="M8.16365 20.002C6.49202 19.0878 5.08334 17.7595 4.07274 16.1443C1.81865 12.5484 4.70687 9.30023 7.79142 7.55341C9.39197 6.68841 11.158 6.17327 12.9726 6.04209C14.7872 5.91092 16.609 6.16665 18.3173 6.79246M21.1318 8.32248C22.1305 9.0783 22.9655 10.0289 23.5864 11.1166L23.6191 11.178C26.1514 15.7026 21.3119 19.3598 17.4828 20.7302C15.2974 21.5098 12.9275 21.611 10.6836 21.0207M23.3492 5.39342C23.3492 5.39342 25.2054 6.75967 26.0042 7.59029M1.57727 7.59029C1.57727 7.59029 7.04686 1.953 13.7928 1.953C16.2891 2.01153 18.7336 2.67706 20.915 3.89209M10.9046 16.2425C10.401 15.6811 10.0709 14.9859 9.95416 14.2408C9.83741 13.4958 9.939 12.7328 10.2467 12.0443C10.5544 11.3557 11.0551 10.7712 11.688 10.3612C12.3209 9.95113 13.0591 9.73328 13.8133 9.73393C14.4328 9.73239 15.0434 9.88111 15.5927 10.1675M17.716 13.6244C17.7149 14.6591 17.3034 15.6511 16.5717 16.3827C15.84 17.1144 14.848 17.5259 13.8132 17.527M22.1219 2.70979L6.60095 22.3012" stroke="#3E2823" strokeOpacity="0.45" strokeWidth="2.04545" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            )}
          </TouchableOpacity>
        </View>
        {error ? <Text style={{ color: 'red', marginVertical: 8 }}>{error}</Text> : null}
        {loading ? <ActivityIndicator size="small" color="#EDC7BA" style={{ marginVertical: 8 }} /> : null}
        <TouchableOpacity style={styles.signupButton} onPress={handleSignUp} disabled={loading}>
          <Text style={styles.logIn}>Sign up</Text>
        </TouchableOpacity>
        <Text style={styles.alreadyhaveanaccountLogIn}>
          Already have an account? <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}>Log In</Text>
        </Text>
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  SignupContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 253, 249, 1)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  frame25: {
    marginBottom: 24,
    alignItems: 'center',
  },
  signUp: {
    color: 'rgba(50, 32, 28, 1)',
    fontFamily: 'Poppins',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  formArea: {
    width: '100%',
    alignItems: 'stretch',
    marginBottom: 24,
  },
  fullname: {
    color: 'rgba(50, 32, 28, 1)',
    fontFamily: 'Poppins',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  inputBox: {
    width: '100%',
    height: 41,
    backgroundColor: 'rgba(237, 199, 186, 1)',
    justifyContent: 'center',
    borderRadius: 18,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  email: {
    color: 'rgba(50, 32, 28, 1)',
    fontFamily: 'Poppins',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  mobileNumber: {
    color: 'rgba(50, 32, 28, 1)',
    fontFamily: 'Poppins',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  dateofbirth: {
    color: 'rgba(50, 32, 28, 1)',
    fontFamily: 'Poppins',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  password: {
    color: 'rgba(50, 32, 28, 1)',
    fontFamily: 'Poppins',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  confirmPassword: {
    color: 'rgba(50, 32, 28, 1)',
    fontFamily: 'Poppins',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  frame703: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  bycontinuingyouagreetoTermsofUseandPrivacyPolicy: {
    color: 'rgba(50, 32, 28, 1)',
    fontFamily: 'League Spartan',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 8,
  },
  boldText: {
    color: 'rgba(50, 32, 28, 1)',
    fontFamily: 'League Spartan',
    fontSize: 14,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: '#D4B2A7', // Pink background
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%', // Full width
    marginTop: 8,
    marginBottom: 0,
    shadowColor: '#D4B2A7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  logIn: {
    color: '#fff', // White text
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  alreadyhaveanaccountLogIn: {
    color: 'rgba(50, 32, 28, 1)',
    fontFamily: 'League Spartan',
    fontSize: 13,
    fontWeight: '300',
    textAlign: 'center',
    marginTop: 8,
  },
  loginLink: {
    color: 'rgba(236, 136, 141, 1)',
    fontFamily: 'League Spartan',
    fontSize: 13,
    fontWeight: '300',
    textAlign: 'center',
  },
});