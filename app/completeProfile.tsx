import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
  ActionSheetIOS, ActivityIndicator, Alert, Image, KeyboardAvoidingView,
  Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { Circle, Path, Svg } from 'react-native-svg';
import { useUser } from '../context/UserContext';
import { db } from '../firebase/config';
import { theme } from '../styles/theme';
import { logUserAuthState } from '../utils/logUserAuthState';
import * as ImageManipulator from 'expo-image-manipulator'

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME!;
export const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
export const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

export default function CompleteProfileScreen() {
  const [username, setUsername] = useState('');
  const [userType, setUserType] = useState('');
  const [customType, setCustomType] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  const { user } = useUser() as { user: any };

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
      Alert.alert('Success', 'Profile updated!');
    } catch (e) {
      console.log('Profile update error:', e);
      Alert.alert('Error', 'Could not update profile.');
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

  const handleMinimalUpdate = async () => {
    if (!user) {
      Alert.alert('Not logged in', 'You must be logged in to update your profile.');
      return;
    }
    try {
      await setDoc(doc(db, 'users', user.uid), { testField: 'test' }, { merge: true });
      Alert.alert('Success', 'Minimal update succeeded!');
    } catch (e: any) {
      Alert.alert('Error', 'Minimal update failed: ' + (e?.message || ''));
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={theme.screenContainer}>
          <View style={theme.headerContainer}>
            <Text style={theme.heading}>Complete Your Profile</Text>
          </View>

          <View style={theme.formContainer}>
            <View style={styles.avatarSection}>
              <View style={styles.avatarWrapper}>
                <Svg style={styles.ellipse48} width="102" height="101" viewBox="0 0 102 101" fill="none">
                  <Circle cx="50.6863" cy="50.4073" r="50.4073" fill="#EDC7BA" />
                </Svg>

                {loading ? (
                  <ActivityIndicator size="large" color="#D4B2A7" style={styles.profileImage} />
                ) : image ? (
                  <Image source={{ uri: image }} style={styles.profileImage} />
                ) : (
                  <View style={styles.personIconWrapper}>
                    <Svg width="42" height="60" viewBox="0 0 42 60" fill="none" opacity={0.4}>
                      <Path d="M21.1794 20.8069C26.3247 20.8069 30.4958 16.6359 30.4958 11.4906C30.4958 6.34533 26.3247 2.17426 21.1794 2.17426C16.0341 2.17426 11.8631 6.34533 11.8631 11.4906C11.8631 16.6359 16.0341 20.8069 21.1794 20.8069Z" stroke="#1C0F0D" strokeWidth="4.1406" strokeLinecap="round" strokeLinejoin="round"/>
                      <Path d="M38.3297 48.0189C33.8578 58.064 21.1215 57.236 21.1215 57.236C21.1215 57.236 8.37674 58.0309 3.91318 48.0189C3.04931 46.0929 2.60266 44.0058 2.60266 41.8949C2.60266 39.784 3.04931 37.6972 3.91318 35.7712C8.37674 25.7261 21.1215 26.5541 21.1215 26.5541C21.1215 26.5541 33.8578 25.7592 38.3297 35.7712C39.1935 37.6972 39.6402 39.784 39.6402 41.8949C39.6402 44.0058 39.1935 46.0929 38.3297 48.0189Z" stroke="#1C0F0D" strokeWidth="4.1406" strokeLinecap="round" strokeLinejoin="round"/>
                    </Svg>
                  </View>
                )}
              </View>

              <TouchableOpacity style={styles.uploadBtn} activeOpacity={0.7} onPress={showImagePickerOptions}>
                <Text style={theme.link}>{image ? 'Change Profile Picture' : 'Upload Profile Picture'}</Text>
              </TouchableOpacity>
            </View>

            <View style={theme.formContainer}>
              <Text style={theme.label}>Username</Text>
              <TextInput
                style={theme.textInput}
                placeholder="username"
                placeholderTextColor="#1C0F0D55"
                value={username}
                autoCapitalize="none"
                onChangeText={(t) => { setUsername(t); setUsernameError(''); }}
              />
              {!!usernameError && <Text style={{ color: '#D7263D', marginBottom: 8, marginLeft: 4, fontSize: 14 }}>{usernameError}</Text>}

              <Text style={theme.label}>What best describes you?</Text>

              {Platform.OS === 'ios' ? (
                <TouchableOpacity style={[theme.textInput, { justifyContent: 'center' }]} onPress={handleUserTypePress} activeOpacity={0.7}>
                  <Text style={{ color: userType ? '#1C0F0D' : '#1C0F0D55' }}>
                    {userType ? (userType === 'Other' ? 'Other (type below)' : userType) : 'Select an option...'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Picker selectedValue={userType} onValueChange={(v) => setUserType(v)} style={{ minHeight: 44, width: '100%', color: '#1C0F0D' }} dropdownIconColor="#D4B2A7">
                  <Picker.Item label="Select an option..." value="" />
                  <Picker.Item label="Hobbyist" value="Hobbyist" />
                  <Picker.Item label="Small Business Owner" value="Small Business Owner" />
                  <Picker.Item label="Professional Baker" value="Professional Baker" />
                  <Picker.Item label="Student" value="Student" />
                  <Picker.Item label="Other (type below)" value="Other" />
                </Picker>
              )}

              {userType === 'Other' && (
                <TextInput
                  style={theme.textInput}
                  placeholder="Type your description..."
                  placeholderTextColor="#1C0F0D55"
                  value={customType}
                  onChangeText={setCustomType}
                />
              )}
            </View>

            <View style={theme.buttonRow}>
              <TouchableOpacity style={[theme.button, { flex: 1, marginHorizontal: 0 }]} onPress={handleContinue} disabled={loading}>
                <Text style={theme.buttonText}>{loading ? 'Saving...' : 'Continue'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[theme.button, { flex: 1, marginHorizontal: 0, backgroundColor: '#aaa' }]} onPress={handleMinimalUpdate} disabled={loading}>
                <Text style={theme.buttonText}>Minimal Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  avatarSection: { alignItems: 'center', marginBottom: 16 },
  avatarWrapper: { width: 102, height: 101, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  ellipse48: { position: 'absolute', top: 0, left: 0, width: 102, height: 101 },
  profileImage: { width: 70, height: 70, borderRadius: 35, position: 'absolute', top: 16, left: 16, resizeMode: 'cover' },
  personIconWrapper: { width: 42, height: 60, alignItems: 'center', justifyContent: 'center', position: 'absolute', top: 20, left: 30 },
  headerSection: { width: '100%', alignItems: 'flex-start', marginBottom: 16 },
  uploadBtn: { marginTop: 8, marginBottom: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  modalContent: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, maxHeight: 350 },
  modalItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalItemText: { fontSize: 18, color: '#1C0F0D' },
});
