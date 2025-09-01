export type RootStackParamList = {
  Launch: undefined;
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  TimerMenu: undefined;
  Timer: { seconds: number } | undefined;
  IcingColorGuide: undefined;
  ShoppingList: undefined;
  MeasurementConverter: undefined;
  Recipes: undefined;
  NewRecipe: undefined;
  RecipeDetails: { id: string };
  EditRecipe: { id: string };
  InspirationGallery: undefined;
  Inventory: undefined;
  InventoryEdit: { id: string, categoryId: string };
  InventoryNew: { categoryId: string };
  Settings: undefined;
  PrivacyPolicy: undefined;
  UpdateProfile: { mode?: "create" | "edit" } | undefined;
};

