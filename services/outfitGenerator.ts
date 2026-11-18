import { getColorById, getSlotForCategory } from '../constants/colors';
import {
  GenderPreference,
  OccasionType,
  OutfitPiece,
  OutfitSuggestion,
  StyleType,
  WardrobeItem,
} from '../types';
import { evaluateColorMatch } from './colorTheory';

export interface GenerateOutfitOptions {
  gender: GenderPreference;
  occasion: OccasionType;
  style: StyleType;
  availableColors?: string[];
  wardrobeItems?: WardrobeItem[];
  seedOffset?: number;
}

// Curated high quality fashion imagery for outfits
const FASHION_IMAGE_COLLECTION = {
  men: [
    'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?auto=format&fit=crop&w=800&q=80',
  ],
  women: [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=80',
  ],
  unisex: [
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=800&q=80',
  ],
};

export function generateOutfits(options: GenerateOutfitOptions): OutfitSuggestion[] {
  const {
    gender,
    occasion,
    style,
    availableColors = [],
    wardrobeItems = [],
    seedOffset = 0,
  } = options;

  const results: OutfitSuggestion[] = [];

  // ==============================================================
  // 1. GENERATE RECOMMENDATIONS USING USER'S REAL WARDROBE CLOTHES
  // ==============================================================
  if (wardrobeItems.length > 0) {
    const tops = wardrobeItems.filter((i) => getSlotForCategory(i.category) === 'top');
    const bottoms = wardrobeItems.filter((i) => getSlotForCategory(i.category) === 'bottom');
    const shoes = wardrobeItems.filter((i) => getSlotForCategory(i.category) === 'shoes');
    const accessories = wardrobeItems.filter((i) => getSlotForCategory(i.category) === 'accessory');

    interface Candidate {
      top: WardrobeItem;
      bottom: WardrobeItem;
      shoe?: WardrobeItem;
      acc?: WardrobeItem;
      score: number;
      evalRes: ReturnType<typeof evaluateColorMatch>;
    }

    const candidates: Candidate[] = [];

    // Evaluate combinations across user's real garments
    for (const top of tops) {
      for (const bottom of bottoms) {
        const shoeList = shoes.length > 0 ? shoes : [undefined];
        for (const shoe of shoeList) {
          const accList = accessories.length > 0 ? [undefined, ...accessories] : [undefined];
          const acc = accList[0];

          const tCol = getColorById(top.color).id;
          const bCol = getColorById(bottom.color).id;
          const sCol = shoe ? getColorById(shoe.color).id : 'brown';
          const aCol = acc ? getColorById(acc.color).id : undefined;

          const evalRes = evaluateColorMatch({
            topColor: tCol,
            bottomColor: bCol,
            shoesColor: sCol,
            accessoryColor: aCol,
            occasion,
            style,
          });

          let adjustedScore = evalRes.score;
          // Preferences bonus
          if (top.style === style || bottom.style === style) adjustedScore += 3;
          if (top.occasion === occasion || bottom.occasion === occasion) adjustedScore += 3;
          if (availableColors.includes(tCol) || availableColors.includes(bCol)) adjustedScore += 2;

          candidates.push({
            top,
            bottom,
            shoe,
            acc,
            score: Math.min(99, adjustedScore),
            evalRes,
          });
        }
      }
    }

    // Sort candidates by highest score
    candidates.sort((a, b) => b.score - a.score);

    // Pick candidates using seed offset for "Try Another Combination"
    const offset = seedOffset % Math.max(1, candidates.length);
    const rotated = [...candidates.slice(offset), ...candidates.slice(0, offset)];

    const selectedCandidates = rotated.slice(0, 3);

    for (let i = 0; i < selectedCandidates.length; i++) {
      const { top, bottom, shoe, acc, score, evalRes } = selectedCandidates[i];

      const pieces: OutfitPiece[] = [
        {
          type: 'Top',
          name: top.name,
          colorName: top.color,
          colorHex: top.colorHex,
          imageUri: top.imageUri,
          wardrobeItemId: top.id,
        },
        {
          type: 'Bottom',
          name: bottom.name,
          colorName: bottom.color,
          colorHex: bottom.colorHex,
          imageUri: bottom.imageUri,
          wardrobeItemId: bottom.id,
        },
      ];

      if (shoe) {
        pieces.push({
          type: 'Shoes',
          name: shoe.name,
          colorName: shoe.color,
          colorHex: shoe.colorHex,
          imageUri: shoe.imageUri,
          wardrobeItemId: shoe.id,
        });
      } else {
        const defShoe = getColorById(evalRes.itemFeedback.shoeAnchor ? 'brown' : 'white');
        pieces.push({
          type: 'Shoes',
          name: 'Classic Footwear',
          colorName: defShoe.name,
          colorHex: defShoe.hex,
        });
      }

      if (acc) {
        pieces.push({
          type: 'Accessory',
          name: acc.name,
          colorName: acc.color,
          colorHex: acc.colorHex,
          imageUri: acc.imageUri,
          wardrobeItemId: acc.id,
        });
      }

      results.push({
        id: `wardrobe-rec-${Date.now()}-${i}`,
        title: `${top.name} with ${bottom.name}`,
        subtitle: `${evalRes.harmonyType} • From Your Wardrobe`,
        occasion,
        style,
        gender,
        compatibilityScore: score,
        harmonyTitle: evalRes.harmonyType,
        description: evalRes.explanation,
        pieces,
        shoesAdvice: evalRes.itemFeedback.shoeAnchor,
        accessoriesAdvice:
          evalRes.accessoryRecommendations[0] ||
          'Understated timepiece and matching leather belt.',
        stylingTips: [
          evalRes.itemFeedback.topAndBottom,
          evalRes.occasionSuitability.comment,
          top.pattern ? `Highlight the ${top.pattern} pattern by keeping accessories minimal.` : 'Keep silhouette clean and well-pressed.',
        ],
        imageUrl: top.imageUri, // Uses the real photograph of user's garment!
        isFromWardrobe: true,
      });
    }
  }

  // ==============================================================
  // 2. CURATED INSPIRATION SUGGESTIONS (COMPLEMENTARY)
  // ==============================================================
  const images = FASHION_IMAGE_COLLECTION[gender] || FASHION_IMAGE_COLLECTION.unisex;
  const userColor = availableColors.length > 0 ? availableColors[0] : undefined;

  if (style === 'Formal' || occasion === 'Office') {
    const navy = getColorById('navy');
    const white = getColorById('white');
    const brown = getColorById('brown');
    results.push({
      id: `gen-${Date.now()}-1`,
      title: 'The Continental Executive',
      subtitle: 'Crisp, structured tailoring with Italian heritage depth',
      occasion,
      style,
      gender,
      compatibilityScore: 97,
      harmonyTitle: 'Complementary Tailored Balance',
      description:
        'A crisp white structured shirt paired with slim-tapered navy trousers, grounded by warm brown double-monks or heels. The stark contrast conveys poise and quiet authority.',
      pieces: [
        {
          type: 'Top',
          name: gender === 'women' ? 'Silk Poplin Blouse' : 'Egyptian Cotton Dress Shirt',
          colorName: white.name,
          colorHex: white.hex,
        },
        {
          type: 'Bottom',
          name: gender === 'women' ? 'Pleated High-Waist Trousers' : 'Tailored Wool Trousers',
          colorName: navy.name,
          colorHex: navy.hex,
        },
        {
          type: 'Shoes',
          name: gender === 'women' ? 'Almond-Toe Leather Pumps' : 'Cognac Oxford Brogues',
          colorName: brown.name,
          colorHex: brown.hex,
        },
        {
          type: 'Accessory',
          name: 'Structured Leather Brief / Satchel',
          colorName: brown.name,
          colorHex: brown.hex,
        },
      ],
      shoesAdvice: 'Ensure footwear is buffed to a soft matte sheen. Match leather hue closely to the belt/strap.',
      accessoriesAdvice:
        'Slim bezel gold timepiece, understated leather portfolio, and subtle geometric cufflinks or earrings.',
      stylingTips: [
        'Maintain a slight break at the trouser hem over shoes.',
        'Keep collars firm with structured collar stays.',
        'Opt for a clean French tuck or full tuck with a slender belt.',
      ],
      imageUrl: images[0 % images.length],
    });
  } else if (style === 'Traditional' || occasion === 'Wedding') {
    const cream = getColorById('cream');
    const maroon = getColorById('maroon');
    const beige = getColorById('beige');
    results.push({
      id: `gen-${Date.now()}-1`,
      title: 'Royal Heritage Grandeur',
      subtitle: 'Rich woven textures and festive regal tones',
      occasion,
      style,
      gender,
      compatibilityScore: 98,
      harmonyTitle: 'Imperial Ceremonial Contrast',
      description:
        'Luxurious raw silk in ivory or cream harmonized against rich royal maroon and muted gold accents. Designed for celebration, cultural ceremonies, and commanding elegance.',
      pieces: [
        {
          type: 'Top',
          name: gender === 'women' ? 'Embroidered Raw Silk Choli / Kurti' : 'Tussar Silk Bandhgala Kurta',
          colorName: cream.name,
          colorHex: cream.hex,
        },
        {
          type: 'Bottom',
          name: gender === 'women' ? 'Gathered Brocade Lehenga / Pants' : 'Churidar / Tailored Dhoti Pants',
          colorName: maroon.name,
          colorHex: maroon.hex,
        },
        {
          type: 'Shoes',
          name: gender === 'women' ? 'Handcrafted Zari Juttis' : 'Mojaris with Antique Threadwork',
          colorName: beige.name,
          colorHex: beige.hex,
        },
        {
          type: 'Accessory',
          name: 'Zari Border Pashmina Stole',
          colorName: maroon.name,
          colorHex: maroon.hex,
        },
      ],
      shoesAdvice: 'Traditional embroidered juttis or mojaris in soft tan or gold-thread leather.',
      accessoriesAdvice: 'Polki or brushed antique brass jewelry, woven stole, and a heritage pocket square.',
      stylingTips: [
        'Drape the stole over one shoulder with structured folds.',
        'Pair with an understated, woody sandalwood or oud fragrance.',
      ],
      imageUrl: images[1 % images.length],
    });
  } else {
    // Casual / Smart Casual / Minimal / Streetwear
    const beige = getColorById('beige');
    const white = getColorById('white');
    const olive = getColorById('olive');
    const brown = getColorById('brown');
    results.push({
      id: `gen-${Date.now()}-1`,
      title: 'Earth & Linen Resonance',
      subtitle: 'Organic botanical undertones with effortless drape',
      occasion,
      style,
      gender,
      compatibilityScore: 96,
      harmonyTitle: 'Neutral Earth Palette',
      description:
        'Breathing room meets intentional styling: relaxed olive over-shirt or top layered above beige trousers with clean minimalist footwear.',
      pieces: [
        {
          type: 'Top',
          name: gender === 'women' ? 'Oversized Olive Linen Shirt' : 'Sage Camp Collar Linen Shirt',
          colorName: olive.name,
          colorHex: olive.hex,
        },
        {
          type: 'Bottom',
          name: gender === 'women' ? 'Wide-Leg Linen Pants' : 'Relaxed Pleated Chinos',
          colorName: beige.name,
          colorHex: beige.hex,
        },
        {
          type: 'Shoes',
          name: 'Minimalist Low-Profile Leather Trainers',
          colorName: white.name,
          colorHex: white.hex,
        },
        {
          type: 'Accessory',
          name: 'Woven Canvas & Leather Tote',
          colorName: brown.name,
          colorHex: brown.hex,
        },
      ],
      shoesAdvice: 'Clean white leather trainers or suede espadrilles keep the look grounded yet contemporary.',
      accessoriesAdvice: 'Tortoiseshell acetate sunglasses and a subtle rope or leather bracelet.',
      stylingTips: [
        'Cuff sleeves twice right below the elbow for an unstudied nonchalance.',
        'Leave top 2 buttons undone over a fine ribbed ivory undershirt.',
      ],
      imageUrl: images[0 % images.length],
    });
  }

  // Suggestion: Modern Monochrome
  const black = getColorById('black');
  const grey = getColorById('grey');
  results.push({
    id: `gen-${Date.now()}-2`,
    title: 'The Parisian Monochrome',
    subtitle: 'High-contrast architectural simplicity',
    occasion,
    style,
    gender,
    compatibilityScore: 94,
    harmonyTitle: 'Monochromatic Sharp Contrast',
    description:
      'Black and white in perfect geometric equilibrium. A silhouette designed to flatter every body line while removing unnecessary chromatic clutter.',
    pieces: [
      {
        type: 'Top',
        name: gender === 'women' ? 'Structured Mockneck Knit' : 'Heavyweight Cotton Boxy Tee',
        colorName: black.name,
        colorHex: black.hex,
      },
      {
        type: 'Bottom',
        name: gender === 'women' ? 'High-Rise Straight Trousers' : 'Washed Grey Relaxed Denim',
        colorName: grey.name,
        colorHex: grey.hex,
      },
      {
        type: 'Shoes',
        name: gender === 'women' ? 'Chunky Leather Loafers' : 'Derby Shoes with Commando Sole',
        colorName: black.name,
        colorHex: black.hex,
      },
      {
        type: 'Accessory',
        name: 'Matte Silver Chain / Watch',
        colorName: grey.name,
        colorHex: grey.hex,
      },
    ],
    shoesAdvice: 'Black chunky lug-sole loafers or pristine retro monochrome sneakers.',
    accessoriesAdvice: 'Silver industrial signet ring and a structured leather crossbody or messenger.',
    stylingTips: [
      'Contrast matte textures against sleek leather accents.',
      'Slight crop on trousers to showcase clean footwear geometry.',
    ],
    imageUrl: images[2 % images.length],
  });

  return results;
}
