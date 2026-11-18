import React, { useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BrandHeader } from '../../components/BrandHeader';
import { FilterTabs } from '../../components/FilterTabs';
import { OutfitCard } from '../../components/OutfitCard';
import { BorderRadius, Colors, Spacing } from '../../constants/theme';
import { removeSavedOutfit, saveOutfit } from '../../services/storage';
import { OutfitSuggestion } from '../../types';

const EXPLORE_LOOKBOOKS: OutfitSuggestion[] = [
  {
    id: 'exp-1',
    title: 'The Riviera Linen Masterpiece',
    subtitle: 'Quiet Luxury • Mediterranean Resort',
    occasion: 'Casual',
    style: 'Minimal',
    gender: 'men',
    compatibilityScore: 98,
    harmonyTitle: 'Tonal Earth & White Harmony',
    description: 'Crisp white camp-collar linen shirt draped with tailored beige chinos and chocolate suede penny loafers. The epitome of effortless European holiday tailoring.',
    pieces: [
      { type: 'Top', name: 'Camp-Collar Linen Shirt', colorName: 'White', colorHex: '#FFFFFF' },
      { type: 'Bottom', name: 'Pleated Chino Trousers', colorName: 'Beige', colorHex: '#D7C4B7' },
      { type: 'Shoes', name: 'Chocolate Suede Loafers', colorName: 'Brown', colorHex: '#5C3E2A' },
      { type: 'Accessory', name: 'Cognac Leather Watch', colorName: 'Brown', colorHex: '#5C3E2A' },
    ],
    shoesAdvice: 'Wear sockless with no-show bamboo liners. Keep suede softly brushed.',
    accessoriesAdvice: 'Tortoiseshell sunglasses and a braided tan belt.',
    stylingTips: [
      'Roll sleeve cuffs twice at the forearm.',
      'Slight relaxed ankle break on trousers.',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'exp-2',
    title: 'Imperial Raw Silk Sherwani',
    subtitle: 'Traditional Indian • Ceremonial Grandeur',
    occasion: 'Wedding',
    style: 'Traditional',
    gender: 'men',
    compatibilityScore: 99,
    harmonyTitle: 'Ceremonial Royal Contrast',
    description: 'Handwoven ivory tussar silk bandhgala adorned with royal maroon brocade stole and antique zari-embroidered mojaris.',
    pieces: [
      { type: 'Top', name: 'Tussar Silk Bandhgala', colorName: 'Cream', colorHex: '#F5EFE6' },
      { type: 'Bottom', name: 'Tailored Churidar Trousers', colorName: 'Maroon', colorHex: '#6B1D2F' },
      { type: 'Shoes', name: 'Zari Embroidered Mojaris', colorName: 'Beige', colorHex: '#D7C4B7' },
      { type: 'Accessory', name: 'Brocade Pashmina Stole', colorName: 'Maroon', colorHex: '#6B1D2F' },
    ],
    shoesAdvice: 'Handcrafted leather mojaris with soft padded insoles.',
    accessoriesAdvice: 'Antique brass lapel brooch and pearl-accented kalgi.',
    stylingTips: ['Drape stole in a structured diagonal waterfall across the chest.'],
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'exp-3',
    title: 'The Wall Street Sartorial',
    subtitle: 'Executive Poise • Bespoke Wool',
    occasion: 'Office',
    style: 'Formal',
    gender: 'women',
    compatibilityScore: 96,
    harmonyTitle: 'Tailored Monochromatic Anchor',
    description: 'Pristine silk poplin blouse framed by high-waisted midnight navy trousers and pointed almond-toe pumps.',
    pieces: [
      { type: 'Top', name: 'Silk Poplin Blouse', colorName: 'White', colorHex: '#FFFFFF' },
      { type: 'Bottom', name: 'Pleated High-Rise Trousers', colorName: 'Navy', colorHex: '#1B2A4A' },
      { type: 'Shoes', name: 'Cognac Leather Pumps', colorName: 'Brown', colorHex: '#5C3E2A' },
      { type: 'Accessory', name: 'Italian Leather Portfolio', colorName: 'Brown', colorHex: '#5C3E2A' },
    ],
    shoesAdvice: 'Buffed leather with 65mm comfortable block or stiletto heel.',
    accessoriesAdvice: 'Gold minimalist huggie earrings and sapphire ring.',
    stylingTips: ['Full tuck with structured narrow leather belt.'],
    imageUrl: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'exp-4',
    title: 'Tokyo Streetwear Layer',
    subtitle: 'Urban Architecture • Oversized Geometry',
    occasion: 'Casual',
    style: 'Streetwear',
    gender: 'unisex',
    compatibilityScore: 94,
    harmonyTitle: 'High-Contrast Monolith',
    description: 'Heavyweight boxy black crewneck layered over washed grey relaxed denim with chunky lug-sole leather derbies.',
    pieces: [
      { type: 'Top', name: 'Boxy Heavyweight Tee', colorName: 'Black', colorHex: '#141414' },
      { type: 'Bottom', name: 'Washed Grey Relaxed Denim', colorName: 'Grey', colorHex: '#8E9196' },
      { type: 'Shoes', name: 'Commando-Sole Derby Shoes', colorName: 'Black', colorHex: '#141414' },
      { type: 'Accessory', name: 'Silver Heavy Curb Chain', colorName: 'Grey', colorHex: '#8E9196' },
    ],
    shoesAdvice: 'Chunky lug soles or pristine retro monochromatic skate sneakers.',
    accessoriesAdvice: 'Matte silver signet ring and nylon tactical crossbody bag.',
    stylingTips: ['Drop shoulder seam should hit 2 inches below natural acromion.'],
    imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'exp-5',
    title: 'Nocturnal Cocktail Chic',
    subtitle: 'Evening Magnetic Glamour',
    occasion: 'Party',
    style: 'Smart Casual',
    gender: 'women',
    compatibilityScore: 97,
    harmonyTitle: 'Emerald & Velvet Seduction',
    description: 'Satin draped emerald blouse paired with tailored jet black cigarette pants and strappy metallic sandals.',
    pieces: [
      { type: 'Top', name: 'Draped Satin Blouse', colorName: 'Green', colorHex: '#2D6A4F' },
      { type: 'Bottom', name: 'Tailored Ankle Trousers', colorName: 'Black', colorHex: '#141414' },
      { type: 'Shoes', name: 'Strappy Minimalist Stilettos', colorName: 'Black', colorHex: '#141414' },
      { type: 'Accessory', name: 'Gold Sculptural Minaudière', colorName: 'Yellow', colorHex: '#E5B238' },
    ],
    shoesAdvice: 'Clean ankle-strap sandals with metallic or lacquer black finish.',
    accessoriesAdvice: 'Champagne gold sculptural clutch and statement drop earrings.',
    stylingTips: ['Sweep hair back to showcase the jewel-toned neckline.'],
    imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'exp-6',
    title: 'Kanjeevaram Festive Saree',
    subtitle: 'Heritage Weaves • Timeless Opulence',
    occasion: 'Wedding',
    style: 'Traditional',
    gender: 'women',
    compatibilityScore: 99,
    harmonyTitle: 'Festive Jewel Elegance',
    description: 'Heritage pure mulberry silk saree in deep maroon with antique golden zari pallu and contrasting jade emerald blouse.',
    pieces: [
      { type: 'Top', name: 'Zari Border Silk Blouse', colorName: 'Green', colorHex: '#2D6A4F' },
      { type: 'Bottom', name: 'Pure Kanjeevaram Silk Saree', colorName: 'Maroon', colorHex: '#6B1D2F' },
      { type: 'Shoes', name: 'Handcrafted Zardozi Wedges', colorName: 'Beige', colorHex: '#D7C4B7' },
      { type: 'Accessory', name: 'Temple Jewelry Choker', colorName: 'Yellow', colorHex: '#E5B238' },
    ],
    shoesAdvice: 'Comfortable zardozi-embroidered wedge juttis.',
    accessoriesAdvice: 'Temple jewellery choker, jhumkas, and jasmine gajra.',
    stylingTips: ['Pin pleats neatly at shoulder with antique gold safety pin.'],
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
  },
];

export default function ExploreScreen() {
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const filterTabs = [
    'All',
    'Casual',
    'Formal',
    'Streetwear',
    'Traditional',
    'Partywear',
    'Minimal',
  ];

  const filteredLookbooks = EXPLORE_LOOKBOOKS.filter((outfit) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Casual') return outfit.occasion === 'Casual';
    if (activeFilter === 'Formal') return outfit.occasion === 'Office' || outfit.style === 'Formal';
    if (activeFilter === 'Streetwear') return outfit.style === 'Streetwear';
    if (activeFilter === 'Traditional') return outfit.style === 'Traditional' || outfit.occasion === 'Wedding';
    if (activeFilter === 'Partywear') return outfit.occasion === 'Party';
    if (activeFilter === 'Minimal') return outfit.style === 'Minimal';
    return true;
  });

  const handleSaveToggle = async (outfit: OutfitSuggestion, isSaved: boolean) => {
    if (isSaved) {
      await saveOutfit(outfit);
    } else {
      await removeSavedOutfit(outfit.id);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BrandHeader
        title="VASTHRA"
        subtitle="Explore Lookbooks"
        rightAction="saved"
      />

      {/* FILTER TABS */}
      <FilterTabs
        tabs={filterTabs}
        activeTab={activeFilter}
        onSelectTab={setActiveFilter}
      />

      {/* LOOKBOOKS LIST */}
      <FlatList
        data={filteredLookbooks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <OutfitCard
            outfit={item}
            onSaveToggle={handleSaveToggle}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
});
