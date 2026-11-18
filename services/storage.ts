import AsyncStorage from '@react-native-async-storage/async-storage';
import { OutfitSuggestion, PersonalPhoto, UserProfile, WardrobeItem } from '../types';
import { deletePersistentImage, savePersistentImage } from './imageStorage';

const STORAGE_KEYS = {
  USER_PROFILE: '@vasthra_user_profile',
  WARDROBE_ITEMS: '@vasthra_wardrobe_items',
  SAVED_OUTFITS: '@vasthra_saved_outfits',
  ONBOARDING_DONE: '@vasthra_onboarding_done',
};

// Default starter profile
export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Style Enthusiast',
  gender: 'men',
  favoriteColors: ['navy', 'olive', 'cream', 'beige', 'black'],
  preferredStyles: ['Minimal', 'Smart Casual', 'Traditional'],
  onboardingCompleted: false,
  photos: [],
};

// Seed wardrobe pieces with high-res fashion garments for instant delight
export const INITIAL_WARDROBE_ITEMS: WardrobeItem[] = [
  {
    id: 'wardrobe-seed-1',
    name: 'Merino Wool Knit Polo',
    category: 'Tops',
    color: 'Navy',
    colorHex: '#1B2A4A',
    secondaryColor: 'White',
    secondaryColorHex: '#FFFFFF',
    pattern: 'Solid',
    style: 'Smart Casual',
    occasion: 'Office',
    imageUri: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=600&q=80',
    createdAt: Date.now() - 86400000 * 3,
    isFavorite: true,
  },
  {
    id: 'wardrobe-seed-2',
    name: 'Pleated Linen Trousers',
    category: 'Trousers',
    color: 'Beige',
    colorHex: '#D7C4B7',
    pattern: 'Solid',
    style: 'Minimal',
    occasion: 'Casual',
    imageUri: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80',
    createdAt: Date.now() - 86400000 * 2,
    isFavorite: true,
  },
  {
    id: 'wardrobe-seed-3',
    name: 'Italian Leather Penny Loafers',
    category: 'Shoes',
    color: 'Brown',
    colorHex: '#5C3E2A',
    pattern: 'Textured',
    style: 'Smart Casual',
    occasion: 'Date',
    imageUri: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=600&q=80',
    createdAt: Date.now() - 86400000,
    isFavorite: false,
  },
  {
    id: 'wardrobe-seed-4',
    name: 'Relaxed Camp-Collar Overshirt',
    category: 'Shirts',
    color: 'Olive',
    colorHex: '#5B6846',
    pattern: 'Solid',
    style: 'Smart Casual',
    occasion: 'Travel',
    imageUri: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80',
    createdAt: Date.now() - 86400000 * 4,
    isFavorite: true,
  },
  {
    id: 'wardrobe-seed-5',
    name: 'Raw Silk Festive Kurta',
    category: 'Kurtas',
    color: 'Cream',
    colorHex: '#F5EFE6',
    secondaryColor: 'Maroon',
    secondaryColorHex: '#6B1D2F',
    pattern: 'Embroidered',
    style: 'Traditional',
    occasion: 'Wedding',
    imageUri: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
    createdAt: Date.now() - 86400000 * 5,
    isFavorite: false,
  },
  {
    id: 'wardrobe-seed-6',
    name: 'Heavyweight Minimalist Tee',
    category: 'T-shirts',
    color: 'White',
    colorHex: '#FFFFFF',
    pattern: 'Solid',
    style: 'Minimal',
    occasion: 'Casual',
    imageUri: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    createdAt: Date.now() - 86400000 * 6,
    isFavorite: true,
  },
];

