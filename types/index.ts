export type GenderPreference = 'men' | 'women' | 'unisex';

export type OccasionType = 
  | 'Casual' 
  | 'College' 
  | 'Office' 
  | 'Party' 
  | 'Wedding' 
  | 'Travel' 
  | 'Date';

export type StyleType = 
  | 'Minimal' 
  | 'Formal' 
  | 'Streetwear' 
  | 'Traditional' 
  | 'Smart Casual';

export type DetailedCategory =
  | 'T-shirts'
  | 'Shirts'
  | 'Jeans'
  | 'Trousers'
  | 'Shorts'
  | 'Jackets'
  | 'Hoodies'
  | 'Dresses'
  | 'Sarees'
  | 'Kurtas'
  | 'Sherwanis'
  | 'Skirts'
  | 'Shoes'
  | 'Bags'
  | 'Watches'
  | 'Accessories';

export type ClothingCategory = 
  | DetailedCategory
  | 'Tops' 
  | 'Bottoms' 
  | 'Outerwear' 
  | 'Traditional';

export type PatternType =
  | 'Solid'
  | 'Striped'
  | 'Checked'
  | 'Floral'
  | 'Textured'
  | 'Graphic'
  | 'Polka Dot'
  | 'Embroidered';

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  textHex: string;
  family: 'neutral' | 'earth' | 'warm' | 'cool' | 'pastel';
  undertone: 'warm' | 'cool' | 'neutral';
  brightness: 'light' | 'medium' | 'dark';
  hueGroup: string;
}

export interface MatchSelection {
  topColor: string;
  bottomColor: string;
  shoesColor: string;
  accessoryColor?: string;
  occasion: OccasionType;
  style: StyleType;
  // Connected Wardrobe Items
  topItem?: WardrobeItem;
  bottomItem?: WardrobeItem;
  shoesItem?: WardrobeItem;
  accessoryItem?: WardrobeItem;
}

export interface BetterAlternative {
  title: string;
  description: string;
  topColor: string;
  bottomColor: string;
  shoesColor: string;
  accessoryColor?: string;
  expectedScore: number;
  topItem?: WardrobeItem;
  bottomItem?: WardrobeItem;
  shoesItem?: WardrobeItem;
}

export interface MatchResult {
  score: number;
  rating: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
  ratingLabel: string;
  ratingColor: string;
  harmonyType: string;
  explanation: string;
  itemFeedback: {
    topAndBottom: string;
    shoeAnchor: string;
    accessoryTouch: string;
  };
  occasionSuitability: {
    fit: 'Perfect' | 'Suitable' | 'Fair' | 'Not Recommended';
    comment: string;
  };
  accessoryRecommendations: string[];
  betterAlternatives: BetterAlternative[];
}

export interface WardrobeItem {
  id: string;
  name: string;
  category: ClothingCategory;
  color: string;
  colorHex: string;
  secondaryColor?: string;
  secondaryColorHex?: string;
  pattern?: PatternType;
  style: StyleType;
  occasion: OccasionType;
  imageUri: string;
  createdAt: number;
  notes?: string;
  isFavorite?: boolean;
}

export interface OutfitPiece {
  type: 'Top' | 'Bottom' | 'Shoes' | 'Outerwear' | 'Accessory' | 'Traditional';
  name: string;
  colorName: string;
  colorHex: string;
  imageUri?: string;
  wardrobeItemId?: string;
}

export interface OutfitSuggestion {
  id: string;
  title: string;
  subtitle: string;
  occasion: OccasionType;
  style: StyleType;
  gender: GenderPreference;
  compatibilityScore: number;
  harmonyTitle: string;
  description: string;
  pieces: OutfitPiece[];
  shoesAdvice: string;
  accessoriesAdvice: string;
  stylingTips: string[];
  imageUrl: string;
  isSaved?: boolean;
  isFromWardrobe?: boolean;
}

export interface StylistMessage {
  id: string;
  sender: 'user' | 'stylist';
  text: string;
  timestamp: number;
  imageUri?: string;
  chips?: string[];
  suggestedOutfit?: OutfitSuggestion;
  colorSwatches?: string[];
  attachedWardrobeItem?: WardrobeItem;
  isAiVisionNotice?: boolean;
}

export type PersonalPhotoType = 'face' | 'fullBodyFront' | 'fullBodySide' | 'reference';

export interface PersonalPhoto {
  id: string;
  uri: string;
  type: PersonalPhotoType;
  label: string;
  isPrimary?: boolean;
  createdAt: number;
}

export interface UserProfile {
  name: string;
  gender: GenderPreference;
  favoriteColors: string[];
  preferredStyles: StyleType[];
  onboardingCompleted: boolean;
  avatarUrl?: string;
  photos?: PersonalPhoto[];
}
