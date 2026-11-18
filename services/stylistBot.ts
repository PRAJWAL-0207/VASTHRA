import { getColorById, getSlotForCategory } from '../constants/colors';
import { StylistMessage, WardrobeItem } from '../types';
import { evaluateColorMatch } from './colorTheory';

export const INITIAL_STYLIST_MESSAGES: StylistMessage[] = [
  {
    id: 'msg-init-1',
    sender: 'stylist',
    text: `Hello, I'm your VASTHRA Personal Stylist.\n\nWhether you're deciding what to wear for a wedding, matching tricky colors, or building an outfit from your wardrobe, I'm here with sartorial guidance.\n\nYou can attach a photo of your clothes or personal style reference using the camera / wardrobe buttons below!`,
    timestamp: Date.now() - 10000,
    chips: [
      'Which shirt matches my trousers?',
      'What shoes go with my outfit?',
      'Summer wedding outfit ideas',
      'Smart casual office guidelines',
    ],
  },
];

export interface StylistQueryOptions {
  hasImage?: boolean;
  imageUri?: string;
  attachedItem?: WardrobeItem;
  isPersonalPhoto?: boolean;
  wardrobeContext?: WardrobeItem[];
}

export function getStylistResponse(
  userInput: string,
  options?: StylistQueryOptions
): StylistMessage {
  const query = userInput.toLowerCase().trim();
  const timestamp = Date.now();
  const id = `stylist-${timestamp}`;

  const { attachedItem, isPersonalPhoto, wardrobeContext = [] } = options || {};

  // Case 1: An actual Wardrobe Item was attached
  if (attachedItem) {
    const slot = getSlotForCategory(attachedItem.category);
    const itemColor = getColorById(attachedItem.color);

    if (slot === 'bottom') {
      // Suggesting tops for trousers / jeans
      const matchingTops = wardrobeContext.filter(
        (i) => getSlotForCategory(i.category) === 'top'
      );
      const topSuggestionsText =
        matchingTops.length > 0
          ? `\n\n**From Your Wardrobe:**\n` +
            matchingTops
              .slice(0, 3)
              .map((t) => {
                const evalMatch = evaluateColorMatch({
                  topColor: getColorById(t.color).id,
                  bottomColor: itemColor.id,
                  shoesColor: 'brown',
                  occasion: attachedItem.occasion,
                  style: attachedItem.style,
                });
                return `• **${t.name}** (${t.color}) — *${evalMatch.score}% Match (${evalMatch.harmonyType})*`;
              })
              .join('\n')
          : '';

      return {
        id,
        sender: 'stylist',
        text: `👖 **Styling Advice for "${attachedItem.name}" (${attachedItem.color} ${attachedItem.category})**\n\nTo balance these bottoms:\n\n• **Ideal Tops**: Contrast is key. If your ${attachedItem.name} is ${itemColor.name}, pair it with crisp White, French Navy, or warm Beige/Cream.\n• **Silhouette**: Maintain proportion balance—if these bottoms are relaxed, wear a structured knit or tailored tucked shirt.\n• **Footwear**: Chocolate brown loafers or clean low-profile white trainers.${topSuggestionsText}\n\n*(Analysis powered by VASTHRA's Color Theory Engine)*`,
        timestamp,
        chips: [
          `What shoes match ${attachedItem.color}?`,
          `Style for ${attachedItem.occasion}`,
          'Check color compatibility',
        ],
        colorSwatches: [itemColor.hex, '#FFFFFF', '#1B2A4A', '#5C3E2A', '#D7C4B7'],
        attachedWardrobeItem: attachedItem,
      };
    } else if (slot === 'top') {
      // Suggesting bottoms and shoes for tops / shirts
      const matchingBottoms = wardrobeContext.filter(
        (i) => getSlotForCategory(i.category) === 'bottom'
      );
      const bottomSuggestionsText =
        matchingBottoms.length > 0
          ? `\n\n**From Your Wardrobe:**\n` +
            matchingBottoms
              .slice(0, 3)
              .map((b) => {
                const evalMatch = evaluateColorMatch({
                  topColor: itemColor.id,
                  bottomColor: getColorById(b.color).id,
                  shoesColor: 'brown',
                  occasion: attachedItem.occasion,
                  style: attachedItem.style,
                });
                return `• **${b.name}** (${b.color}) — *${evalMatch.score}% Match (${evalMatch.harmonyType})*`;
              })
              .join('\n')
          : '';

      return {
        id,
        sender: 'stylist',
        text: `👔 **Styling Advice for "${attachedItem.name}" (${attachedItem.color} ${attachedItem.category})**\n\nHere is how to style your ${attachedItem.category.toLowerCase()}:\n\n• **Lower Foundation**: Ground ${itemColor.name} with tailored trousers or clean denim in contrasting neutral tones.\n• **Footwear**: Match your shoes with your belt leather tone for high-sartorial polish.\n• **Occasion Calibration**: Best suited for ${attachedItem.occasion} in a ${attachedItem.style} silhouette.${bottomSuggestionsText}\n\n*(Analysis powered by VASTHRA's Color Theory Engine)*`,
        timestamp,
        chips: [
          `What trousers with ${attachedItem.color}?`,
          'Recommended accessories',
          'Save outfit with this piece',
        ],
        colorSwatches: [itemColor.hex, '#D7C4B7', '#141414', '#1B2A4A', '#8E9196'],
        attachedWardrobeItem: attachedItem,
      };
    } else {
      return {
        id,
        sender: 'stylist',
        text: `👞 **Styling Advice for "${attachedItem.name}"**\n\nYour ${attachedItem.category} in ${itemColor.name} serves as an anchor piece for your ensemble. Keep adjacent garments in harmonious or neutral tones to allow this piece to complement without optical friction.`,
        timestamp,
        chips: ['Match this in Outfit Studio', 'Check occasion suitability'],
        colorSwatches: [itemColor.hex, '#FFFFFF', '#1B2A4A', '#D7C4B7'],
        attachedWardrobeItem: attachedItem,
      };
    }
  }

  // Case 2: Personal Reference or Uncategorized Image Attached
  if (isPersonalPhoto || options?.hasImage) {
    return {
      id,
      sender: 'stylist',
      text: `📸 **Image Received for Styling**\n\nI have received your photo attachment! Here is our current status:\n\nℹ️ **AI Vision Notice**: Automatic computer vision pixel segmentation and fabric recognition requires an external Cloud AI Vision API integration (e.g. Gemini Vision API). Currently, VASTHRA is operating on its **Offline Sartorial & Color Harmony Engine**.\n\nTo give you tailored advice:\n1. What color and garment category is this piece?\n2. Or tap **"Pick from Wardrobe"** to select your cataloged clothes with instant color theory analysis!`,
      timestamp,
      chips: [
        'Pick from my wardrobe',
        'Which shirt matches my trousers?',
        'What shoes go with my outfit?',
      ],
      isAiVisionNotice: true,
      colorSwatches: ['#F5EFE6', '#1B2A4A', '#5C3E2A', '#D7C4B7'],
    };
  }

  // Case 3: "Which shirt matches my trousers"
  if (query.includes('which shirt') || query.includes('shirt matches') || query.includes('what shirt')) {
    const userBottoms = wardrobeContext.filter((i) => getSlotForCategory(i.category) === 'bottom');
    const bottomsText =
      userBottoms.length > 0
        ? `\n\n**Your Wardrobe Trousers & Recommended Shirts:**\n` +
          userBottoms
            .slice(0, 3)
            .map((b) => {
              const bCol = getColorById(b.color);
              const complement = bCol.id === 'navy' ? 'White or Cream' : bCol.id === 'beige' ? 'Olive, Navy, or White' : 'Light Blue or White';
              return `• **${b.name}** (${b.color}) pairs effortlessly with **${complement}** shirts.`;
            })
            .join('\n')
        : '';

    return {
      id,
      sender: 'stylist',
      text: `👔 **Shirt & Trouser Compatibility Guide**\n\nThe fundamental rule of shirt-and-trouser matching is **Value & Temperature Contrast**:\n\n1. **Dark Trousers (Navy, Charcoal, Black)**: Light, crisp shirts (White, Linen Cream, Sky Blue, Pastel Pink) create an open, flattering vertical silhouette.\n2. **Light Trousers (Beige, Cream, Light Grey)**: Earthy or deep shirts (Olive, French Navy, Burgundy, Rust) establish grounded visual presence.\n3. **Denim / Jeans**: Oxford cotton button-downs or casual knit polos in almost any non-matching blue hue.${bottomsText}`,
      timestamp,
      chips: ['Match trousers in Studio', 'What shoes with this?', 'Color theory rules'],
      colorSwatches: ['#FFFFFF', '#1B2A4A', '#D7C4B7', '#5B6846'],
    };
  }

  // Case 4: "What shoes go with..."
  if (query.includes('shoe') || query.includes('footwear') || query.includes('sneaker') || query.includes('loafer')) {
    return {
      id,
      sender: 'stylist',
      text: `👞 **Footwear Pairing Rules**\n\nYour footwear anchors the entire silhouette:\n\n• **White Leather Minimalist Sneakers**: Universal with chinos, shorts, relaxed denim, and unstructured suits. Keep them clean.\n• **Chocolate Brown / Tan Suede Loafers**: The masterclass choice for Navy, Olive, Beige, and Cream pants.\n• **Black Leather Derbies / Oxfords**: Mandatory for black or charcoal formal tailoring.\n• **The Belt-Shoe Anchor**: Ensure your belt leather closely matches your shoe leather in hue and finish.`,
      timestamp,
      chips: ['Match brown shoes', 'Shoes for wedding', 'Loafers with trousers'],
      colorSwatches: ['#FFFFFF', '#5C3E2A', '#141414', '#D7C4B7'],
    };
  }

  // Case 5: Olive Green
  if (query.includes('olive') || query.includes('green')) {
    return {
      id,
      sender: 'stylist',
      text: `🌿 **How to Style Olive & Sage Tones**\n\nOlive is one of fashion's most versatile "secret neutrals." It acts like denim—pairing with almost everything while feeling organic.\n\n**Top Pairings:**\n1. **Olive + Cashmere Cream / Beige**: An organic, quiet luxury masterclass.\n2. **Olive + Navy**: The complementary dialogue between botanical olive and maritime navy is timeless.\n3. **Olive + Rich Maroon**: The subtle warm-cool dialogue makes an unforgettable evening statement.\n\n**Footwear**: Tan/cognac suede loafers or clean white trainers work best.`,
      timestamp,
      chips: ['What shoes with olive?', 'Olive shirt outfit idea', 'Other earth tones'],
      colorSwatches: ['#5B6846', '#F5EFE6', '#1B2A4A', '#6B1D2F', '#D7C4B7'],
    };
  }

  // Case 6: Navy with Black
  if (query.includes('navy') && query.includes('black')) {
    return {
      id,
      sender: 'stylist',
      text: `🖤 **Can You Wear Navy with Black? Yes, with Intention.**\n\nOld rules claimed navy and black clash. Modern haute couture celebrates them together!\n\n**The Rule**: There must be clear contrast in shade or rich texture difference.\n• **Do**: Pair an inky Navy coat with tailored black wool trousers and black chelsea boots.\n• **Do**: Wear a navy silk-knit top with structured black pants.\n• **Don't**: Wear a very dark navy that looks like an "almost-black mistake" right next to pure black without texture difference.`,
      timestamp,
      chips: ['Navy suit shoes guide', 'Black trousers pairings', 'Minimalist palette'],
      colorSwatches: ['#1B2A4A', '#141414', '#FFFFFF', '#8E9196'],
    };
  }

  // Case 7: Wedding / Festive
  if (query.includes('wedding') || query.includes('traditional') || query.includes('reception') || query.includes('saree') || query.includes('kurta')) {
    return {
      id,
      sender: 'stylist',
      text: `✨ **Ceremonial & Wedding Styling Formula**\n\nFor celebratory occasions, rich texture and regal color depth take center stage:\n\n**For Traditional Wear:**\n• **Palette**: Royal Maroon, Raw Ivory, Deep Peacock Navy, or Emerald Green with antique gold (Zari) accents.\n• **Kurtas / Sherwanis**: Raw silk or Tussar silk paired with churidar or dhoti pants.\n• **Sarees / Lehengas**: Woven Kanjeevaram or Banarasi silk draped with balanced jewel tones.\n\n**Western Formal:**\n• Midnight tuxedo or charcoal three-piece suit with black patent oxfords.`,
      timestamp,
      chips: ['Traditional Indian look', 'Wedding color combinations', 'Accessories for wedding'],
      colorSwatches: ['#6B1D2F', '#F5EFE6', '#1B2A4A', '#C5A059'],
    };
  }

  // Fallback intelligent response
  return {
    id,
    sender: 'stylist',
    text: `✨ **Styling Insight for "${userInput}"**\n\nWhen curating an ensemble around this, follow VASTHRA's **3 Golden Dimensions**:\n\n1. **Color Contrast**: 1 focal statement hue balanced against 2 neutral anchors (White, Cream, Navy, Grey, or Black).\n2. **Texture Layering**: Combine flat weaves with rich textures (e.g., linen, knitwear, suede).\n3. **Sartorial Purpose**: Calibrate for the right dress code and footwear stance.\n\nAttach a clothing photo or pick an item from your digital wardrobe to analyze specific matches!`,
    timestamp,
    chips: [
      'Pick from my wardrobe',
      'Which shirt matches my trousers?',
      'Check color compatibility',
    ],
    colorSwatches: ['#F5EFE6', '#141414', '#1B2A4A', '#5B6846'],
  };
}
