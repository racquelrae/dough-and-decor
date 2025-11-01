import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updateEmail, updatePassword } from 'firebase/auth';
import { useState, useEffect, useMemo } from 'react';
import {
  ActionSheetIOS, ActivityIndicator, Alert, Image, KeyboardAvoidingView,
  Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { Circle, Path, Svg } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../context/UserContext';
import { db } from '../firebase/config';
import { theme } from '../styles/theme';
import { BackButton } from '@/components/BackButton';
import { logUserAuthState } from '../utils/logUserAuthState';
import * as ImageManipulator from 'expo-image-manipulator';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/types/navigation';
import { ToastHost, showToast } from '@/components/Toast';
import * as Haptics from 'expo-haptics';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME!;
export const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
export const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

export default function CompleteProfileScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "UpdateProfile">>();
  const mode: "create" | "edit" = route?.params?.mode ?? "create";
  const [username, setUsername] = useState('');
  const [userType, setUserType] = useState('');
  const [customType, setCustomType] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  const { user } = useUser() as { user: any };

  const auth = getAuth();
  async function reauthWithPassword(currentPassword: string) {
    if (!auth.currentUser || !auth.currentUser.email) {
      throw new Error('No authenticated user.');
    }
    const cred = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, cred);
  }

  // Modals
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Change Email fields
  const [newEmail, setNewEmail] = useState('');
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');
  const [changingEmail, setChangingEmail] = useState(false);

  // Change Password fields
  const [newPassword, setNewPassword] = useState('');
  const [currentPasswordForPassword, setCurrentPasswordForPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Track existing photo (from Firestore prefill)
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);

  // Prefill when editing
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (mode !== "edit" || !user) return;
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const data = snap.data();
        if (!cancelled && data) {
          setUsername((data.username ?? "").toString());
          const desc = (data.description ?? "") as string;
          const options = ['Hobbyist','Small Business Owner','Professional Baker','Student'];
          if (options.includes(desc)) {
            setUserType(desc);
            setCustomType("");
          } else if (desc) {
            setUserType("Other");
            setCustomType(desc);
          }
          setImage(data.photo ?? null);
          setExistingPhotoUrl(data.photo ?? null);
        }
      } catch (e) {
        console.log("Prefill error:", e);
      }
    })();
    return () => { cancelled = true; };
  }, [mode, user]);

  const userTypeOptions = ['Hobbyist','Small Business Owner','Professional Baker','Student','Other'];

  const handleImagePick = async (fromCamera = false) => {
    try {
      setLoading(true);
      const permissionResult = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.status !== 'granted') {
        Alert.alert('Permission required', `Permission to access your ${fromCamera ? 'camera' : 'media library'} is required!`);
        return;
      }

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true, aspect: [1, 1], quality: 0.7
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, // <-- enum, not string
            allowsEditing: true, aspect: [1, 1], quality: 0.7
          });

      console.log('ImagePicker result:', result);
      if (!result.canceled && result.assets?.length) {
        setImage(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Error', 'Something went wrong while picking the image.');
    } finally {
      setLoading(false);
    }
  };

  const showImagePickerOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Take Photo', 'Choose from Library', 'Cancel'], cancelButtonIndex: 2 },
        (i) => { if (i === 0) handleImagePick(true); if (i === 1) handleImagePick(false); }
      );
    } else {
      Alert.alert('Profile Picture', 'Select an option', [
        { text: 'Take Photo', onPress: () => handleImagePick(true) },
        { text: 'Choose from Library', onPress: () => handleImagePick(false) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const uploadToCloudinary = async (imageUri: string) => {
    try {
      // optional: resize to keep uploads snappy/costs down
      const manipulated = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 800 } }], // adjust as you like
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      const data = new FormData();
      data.append('file', {
        uri: manipulated.uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);
      data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: data });
      const result = await res.json();

      if (!res.ok) {
        console.log('Cloudinary upload error:', result);
        Alert.alert('Image Upload Error', result?.error?.message ?? 'Upload failed.');
        return null;
      }

      return result.secure_url ?? null;
    } catch (err) {
      console.log('Upload exception:', err);
      Alert.alert('Image Upload Error', 'Could not upload image.');
      return null;
    }
  };

  const handleContinue = async () => {
    if (!username || !(userType || customType)) {
      Alert.alert('Missing Info', 'Please fill in all fields.');
      return;
    }
    if (!user) {
      Alert.alert('Not logged in', 'You must be logged in to update your profile.');
      return;
    }
    await logUserAuthState(user);

    try {
      setLoading(true);
      let photoUrl = '';
      if (image) {
        photoUrl = await uploadToCloudinary(image) || '';
      }

      const userRef = doc(db, 'users', user.uid);
      const updateData = {
        username: username.trim().toLowerCase(),
        description: userType === 'Other' ? (customType || null) : (userType || null),
        photo: photoUrl || null,
      };

      console.log('Writing to Firestore with setDoc:', updateData);
      await setDoc(userRef, updateData, { merge: true });
      showToast("Profile updated!");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.log('Profile update error:', e);
      showToast("Update failed.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserTypePress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [...userTypeOptions, 'Cancel'], cancelButtonIndex: userTypeOptions.length },
        (i) => { if (i !== userTypeOptions.length) setUserType(userTypeOptions[i]); }
      );
    }
  };

  async function handleChangeEmail() {
    if (!auth.currentUser) return Alert.alert('Error', 'Not logged in.');
    if (!newEmail || !currentPasswordForEmail) {
      return Alert.alert('Missing Info', 'Please enter your current password and a new email.');
    }
    try {
      setChangingEmail(true);
      await reauthWithPassword(currentPasswordForEmail);
      await updateEmail(auth.currentUser, newEmail.trim());
      setShowChangeEmail(false);
      setNewEmail('');
      setCurrentPasswordForEmail('');
      Alert.alert('Success', 'Your email has been updated.');
    } catch (e: any) {
      console.log('Update email error:', e);
      Alert.alert('Error', e?.message || 'Could not update email.');
    } finally {
      setChangingEmail(false);
    }
  }

  async function handleChangePassword() {
    if (!auth.currentUser) return Alert.alert('Error', 'Not logged in.');
    if (!newPassword || !currentPasswordForPassword) {
      return Alert.alert('Missing Info', 'Please enter your current and new password.');
    }
    try {
      setChangingPassword(true);
      await reauthWithPassword(currentPasswordForPassword);
      await updatePassword(auth.currentUser, newPassword);
      setShowChangePassword(false);
      setNewPassword('');
      setCurrentPasswordForPassword('');
      Alert.alert('Success', 'Your password has been updated.');
    } catch (e: any) {
      console.log('Update password error:', e);
      Alert.alert('Error', e?.message || 'Could not update password.');
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleRemovePhoto() {
    if (!user) return Alert.alert('Not logged in', 'You must be logged in to update your profile.');
    try {
      setLoading(true);
      await setDoc(doc(db, 'users', user.uid), { photo: null }, { merge: true });
      setImage(null);
      setExistingPhotoUrl(null);
      Alert.alert('Removed', 'Profile photo removed.');
    } catch (e: any) {
      console.log('Remove photo error:', e);
      Alert.alert('Error', e?.message || 'Could not remove photo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={['#F9E8DE', '#D9B6AB']} style={styles.gradient}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View style={styles.backRow}>
              <BackButton />
            </View>
            <View style={styles.header}>
              <Text style={[theme.heading, styles.title]}>
                {mode === "edit" ? "Edit Your Profile" : "Complete Your Profile"}
              </Text>
              <Text style={styles.subtitle}>
                {mode === "edit"
                  ? "Refresh your baking persona and keep everything current."
                  : "Tell us a bit about you so we can personalize your baking journey."}
              </Text>
            </View>

            <View style={styles.avatarSection}>
              <View style={styles.avatarWrapper}>
                <Svg style={styles.ellipse} width="102" height="101" viewBox="0 0 102 101" fill="none">
                  <Circle cx="50.6863" cy="50.4073" r="50.4073" fill="#EDC7BA" opacity={0.7}/>
                </Svg>

                {loading ? (
                  <ActivityIndicator size="large" color="#D4B2A7" style={styles.profileImage} />
                ) : image ? (
                  <Image source={{ uri: image }} style={styles.profileImage} />
                ) : (
                  <View style={styles.personIconWrapper}>
                    <Svg width="50" height="64" viewBox="0 0 256 256" fill="#FFFFFF" opacity={0.8}>
                      <Path d="M224,40V76a8,8,0,0,1-16,0V48H180a8,8,0,0,1,0-16h36A8,8,0,0,1,224,40Zm-8,132a8,8,0,0,0-8,8v28H180a8,8,0,0,0,0,16h36a8,8,0,0,0,8-8V180A8,8,0,0,0,216,172ZM76,208H48V180a8,8,0,0,0-16,0v36a8,8,0,0,0,8,8H76a8,8,0,0,0,0-16ZM40,84a8,8,0,0,0,8-8V48H76a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8V76A8,8,0,0,0,40,84Zm136,92a8,8,0,0,1-6.41-3.19,52,52,0,0,0-83.2,0,8,8,0,1,1-12.8-9.62A67.94,67.94,0,0,1,101,141.51a40,40,0,1,1,53.94,0,67.94,67.94,0,0,1,27.43,21.68A8,8,0,0,1,176,176Zm-48-40a24,24,0,1,0-24-24A24,24,0,0,0,128,136Z"></Path>
                    </Svg>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.uploadBtn}
                activeOpacity={0.7}
                onPress={showImagePickerOptions}
              >
                <Text style={styles.uploadText}>
                  {image || existingPhotoUrl ? 'Change Profile Picture' : 'Upload Profile Picture'}
                </Text>
              </TouchableOpacity>

              {(image || existingPhotoUrl) && (
                <TouchableOpacity
                  style={styles.removePhotoWrapper}
                  activeOpacity={0.7}
                  onPress={handleRemovePhoto}
                  disabled={loading}
                >
                  <Text style={styles.removePhoto}>Remove Photo</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.section}>
              <Text style={theme.label}>Username</Text>
              <TextInput
                style={[theme.textInput, styles.textInput]}
                placeholder="username"
                placeholderTextColor="#1C0F0D80"
                value={username}
                autoCapitalize="none"
                onChangeText={(t) => { setUsername(t); setUsernameError(''); }}
              />
              {!!usernameError && <Text style={styles.errorText}>{usernameError}</Text>}

              <Text style={theme.label}>What best describes you?</Text>

              {Platform.OS === 'ios' ? (
                <TouchableOpacity
                  style={[theme.textInput, styles.textInput, styles.selectInput]}
                  onPress={handleUserTypePress}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.selectValue, { color: userType ? '#1C0F0D' : '#1C0F0D80' }]}>
                    {userType ? (userType === 'Other' ? 'Other (type below)' : userType) : 'Select an option...'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={[theme.textInput, styles.textInput, styles.pickerWrapper]}>
                  <Picker
                    selectedValue={userType}
                    onValueChange={(v) => setUserType(v)}
                    style={styles.picker}
                    dropdownIconColor="#D4B2A7"
                  >
                    <Picker.Item label="Select an option..." value="" color="#1C0F0D55" />
                    <Picker.Item label="Hobbyist" value="Hobbyist" />
                    <Picker.Item label="Small Business Owner" value="Small Business Owner" />
                    <Picker.Item label="Professional Baker" value="Professional Baker" />
                    <Picker.Item label="Student" value="Student" />
                    <Picker.Item label="Other (type below)" value="Other" />
                  </Picker>
                </View>
              )}

              {userType === 'Other' && (
                <TextInput
                  style={[theme.textInput, styles.textInput]}
                  placeholder="Type your description..."
                  placeholderTextColor="#1C0F0D80"
                  value={customType}
                  onChangeText={setCustomType}
                />
              )}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[theme.button, styles.utilityButton]}
                onPress={() => setShowChangeEmail(true)}
                disabled={loading}
                activeOpacity={0.85}
              >
                <Text style={theme.buttonText}>Change Email</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[theme.button, styles.utilityButton]}
                onPress={() => setShowChangePassword(true)}
                disabled={loading}
                activeOpacity={0.85}
              >
                <Text style={theme.buttonText}>Change Password</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[theme.button, styles.primaryButton]}
                onPress={handleContinue}
                disabled={loading}
                activeOpacity={0.9}
              >
                <Text style={theme.buttonText}>
                  {loading
                    ? mode === "edit"
                      ? "Saving..."
                      : "Saving..."
                    : mode === "edit"
                    ? "Save Changes"
                    : "Continue"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
      </ScrollView>
      </KeyboardAvoidingView>

      {showChangeEmail && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Change Email</Text>
            <TextInput
              style={[theme.textInput, styles.textInput]}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="New email"
              placeholderTextColor="#1C0F0D80"
              value={newEmail}
              onChangeText={setNewEmail}
            />
            <TextInput
              style={[theme.textInput, styles.textInput]}
              secureTextEntry
              placeholder="Current password"
              placeholderTextColor="#1C0F0D80"
              value={currentPasswordForEmail}
              onChangeText={setCurrentPasswordForEmail}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[theme.button, styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowChangeEmail(false)}
                disabled={changingEmail}
                activeOpacity={0.85}
              >
                <Text style={[theme.buttonText, styles.modalCancelText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  theme.button,
                  styles.modalButton,
                  styles.modalConfirmButton,
                  styles.modalButtonSpacing,
                ]}
                onPress={handleChangeEmail}
                disabled={changingEmail}
                activeOpacity={0.9}
              >
                <Text style={theme.buttonText}>{changingEmail ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showChangePassword && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput
              style={[theme.textInput, styles.textInput]}
              secureTextEntry
              placeholder="Current password"
              placeholderTextColor="#1C0F0D80"
              value={currentPasswordForPassword}
              onChangeText={setCurrentPasswordForPassword}
            />
            <TextInput
              style={[theme.textInput, styles.textInput]}
              secureTextEntry
              placeholder="New password"
              placeholderTextColor="#1C0F0D80"
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[theme.button, styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowChangePassword(false)}
                disabled={changingPassword}
                activeOpacity={0.85}
              >
                <Text style={[theme.buttonText, styles.modalCancelText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  theme.button,
                  styles.modalButton,
                  styles.modalConfirmButton,
                  styles.modalButtonSpacing,
                ]}
                onPress={handleChangePassword}
                disabled={changingPassword}
                activeOpacity={0.9}
              >
                <Text style={theme.buttonText}>{changingPassword ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <ToastHost />
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
    paddingHorizontal: 28,
    paddingBottom: 28,
    paddingTop: 72,
    alignSelf: 'stretch',
    shadowColor: '#46302B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
  },
  backRow: {
    position: 'absolute',
    left: 10,
    zIndex: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
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
    marginTop: 6,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    width: 102,
    height: 101,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ellipse: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 102,
    height: 101,
  },
  profileImage: {
    width: 87,
    height: 87,
    borderRadius: 50,
    position: 'absolute',
    top: 7,
    left: 7,
    resizeMode: 'cover',
  },
  personIconWrapper: {
    width: 42,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 20,
    left: 30,
  },
  uploadBtn: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#3E2823',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 6,
  },
  uploadText: {
    color: '#3E2823',
    fontFamily: 'Poppins',
    fontSize: 13,
    fontWeight: '600',
  },
  removePhotoWrapper: {
    marginTop: 12,
  },
  removePhoto: {
    color: '#C26A77',
    fontFamily: 'Poppins',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(62, 40, 35, 0.1)',
    shadowColor: '#3E2823',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  errorText: {
    color: '#D7263D',
    marginBottom: 4,
    marginLeft: 4,
    fontSize: 14,
  },
  selectInput: {
    justifyContent: 'center',
  },
  selectValue: {
    fontFamily: 'Poppins',
    fontSize: 16,
  },
  pickerWrapper: {
    paddingHorizontal: 0,
  },
  picker: {
    width: '100%',
    color: '#1C0F0D',
  },
  actions: {
    marginTop: 8,
  },
  utilityButton: {
    backgroundColor: '#ccb0a7ff',
    shadowColor: '#C79A8C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 10,
    marginTop: 12,
  },
  primaryButton: {
    shadowColor: '#2E1C18',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 12,
    marginTop: 20,
  },
  modalOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(28, 15, 13, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: 'rgba(255, 253, 249, 0.98)',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    shadowColor: '#46302B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: '#3E2823',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalButtonRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    shadowColor: '#2E1C18',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 10,
  },
  modalButtonSpacing: {
    marginLeft: 12,
  },
  modalCancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  modalCancelText: {
    color: '#3E2823',
  },
  modalConfirmButton: {
    backgroundColor: '#da9078ff',
  },
});
