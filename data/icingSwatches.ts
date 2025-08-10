// AmeriColor Soft Gel Paste mix recipes (parts ≈ drops).
import type { Swatch } from "../components/ColorTiles";

export const AMERICOLOR_SWATCHES: Swatch[] = [
  // --- Pinks / Reds ---
  { name: "My Favorite Pink", hex: "#FF8085", recipe: { "Tulip Red": 2, "Soft Pink": 1 } },
  { name: "Dusty Rose", hex: "#D98A96", recipe: { "Red Red": 2, "Warm Brown": 1 } },
  { name: "Raspberry", hex: "#E2144E", recipe: { "Rose Pink": 3, "Super Red": 1 } },
  { name: "Ruby Red", hex: "#C5082E", recipe: { "Red Red": 1, "Super Black": "touch" } },
  { name: "Burgundy", hex: "#7C1F2C", recipe: { "Rose Pink": 5, "Violet": 1 } },
  { name: "Maroon", hex: "#7B2B26", recipe: { "Red Red": 4, "Burgundy": 2 } },

  // --- Corals / Oranges / Yellows ---
  { name: "Coral", hex: "#FF7F6F", recipe: { "Rose Pink": 3, "Lemon Yellow": 2 } },
  { name: "Apricot", hex: "#FFA736", recipe: { "Orange": 2, "Egg Yellow": 1 } },
  { name: "Copper", hex: "#C66821", recipe: { "Egg Yellow": 1, "Warm Brown": 1, "Super Red": 1 } },
  { name: "Rust", hex: "#A24A2A", recipe: { "Orange": 8, "Red Red": 2, "Warm Brown": 1 } },
  { name: "Burnt Orange", hex: "#B25C0D", recipe: { "Tulip Red": 4, "Egg Yellow": 3, "Warm Brown": 2 } },
  { name: "Gold", hex: "#E1B200", recipe: { "Lemon Yellow": 10, "Orange": 3, "Red Red": 1 } },
  { name: "Old Gold", hex: "#C6A013", recipe: { "Egg Yellow": 5, "Violet": 2, "Warm Brown": 2 } },

  // --- Greens ---
  { name: "My Favorite Green", hex: "#3DBA59", recipe: { "Leaf Green": 3, "Egg Yellow": 1 } },
  { name: "Chartreuse", hex: "#C9E63B", recipe: { "Lemon Yellow": 5, "Leaf Green": 1 } },
  { name: "Avocado", hex: "#8B9B2A", recipe: { "Lemon Yellow": 4, "Leaf Green": 1, "Super Black": "touch" } },
  { name: "Moss Green", hex: "#7C8F49", recipe: { "Violet": 2, "Lemon Yellow": 3 } },
  { name: "My Favorite Electric Green", hex: "#10D15A", recipe: { "Electric Green": 5, "Electric Blue": 2 } },
  { name: "Hunter Green", hex: "#0C3B18", recipe: { "Leaf Green": 5, "Royal Blue": 1, "Super Black": "touch" } },
  { name: "Teal", hex: "#0FA58A", recipe: { "Sky Blue": 9, "Lemon Yellow": 1 } },

  // --- Blues / Purples ---
  { name: "Aqua", hex: "#3DE1C0", recipe: { "Sky Blue": 5, "Leaf Green": 1 } },
  // Tiffany Blue note had two options; we encode the “3:1” option for consistency
  { name: "Tiffany Blue", hex: "#7EE9DA", recipe: { "Royal Blue": 3, "Leaf Green": 1 } },
  { name: "Turquoise", hex: "#00C4AB", recipe: { "Sky Blue": 6, "Lemon Yellow": 1 } },
  { name: "Baby Blue", hex: "#86C7FF", recipe: { "Royal Blue": 1 } }, // add to taste in UI
  { name: "Navy", hex: "#101B45", recipe: { "Royal Blue": 6, "Violet": 3, "Super Black": 2 } },
  { name: "Lavender", hex: "#B49BD6", recipe: { "Soft Pink": 5, "Violet": 1 } },
  { name: "Mauve", hex: "#C070CC", recipe: { "Rose Pink": 5, "Orange": 2, "Red Red": 2, "Super Black": 2 } },
  { name: "My Favorite Purple", hex: "#8E46B8", recipe: { "Regal Purple": 1, "Electric Purple": 1 } },
  { name: "Plum", hex: "#8B1B59", recipe: { "Violet": 3, "Super Red": 1 } },
  { name: "Grape", hex: "#5E2F7D", recipe: { "Violet": 6, "Super Black": "touch" } },

  // --- Neutrals / Skin / Browns ---
  { name: "Khaki", hex: "#C6B48A", recipe: { "Egg Yellow": 1, "Regal Purple": 2, "Ivory": 1, "Super Black": "touch" } },
  { name: "Skin Tone", hex: "#E9C9A9", recipe: { "Warm Brown": "touch", "Ivory": "touch" } },
  { name: "Deep Chocolate Brown", hex: "#3B2412", recipe: { "Chocolate Brown": 5, "Super Black": 1 } },
  { name: "Black", hex: "#000000", recipe: { "Super Black": 1 } },
];
