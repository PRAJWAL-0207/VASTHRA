import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { BrandHeader } from '../../components/BrandHeader';
import { ColorChip } from '../../components/ColorChip';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScoreGauge } from '../../components/ScoreGauge';
import {
  FASHION_COLORS,
  getColorById,
  getSlotForCategory,
  OCCASIONS,
  STYLES,
} from '../../constants/colors';
import { BorderRadius, Colors, Shadows, Spacing } from '../../constants/theme';
import { evaluateColorMatch } from '../../services/colorTheory';
import { getWardrobeItems, saveOutfit } from '../../services/storage';
import {
  BetterAlternative,
  MatchResult,
  OccasionType,
  StyleType,
  WardrobeItem,
} from '../../types';

interface WardrobeAlternative {
  title: string;
  description: string;
  topItem: WardrobeItem;
  bottomItem: WardrobeItem;
  shoesItem: WardrobeItem;
  accessoryItem?: WardrobeItem;
  score: number;
  harmonyType: string;
}

export default function MatchScreen() {
  // Mode: 'wardrobe' (Real clothes) or 'palette' (Color chips)
  const [matchMode, setMatchMode] = useState<'wardrobe' | 'palette'>('wardrobe');

  // Wardrobe Items Loaded
  const [wardrobeList, setWardrobeList] = useState<WardrobeItem[]>([]);

  // Selected Real Wardrobe Pieces
  const [selectedTop, setSelectedTop] = useState<WardrobeItem | null>(null);
  const [selectedBottom, setSelectedBottom] = useState<WardrobeItem | null>(null);
  const [selectedShoes, setSelectedShoes] = useState<WardrobeItem | null>(null);
  const [selectedAccessory, setSelectedAccessory] = useState<WardrobeItem | null>(null);

  // Fallback / Palette Colors
  const [topColor, setTopColor] = useState('white');
  const [bottomColor, setBottomColor] = useState('navy');
  const [shoesColor, setShoesColor] = useState('brown');
  const [accessoryColor, setAccessoryColor] = useState<string | undefined>('brown');
  const [occasion, setOccasion] = useState<OccasionType>('Office');
  const [style, setStyle] = useState<StyleType>('Smart Casual');

  // Active item selector tab for palette mode: 'top' | 'bottom' | 'shoes' | 'accessory'
  const [activeItemTab, setActiveItemTab] = useState<'top' | 'bottom' | 'shoes' | 'accessory'>('top');

  // Wardrobe Picker Modal State
  const [isWardrobeModalOpen, setIsWardrobeModalOpen] = useState(false);
  const [pickerTargetSlot, setPickerTargetSlot] = useState<'top' | 'bottom' | 'shoes' | 'accessory'>('top');
  const [pickerSearch, setPickerSearch] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load Wardrobe items
  useEffect(() => {
    async function load() {
      const items = await getWardrobeItems();
      setWardrobeList(items);

      // Auto-populate default slots if items exist
      if (items.length > 0) {
        const firstTop = items.find((i) => getSlotForCategory(i.category) === 'top') || items[0];
        const firstBottom = items.find((i) => getSlotForCategory(i.category) === 'bottom');
        const firstShoe = items.find((i) => getSlotForCategory(i.category) === 'shoes');
        const firstAcc = items.find((i) => getSlotForCategory(i.category) === 'accessory');

        if (firstTop) {
          setSelectedTop(firstTop);
          const cId = getColorById(firstTop.color).id;
          setTopColor(cId);
        }
        if (firstBottom) {
          setSelectedBottom(firstBottom);
          const cId = getColorById(firstBottom.color).id;
          setBottomColor(cId);
        }
        if (firstShoe) {
          setSelectedShoes(firstShoe);
          const cId = getColorById(firstShoe.color).id;
          setShoesColor(cId);
        }
        if (firstAcc) {
          setSelectedAccessory(firstAcc);
          const cId = getColorById(firstAcc.color).id;
          setAccessoryColor(cId);
        }
      }
    }
    load();
  }, []);

  // Compute Active Match Result using existing colourTheory.ts evaluateColorMatch
  const matchResult: MatchResult = useMemo(() => {
    const tCol = selectedTop ? getColorById(selectedTop.color).id : topColor;
    const bCol = selectedBottom ? getColorById(selectedBottom.color).id : bottomColor;
    const sCol = selectedShoes ? getColorById(selectedShoes.color).id : shoesColor;
    const aCol = selectedAccessory
      ? getColorById(selectedAccessory.color).id
      : accessoryColor === 'none'
      ? undefined
      : accessoryColor;

    return evaluateColorMatch({
      topColor: tCol,
      bottomColor: bCol,
      shoesColor: sCol,
      accessoryColor: aCol,
      occasion,
      style,
      topItem: selectedTop || undefined,
      bottomItem: selectedBottom || undefined,
      shoesItem: selectedShoes || undefined,
      accessoryItem: selectedAccessory || undefined,
    });
  }, [
    selectedTop,
    selectedBottom,
    selectedShoes,
    selectedAccessory,
    topColor,
    bottomColor,
    shoesColor,
    accessoryColor,
    occasion,
    style,
  ]);

  // Compute "Better combinations from your wardrobe"
  const wardrobeAlternatives: WardrobeAlternative[] = useMemo(() => {
    if (wardrobeList.length < 2) return [];

    const tops = wardrobeList.filter((i) => getSlotForCategory(i.category) === 'top');
    const bottoms = wardrobeList.filter((i) => getSlotForCategory(i.category) === 'bottom');
    const shoes = wardrobeList.filter((i) => getSlotForCategory(i.category) === 'shoes');
    const accessories = wardrobeList.filter((i) => getSlotForCategory(i.category) === 'accessory');

    if (tops.length === 0 || bottoms.length === 0) return [];

    const currentScore = matchResult.score;
    const alternatives: WardrobeAlternative[] = [];

    // Test smart combinations from wardrobe
    for (const t of tops) {
      for (const b of bottoms) {
        // Skip exact current combination
        if (selectedTop?.id === t.id && selectedBottom?.id === b.id) continue;

        for (const s of shoes.length > 0 ? shoes : [undefined]) {
          const tCol = getColorById(t.color).id;
          const bCol = getColorById(b.color).id;
          const sCol = s ? getColorById(s.color).id : shoesColor;

          const evaluated = evaluateColorMatch({
            topColor: tCol,
            bottomColor: bCol,
            shoesColor: sCol,
            occasion,
            style,
          });

          // If combination has higher or excellent score
          if (evaluated.score >= 88 || evaluated.score > currentScore) {
            alternatives.push({
              title: `${t.name} + ${b.name}`,
              description: evaluated.itemFeedback.topAndBottom,
              topItem: t,
              bottomItem: b,
              shoesItem: s || selectedShoes || {
                id: 'shoe-virt',
                name: 'Neutral Footwear',
                category: 'Shoes',
                color: 'White',
                colorHex: '#FFFFFF',
                style: 'Smart Casual',
                occasion: 'Casual',
                imageUri: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=600&q=80',
                createdAt: Date.now(),
              },
              score: evaluated.score,
              harmonyType: evaluated.harmonyType,
            });
          }

          if (alternatives.length >= 4) break;
        }
        if (alternatives.length >= 4) break;
      }
      if (alternatives.length >= 4) break;
    }

    return alternatives.sort((a, b) => b.score - a.score).slice(0, 3);
  }, [wardrobeList, selectedTop, selectedBottom, selectedShoes, occasion, style, matchResult.score, shoesColor]);

  // Open Wardrobe Picker
  const handleOpenPicker = (slot: 'top' | 'bottom' | 'shoes' | 'accessory') => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setPickerTargetSlot(slot);
    setPickerSearch('');
    setIsWardrobeModalOpen(true);
  };

  // Select a wardrobe piece for a slot
  const handleSelectWardrobeItem = (item: WardrobeItem) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const colId = getColorById(item.color).id;

    if (pickerTargetSlot === 'top') {
      setSelectedTop(item);
      setTopColor(colId);
    } else if (pickerTargetSlot === 'bottom') {
      setSelectedBottom(item);
      setBottomColor(colId);
    } else if (pickerTargetSlot === 'shoes') {
      setSelectedShoes(item);
      setShoesColor(colId);
    } else if (pickerTargetSlot === 'accessory') {
      setSelectedAccessory(item);
      setAccessoryColor(colId);
    }

    setIsWardrobeModalOpen(false);
    setSavedSuccess(false);
  };

  // Clear slot
  const handleClearSlot = (slot: 'top' | 'bottom' | 'shoes' | 'accessory') => {
    if (slot === 'top') setSelectedTop(null);
    if (slot === 'bottom') setSelectedBottom(null);
    if (slot === 'shoes') setSelectedShoes(null);
    if (slot === 'accessory') {
      setSelectedAccessory(null);
      setAccessoryColor('none');
    }
    setSavedSuccess(false);
  };

  // Equip full combination from wardrobe alternative
  const handleApplyWardrobeAlt = (alt: WardrobeAlternative) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setSelectedTop(alt.topItem);
    setTopColor(getColorById(alt.topItem.color).id);

    setSelectedBottom(alt.bottomItem);
    setBottomColor(getColorById(alt.bottomItem.color).id);

    if (alt.shoesItem) {
      setSelectedShoes(alt.shoesItem);
      setShoesColor(getColorById(alt.shoesItem.color).id);
    }

    setSavedSuccess(false);
  };

  // Apply palette alternative
  const applyAlternative = (alt: BetterAlternative) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setTopColor(alt.topColor);
    setBottomColor(alt.bottomColor);
    setShoesColor(alt.shoesColor);
    if (alt.accessoryColor) setAccessoryColor(alt.accessoryColor);
    setSavedSuccess(false);
  };

  // Save outfit with actual photos & piece references
  const handleSaveCombination = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}

    const topObj = getColorById(topColor);
    const btmObj = getColorById(bottomColor);
    const shoeObj = getColorById(shoesColor);

    const mainImg =
      selectedTop?.imageUri ||
      selectedBottom?.imageUri ||
      selectedShoes?.imageUri ||
      'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80';

    await saveOutfit({
      id: `match-saved-${Date.now()}`,
      title: selectedTop && selectedBottom
        ? `${selectedTop.name} & ${selectedBottom.name}`
        : `${topObj.name} & ${btmObj.name} Harmony`,
      subtitle: `${style} • ${occasion}`,
      occasion,
      style,
      gender: 'unisex',
      compatibilityScore: matchResult.score,
      harmonyTitle: matchResult.harmonyType,
      description: matchResult.explanation,
      pieces: [
        {
          type: 'Top',
          name: selectedTop?.name || 'Top / Shirt',
          colorName: topObj.name,
          colorHex: topObj.hex,
          imageUri: selectedTop?.imageUri,
          wardrobeItemId: selectedTop?.id,
        },
        {
          type: 'Bottom',
          name: selectedBottom?.name || 'Bottoms / Trousers',
          colorName: btmObj.name,
          colorHex: btmObj.hex,
          imageUri: selectedBottom?.imageUri,
          wardrobeItemId: selectedBottom?.id,
        },
        {
          type: 'Shoes',
          name: selectedShoes?.name || 'Footwear',
          colorName: shoeObj.name,
          colorHex: shoeObj.hex,
          imageUri: selectedShoes?.imageUri,
          wardrobeItemId: selectedShoes?.id,
        },
      ],
      shoesAdvice: matchResult.itemFeedback.shoeAnchor,
      accessoriesAdvice: matchResult.accessoryRecommendations[0] || 'Understated timepiece and matching leather belt.',
      stylingTips: [
        matchResult.itemFeedback.topAndBottom,
        matchResult.occasionSuitability.comment,
      ],
      imageUrl: mainImg,
      isSaved: true,
      isFromWardrobe: !!(selectedTop || selectedBottom || selectedShoes),
    });

    setSavedSuccess(true);
  };

  // Filter items in Wardrobe Picker Modal
  const modalEligibleItems = wardrobeList.filter((item) => {
    const slot = getSlotForCategory(item.category);
    const matchesSlot = slot === pickerTargetSlot;
    const q = pickerSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.color.toLowerCase().includes(q) ||
      (item.pattern && item.pattern.toLowerCase().includes(q));
    return matchesSlot && matchesSearch;
  });

  const topC = getColorById(topColor);
  const bottomC = getColorById(bottomColor);
  const shoesC = getColorById(shoesColor);
  const accessoryC = accessoryColor && accessoryColor !== 'none' ? getColorById(accessoryColor) : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <BrandHeader
        title="VASTHRA"
        subtitle="Match My Outfit"
        rightAction="saved"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* MODE SWITCHER: MY WARDROBE vs COLOR PALETTE */}
        <View style={styles.modeSwitchCard}>
          <TouchableOpacity
            style={[
              styles.modeTab,
              matchMode === 'wardrobe' && styles.modeTabActive,
            ]}
            onPress={() => {
              try {
                Haptics.selectionAsync();
              } catch {}
              setMatchMode('wardrobe');
            }}
          >
            <Ionicons
              name="shirt"
              size={15}
              color={matchMode === 'wardrobe' ? '#FFFFFF' : Colors.textPrimary}
            />
            <Text
              style={[
                styles.modeTabText,
                matchMode === 'wardrobe' && styles.modeTabTextActive,
              ]}
            >
              My Real Clothes ({wardrobeList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeTab,
              matchMode === 'palette' && styles.modeTabActive,
            ]}
            onPress={() => {
              try {
                Haptics.selectionAsync();
              } catch {}
              setMatchMode('palette');
            }}
          >
            <Ionicons
              name="color-palette"
              size={15}
              color={matchMode === 'palette' ? '#FFFFFF' : Colors.textPrimary}
            />
            <Text
              style={[
                styles.modeTabText,
                matchMode === 'palette' && styles.modeTabTextActive,
              ]}
            >
              Palette Studio
            </Text>
          </TouchableOpacity>
        </View>

        {/* ============================================================== */}
        {/* MODE A: REAL DIGITAL WARDROBE CLOTHES MATCHING                */}
        {/* ============================================================== */}
        {matchMode === 'wardrobe' && (
          <View style={styles.wardrobeMatchSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>Selected Clothes</Text>
              <Text style={styles.sectionHeaderSub}>
                Tap any slot to equip pieces from your wardrobe
              </Text>
            </View>

            {/* REAL CLOTHES ENSEMBLE GRID (4 SLOTS) */}
            <View style={styles.wardrobeSlotsGrid}>
              {/* TOP / UPPER SLOT */}
              <WardrobeSlotCard
                title="Top / Upper"
                item={selectedTop}
                fallbackColor={topC}
                icon="shirt-outline"
                onPress={() => handleOpenPicker('top')}
                onClear={() => handleClearSlot('top')}
              />

              {/* BOTTOM / LOWER SLOT */}
              <WardrobeSlotCard
                title="Bottoms"
                item={selectedBottom}
                fallbackColor={bottomC}
                icon="trail-sign-outline"
                onPress={() => handleOpenPicker('bottom')}
                onClear={() => handleClearSlot('bottom')}
              />

              {/* SHOES SLOT */}
              <WardrobeSlotCard
                title="Footwear"
                item={selectedShoes}
                fallbackColor={shoesC}
                icon="footsteps-outline"
                onPress={() => handleOpenPicker('shoes')}
                onClear={() => handleClearSlot('shoes')}
              />

              {/* ACCESSORY SLOT */}
              <WardrobeSlotCard
                title="Accessory"
                item={selectedAccessory}
                fallbackColor={accessoryC}
                icon="watch-outline"
                optional
                onPress={() => handleOpenPicker('accessory')}
                onClear={() => handleClearSlot('accessory')}
              />
            </View>

            {/* REAL CLOTHES OUTFIT LOOKBOOK PREVIEW */}
            {(selectedTop || selectedBottom || selectedShoes) && (
              <View style={styles.lookbookPreviewCard}>
                <Text style={styles.lookbookTitle}>Active Outfit Silhouette</Text>
                <View style={styles.lookbookPhotosRow}>
                  {selectedTop && (
                    <View style={styles.lookbookPhotoFrame}>
                      <Image source={{ uri: selectedTop.imageUri }} style={styles.lookbookImg} />
                      <Text numberOfLines={1} style={styles.lookbookCaption}>
                        {selectedTop.name}
                      </Text>
                    </View>
                  )}
                  {selectedBottom && (
                    <View style={styles.lookbookPhotoFrame}>
                      <Image source={{ uri: selectedBottom.imageUri }} style={styles.lookbookImg} />
                      <Text numberOfLines={1} style={styles.lookbookCaption}>
                        {selectedBottom.name}
                      </Text>
                    </View>
                  )}
                  {selectedShoes && (
                    <View style={styles.lookbookPhotoFrame}>
                      <Image source={{ uri: selectedShoes.imageUri }} style={styles.lookbookImg} />
                      <Text numberOfLines={1} style={styles.lookbookCaption}>
                        {selectedShoes.name}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        )}

        {/* ============================================================== */}
        {/* MODE B: FREE COLOR PALETTE STUDIO SELECTOR                    */}
        {/* ============================================================== */}
        {matchMode === 'palette' && (
          <View style={styles.paletteModeSection}>
            {/* ACTIVE COLOR PALETTE MANNEQUIN ROW */}
            <View style={styles.mannequinCard}>
              <Text style={styles.mannequinTitle}>Active Color Palette</Text>
              <View style={styles.paletteDisplayRow}>
                {/* Top Swatch */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setActiveItemTab('top')}
                  style={[
                    styles.itemSlot,
                    activeItemTab === 'top' && styles.itemSlotActive,
                  ]}
                >
                  <View
                    style={[
                      styles.slotColorCircle,
                      { backgroundColor: topC.hex },
                      (topC.hex === '#FFFFFF' || topC.hex === '#F5EFE6') && styles.lightBorder,
                    ]}
                  >
                    <Ionicons name="shirt-outline" size={16} color={topC.textHex} />
                  </View>
                  <Text style={styles.slotLabel}>Top</Text>
                  <Text style={styles.slotValue}>{topC.name}</Text>
                </TouchableOpacity>

                <Ionicons name="add" size={16} color={Colors.textMuted} />

                {/* Bottom Swatch */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setActiveItemTab('bottom')}
                  style={[
                    styles.itemSlot,
                    activeItemTab === 'bottom' && styles.itemSlotActive,
                  ]}
                >
                  <View
                    style={[
                      styles.slotColorCircle,
                      { backgroundColor: bottomC.hex },
                      (bottomC.hex === '#FFFFFF' || bottomC.hex === '#F5EFE6') && styles.lightBorder,
                    ]}
                  >
                    <Ionicons name="trail-sign-outline" size={16} color={bottomC.textHex} />
                  </View>
                  <Text style={styles.slotLabel}>Bottom</Text>
                  <Text style={styles.slotValue}>{bottomC.name}</Text>
                </TouchableOpacity>

                <Ionicons name="add" size={16} color={Colors.textMuted} />

                {/* Shoes Swatch */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setActiveItemTab('shoes')}
                  style={[
                    styles.itemSlot,
                    activeItemTab === 'shoes' && styles.itemSlotActive,
                  ]}
                >
                  <View
                    style={[
                      styles.slotColorCircle,
                      { backgroundColor: shoesC.hex },
                      (shoesC.hex === '#FFFFFF' || shoesC.hex === '#F5EFE6') && styles.lightBorder,
                    ]}
                  >
                    <Ionicons name="footsteps-outline" size={16} color={shoesC.textHex} />
                  </View>
                  <Text style={styles.slotLabel}>Shoes</Text>
                  <Text style={styles.slotValue}>{shoesC.name}</Text>
                </TouchableOpacity>

                <Ionicons name="add" size={16} color={Colors.textMuted} />

                {/* Accessory Swatch */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setActiveItemTab('accessory')}
                  style={[
                    styles.itemSlot,
                    activeItemTab === 'accessory' && styles.itemSlotActive,
                  ]}
                >
                  <View
                    style={[
                      styles.slotColorCircle,
                      { backgroundColor: accessoryC ? accessoryC.hex : '#EFECE6' },
                      accessoryC && (accessoryC.hex === '#FFFFFF' || accessoryC.hex === '#F5EFE6') && styles.lightBorder,
                    ]}
                  >
                    <Ionicons
                      name="watch-outline"
                      size={16}
                      color={accessoryC ? accessoryC.textHex : Colors.textMuted}
                    />
                  </View>
                  <Text style={styles.slotLabel}>Accent</Text>
                  <Text style={styles.slotValue}>{accessoryC ? accessoryC.name : 'None'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* SELECTOR TABS: Top, Bottom, Shoes, Accessory */}
            <View style={styles.selectorTabRow}>
              {[
                { id: 'top' as const, label: 'Shirt / Top' },
                { id: 'bottom' as const, label: 'Pants / Bottom' },
                { id: 'shoes' as const, label: 'Shoes' },
                { id: 'accessory' as const, label: 'Accessories' },
              ].map((tab) => {
                const isActive = activeItemTab === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => {
                      try {
                        Haptics.selectionAsync();
                      } catch {}
                      setActiveItemTab(tab.id);
                    }}
                    style={[
                      styles.itemSelectorTab,
                      isActive && styles.itemSelectorTabActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.itemSelectorTabText,
                        isActive && styles.itemSelectorTabTextActive,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 17 COLOR OPTIONS CAROUSEL */}
            <View style={styles.paletteSection}>
              <Text style={styles.paletteSubhead}>
                Pick Color for {activeItemTab.toUpperCase()}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.colorPillsScroll}
              >
                {activeItemTab === 'accessory' && (
                  <TouchableOpacity
                    onPress={() => {
                      setAccessoryColor('none');
                    }}
                    style={[
                      styles.noneColorBtn,
                      accessoryColor === 'none' && styles.noneColorBtnActive,
                    ]}
                  >
                    <Ionicons name="close-circle-outline" size={24} color={Colors.textMuted} />
                    <Text style={styles.noneColorText}>None</Text>
                  </TouchableOpacity>
                )}
                {FASHION_COLORS.map((col) => {
                  const currentActiveColor =
                    activeItemTab === 'top'
                      ? topColor
                      : activeItemTab === 'bottom'
                      ? bottomColor
                      : activeItemTab === 'shoes'
                      ? shoesColor
                      : accessoryColor;
                  const isSelected = currentActiveColor === col.id;

                  return (
                    <View key={col.id} style={styles.chipCell}>
                      <ColorChip
                        color={col}
                        isSelected={isSelected}
                        onSelect={() => {
                          if (activeItemTab === 'top') setTopColor(col.id);
                          if (activeItemTab === 'bottom') setBottomColor(col.id);
                          if (activeItemTab === 'shoes') setShoesColor(col.id);
                          if (activeItemTab === 'accessory') setAccessoryColor(col.id);
                          setSavedSuccess(false);
                        }}
                        size="md"
                      />
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        )}

        {/* OCCASION & STYLE SELECTORS */}
        <View style={styles.controlsRow}>
          <View style={styles.controlBlock}>
            <Text style={styles.controlLabel}>Occasion</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {OCCASIONS.map((occ) => {
                const isSelected = occasion === occ;
                return (
                  <TouchableOpacity
                    key={occ}
                    onPress={() => setOccasion(occ)}
                    style={[
                      styles.miniPill,
                      isSelected && styles.miniPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.miniPillText,
                        isSelected && styles.miniPillTextActive,
                      ]}
                    >
                      {occ}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={[styles.controlBlock, { marginTop: Spacing.sm }]}>
            <Text style={styles.controlLabel}>Style Aesthetic</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {STYLES.map((st) => {
                const isSelected = style === st;
                return (
                  <TouchableOpacity
                    key={st}
                    onPress={() => setStyle(st)}
                    style={[
                      styles.miniPill,
                      isSelected && styles.miniPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.miniPillText,
                        isSelected && styles.miniPillTextActive,
                      ]}
                    >
                      {st}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* RESULTS SECTION */}
        <View style={styles.resultsHeader}>
          <Ionicons name="sparkles" size={16} color={Colors.primaryGold} />
          <Text style={styles.resultsHeaderText}>Color Harmony Evaluation</Text>
        </View>

        {/* SCORE GAUGE */}
        <ScoreGauge result={matchResult} />

        {/* HARMONY EXPLANATION CARD */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
            <Text style={styles.cardHeaderTitle}>Color Theory Breakdown</Text>
          </View>
          <Text style={styles.bodyText}>{matchResult.explanation}</Text>
        </View>

        {/* ITEM BY ITEM FEEDBACK */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="layers-outline" size={18} color={Colors.primary} />
            <Text style={styles.cardHeaderTitle}>Individual Piece Synergy</Text>
          </View>

          <View style={styles.feedbackItem}>
            <Text style={styles.feedbackTitle}>• Top & Bottom Coordination:</Text>
            <Text style={styles.feedbackBody}>{matchResult.itemFeedback.topAndBottom}</Text>
          </View>

          <View style={styles.feedbackItem}>
            <Text style={styles.feedbackTitle}>• Footwear Grounding:</Text>
            <Text style={styles.feedbackBody}>{matchResult.itemFeedback.shoeAnchor}</Text>
          </View>

          <View style={styles.feedbackItem}>
            <Text style={styles.feedbackTitle}>• Accessory Dialogue:</Text>
            <Text style={styles.feedbackBody}>{matchResult.itemFeedback.accessoryTouch}</Text>
          </View>
        </View>

        {/* OCCASION SUITABILITY */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar-outline" size={18} color={Colors.accentTerracotta} />
            <Text style={styles.cardHeaderTitle}>
              Occasion Suitability: {occasion}
            </Text>
          </View>
          <View style={styles.suitabilityBadgeRow}>
            <View
              style={[
                styles.suitabilityBadge,
                matchResult.occasionSuitability.fit === 'Perfect'
                  ? { backgroundColor: '#E2F0D9' }
                  : { backgroundColor: '#FCE4D6' },
              ]}
            >
              <Text
                style={[
                  styles.suitabilityBadgeText,
                  matchResult.occasionSuitability.fit === 'Perfect'
                    ? { color: Colors.scoreExcellent }
                    : { color: Colors.accentTerracotta },
                ]}
              >
                {matchResult.occasionSuitability.fit}
              </Text>
            </View>
          </View>
          <Text style={styles.bodyText}>{matchResult.occasionSuitability.comment}</Text>
        </View>

        {/* RECOMMENDED ACCESSORIES */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="watch-outline" size={18} color={Colors.primaryGold} />
            <Text style={styles.cardHeaderTitle}>Recommended Accessories</Text>
          </View>
          {matchResult.accessoryRecommendations.map((acc, idx) => (
            <View key={idx} style={styles.recItemRow}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.primaryGold} />
              <Text style={styles.recItemText}>{acc}</Text>
            </View>
          ))}
        </View>

        {/* ============================================================== */}
        {/* BETTER COMBINATIONS USING OTHER CLOTHES IN USER'S WARDROBE    */}
        {/* ============================================================== */}
        {wardrobeAlternatives.length > 0 && (
          <View style={styles.wardrobeAltSection}>
            <View style={styles.wardrobeAltHeaderRow}>
              <Ionicons name="sparkles" size={18} color={Colors.primaryGold} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.wardrobeAltHeaderTitle}>
                  Better Combinations from Your Wardrobe
                </Text>
                <Text style={styles.wardrobeAltHeaderSub}>
                  Sartorial pairings crafted from clothes you already own
                </Text>
              </View>
            </View>

            {wardrobeAlternatives.map((alt, idx) => (
              <View key={idx} style={styles.wardrobeAltCard}>
                <View style={styles.wardrobeAltTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.wardrobeAltTitle}>{alt.title}</Text>
                    <Text style={styles.wardrobeAltHarmony}>{alt.harmonyType}</Text>
                  </View>
                  <View style={styles.wardrobeAltScorePill}>
                    <Text style={styles.wardrobeAltScoreText}>{alt.score}%</Text>
                  </View>
                </View>

                {/* Clothing Photos Thumbnail Row */}
                <View style={styles.wardrobeAltThumbnails}>
                  <View style={styles.thumbWrap}>
                    <Image source={{ uri: alt.topItem.imageUri }} style={styles.thumbImg} />
                    <Text numberOfLines={1} style={styles.thumbLabel}>
                      {alt.topItem.name}
                    </Text>
                  </View>
                  <Ionicons name="add" size={14} color={Colors.textMuted} />
                  <View style={styles.thumbWrap}>
                    <Image source={{ uri: alt.bottomItem.imageUri }} style={styles.thumbImg} />
                    <Text numberOfLines={1} style={styles.thumbLabel}>
                      {alt.bottomItem.name}
                    </Text>
                  </View>
                  {alt.shoesItem && (
                    <>
                      <Ionicons name="add" size={14} color={Colors.textMuted} />
                      <View style={styles.thumbWrap}>
                        <Image source={{ uri: alt.shoesItem.imageUri }} style={styles.thumbImg} />
                        <Text numberOfLines={1} style={styles.thumbLabel}>
                          {alt.shoesItem.name}
                        </Text>
                      </View>
                    </>
                  )}
                </View>

                <Text style={styles.wardrobeAltDesc}>{alt.description}</Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleApplyWardrobeAlt(alt)}
                  style={styles.equipAltBtn}
                >
                  <Ionicons name="shirt-outline" size={14} color="#FFFFFF" />
                  <Text style={styles.equipAltBtnText}>Equip This Wardrobe Match</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* BETTER ALTERNATIVES (PALETTE BASED) */}
        {matchResult.betterAlternatives.length > 0 && (
          <View style={styles.alternativesSection}>
            <Text style={styles.alternativesHeader}>Alternative Color Palettes</Text>
            <Text style={styles.alternativesSub}>
              Theoretical color tweaks that maximize optical balance
            </Text>

            {matchResult.betterAlternatives.map((alt, index) => {
              const altTop = getColorById(alt.topColor);
              const altBtm = getColorById(alt.bottomColor);
              const altShoe = getColorById(alt.shoesColor);

              return (
                <View key={index} style={styles.alternativeCard}>
                  <View style={styles.altHeader}>
                    <Text style={styles.altTitle}>{alt.title}</Text>
                    <View style={styles.altScoreBadge}>
                      <Text style={styles.altScoreText}>{alt.expectedScore}%</Text>
                    </View>
                  </View>

                  <Text style={styles.altDesc}>{alt.description}</Text>

                  {/* Swatch preview */}
                  <View style={styles.altSwatchesRow}>
                    <View style={styles.altSwatchItem}>
                      <View style={[styles.altDot, { backgroundColor: altTop.hex }]} />
                      <Text style={styles.altDotLabel}>{altTop.name}</Text>
                    </View>
                    <Text style={styles.altPlus}>+</Text>
                    <View style={styles.altSwatchItem}>
                      <View style={[styles.altDot, { backgroundColor: altBtm.hex }]} />
                      <Text style={styles.altDotLabel}>{altBtm.name}</Text>
                    </View>
                    <Text style={styles.altPlus}>+</Text>
                    <View style={styles.altSwatchItem}>
                      <View style={[styles.altDot, { backgroundColor: altShoe.hex }]} />
                      <Text style={styles.altDotLabel}>{altShoe.name}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.applyAltBtn}
                    onPress={() => applyAlternative(alt)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.applyAltBtnText}>Apply Palette</Text>
                    <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* SAVE COMBINATION BUTTON */}
        <PrimaryButton
          title={savedSuccess ? 'Outfit Saved to Favorites!' : 'Save This Combination'}
          onPress={handleSaveCombination}
          variant={savedSuccess ? 'gold' : 'primary'}
          size="lg"
          icon={
            <Ionicons
              name={savedSuccess ? 'checkmark-circle' : 'bookmark-outline'}
              size={18}
              color="#FFFFFF"
            />
          }
          style={styles.saveBtn}
        />
      </ScrollView>

      {/* WARDROBE GARMENT SELECTOR MODAL */}
      <Modal
        visible={isWardrobeModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsWardrobeModalOpen(false)}
      >
        <SafeAreaView style={styles.pickerSafeArea}>
          <View style={styles.pickerHeader}>
            <View>
              <Text style={styles.pickerTitle}>
                Select {pickerTargetSlot.toUpperCase()} from Wardrobe
              </Text>
              <Text style={styles.pickerSubtitle}>
                Choose an item you actually own
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsWardrobeModalOpen(false)}
              style={styles.pickerCloseBtn}
            >
              <Ionicons name="close" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.pickerSearchWrap}>
            <Ionicons name="search" size={16} color={Colors.textMuted} />
            <TextInput
              style={styles.pickerSearchInput}
              placeholder="Search by garment name, color..."
              placeholderTextColor={Colors.textMuted}
              value={pickerSearch}
              onChangeText={setPickerSearch}
            />
          </View>

          {modalEligibleItems.length === 0 ? (
            <View style={styles.pickerEmptyWrap}>
              <Ionicons name="shirt-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.pickerEmptyTitle}>No matching items</Text>
              <Text style={styles.pickerEmptyDesc}>
                You haven't uploaded any garments for {pickerTargetSlot} yet.
              </Text>
            </View>
          ) : (
            <FlatList
              data={modalEligibleItems}
              keyExtractor={(i) => i.id}
              numColumns={2}
              contentContainerStyle={styles.pickerGrid}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.pickerItemCard}
                  onPress={() => handleSelectWardrobeItem(item)}
                >
                  <Image source={{ uri: item.imageUri }} style={styles.pickerItemImg} />
                  <View style={styles.pickerItemContent}>
                    <Text numberOfLines={1} style={styles.pickerItemName}>
                      {item.name}
                    </Text>
                    <View style={styles.pickerItemMeta}>
                      <View
                        style={[
                          styles.pickerItemDot,
                          { backgroundColor: item.colorHex },
                        ]}
                      />
                      <Text style={styles.pickerItemColor}>{item.color}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

interface WardrobeSlotCardProps {
  title: string;
  item: WardrobeItem | null;
  fallbackColor: { name: string; hex: string; textHex: string } | null;
  icon: keyof typeof Ionicons.glyphMap;
  optional?: boolean;
  onPress: () => void;
  onClear: () => void;
}

const WardrobeSlotCard: React.FC<WardrobeSlotCardProps> = ({
  title,
  item,
  fallbackColor,
  icon,
  optional,
  onPress,
  onClear,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.slotCard, item ? styles.slotCardFilled : styles.slotCardEmpty]}
    >
      <View style={styles.slotTopRow}>
        <Text style={styles.slotCardTitle}>{title}</Text>
        {item ? (
          <TouchableOpacity onPress={(e) => { e.stopPropagation(); onClear(); }}>
            <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        ) : optional ? (
          <Text style={styles.slotOptionalTag}>Optional</Text>
        ) : null}
      </View>

      {item ? (
        <View style={styles.slotFilledContent}>
          <Image source={{ uri: item.imageUri }} style={styles.slotImage} resizeMode="cover" />
          <View style={styles.slotMeta}>
            <Text numberOfLines={1} style={styles.slotItemName}>
              {item.name}
            </Text>
            <View style={styles.slotItemColorRow}>
              <View style={[styles.slotDot, { backgroundColor: item.colorHex }]} />
              <Text numberOfLines={1} style={styles.slotItemCategory}>
                {item.color} • {item.category}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.slotEmptyContent}>
          <View style={styles.slotEmptyIconWrap}>
            <Ionicons name={icon} size={22} color={Colors.primary} />
          </View>
          <Text style={styles.slotSelectBtnText}>+ Select Real Clothes</Text>
          {fallbackColor && (
            <Text style={styles.slotFallbackText}>Color: {fallbackColor.name}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  modeSwitchCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 4,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  modeTabActive: {
    backgroundColor: Colors.primary,
  },
  modeTabText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modeTabTextActive: {
    color: '#FFFFFF',
  },
  wardrobeMatchSection: {
    marginBottom: Spacing.sm,
  },
  sectionHeaderRow: {
    marginBottom: Spacing.sm,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionHeaderSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  wardrobeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.md,
  },
  slotCard: {
    width: '48.5%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    minHeight: 140,
    justifyContent: 'space-between',
    ...Shadows.subtle,
  },
  slotCardFilled: {
    borderColor: Colors.surfaceBorder,
  },
  slotCardEmpty: {
    borderStyle: 'dashed',
    borderColor: Colors.divider,
    backgroundColor: Colors.surfaceElevated,
  },
  slotTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  slotCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  slotOptionalTag: {
    fontSize: 9.5,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  slotFilledContent: {
    alignItems: 'center',
  },
  slotImage: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
    marginBottom: 6,
  },
  slotMeta: {
    width: '100%',
  },
  slotItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  slotItemColorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 2,
  },
  slotDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  slotItemCategory: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  slotEmptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  slotEmptyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  slotSelectBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.primary,
  },
  slotFallbackText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  lookbookPreviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  lookbookTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    letterSpacing: 0.3,
  },
  lookbookPhotosRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  lookbookPhotoFrame: {
    flex: 1,
    alignItems: 'center',
  },
  lookbookImg: {
    width: '100%',
    height: 100,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
    marginBottom: 4,
  },
  lookbookCaption: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  paletteModeSection: {
    marginBottom: Spacing.sm,
  },
  mannequinCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  mannequinTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  paletteDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemSlot: {
    alignItems: 'center',
    padding: 6,
    borderRadius: BorderRadius.md,
  },
  itemSlotActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  slotColorCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  lightBorder: {
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  slotLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  slotValue: {
    fontSize: 11,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  selectorTabRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 3,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  itemSelectorTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  itemSelectorTabActive: {
    backgroundColor: Colors.primary,
  },
  itemSelectorTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  itemSelectorTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  paletteSection: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  paletteSubhead: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  colorPillsScroll: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  noneColorBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginRight: 8,
  },
  noneColorBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceElevated,
  },
  noneColorText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  chipCell: {
    marginRight: 8,
  },
  controlsRow: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  controlBlock: {},
  controlLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  miniPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginRight: 6,
  },
  miniPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  miniPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  miniPillTextActive: {
    color: '#FFFFFF',
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  resultsHeaderText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  bodyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  feedbackItem: {
    marginBottom: 6,
  },
  feedbackTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  feedbackBody: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
    lineHeight: 17,
  },
  suitabilityBadgeRow: {
    marginBottom: 6,
  },
  suitabilityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  suitabilityBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  recItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  recItemText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  wardrobeAltSection: {
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    marginBottom: Spacing.md,
  },
  wardrobeAltHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  wardrobeAltHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  wardrobeAltHeaderSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  wardrobeAltCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.sm,
    ...Shadows.subtle,
  },
  wardrobeAltTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  wardrobeAltTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  wardrobeAltHarmony: {
    fontSize: 11,
    color: Colors.primaryGold,
    fontWeight: '600',
    marginTop: 1,
  },
  wardrobeAltScorePill: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  wardrobeAltScoreText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
  wardrobeAltThumbnails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: Spacing.sm,
  },
  thumbWrap: {
    flex: 1,
    alignItems: 'center',
  },
  thumbImg: {
    width: '100%',
    height: 60,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
    marginBottom: 3,
  },
  thumbLabel: {
    fontSize: 9.5,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  wardrobeAltDesc: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  equipAltBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  equipAltBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  alternativesSection: {
    marginBottom: Spacing.md,
  },
  alternativesHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  alternativesSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  alternativeCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.sm,
    ...Shadows.subtle,
  },
  altHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  altTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  altScoreBadge: {
    backgroundColor: Colors.primaryGold,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  altScoreText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
  altDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  altSwatchesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  altSwatchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  altDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  altDotLabel: {
    fontSize: 11,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  altPlus: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  applyAltBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  applyAltBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.primary,
  },
  saveBtn: {
    marginBottom: Spacing.xl,
  },
  pickerSafeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  pickerSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  pickerCloseBtn: {
    padding: 4,
  },
  pickerSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: Spacing.md,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 8,
  },
  pickerSearchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  pickerEmptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
    gap: 8,
  },
  pickerEmptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  pickerEmptyDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  pickerGrid: {
    padding: Spacing.sm,
  },
  pickerItemCard: {
    flex: 1,
    margin: 4,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    ...Shadows.subtle,
  },
  pickerItemImg: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.surfaceElevated,
  },
  pickerItemContent: {
    padding: Spacing.sm,
  },
  pickerItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  pickerItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pickerItemDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  pickerItemColor: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
