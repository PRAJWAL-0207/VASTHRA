export const Colors = {
  // Brand Backgrounds
  background: '#FBF9F5',        // Warm ivory
  surface: '#FFFFFF',           // Crisp white card
  surfaceElevated: '#F5F2EB',   // Subtle cream card
  surfaceSubtle: '#EFECE5',     // Soft linen
  surfaceBorder: '#E5DFD5',     // Elegant border

  // Typography
  textPrimary: '#141414',       // Deep rich charcoal
  textSecondary: '#5A544C',     // Muted warm graphite
  textMuted: '#8E877D',         // Subtle taupe grey
  textLight: '#FAF8F5',         // Inverted text on dark chips

  // Luxury Fashion Accents
  primary: '#1A1816',           // Royal Obsidian / Midnight
  primaryGold: '#C5A059',       // Brushed Champagne Gold
  goldLight: '#F3EAD8',         // Champagne mist
  accentTerracotta: '#B86A4C',  // Warm Earth Terracotta
  accentOlive: '#6B7A60',       // Muted Sage Olive
  accentNavy: '#233246',        // Parisian Navy
  accentBeige: '#D4C3B3',       // Cashmere Beige
  accentTaupe: '#8C7A6B',       // Warm Taupe

  // Status & Scores
  scoreExcellent: '#2E6F40',    // Regal Emerald
  scoreGood: '#966F23',         // Antique Amber
  scoreAverage: '#BD6B2D',      // Warm Ochre
  scorePoor: '#A33333',         // Ruby / Burgundy

  // Component colors
  cardShadow: 'rgba(30, 26, 21, 0.06)',
  cardShadowStrong: 'rgba(30, 26, 21, 0.12)',
  divider: '#EBE5DC',
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#EFEBE4',
  tabActive: '#1A1816',
  tabInactive: '#9B9488',
  badgeBg: '#F3EFEA',
  inputBg: '#F7F4EE',
  inputBorder: '#DFD8CD',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
};

export const Shadows = {
  subtle: {
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 4,
  },
  floating: {
    shadowColor: Colors.cardShadowStrong,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
};
