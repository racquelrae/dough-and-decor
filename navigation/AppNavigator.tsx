import IcingColorGuide from '@/app/icingColorGuide';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CompleteProfileScreen from '@/app/updateProfile';
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
import InventoryIndex from '@/app/inventory';
import InventoryEdit from '@/app/inventory/[id]/edit';
import InventoryNew from '@/app/inventory/new';
import SettingsScreen from '@/app/settings';
import PrivacyPolicyScreen from '@/app/privacyPolicy';


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Launch">
      <Stack.Screen name="Launch" component={LaunchScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}} />
      <Stack.Screen name="Signup" component={SignUpScreen} options={{headerShown: false}} />
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
      <Stack.Screen name="Inventory" component={InventoryIndex} options={{ headerShown: false }} />
      <Stack.Screen name="InventoryEdit" component={InventoryEdit} options={{ presentation: "modal",headerShown: false }} />
      <Stack.Screen name="InventoryNew" component={InventoryNew} options={{ presentation:"modal", headerShown: false }} />
      <Stack.Screen name="UpdateProfile" component={CompleteProfileScreen} options={{headerShown: false}} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{headerShown: false}} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{headerShown: false}} />
    </Stack.Navigator>
  );
}
