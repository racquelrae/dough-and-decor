import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CompleteProfileScreen from '../app/CompleteProfileScreen';
import HomeScreen from '../app/HomeScreen';
import LaunchScreen from '../app/LaunchScreen';
import LoginScreen from '../app/LoginScreen';
import SignupScreen from '../app/SignUpScreen';
import TimerMenuScreen from '../app/timerMenuScreen';
import TimerScreen from '../app/timerScreen';
import { RootStackParamList } from '../types/navigation';
import ShoppingListScreen from '../app/shoppingListScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Launch">
      <Stack.Screen name="Launch" component={LaunchScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
      <Stack.Screen
        name="TimerMenu"                   
        component={TimerMenuScreen}
        options={{ title: 'Timer Menu' }}  
      />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Timer" component={TimerScreen} />
      <Stack.Screen
        name="ColorBlend"
        component={require('../app/colorBlendScreen').default} 
        options={{ title: 'Icing Color Blending Guide' }} />
      <Stack.Screen name="ShoppingList" component={ShoppingListScreen} />
    </Stack.Navigator>
  );
}
