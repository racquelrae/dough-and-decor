import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Circle, Path, Rect, Svg } from 'react-native-svg';

export default function CompleteProfileScreen() {
  return (
    <View style={styles.completeProfileContainer}>
      <View style={styles.cellstrip}>
        <Text style={styles._04}>16:04</Text>
      </View>
      <View style={styles.frame25}>
        <Text style={styles.profile}>Profile</Text>
      </View>
      <View style={styles.contentArea}>
        <View style={styles.headerSection}>
          <Text style={styles.completeyourprofile}>Complete your profile</Text>
          <Text style={styles.loremipsumdolorsitametpretiumcrasidduipellentesqueornareQuisquemalesuadanetuspulvinardiam}>
            Lorem ipsum dolor sit amet pretium cras id dui pellentesque ornare. Quisque malesuada netus pulvinar diam.
          </Text>
        </View>
        <View style={styles.avatarSection}>
          <Svg style={styles.ellipse48} width="102" height="101" viewBox="0 0 102 101" fill="none" >
            <Circle cx="50.6863" cy="50.4073" r="50.4073" fill="#EDC7BA"/>
          </Svg>
          <View style={styles.vector}>
            <Svg style={styles.Vector} width="42" height="60" viewBox="0 0 42 60" fill="none" >
              <Path d="M21.1794 20.8069C26.3247 20.8069 30.4958 16.6359 30.4958 11.4906C30.4958 6.34533 26.3247 2.17426 21.1794 2.17426C16.0341 2.17426 11.8631 6.34533 11.8631 11.4906C11.8631 16.6359 16.0341 20.8069 21.1794 20.8069Z" stroke="#1C0F0D" strokeWidth="4.1406" strokeLinecap="round" strokeLinejoin="round"/>
              <Path d="M38.3297 48.0189C33.8578 58.064 21.1215 57.236 21.1215 57.236C21.1215 57.236 8.37674 58.0309 3.91318 48.0189C3.04931 46.0929 2.60266 44.0058 2.60266 41.8949C2.60266 39.784 3.04931 37.6972 3.91318 35.7712C8.37674 25.7261 21.1215 26.5541 21.1215 26.5541C21.1215 26.5541 33.8578 25.7592 38.3297 35.7712C39.1935 37.6972 39.6402 39.784 39.6402 41.8949C39.6402 44.0058 39.1935 46.0929 38.3297 48.0189Z" stroke="#1C0F0D" strokeWidth="4.1406" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </View>
        </View>
        <View style={styles.formArea}>
          <Text style={styles.fullname}>Full name</Text>
          <View style={styles.inputBox}/>
          <Text style={styles.gender}>Gender</Text>
          <View style={styles.inputBox}><Text style={styles.inputText}>Gender</Text></View>
          <Text style={styles.mobileNumber}>Mobile Number</Text>
          <View style={styles.inputBox}/>
          <Text style={styles.dateofbirth}>Date of birth</Text>
          <View style={styles.inputBox}><Text style={styles.inputText}>DD / MM /YYY</Text></View>
          <Text style={styles.inputText}>+ 123 456 789</Text>
          <Text style={styles.inputText}>example@example.com</Text>
        </View>
        <View style={styles.buttonArea}>
          <View style={styles.loginButton}>
            <Svg style={styles.group54} width="207" height="45" viewBox="0 0 207 45" fill="none" >
              <Rect width="207" height="45" rx="22.5" fill="#EDC7BA"/>
            </Svg>
            <Text style={styles.logIn}>continue</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  completeProfileContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 253, 249, 1)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  cellstrip: {
    width: '100%',
    paddingTop: 10,
    paddingBottom: 8,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    backgroundColor: 'rgba(255, 253, 249, 1)',
    alignItems: 'center',
    marginBottom: 16,
  },
  _04: {
    color: 'rgba(50, 32, 28, 1)',
    fontFamily: 'League Spartan',
    fontSize: 13,
    fontWeight: '500',
  },
  frame25: {
    marginBottom: 24,
    alignItems: 'center',
  },
  profile: {
    color: 'rgba(50, 32, 28, 1)',
    fontFamily: 'Poppins',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  contentArea: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerSection: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  completeyourprofile: {
    color: 'rgba(50, 32, 28, 1)',
    fontFamily: 'Poppins',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  loremipsumdolorsitametpretiumcrasidduipellentesqueornareQuisquemalesuadanetuspulvinardiam: {
    color: 'rgba(50, 32, 28, 1)',
    fontFamily: 'Poppins',
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 8,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  ellipse48: {
    width: 101,
    height: 101,
    marginBottom: 8,
  },
  vector: {
    position: 'absolute',
    top: 23,
    left: 32,
    width: 37,
    height: 55,
  },
  formArea: {
    width: '100%',
    alignItems: 'stretch',
    marginBottom: 16,
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
  inputText: {
    color: 'rgba(28, 15, 13, 1)',
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '500',
  },
  gender: {
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
  buttonArea: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  loginButton: {
    height: 45,
    width: 207,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  group54: {
    position: 'absolute',
    height: 45,
    width: 207,
  },
  logIn: {
    color: 'rgba(255, 253, 249, 1)',
    fontFamily: 'Poppins',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    zIndex: 1,
  },
});