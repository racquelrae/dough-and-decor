export type Recipe = {
  title: string;
  description: string;
  time: string;        // "30min" etc
  servings: string;   
  photo: string | null; // Cloudinary URL
  ingredients: string[];
  steps: string[];
  createdAt: any;       // serverTimestamp()
  updatedAt: any;       // serverTimestamp()
};