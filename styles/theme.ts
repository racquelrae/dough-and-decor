// Master theme for Dough & Decor app
import { StyleSheet } from 'react-native';

export const colors = {
  background: 'rgba(255, 253, 249, 1)',
  pink: '#D4B2A7',
  pinkLight: '#EDC7BA',
  pinkAccent: '#EC888D',
  brown: 'rgba(50, 32, 28, 1)',
  inputBg: 'rgba(237, 199, 186, 1)',
  inputText: '#1C0F0D',
  placeholder: '#1C0F0D99',
  placeholderLight: '#1C0F0D55',
  error: 'red',
  white: '#fff',
};

export const fonts = {
  heading: 'Poppins',
  body: 'Poppins',
  accent: 'League Spartan',
};

export const theme = StyleSheet.create({
  // Containers
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 24,
    paddingTop: 40,
  },
  headerContainer: {
    marginTop: 100,
    marginBottom: 60,
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 75,
  },
  fieldsContainer: {
    width: '100%',
    marginBottom: 16,
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  // Buttons
  button: {
    backgroundColor: colors.pink,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.pink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: colors.white,
    fontFamily: fonts.heading,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Text Inputs
  textInput: {
    width: '100%',
    height: 41,
    backgroundColor: colors.inputBg,
    borderRadius: 18,
    paddingHorizontal: 16,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.inputText,
    marginBottom: 8,
  },
  // Labels
  label: {
    color: colors.brown,
    fontFamily: fonts.heading,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  // Error text
  errorText: {
    color: colors.error,
    marginBottom: 8,
    textAlign: 'center',
  },
  // Link text
  link: {
    color: colors.pinkAccent,
    fontFamily: fonts.accent,
    fontSize: 13,
    fontWeight: '300',
    textAlign: 'center',
  },
  // Heading
  heading: {
    color: colors.brown,
    fontFamily: fonts.heading,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  alreadyHaveAccountText: {
    color: '#1C0F0D',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  // Additional styles
  forgotPassword: {
    color: '#1C0F0D',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  bottomText: {
    color: '#1C0F0D',
    fontSize: 13,
    fontWeight: '300',
    textAlign: 'center',
    marginTop: 8,
  },
  passwordInputWrapper: {
    position: 'relative',
    width: '100%',
    marginBottom: 8,
    justifyContent: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 8,
    height: 24,
    width: 28,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  buttonRow: {
    width: '100%',
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 0,
  },
  inputText: {
    color: '#1C0F0D',
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '500',
  },
  bodyText: {
    color: colors.brown,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 8,
  },
  timeText: {
    color: colors.brown,
    fontFamily: fonts.accent,
    fontSize: 13,
    fontWeight: '500',
  },
});
