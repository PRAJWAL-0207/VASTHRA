import { ClothingCategory, ColorOption, DetailedCategory, PatternType } from '../types';

export const FASHION_COLORS: ColorOption[] = [
  {
    id: 'white',
    name: 'White',
    hex: '#FFFFFF',
    textHex: '#141414',
    family: 'neutral',
    undertone: 'neutral',
    brightness: 'light',
    hueGroup: 'neutral-white',
  },
  {
    id: 'black',
    name: 'Black',
    hex: '#141414',
    textHex: '#FFFFFF',
    family: 'neutral',
    undertone: 'neutral',
    brightness: 'dark',
    hueGroup: 'neutral-black',
  },
  {
    id: 'beige',
    name: 'Beige',
    hex: '#D7C4B7',
    textHex: '#2E2721',
    family: 'earth',
    undertone: 'warm',
    brightness: 'light',
    hueGroup: 'earth-beige',
  },
  {
    id: 'cream',
    name: 'Cream',
    hex: '#F5EFE6',
    textHex: '#2E2721',
    family: 'neutral',
    undertone: 'warm',
    brightness: 'light',
    hueGroup: 'neutral-cream',
  },
  {
    id: 'brown',
    name: 'Brown',
    hex: '#5C3E2A',
    textHex: '#FFFFFF',
    family: 'earth',
    undertone: 'warm',
    brightness: 'dark',
    hueGroup: 'earth-brown',
  },
  {
    id: 'grey',
    name: 'Grey',
    hex: '#8E9196',
    textHex: '#FFFFFF',
    family: 'neutral',
    undertone: 'cool',
    brightness: 'medium',
    hueGroup: 'neutral-grey',
  },
  {
    id: 'navy',
    name: 'Navy',
    hex: '#1B2A4A',
    textHex: '#FFFFFF',
    family: 'cool',
    undertone: 'cool',
    brightness: 'dark',
    hueGroup: 'navy',
  },
  {
    id: 'blue',
    name: 'Blue',
    hex: '#3D6CB9',
    textHex: '#FFFFFF',
    family: 'cool',
    undertone: 'cool',
    brightness: 'medium',
    hueGroup: 'blue',
  },
  {
    id: 'olive',
    name: 'Olive',
    hex: '#5B6846',
    textHex: '#FFFFFF',
    family: 'earth',
    undertone: 'warm',
    brightness: 'dark',
    hueGroup: 'olive',
  },
  {
    id: 'green',
    name: 'Green',
    hex: '#2D6A4F',
    textHex: '#FFFFFF',
    family: 'cool',
    undertone: 'cool',
    brightness: 'medium',
    hueGroup: 'green',
  },
  {
    id: 'red',
    name: 'Red',
    hex: '#C1292E',
    textHex: '#FFFFFF',
    family: 'warm',
    undertone: 'warm',
    brightness: 'medium',
    hueGroup: 'red',
  },
  {
    id: 'maroon',
    name: 'Maroon',
    hex: '#6B1D2F',
    textHex: '#FFFFFF',
    family: 'warm',
    undertone: 'warm',
    brightness: 'dark',
    hueGroup: 'maroon',
  },
  {
    id: 'pink',
    name: 'Pink',
    hex: '#E8A598',
    textHex: '#3D201A',
    family: 'pastel',
    undertone: 'warm',
    brightness: 'light',
    hueGroup: 'pink',
  },
  {
    id: 'lavender',
    name: 'Lavender',
    hex: '#C5B4E3',
    textHex: '#2A1C40',
    family: 'pastel',
    undertone: 'cool',
    brightness: 'light',
    hueGroup: 'purple',
  },
  {
    id: 'purple',
    name: 'Purple',
    hex: '#5E2B7A',
    textHex: '#FFFFFF',
    family: 'cool',
    undertone: 'cool',
    brightness: 'dark',
    hueGroup: 'purple',
  },
  {
    id: 'yellow',
    name: 'Yellow',
    hex: '#E5B238',
    textHex: '#362704',
    family: 'warm',
    undertone: 'warm',
    brightness: 'light',
    hueGroup: 'yellow',
  },
  {
    id: 'orange',
    name: 'Orange',
    hex: '#D96B27',
    textHex: '#FFFFFF',
    family: 'warm',
    undertone: 'warm',
    brightness: 'medium',
    hueGroup: 'orange',
  },
];

export const getColorById = (id?: string): ColorOption => {
  if (!id) return FASHION_COLORS[0];
  const found = FASHION_COLORS.find(
    (c) =>
      c.id.toLowerCase() === id.toLowerCase() ||
      c.name.toLowerCase() === id.toLowerCase()
  );
  return found || FASHION_COLORS[0];
};

export const OCCASIONS = [
  'Casual',
  'College',
  'Office',
  'Party',
  'Wedding',
  'Travel',
  'Date',
] as const;

export const STYLES = [
  'Minimal',
  'Formal',
  'Streetwear',
  'Traditional',
  'Smart Casual',
] as const;

// 16 Real Clothes Categories
export const CLOTHING_CATEGORIES: DetailedCategory[] = [
  'T-shirts',
  'Shirts',
  'Jeans',
  'Trousers',
  'Shorts',
  'Jackets',
  'Hoodies',
  'Dresses',
  'Sarees',
  'Kurtas',
  'Sherwanis',
  'Skirts',
  'Shoes',
  'Bags',
  'Watches',
  'Accessories',
];

// Preserved for backwards compatibility with existing tabs & seed pieces
export const CATEGORIES = [
  'Tops',
  'Bottoms',
  'Shoes',
  'Outerwear',
  'Accessories',
  'Traditional',
] as const;

export const PATTERNS: PatternType[] = [
  'Solid',
  'Striped',
  'Checked',
  'Floral',
  'Textured',
  'Graphic',
  'Polka Dot',
  'Embroidered',
];

// Helper to determine the slot in outfit matching for any clothing category
export function getSlotForCategory(category: ClothingCategory): 'top' | 'bottom' | 'shoes' | 'accessory' {
  switch (category) {
    case 'T-shirts':
    case 'Shirts':
    case 'Jackets':
    case 'Hoodies':
    case 'Kurtas':
    case 'Sherwanis':
    case 'Dresses':
    case 'Sarees':
    case 'Tops':
    case 'Outerwear':
    case 'Traditional':
      return 'top';

    case 'Jeans':
    case 'Trousers':
    case 'Shorts':
    case 'Skirts':
    case 'Bottoms':
      return 'bottom';

    case 'Shoes':
      return 'shoes';

    case 'Bags':
    case 'Watches':
    case 'Accessories':
    default:
      return 'accessory';
  }
}