// Seed initial saved outfits
export const INITIAL_SAVED_OUTFITS: OutfitSuggestion[] = [
  {
    id: 'saved-init-1',
    title: 'The Riviera Linen Masterpiece',
    subtitle: 'Warm earth & maritime dialogue',
    occasion: 'Date',
    style: 'Smart Casual',
    gender: 'men',
    compatibilityScore: 98,
    harmonyTitle: 'Neutral Earth Harmony',
    description: 'Crisp white camp-collar linen shirt draped effortlessly over tailored beige chinos, grounded by chocolate suede penny loafers.',
    pieces: [
      { type: 'Top', name: 'Camp-Collar Linen Shirt', colorName: 'White', colorHex: '#FFFFFF' },
      { type: 'Bottom', name: 'Pleated Chino Trousers', colorName: 'Beige', colorHex: '#D7C4B7' },
      { type: 'Shoes', name: 'Chocolate Suede Loafers', colorName: 'Brown', colorHex: '#5C3E2A' },
      { type: 'Accessory', name: 'Cognac Leather Watch', colorName: 'Brown', colorHex: '#5C3E2A' },
    ],
    shoesAdvice: 'Wear sockless with no-show liners. Ensure suede is brushed.',
    accessoriesAdvice: 'Warm tortoiseshell sunglasses and brushed gold timepiece.',
    stylingTips: [
      'Roll cuffs twice at the wrist.',
      'Slight relaxed ankle break on trousers.',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    isSaved: true,
  },
  {
    id: 'saved-init-2',
    title: 'Nocturnal Metropolitan',
    subtitle: 'Sharp monochromatic silhouette',
    occasion: 'Party',
    style: 'Minimal',
    gender: 'unisex',
    compatibilityScore: 95,
    harmonyTitle: 'Monochromatic Sharp Contrast',
    description: 'Structured black wool knit paired with charcoal trousers and polished black derby shoes. Timeless and magnetic.',
    pieces: [
      { type: 'Top', name: 'Fine-Gauge Merino Knit', colorName: 'Black', colorHex: '#141414' },
      { type: 'Bottom', name: 'Charcoal Straight Trousers', colorName: 'Grey', colorHex: '#8E9196' },
      { type: 'Shoes', name: 'Polished Derby Brogues', colorName: 'Black', colorHex: '#141414' },
      { type: 'Accessory', name: 'Silver Industrial Ring', colorName: 'Grey', colorHex: '#8E9196' },
    ],
    shoesAdvice: 'High shine calfskin or box leather derbies.',
    accessoriesAdvice: 'Understated silver jewelry and a slim black leather cardholder.',
    stylingTips: ['Keep silhouette clean with zero cuff pooling over the shoes.'],
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    isSaved: true,
  },
];

// Profile storage operations
export async function getUserProfile(): Promise<UserProfile> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!raw) return DEFAULT_USER_PROFILE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_USER_PROFILE,
      ...parsed,
      photos: parsed.photos || [],
    };
  } catch {
    return DEFAULT_USER_PROFILE;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
}

// Personal style photo operations
export async function addPersonalPhoto(photo: Omit<PersonalPhoto, 'id' | 'createdAt'>): Promise<PersonalPhoto> {
  const profile = await getUserProfile();
  const persistentUri = await savePersistentImage(photo.uri, `user_${photo.type}`);

  const isFirstPhoto = !profile.photos || profile.photos.length === 0;
  const isPrimary = photo.isPrimary ?? isFirstPhoto;

  const newPhoto: PersonalPhoto = {
    ...photo,
    id: `photo-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    uri: persistentUri,
    isPrimary,
    createdAt: Date.now(),
  };

  const existingPhotos = (profile.photos || []).map((p) =>
    isPrimary ? { ...p, isPrimary: false } : p
  );

  const updatedPhotos = [newPhoto, ...existingPhotos];
  const updatedProfile: UserProfile = {
    ...profile,
    photos: updatedPhotos,
    avatarUrl: isPrimary ? persistentUri : profile.avatarUrl,
  };

  await saveUserProfile(updatedProfile);
  return newPhoto;
}

export async function deletePersonalPhoto(photoId: string): Promise<void> {
  const profile = await getUserProfile();
  const target = (profile.photos || []).find((p) => p.id === photoId);
  if (target) {
    await deletePersistentImage(target.uri);
  }

  const updatedPhotos = (profile.photos || []).filter((p) => p.id !== photoId);
  let newAvatarUrl = profile.avatarUrl;

  // If deleted photo was primary, assign next available photo as primary
  if (target?.isPrimary && updatedPhotos.length > 0) {
    updatedPhotos[0].isPrimary = true;
    newAvatarUrl = updatedPhotos[0].uri;
  } else if (updatedPhotos.length === 0) {
    newAvatarUrl = undefined;
  }

  const updatedProfile: UserProfile = {
    ...profile,
    photos: updatedPhotos,
    avatarUrl: newAvatarUrl,
  };

  await saveUserProfile(updatedProfile);
}

export async function setPrimaryPersonalPhoto(photoId: string): Promise<void> {
  const profile = await getUserProfile();
  let primaryUri: string | undefined = undefined;

  const updatedPhotos = (profile.photos || []).map((p) => {
    if (p.id === photoId) {
      primaryUri = p.uri;
      return { ...p, isPrimary: true };
    }
    return { ...p, isPrimary: false };
  });

  const updatedProfile: UserProfile = {
    ...profile,
    photos: updatedPhotos,
    avatarUrl: primaryUri || profile.avatarUrl,
  };

  await saveUserProfile(updatedProfile);
}

export async function replacePersonalPhoto(photoId: string, newTempUri: string): Promise<PersonalPhoto | null> {
  const profile = await getUserProfile();
  const currentPhoto = (profile.photos || []).find((p) => p.id === photoId);
  if (!currentPhoto) return null;

  // Save new persistent image
  const persistentUri = await savePersistentImage(newTempUri, `user_${currentPhoto.type}`);

  // Delete previous local file
  await deletePersistentImage(currentPhoto.uri);

  const updatedPhotos = (profile.photos || []).map((p) => {
    if (p.id === photoId) {
      return { ...p, uri: persistentUri };
    }
    return p;
  });

  const updatedProfile: UserProfile = {
    ...profile,
    photos: updatedPhotos,
    avatarUrl: currentPhoto.isPrimary ? persistentUri : profile.avatarUrl,
  };

  await saveUserProfile(updatedProfile);
  return { ...currentPhoto, uri: persistentUri };
}

// Wardrobe storage operations
export async function getWardrobeItems(): Promise<WardrobeItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.WARDROBE_ITEMS);
    if (!raw) {
      await AsyncStorage.setItem(STORAGE_KEYS.WARDROBE_ITEMS, JSON.stringify(INITIAL_WARDROBE_ITEMS));
      return INITIAL_WARDROBE_ITEMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_WARDROBE_ITEMS;
  }
}

export async function addWardrobeItem(item: Omit<WardrobeItem, 'id' | 'createdAt'>): Promise<WardrobeItem> {
  const current = await getWardrobeItems();
  // Ensure image is permanently stored
  const persistentUri = await savePersistentImage(item.imageUri, 'garment');

  const newItem: WardrobeItem = {
    ...item,
    imageUri: persistentUri,
    id: `wardrobe-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: Date.now(),
  };
  const updated = [newItem, ...current];
  await AsyncStorage.setItem(STORAGE_KEYS.WARDROBE_ITEMS, JSON.stringify(updated));
  return newItem;
}

