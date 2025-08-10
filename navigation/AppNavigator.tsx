import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CompleteProfileScreen from '../app/completeProfile';
import HomeScreen from '../app/index';
import LaunchScreen from '../app/launch';
import LoginScreen from '../app/login';
import ShoppingListScreen from '../app/shoppingList';
import SignUpScreen from '../app/signUp';
import TimerScreen from '../app/timer';
import TimerMenuScreen from '../app/timerMenu';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Launch">
      <Stack.Screen name="Launch" component={LaunchScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignUpScreen} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
      <Stack.Screen
        name="TimerMenu"                   
        component={TimerMenuScreen}
        options={{ title: 'Timer Menu' }}  
      />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Timer" component={TimerScreen} />
      <Stack.Screen
        name="IcingColorGuide"
        component={require('../app/icingColorGuide').default}
        options={{ title: 'Icing Color Guide' }} />
      <Stack.Screen name="ShoppingList" component={ShoppingListScreen} />
    </Stack.Navigator>
  );
}
