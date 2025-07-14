import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CompleteProfileScreen from '../screens/CompleteProfileScreen';
import LaunchScreen from '../screens/LaunchScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import TimerMenuScreen from '../screens/timerMenuScreen';
import TimerScreen from '../screens/timerScreen';

const Stack = createNativeStackNavigator();


export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Launch">
      <Stack.Screen name="Launch" component={LaunchScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Timer Menu" component={TimerMenuScreen} />
      <Stack.Screen name="Timer" component={TimerScreen} />
    </Stack.Navigator>
  );
}