export async function updateWardrobeItem(item: WardrobeItem): Promise<void> {
  const current = await getWardrobeItems();
  const existing = current.find((i) => i.id === item.id);

  let finalImageUri = item.imageUri;
  // If image was replaced with a new temporary file, persist it and cleanup old
  if (existing && existing.imageUri !== item.imageUri) {
    finalImageUri = await savePersistentImage(item.imageUri, 'garment');
    await deletePersistentImage(existing.imageUri);
  }

  const updatedItem = { ...item, imageUri: finalImageUri };
  const updated = current.map((i) => (i.id === item.id ? updatedItem : i));
  await AsyncStorage.setItem(STORAGE_KEYS.WARDROBE_ITEMS, JSON.stringify(updated));
}

export async function deleteWardrobeItem(id: string): Promise<void> {
  const current = await getWardrobeItems();
  const target = current.find((i) => i.id === id);
  if (target) {
    await deletePersistentImage(target.imageUri);
  }
  const updated = current.filter((i) => i.id !== id);
  await AsyncStorage.setItem(STORAGE_KEYS.WARDROBE_ITEMS, JSON.stringify(updated));
}

// Saved outfits storage operations
export async function getSavedOutfits(): Promise<OutfitSuggestion[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_OUTFITS);
    if (!raw) {
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_OUTFITS, JSON.stringify(INITIAL_SAVED_OUTFITS));
      return INITIAL_SAVED_OUTFITS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SAVED_OUTFITS;
  }
}

export async function saveOutfit(outfit: OutfitSuggestion): Promise<void> {
  const current = await getSavedOutfits();
  if (current.some((o) => o.id === outfit.id)) return;
  const updated = [{ ...outfit, isSaved: true }, ...current];
  await AsyncStorage.setItem(STORAGE_KEYS.SAVED_OUTFITS, JSON.stringify(updated));
}

export async function removeSavedOutfit(id: string): Promise<void> {
  const current = await getSavedOutfits();
  const updated = current.filter((o) => o.id !== id);
  await AsyncStorage.setItem(STORAGE_KEYS.SAVED_OUTFITS, JSON.stringify(updated));
}

export async function isOutfitSaved(id: string): Promise<boolean> {
  const current = await getSavedOutfits();
  return current.some((o) => o.id === id);
}
