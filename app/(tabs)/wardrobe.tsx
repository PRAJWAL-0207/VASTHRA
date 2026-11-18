import React, { useEffect, useState } from 'react';
import {
  Alert,
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
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { BrandHeader } from '../../components/BrandHeader';
import { ColorChip } from '../../components/ColorChip';
import { EmptyState } from '../../components/EmptyState';
import { FilterTabs } from '../../components/FilterTabs';
import { PrimaryButton } from '../../components/PrimaryButton';
import { WardrobeItemCard } from '../../components/WardrobeItemCard';
import {
  CLOTHING_CATEGORIES,
  FASHION_COLORS,
  getColorById,
  OCCASIONS,
  PATTERNS,
  STYLES,
} from '../../constants/colors';
import { BorderRadius, Colors, Shadows, Spacing } from '../../constants/theme';
import {
  captureImageWithCamera,
  pickImageFromGallery,
} from '../../services/imageStorage';
import {
  addWardrobeItem,
  deleteWardrobeItem,
  getWardrobeItems,
  updateWardrobeItem,
} from '../../services/storage';
import { ClothingCategory, OccasionType, PatternType, StyleType, WardrobeItem } from '../../types';

const SAMPLE_GARMENT_PHOTOS: Record<string, string> = {
  'T-shirts': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
  'Shirts': 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80',
  'Jeans': 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80',
  'Trousers': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80',
  'Shorts': 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80',
  'Jackets': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
  'Hoodies': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
  'Dresses': 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80',
  'Sarees': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
  'Kurtas': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
  'Sherwanis': 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=600&q=80',
  'Skirts': 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=600&q=80',
  'Shoes': 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=600&q=80',
  'Bags': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
  'Watches': 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80',
  'Accessories': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
};

export default function WardrobeScreen() {
  const router = useRouter();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeColorFilter, setActiveColorFilter] = useState<string>('All');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WardrobeItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<ClothingCategory>('Shirts');
  const [itemColor, setItemColor] = useState('white');
  const [secondaryColor, setSecondaryColor] = useState<string>('none');
  const [itemPattern, setItemPattern] = useState<PatternType>('Solid');
  const [itemStyle, setItemStyle] = useState<StyleType>('Smart Casual');
  const [itemOccasion, setItemOccasion] = useState<OccasionType>('Casual');
  const [itemImageUri, setItemImageUri] = useState<string>(SAMPLE_GARMENT_PHOTOS['Shirts']);
  const [itemNotes, setItemNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Photo Source Picker Sheet Modal
  const [isPhotoSheetOpen, setIsPhotoSheetOpen] = useState(false);

  // Item Details View Modal
  const [selectedDetailItem, setSelectedDetailItem] = useState<WardrobeItem | null>(null);

  const loadWardrobe = async () => {
    try {
      const data = await getWardrobeItems();
      setItems(data);
    } catch (e) {
      console.warn('Failed to load wardrobe:', e);
    }
  };

  useEffect(() => {
    loadWardrobe();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setItemName('');
    setItemCategory('Shirts');
    setItemColor('white');
    setSecondaryColor('none');
    setItemPattern('Solid');
    setItemStyle('Smart Casual');
    setItemOccasion('Casual');
    setItemNotes('');
    setItemImageUri(SAMPLE_GARMENT_PHOTOS['Shirts']);
    setIsModalOpen(true);
  };

  const openEditModal = (item: WardrobeItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemCategory(item.category);
    const mainCol = FASHION_COLORS.find(
      (c) => c.name.toLowerCase() === item.color.toLowerCase()
    )?.id || 'white';
    setItemColor(mainCol);
    if (item.secondaryColor) {
      const secCol = FASHION_COLORS.find(
        (c) => c.name.toLowerCase() === item.secondaryColor?.toLowerCase()
      )?.id || 'none';
      setSecondaryColor(secCol);
    } else {
      setSecondaryColor('none');
    }
    setItemPattern(item.pattern || 'Solid');
    setItemStyle(item.style);
    setItemOccasion(item.occasion);
    setItemNotes(item.notes || '');
    setItemImageUri(item.imageUri);
    setIsModalOpen(true);
    if (selectedDetailItem) {
      setSelectedDetailItem(null);
    }
  };

  const handlePickFromGallery = async () => {
    setIsPhotoSheetOpen(false);
    const uri = await pickImageFromGallery([1, 1]);
    if (uri) {
      setItemImageUri(uri);
    }
  };

  const handleCaptureFromCamera = async () => {
    setIsPhotoSheetOpen(false);
    const uri = await captureImageWithCamera([1, 1]);
    if (uri) {
      setItemImageUri(uri);
    }
  };

  const handleSaveItem = async () => {
    if (!itemName.trim()) {
      Alert.alert('Name Required', 'Please enter a name for this clothing item.');
      return;
    }

    setIsSaving(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    const colObj = getColorById(itemColor);
    const secObj = secondaryColor !== 'none' ? getColorById(secondaryColor) : undefined;

    try {
      if (editingItem) {
        // Update existing item
        const updated: WardrobeItem = {
          ...editingItem,
          name: itemName.trim(),
          category: itemCategory,
          color: colObj.name,
          colorHex: colObj.hex,
          secondaryColor: secObj?.name,
          secondaryColorHex: secObj?.hex,
          pattern: itemPattern,
          style: itemStyle,
          occasion: itemOccasion,
          notes: itemNotes.trim() || undefined,
          imageUri: itemImageUri,
        };
        await updateWardrobeItem(updated);
        setItems(items.map((i) => (i.id === updated.id ? updated : i)));
      } else {
        // Add new item
        const newItem = await addWardrobeItem({
          name: itemName.trim(),
          category: itemCategory,
          color: colObj.name,
          colorHex: colObj.hex,
          secondaryColor: secObj?.name,
          secondaryColorHex: secObj?.hex,
          pattern: itemPattern,
          style: itemStyle,
          occasion: itemOccasion,
          notes: itemNotes.trim() || undefined,
          imageUri: itemImageUri,
        });
        setItems([newItem, ...items]);
      }

      setIsModalOpen(false);
    } catch (err) {
      Alert.alert('Storage Error', 'Could not save clothing item. Please try again.');
      console.warn('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (id: string, name: string) => {
    Alert.alert(
      'Remove Garment',
      `Are you sure you want to remove "${name}" from your digital wardrobe?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } catch {}
            await deleteWardrobeItem(id);
            setItems(items.filter((i) => i.id !== id));
            if (selectedDetailItem?.id === id) {
              setSelectedDetailItem(null);
            }
          },
        },
      ]
    );
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    const matchCol =
      activeColorFilter === 'All' ||
      item.color.toLowerCase() === activeColorFilter.toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    const matchQuery =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.color.toLowerCase().includes(query) ||
      (item.pattern && item.pattern.toLowerCase().includes(query)) ||
      (item.notes && item.notes.toLowerCase().includes(query));

    return matchCat && matchCol && matchQuery;
  });

  const categoryTabs = ['All', ...CLOTHING_CATEGORIES];

  return (
    <SafeAreaView style={styles.safeArea}>
      <BrandHeader
        title="VASTHRA"
        subtitle="Smart Digital Wardrobe"
        rightAction="stylist"
      />

      {/* TOP HEADER & SEARCH BAR */}
      <View style={styles.topBar}>
        <View style={styles.titleInfo}>
          <Text style={styles.statsCount}>{items.length} Pieces</Text>
          <Text style={styles.statsSubtitle}>Your Real Clothes Vault</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch {}
            openAddModal();
          }}
          style={styles.addGarmentBtn}
        >
          <Ionicons name="camera" size={16} color="#FFFFFF" />
          <Text style={styles.addGarmentBtnText}>Add Clothes</Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH INPUT */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search garments by name, pattern, color..."
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
            <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* CATEGORY FILTER TABS */}
      <FilterTabs
        tabs={categoryTabs}
        activeTab={activeCategory}
        onSelectTab={setActiveCategory}
      />

      {/* COLOR FILTER STRIP */}
      <View style={styles.colorFilterStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorFilterScroll}>
          <TouchableOpacity
            onPress={() => setActiveColorFilter('All')}
            style={[
              styles.colorFilterAllPill,
              activeColorFilter === 'All' && styles.colorFilterAllPillActive,
            ]}
          >
            <Text
              style={[
                styles.colorFilterAllText,
                activeColorFilter === 'All' && styles.colorFilterAllTextActive,
              ]}
            >
              All Colors
            </Text>
          </TouchableOpacity>
          {FASHION_COLORS.map((col) => {
            const isSelected = activeColorFilter.toLowerCase() === col.name.toLowerCase();
            return (
              <TouchableOpacity
                key={col.id}
                onPress={() => setActiveColorFilter(isSelected ? 'All' : col.name)}
                style={[
                  styles.colorFilterDotBtn,
                  isSelected && styles.colorFilterDotBtnActive,
                ]}
              >
                <View
                  style={[
                    styles.colorFilterDot,
                    { backgroundColor: col.hex },
                    (col.hex === '#FFFFFF' || col.hex === '#F5EFE6') && styles.dotLightBorder,
                  ]}
                />
                <Text style={[styles.colorFilterDotText, isSelected && styles.colorFilterDotTextActive]}>
                  {col.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* GARMENTS GRID */}
      {filteredItems.length === 0 ? (
        <EmptyState
          iconName="shirt-outline"
          title="No Garments Found"
          message={
            searchQuery
              ? `No wardrobe items matching "${searchQuery}".`
              : activeCategory !== 'All'
              ? `You don't have any ${activeCategory} in your wardrobe yet.`
              : 'Your digital wardrobe is ready for your clothes! Photograph or upload your actual garments.'
          }
          buttonTitle="Upload Your First Garment"
          onButtonPress={openAddModal}
        />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          renderItem={({ item }) => (
            <WardrobeItemCard
              item={item}
              onPress={() => setSelectedDetailItem(item)}
              onEdit={() => openEditModal(item)}
              onDelete={() => handleDeleteItem(item.id, item.name)}
              onMatchShortcut={() => router.push('/(tabs)/match')}
            />
          )}
        />
      )}

      {/* ADD / EDIT GARMENT MODAL */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Edit Wardrobe Piece' : 'Add Real Garment'}
            </Text>
            <TouchableOpacity
              onPress={() => setIsModalOpen(false)}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScroll}
          >
            {/* Real Clothing Image Preview & Upload buttons */}
            <View style={styles.imagePickerSection}>
              <View style={styles.imageFrame}>
                <Image
                  source={{ uri: itemImageUri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                <View style={styles.photoTypeBadge}>
                  <Text style={styles.photoTypeBadgeText}>Actual Garment Photo</Text>
                </View>
              </View>

              <View style={styles.photoButtonsRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setIsPhotoSheetOpen(true)}
                  style={styles.changeImageBtn}
                >
                  <Ionicons name="camera-reverse-outline" size={17} color="#FFFFFF" />
                  <Text style={styles.changeImageText}>Change Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleCaptureFromCamera}
                  style={styles.quickCameraBtn}
                >
                  <Ionicons name="camera-outline" size={17} color={Colors.primary} />
                  <Text style={styles.quickCameraText}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handlePickFromGallery}
                  style={styles.quickGalleryBtn}
                >
                  <Ionicons name="images-outline" size={17} color={Colors.primary} />
                  <Text style={styles.quickGalleryText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Garment Name input */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Garment Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Linen Camp Shirt, Charcoal Trousers, Oxford Brogues"
                placeholderTextColor={Colors.textMuted}
                value={itemName}
                onChangeText={setItemName}
              />
            </View>

            {/* Category Select (16 categories) */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Clothing Category</Text>
              <View style={styles.pillRowWrap}>
                {CLOTHING_CATEGORIES.map((cat) => {
                  const isSelected = itemCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => {
                        setItemCategory(cat);
                        // If current photo is still a default sample, update to sample of new category
                        if (Object.values(SAMPLE_GARMENT_PHOTOS).includes(itemImageUri)) {
                          setItemImageUri(SAMPLE_GARMENT_PHOTOS[cat] || SAMPLE_GARMENT_PHOTOS['Shirts']);
                        }
                      }}
                      style={[
                        styles.formPill,
                        isSelected && styles.formPillSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.formPillText,
                          isSelected && styles.formPillTextSelected,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Dominant Colour Select */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Main Colour</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.colorsHorizontal}
              >
                {FASHION_COLORS.map((col) => {
                  const isSelected = itemColor === col.id;
                  return (
                    <View key={col.id} style={{ marginRight: 8 }}>
                      <ColorChip
                        color={col}
                        isSelected={isSelected}
                        onSelect={() => setItemColor(col.id)}
                        size="md"
                      />
                    </View>
                  );
                })}
              </ScrollView>
            </View>

            {/* Optional Secondary Colour */}
            <View style={styles.formGroup}>
              <View style={styles.labelWithSub}>
                <Text style={styles.formLabel}>Secondary Colour</Text>
                <Text style={styles.formSubLabel}>Optional accent or undertone</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.colorsHorizontal}
              >
                <TouchableOpacity
                  onPress={() => setSecondaryColor('none')}
                  style={[
                    styles.noneColorChip,
                    secondaryColor === 'none' && styles.noneColorChipSelected,
                  ]}
                >
                  <Text style={[styles.noneChipText, secondaryColor === 'none' && styles.noneChipTextSelected]}>
                    None
                  </Text>
                </TouchableOpacity>
                {FASHION_COLORS.map((col) => {
                  const isSelected = secondaryColor === col.id;
                  return (
                    <View key={col.id} style={{ marginRight: 8 }}>
                      <ColorChip
                        color={col}
                        isSelected={isSelected}
                        onSelect={() => setSecondaryColor(col.id)}
                        size="md"
                      />
                    </View>
                  );
                })}
              </ScrollView>
            </View>

            {/* Pattern Select */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Pattern</Text>
              <View style={styles.pillRowWrap}>
                {PATTERNS.map((pat) => {
                  const isSelected = itemPattern === pat;
                  return (
                    <TouchableOpacity
                      key={pat}
                      onPress={() => setItemPattern(pat)}
                      style={[
                        styles.formPill,
                        isSelected && styles.formPillSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.formPillText,
                          isSelected && styles.formPillTextSelected,
                        ]}
                      >
                        {pat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Style Aesthetic */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Style Aesthetic</Text>
              <View style={styles.pillRowWrap}>
                {STYLES.map((st) => {
                  const isSelected = itemStyle === st;
                  return (
                    <TouchableOpacity
                      key={st}
                      onPress={() => setItemStyle(st)}
                      style={[
                        styles.formPill,
                        isSelected && styles.formPillSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.formPillText,
                          isSelected && styles.formPillTextSelected,
                        ]}
                      >
                        {st}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Best For Occasion */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Best For Occasion</Text>
              <View style={styles.pillRowWrap}>
                {OCCASIONS.map((occ) => {
                  const isSelected = itemOccasion === occ;
                  return (
                    <TouchableOpacity
                      key={occ}
                      onPress={() => setItemOccasion(occ)}
                      style={[
                        styles.formPill,
                        isSelected && styles.formPillSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.formPillText,
                          isSelected && styles.formPillTextSelected,
                        ]}
                      >
                        {occ}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Optional Description / Fabric Notes */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description & Styling Notes (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="e.g. 100% linen fabric, dry clean only, pairs best with leather loafers..."
                placeholderTextColor={Colors.textMuted}
                value={itemNotes}
                onChangeText={setItemNotes}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Save Button */}
            <PrimaryButton
              title={editingItem ? 'Update Garment' : 'Save to Digital Wardrobe'}
              onPress={handleSaveItem}
              loading={isSaving}
              size="lg"
              variant="primary"
              style={styles.modalSaveBtn}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* PHOTO SOURCE SELECTION SHEET */}
      <Modal
        visible={isPhotoSheetOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPhotoSheetOpen(false)}
      >
        <TouchableOpacity
          style={styles.sheetOverlay}
          activeOpacity={1}
          onPress={() => setIsPhotoSheetOpen(false)}
        >
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Photograph Clothing</Text>
            <Text style={styles.sheetSubtitle}>
              Capture or choose a photo of your actual garment.
            </Text>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={handleCaptureFromCamera}
            >
              <View style={styles.sheetOptionIconWrap}>
                <Ionicons name="camera" size={20} color={Colors.primary} />
              </View>
              <View style={styles.sheetOptionTextWrap}>
                <Text style={styles.sheetOptionTitle}>Take Photo with Camera</Text>
                <Text style={styles.sheetOptionDesc}>Photograph your item with real lighting</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={handlePickFromGallery}
            >
              <View style={styles.sheetOptionIconWrap}>
                <Ionicons name="images" size={20} color={Colors.primaryGold} />
              </View>
              <View style={styles.sheetOptionTextWrap}>
                <Text style={styles.sheetOptionTitle}>Choose from Photo Library</Text>
                <Text style={styles.sheetOptionDesc}>Pick an existing photo from your gallery</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetCancelBtn}
              onPress={() => setIsPhotoSheetOpen(false)}
            >
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* INDIVIDUAL CLOTHING ITEM DETAILS MODAL */}
      <Modal
        visible={!!selectedDetailItem}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedDetailItem(null)}
      >
        <View style={styles.detailOverlay}>
          <View style={styles.detailCard}>
            {selectedDetailItem && (
              <>
                <View style={styles.detailImageWrap}>
                  <Image
                    source={{ uri: selectedDetailItem.imageUri }}
                    style={styles.detailImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.detailCloseBtn}
                    onPress={() => setSelectedDetailItem(null)}
                  >
                    <Ionicons name="close" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                  <View style={styles.detailCategoryBadge}>
                    <Text style={styles.detailCategoryText}>
                      {selectedDetailItem.category}
                    </Text>
                  </View>
                </View>

                <ScrollView style={styles.detailContent}>
                  <Text style={styles.detailTitle}>{selectedDetailItem.name}</Text>

                  {/* Colors & Pattern Row */}
                  <View style={styles.detailMetaGrid}>
                    <View style={styles.detailMetaBlock}>
                      <Text style={styles.detailMetaLabel}>Dominant Color</Text>
                      <View style={styles.detailColorRow}>
                        <View
                          style={[
                            styles.detailColorChip,
                            { backgroundColor: selectedDetailItem.colorHex },
                          ]}
                        />
                        <Text style={styles.detailColorName}>
                          {selectedDetailItem.color}
                        </Text>
                      </View>
                    </View>

                    {selectedDetailItem.secondaryColor && (
                      <View style={styles.detailMetaBlock}>
                        <Text style={styles.detailMetaLabel}>Secondary</Text>
                        <View style={styles.detailColorRow}>
                          <View
                            style={[
                              styles.detailColorChip,
                              { backgroundColor: selectedDetailItem.secondaryColorHex || '#CCC' },
                            ]}
                          />
                          <Text style={styles.detailColorName}>
                            {selectedDetailItem.secondaryColor}
                          </Text>
                        </View>
                      </View>
                    )}

                    <View style={styles.detailMetaBlock}>
                      <Text style={styles.detailMetaLabel}>Pattern</Text>
                      <Text style={styles.detailMetaVal}>
                        {selectedDetailItem.pattern || 'Solid'}
                      </Text>
                    </View>

                    <View style={styles.detailMetaBlock}>
                      <Text style={styles.detailMetaLabel}>Occasion</Text>
                      <Text style={styles.detailMetaVal}>{selectedDetailItem.occasion}</Text>
                    </View>

                    <View style={styles.detailMetaBlock}>
                      <Text style={styles.detailMetaLabel}>Aesthetic</Text>
                      <Text style={styles.detailMetaVal}>{selectedDetailItem.style}</Text>
                    </View>
                  </View>

                  {selectedDetailItem.notes ? (
                    <View style={styles.detailNotesCard}>
                      <Text style={styles.detailNotesLabel}>Styling Notes</Text>
                      <Text style={styles.detailNotesText}>{selectedDetailItem.notes}</Text>
                    </View>
                  ) : null}

                  {/* Action buttons */}
                  <View style={styles.detailActionsRow}>
                    <TouchableOpacity
                      style={styles.detailMatchBtn}
                      onPress={() => {
                        setSelectedDetailItem(null);
                        router.push('/(tabs)/match');
                      }}
                    >
                      <Ionicons name="color-filter-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.detailMatchText}>Match Outfit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.detailEditBtn}
                      onPress={() => openEditModal(selectedDetailItem)}
                    >
                      <Ionicons name="pencil-outline" size={17} color={Colors.primary} />
                      <Text style={styles.detailEditText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.detailDeleteBtn}
                      onPress={() =>
                        handleDeleteItem(selectedDetailItem.id, selectedDetailItem.name)
                      }
                    >
                      <Ionicons name="trash-outline" size={17} color={Colors.scorePoor} />
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  titleInfo: {
    flex: 1,
  },
  statsCount: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  statsSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  addGarmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: BorderRadius.full,
    gap: 6,
    ...Shadows.subtle,
  },
  addGarmentBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  clearSearchBtn: {
    padding: 4,
  },
  colorFilterStrip: {
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  colorFilterScroll: {
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    gap: 6,
  },
  colorFilterAllPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginRight: 4,
  },
  colorFilterAllPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  colorFilterAllText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  colorFilterAllTextActive: {
    color: '#FFFFFF',
  },
  colorFilterDotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 5,
  },
  colorFilterDotBtnActive: {
    borderColor: Colors.primaryGold,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  colorFilterDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotLightBorder: {
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  colorFilterDotText: {
    fontSize: 11,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  colorFilterDotTextActive: {
    fontWeight: '700',
    color: Colors.primaryGold,
  },
  gridContainer: {
    padding: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  modalScroll: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  imagePickerSection: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  imageFrame: {
    width: 200,
    height: 200,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    position: 'relative',
    ...Shadows.subtle,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  photoTypeBadge: {
    position: 'absolute',
    bottom: 6,
    alignSelf: 'center',
    backgroundColor: 'rgba(20, 20, 20, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  photoTypeBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  photoButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  changeImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    gap: 5,
  },
  changeImageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  quickCameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 4,
  },
  quickCameraText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  quickGalleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 4,
  },
  quickGalleryText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: Spacing.md,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  labelWithSub: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  formSubLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  pillRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  formPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  formPillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  formPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  formPillTextSelected: {
    color: '#FFFFFF',
  },
  colorsHorizontal: {
    paddingVertical: 4,
    alignItems: 'center',
  },
  noneColorChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginRight: 8,
    justifyContent: 'center',
  },
  noneColorChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  noneChipText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  noneChipTextSelected: {
    color: '#FFFFFF',
  },
  modalSaveBtn: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.divider,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  sheetSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  sheetOptionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  sheetOptionTextWrap: {
    flex: 1,
  },
  sheetOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sheetOptionDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sheetCancelBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: 4,
  },
  sheetCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  detailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  detailCard: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.card,
  },
  detailImageWrap: {
    height: 250,
    position: 'relative',
    backgroundColor: Colors.surfaceElevated,
  },
  detailImage: {
    width: '100%',
    height: '100%',
  },
  detailCloseBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(20, 20, 20, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCategoryBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  detailCategoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  detailContent: {
    padding: Spacing.md,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  detailMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.md,
  },
  detailMetaBlock: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    minWidth: '47%',
    flex: 1,
  },
  detailMetaLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailColorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  detailColorChip: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  detailColorName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  detailMetaVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  detailNotesCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primaryGold,
    marginBottom: Spacing.md,
  },
  detailNotesLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Colors.primaryGold,
    textTransform: 'uppercase',
  },
  detailNotesText: {
    fontSize: 12,
    color: Colors.textPrimary,
    marginTop: 2,
    lineHeight: 17,
  },
  detailActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
  },
  detailMatchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  detailMatchText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  detailEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: 4,
  },
  detailEditText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  detailDeleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(193, 41, 46, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
