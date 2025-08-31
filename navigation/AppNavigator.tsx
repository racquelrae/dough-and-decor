import IcingColorGuide from '@/app/icingColorGuide';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CompleteProfileScreen from '@/app/completeProfile';
import HomeScreen from '@/app/index';
import LaunchScreen from '@/app/launch';
import LoginScreen from '@/app/login';
import MeasurementConverterScreen from '@/app/measurementConverter';
import RecipeDetail from '@/app/recipes/[id]';
import RecipesScreen from '@/app/recipes/index';
import NewRecipe from '@/app/recipes/new';
import EditRecipe from '@/app/recipes/edit';
import ShoppingListScreen from '@/app/shoppingList';
import SignUpScreen from '@/app/signUp';
import TimerScreen from '@/app/timer';
import TimerMenuScreen from '@/app/timerMenu';
import InspirationGalleryScreen from '@/app/gallery';
import { RootStackParamList } from '@/types/navigation';


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Launch">
      <Stack.Screen name="Launch" component={LaunchScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}} />
      <Stack.Screen name="Signup" component={SignUpScreen} options={{headerShown: false}} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} options={{headerShown: false}} />
      <Stack.Screen name="Recipes" component={RecipesScreen} options={{headerShown: false}} />
      <Stack.Screen name="RecipeDetails" component={RecipeDetail} options={{headerShown: false}} />
      <Stack.Screen name="NewRecipe" component={NewRecipe} options={{headerShown: false}} />
      <Stack.Screen name="EditRecipe" component={EditRecipe} options={{headerShown: false}} />
      <Stack.Screen name="TimerMenu" component={TimerMenuScreen} options={{headerShown: false}} />
      <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false}} />
      <Stack.Screen name="Timer" component={TimerScreen} options={{headerShown: false}} />
      <Stack.Screen name="IcingColorGuide" component={IcingColorGuide} options={{headerShown: false}} />
      <Stack.Screen name="ShoppingList" component={ShoppingListScreen} options={{headerShown: false}} />
      <Stack.Screen name="MeasurementConverter" component={MeasurementConverterScreen} options={{headerShown: false}} />
      <Stack.Screen name="InspirationGallery" component={InspirationGalleryScreen} options={{headerShown: false}} />
    </Stack.Navigator>
  );
}
