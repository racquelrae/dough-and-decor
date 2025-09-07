// types/inventory.ts

export type InventoryCategory = {
  id: string;
  name: string;
  type: CategoryType;
  order: number;
  createdAt?: any;
  updatedAt?: any;
};

export type CategoryType = "cookie_cutters" | "ingredients" | "other" | "custom";

export type InventoryItem = {
  id: string;
  name: string;
  quantity: number;

  // Images
  imageUrl?: string | null;
  thumbUrl?: string | null;

  // Expiry
  expires?: boolean;
  expiryDate?: any | null;

  // Notes
  notes?: string;

  // Auto-add shopping list support
  min?: number | null;             // threshold for “low”
  autoAddToList?: boolean;  // toggle on/off

  // Metadata
  createdAt?: any;
  updatedAt?: any;
};
