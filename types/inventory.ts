export type CategoryType = "cookie_cutters" | "ingredients" | "custom" | "other";

export interface InventoryCategory {
  id: string;
  name: string;
  type: CategoryType;
  order: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  imageUrl?: string;
  thumbUrl?: string;
  expires?: boolean;
  expiryDate?: any; // firestore Timestamp
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}