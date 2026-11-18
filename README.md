# VASTHRA — Wear Your Confidence.

**VASTHRA** is a luxury AI-powered fashion styling and outfit recommendation mobile application designed for men, women, and unisex tailoring. It empowers users to discover matching shirts, T-shirts, tops, pants, jeans, skirts, shoes, and accessories using real color theory, generate occasion-specific ensembles, curate their personal digital wardrobe, and chat with an intelligent fashion concierge.

---

## 🌟 Visual & Sartorial Aesthetic

VASTHRA is crafted around high-end quiet luxury and modern haute couture principles:
- **Warm Ivory & Cream Canvases**: `#FBF9F5`, `#F5EFE6`, `#FFFFFF`
- **Charcoal & Obsidian Typography**: `#141414`, `#5A544C`
- **Brushed Champagne Gold & Earth Accents**: `#C5A059`, `#B86A4C`, `#5B6846`, `#D7C4B7`
- **Curated Editorial Imagery**: Real high-resolution fashion photography
- **Tactile Polish**: Integrated haptic feedback on taps, selections, and saves.

---

## 📱 Implemented Screens & Features

### 1. Splash & Brand Experience
- Luxury serif wordmark **VASTHRA**.
- Tagline: *Wear Your Confidence*.
- Elegant minimal entry experience.

### 2. Onboarding Flow (`/onboarding`)
- **Step 1**: Brand philosophy & haute couture vision.
- **Step 2**: Styling silhouette selection (**Men's Fashion**, **Women's Fashion**, **Unisex & Contemporary**).
- **Step 3**: Interactive 17-color palette selector.
- **Step 4**: Aesthetic personas (**Minimal**, **Formal**, **Streetwear**, **Traditional**, **Smart Casual**).
- Persists user preferences locally into `AsyncStorage`.

### 3. Home Screen (`/(tabs)/index`)
- Personalized greeting dynamically calibrated to the time of day.
- **Daily Inspiration**: Curated look of the day with score badge, pieces breakdown, color swatches, and 1-tap save.
- **Quick Action Cards**:
  - **Match My Outfit** (featured hero card)
  - **AI Outfit Generator**
  - **My Digital Wardrobe**
  - **AI Fashion Stylist**
- **Trending Color Combos**: Curated triadic swatches (The Riviera Classic, Botanical Warmth, Nocturnal Contrast, Ceremonial Majesty).

### 4. Match My Outfit (`/(tabs)/match`) — *The Core Engine*
- Independent color selection for:
  - **Shirt / T-shirt / Top**
  - **Pants / Jeans / Trousers / Skirt**
  - **Shoes / Footwear**
  - **Optional Accessories / Accent**
- Full 17-colour spectrum: **White, Black, Beige, Cream, Brown, Grey, Navy, Blue, Olive, Green, Red, Maroon, Pink, Lavender, Purple, Yellow, Orange**.
- Selectable **Occasions**: *Casual, College, Office, Party, Wedding, Travel, Date*.
- Selectable **Styles**: *Minimal, Formal, Streetwear, Traditional, Smart Casual*.
- **Live Color Harmony Outputs**:
  - Mathematical compatibility score (0 - 100).
  - Rating tiers: **EXCELLENT**, **GOOD**, **AVERAGE**, **POOR**.
  - Harmony title (*Timeless Neutral Elegance*, *Anchor Contrast Harmony*, *Botanical Earth Resonance*, etc.).
  - Color theory breakdown & visual hierarchy explanation.
  - Individual item synergy (Top & Bottom coordination, Footwear anchor, Accessory dialogue).
  - Occasion suitability evaluation.
  - Recommended accessory additions.
  - **Better alternative combinations** with an instant 1-tap **"Apply This Combination"** button.
  - **Save Outfit** button storing the look directly to favorites.

### 5. AI Outfit Generator (`/generator`)
- Filter by gender silhouette, occasion, aesthetic style, and preferred target colors.
- Generates 3+ cohesive ensembles with complete piece breakdowns, shoes advice, accessory tips, and styling pro-tips.
- 1-tap bookmarking to Saved Outfits.

### 6. My Digital Wardrobe (`/(tabs)/wardrobe`)
- Camera & photo library uploads powered by `expo-image-picker`.
- Add garment name, category (*Tops, Bottoms, Shoes, Outerwear, Accessories, Traditional*), dominant color, style, and occasion.
- Filter by category pills or color.
- Edit, favorite, and remove items with confirmation dialogues.
- Instant "Match Palette" shortcut to feed wardrobe pieces directly into the color matching engine.
- Seeded with 6 premium fashion pieces on initial launch.

### 7. AI Fashion Stylist (`/stylist`)
- Interactive concierge chat interface with quick suggestion chips:
  - *"What goes with Olive green?"*
  - *"Can I wear navy with black shoes?"*
  - *"Summer wedding outfit ideas"*
  - *"Smart casual office guidelines"*
- Color swatch previews delivered in stylist responses.
- Support for garment image selection & styling methodology.
- Honest, working local rule-based fashion knowledge base (no deceptive fake AI promises).

### 8. Explore Lookbooks (`/(tabs)/explore`)
- Curated editorial fashion lookbooks covering:
  - *Casual Riviera Linen*
  - *Imperial Raw Silk Sherwani (Traditional Indian)*
  - *Wall Street Executive Sartorial*
  - *Tokyo Architectural Streetwear*
  - *Nocturnal Cocktail Chic*
  - *Kanjeevaram Festive Saree*
- Filter by style tabs and bookmark favorites.

### 9. Saved Outfits (`/saved`)
- View and manage all favorited outfits and saved color matches.
- Filter by style aesthetic with detailed expandable advice.

### 10. Profile & Settings (`/(tabs)/profile`)
- Update name, styling preference, favorite palette, and fashion personas.
- Real-time wardrobe statistics and direct links to features.

---

## 🎨 Reusable Color Theory Algorithm (`services/colorTheory.ts`)

The scoring engine is a dedicated, deterministic module implementing real color wheel principles:
1. **Luminosity & Contrast**: Analyzes light/dark distribution between torso and lower body.
2. **Color Harmony Types**:
   - *Monochromatic*: Same hue family across varied values/textures.
   - *Neutral Anchor + Accent*: Universal neutrals (White, Cream, Grey, Black, Navy) grounding hero hues.
   - *Earth Tone Cohesion*: Botanical synergies (Olive, Brown, Beige, Cream).
   - *Complementary Contrasts*: Opposing color wheel temperatures (Navy + Tan, Olive + Maroon).
   - *Saturation Conflict Detection*: Penalizes ungrounded competing neon/bright clashes.
3. **Shoe Anchoring Rule**: Evaluates footwear neutrality, formal dress codes, and shoe-belt coordination.
4. **Occasion Matrix**: Contextual rules checking corporate solemnity vs. wedding opulence vs. streetwear freedom.

---

## 🛠 Tech Stack

- **Framework**: React Native 0.88, Expo SDK 58
- **Navigation**: Expo Router (File-based routing with Bottom Tabs & Stacks)
- **Language**: TypeScript (Strict mode, zero `any` leaks)
- **Local Storage**: `@react-native-async-storage/async-storage`
- **Media**: `expo-image-picker`
- **Feedback**: `expo-haptics`
- **Icons**: `@expo/vector-icons` (Ionicons)
- **Styling**: Platform-agnostic responsive design with custom luxury typography and color tokens.

---

## 🚀 How to Run the Application

### 1. Set Active Workspace
Open this folder in your terminal or editor:
```bash
cd "C:\Users\Prajwal M\.gemini\antigravity\scratch\vasthra"
```

### 2. Start the Development Server
```bash
npm start
```
or
```bash
npx expo start
```

### 3. Run on Target Platform
- **Android**: Press `a` in the terminal or run `npm run android`
- **iOS**: Press `i` in the terminal or run `npm run ios` (or scan QR code with Expo Go on iOS)
- **Web Preview**: Press `w` in the terminal or run `npm run web`

---

## 🧪 Verification & Build Status

- **TypeScript Compilation**: `npx tsc --noEmit` passed with **0 errors**.
- **Metro Bundle Export**: `npx expo export` successfully compiled **1,261 iOS modules**, **1,256 Android modules**, and **907 Web modules**.
