import React, { useEffect, useState } from 'react';
import {
  Alert,
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
import { PrimaryButton } from '../../components/PrimaryButton';
import { FASHION_COLORS, STYLES } from '../../constants/colors';
import { BorderRadius, Colors, Shadows, Spacing } from '../../constants/theme';
import {
  captureImageWithCamera,
  pickImageFromGallery,
} from '../../services/imageStorage';
import {
  addPersonalPhoto,
  DEFAULT_USER_PROFILE,
  deletePersonalPhoto,
  getUserProfile,
  getWardrobeItems,
  replacePersonalPhoto,
  saveUserProfile,
  setPrimaryPersonalPhoto,
} from '../../services/storage';
import { GenderPreference, PersonalPhoto, PersonalPhotoType, StyleType, UserProfile } from '../../types';

const PHOTO_TYPE_CONFIG: Record<
  PersonalPhotoType,
  { title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap; aspect: [number, number] }
> = {
  face: {
    title: 'Face / Portrait',
    subtitle: 'Close-up for skin tone and neckline harmony',
    icon: 'person-circle-outline',
    aspect: [1, 1],
  },
  fullBodyFront: {
    title: 'Full-Body Front',
    subtitle: 'Head-to-toe stance for silhouette proportions',
    icon: 'body-outline',
    aspect: [3, 4],
  },
  fullBodySide: {
    title: 'Full-Body Side',
    subtitle: 'Profile angle for drape and posture fit',
    icon: 'walk-outline',
    aspect: [3, 4],
  },
  reference: {
    title: 'Style Reference',
    subtitle: 'Inspirational look or favorite personal outfit',
    icon: 'sparkles-outline',
    aspect: [3, 4],
  },
};

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<GenderPreference>('men');
  const [favColors, setFavColors] = useState<string[]>([]);
  const [prefStyles, setPrefStyles] = useState<StyleType[]>([]);
  const [wardrobeCount, setWardrobeCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Photo modal states
  const [isUploadSheetOpen, setIsUploadSheetOpen] = useState(false);
  const [uploadPhotoType, setUploadPhotoType] = useState<PersonalPhotoType>('face');
  const [previewPhoto, setPreviewPhoto] = useState<PersonalPhoto | null>(null);

  const loadProfileData = async () => {
    const p = await getUserProfile();
    setProfile(p);
    setName(p.name);
    setGender(p.gender);
    setFavColors(p.favoriteColors);
    setPrefStyles(p.preferredStyles);

    const items = await getWardrobeItems();
    setWardrobeCount(items.length);
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const toggleColor = (id: string) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    if (favColors.includes(id)) {
      if (favColors.length > 1) {
        setFavColors(favColors.filter((c) => c !== id));
      }
    } else {
      setFavColors([...favColors, id]);
    }
    setSaveSuccess(false);
  };

  const toggleStyle = (st: StyleType) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    if (prefStyles.includes(st)) {
      if (prefStyles.length > 1) {
        setPrefStyles(prefStyles.filter((s) => s !== st));
      }
    } else {
      setPrefStyles([...prefStyles, st]);
    }
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    const updated: UserProfile = {
      ...profile,
      name: name.trim() || 'Style Enthusiast',
      gender,
      favoriteColors: favColors,
      preferredStyles: prefStyles,
      onboardingCompleted: true,
    };
    await saveUserProfile(updated);
    setProfile(updated);
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // --- Photo Upload Handlers ---
  const handleOpenUploadSheet = (type: PersonalPhotoType) => {
    setUploadPhotoType(type);
    setIsUploadSheetOpen(true);
  };

  const handleCapturePhoto = async () => {
    setIsUploadSheetOpen(false);
    const aspect = PHOTO_TYPE_CONFIG[uploadPhotoType].aspect;
    const uri = await captureImageWithCamera(aspect);
    if (!uri) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await addPersonalPhoto({
        uri,
        type: uploadPhotoType,
        label: PHOTO_TYPE_CONFIG[uploadPhotoType].title,
      });
      await loadProfileData();
    } catch (e) {
      console.warn('Failed to add captured photo:', e);
      Alert.alert('Upload Error', 'Could not save photo.');
    }
  };

  const handlePickFromGallery = async () => {
    setIsUploadSheetOpen(false);
    const aspect = PHOTO_TYPE_CONFIG[uploadPhotoType].aspect;
    const uri = await pickImageFromGallery(aspect);
    if (!uri) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await addPersonalPhoto({
        uri,
        type: uploadPhotoType,
        label: PHOTO_TYPE_CONFIG[uploadPhotoType].title,
      });
      await loadProfileData();
    } catch (e) {
      console.warn('Failed to add gallery photo:', e);
      Alert.alert('Upload Error', 'Could not save photo.');
    }
  };

  const handleSetPrimary = async (photoId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await setPrimaryPersonalPhoto(photoId);
      await loadProfileData();
      if (previewPhoto && previewPhoto.id === photoId) {
        setPreviewPhoto({ ...previewPhoto, isPrimary: true });
      }
    } catch (e) {
      console.warn('Set primary error:', e);
    }
  };

  const handleDeletePhoto = async (photo: PersonalPhoto) => {
    Alert.alert(
      'Delete Photo',
      `Are you sure you want to delete your ${photo.label}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await deletePersonalPhoto(photo.id);
              if (previewPhoto?.id === photo.id) {
                setPreviewPhoto(null);
              }
              await loadProfileData();
            } catch (e) {
              console.warn('Delete photo err:', e);
            }
          },
        },
      ]
    );
  };

  const handleReplacePhoto = async (photo: PersonalPhoto) => {
    Alert.alert(
      'Replace Photo',
      `Choose how you would like to replace your ${photo.label}:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Take Photo',
          onPress: async () => {
            const aspect = PHOTO_TYPE_CONFIG[photo.type].aspect;
            const uri = await captureImageWithCamera(aspect);
            if (uri) {
              await replacePersonalPhoto(photo.id, uri);
              await loadProfileData();
              if (previewPhoto?.id === photo.id) {
                setPreviewPhoto(null);
              }
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const aspect = PHOTO_TYPE_CONFIG[photo.type].aspect;
            const uri = await pickImageFromGallery(aspect);
            if (uri) {
              await replacePersonalPhoto(photo.id, uri);
              await loadProfileData();
              if (previewPhoto?.id === photo.id) {
                setPreviewPhoto(null);
              }
            }
          },
        },
      ]
    );
  };

  // Find photos by category
  const photos = profile.photos || [];
  const facePhotos = photos.filter((p) => p.type === 'face');
  const frontPhotos = photos.filter((p) => p.type === 'fullBodyFront');
  const sidePhotos = photos.filter((p) => p.type === 'fullBodySide');
  const referencePhotos = photos.filter((p) => p.type === 'reference');

  const primaryPhoto = photos.find((p) => p.isPrimary) || photos[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <BrandHeader
        title="VASTHRA"
        subtitle="Personal Style Profile"
        rightAction="saved"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* AVATAR & NAME CARD */}
        <View style={styles.profileHeaderCard}>
          <TouchableOpacity
            style={styles.avatarCircle}
            activeOpacity={0.8}
            onPress={() => {
              if (primaryPhoto) {
                setPreviewPhoto(primaryPhoto);
              } else {
                handleOpenUploadSheet('face');
              }
            }}
          >
            {primaryPhoto ? (
              <Image source={{ uri: primaryPhoto.uri }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={32} color={Colors.primary} />
            )}
            <View style={styles.avatarCameraBadge}>
              <Ionicons name="camera" size={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <View style={styles.profileMeta}>
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={(text) => {
                setName(text);
                setSaveSuccess(false);
              }}
              placeholder="Your Name"
              placeholderTextColor={Colors.textMuted}
            />
            <Text style={styles.personaTag}>
              {gender.toUpperCase()} • {prefStyles.join(' / ') || 'Contemporary'}
            </Text>
            <Text style={styles.photoCountText}>
              {photos.length} personal photo{photos.length === 1 ? '' : 's'} uploaded
            </Text>
          </View>
        </View>

        {/* QUICK STATS ROW */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statBox}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/wardrobe')}
          >
            <Ionicons name="shirt-outline" size={20} color={Colors.primary} />
            <Text style={styles.statNumber}>{wardrobeCount}</Text>
            <Text style={styles.statLabel}>Wardrobe Items</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statBox}
            activeOpacity={0.8}
            onPress={() => router.push('/saved')}
          >
            <Ionicons name="bookmark-outline" size={20} color={Colors.primaryGold} />
            <Text style={styles.statNumber}>Saved</Text>
            <Text style={styles.statLabel}>Favorite Outfits</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statBox}
            activeOpacity={0.8}
            onPress={() => router.push('/stylist')}
          >
            <Ionicons name="chatbubbles-outline" size={20} color={Colors.accentOlive} />
            <Text style={styles.statNumber}>AI</Text>
            <Text style={styles.statLabel}>Stylist Chat</Text>
          </TouchableOpacity>
        </View>

        {/* SECTION 1: PERSONAL PHOTO VAULT & STYLE REFERENCE */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Personal Style Profile</Text>
              <Text style={styles.sectionSub}>
                Upload real photos to guide silhouette and palette calibration
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleOpenUploadSheet('reference')}
              style={styles.addPhotoIconBtn}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Privacy Notice Banner */}
          <View style={styles.privacyBanner}>
            <Ionicons name="lock-closed" size={14} color={Colors.primaryGold} />
            <Text style={styles.privacyBannerText}>
              100% Private & On-Device Storage. Your photos never leave your device.
            </Text>
          </View>

          {/* PHOTO SLOTS GRID */}
          <View style={styles.photoSlotsContainer}>
            {/* Slot 1: Face / Portrait */}
            <View style={styles.slotBlock}>
              <View style={styles.slotHeader}>
                <Ionicons name="person-circle-outline" size={16} color={Colors.primary} />
                <Text style={styles.slotTitle}>Face / Portrait</Text>
                <Text style={styles.slotRequiredBadge}>Essential</Text>
              </View>
              <Text style={styles.slotHelpText}>Skin tone & undertone reference</Text>

              {facePhotos.length > 0 ? (
                <View style={styles.photoCardsRow}>
                  {facePhotos.map((p) => (
                    <PersonalPhotoCard
                      key={p.id}
                      photo={p}
                      onPress={() => setPreviewPhoto(p)}
                      onSetPrimary={() => handleSetPrimary(p.id)}
                      onReplace={() => handleReplacePhoto(p)}
                      onDelete={() => handleDeletePhoto(p)}
                    />
                  ))}
                  <TouchableOpacity
                    style={styles.addMiniPhotoCard}
                    onPress={() => handleOpenUploadSheet('face')}
                  >
                    <Ionicons name="add" size={20} color={Colors.primary} />
                    <Text style={styles.addMiniText}>Add</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.emptySlotButton}
                  onPress={() => handleOpenUploadSheet('face')}
                >
                  <Ionicons name="camera-outline" size={24} color={Colors.primary} />
                  <Text style={styles.emptySlotTitle}>Upload Face Photo</Text>
                  <Text style={styles.emptySlotDesc}>Take photo or select from gallery</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Slot 2: Full-Body Front */}
            <View style={styles.slotBlock}>
              <View style={styles.slotHeader}>
                <Ionicons name="body-outline" size={16} color={Colors.primary} />
                <Text style={styles.slotTitle}>Full-Body Front</Text>
                <Text style={styles.slotRequiredBadge}>Recommended</Text>
              </View>
              <Text style={styles.slotHelpText}>Head-to-toe stance for proportions</Text>

              {frontPhotos.length > 0 ? (
                <View style={styles.photoCardsRow}>
                  {frontPhotos.map((p) => (
                    <PersonalPhotoCard
                      key={p.id}
                      photo={p}
                      onPress={() => setPreviewPhoto(p)}
                      onSetPrimary={() => handleSetPrimary(p.id)}
                      onReplace={() => handleReplacePhoto(p)}
                      onDelete={() => handleDeletePhoto(p)}
                    />
                  ))}
                  <TouchableOpacity
                    style={styles.addMiniPhotoCard}
                    onPress={() => handleOpenUploadSheet('fullBodyFront')}
                  >
                    <Ionicons name="add" size={20} color={Colors.primary} />
                    <Text style={styles.addMiniText}>Add</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.emptySlotButton}
                  onPress={() => handleOpenUploadSheet('fullBodyFront')}
                >
                  <Ionicons name="camera-outline" size={24} color={Colors.primary} />
                  <Text style={styles.emptySlotTitle}>Upload Full-Body Front</Text>
                  <Text style={styles.emptySlotDesc}>Stance with shoes visible</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Slot 3: Full-Body Side (Optional) */}
            <View style={styles.slotBlock}>
              <View style={styles.slotHeader}>
                <Ionicons name="walk-outline" size={16} color={Colors.primary} />
                <Text style={styles.slotTitle}>Full-Body Side</Text>
                <Text style={styles.slotOptionalBadge}>Optional</Text>
              </View>
              <Text style={styles.slotHelpText}>Side profile for fabric drape & posture</Text>

              {sidePhotos.length > 0 ? (
                <View style={styles.photoCardsRow}>
                  {sidePhotos.map((p) => (
                    <PersonalPhotoCard
                      key={p.id}
                      photo={p}
                      onPress={() => setPreviewPhoto(p)}
                      onSetPrimary={() => handleSetPrimary(p.id)}
                      onReplace={() => handleReplacePhoto(p)}
                      onDelete={() => handleDeletePhoto(p)}
                    />
                  ))}
                  <TouchableOpacity
                    style={styles.addMiniPhotoCard}
                    onPress={() => handleOpenUploadSheet('fullBodySide')}
                  >
                    <Ionicons name="add" size={20} color={Colors.primary} />
                    <Text style={styles.addMiniText}>Add</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.emptySlotButton}
                  onPress={() => handleOpenUploadSheet('fullBodySide')}
                >
                  <Ionicons name="camera-outline" size={24} color={Colors.primary} />
                  <Text style={styles.emptySlotTitle}>Upload Side Profile</Text>
                  <Text style={styles.emptySlotDesc}>Take photo or select from gallery</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Slot 4: Additional Reference Photos */}
            <View style={styles.slotBlock}>
              <View style={styles.slotHeader}>
                <Ionicons name="sparkles-outline" size={16} color={Colors.primaryGold} />
                <Text style={styles.slotTitle}>Personal Reference Photos</Text>
                <Text style={styles.slotOptionalBadge}>Flexible</Text>
              </View>
              <Text style={styles.slotHelpText}>Favorite outfits, styling inspirations, or trial looks</Text>

              {referencePhotos.length > 0 ? (
                <View style={styles.photoCardsRow}>
                  {referencePhotos.map((p) => (
                    <PersonalPhotoCard
                      key={p.id}
                      photo={p}
                      onPress={() => setPreviewPhoto(p)}
                      onSetPrimary={() => handleSetPrimary(p.id)}
                      onReplace={() => handleReplacePhoto(p)}
                      onDelete={() => handleDeletePhoto(p)}
                    />
                  ))}
                  <TouchableOpacity
                    style={styles.addMiniPhotoCard}
                    onPress={() => handleOpenUploadSheet('reference')}
                  >
                    <Ionicons name="add" size={20} color={Colors.primary} />
                    <Text style={styles.addMiniText}>Add</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.emptySlotButton}
                  onPress={() => handleOpenUploadSheet('reference')}
                >
                  <Ionicons name="images-outline" size={24} color={Colors.primary} />
                  <Text style={styles.emptySlotTitle}>Add Reference Look</Text>
                  <Text style={styles.emptySlotDesc}>Upload past outfits you love wearing</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* GENDER & SILHOUETTE PREFERENCE */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Styling Silhouette</Text>
          <View style={styles.genderRow}>
            {(['men', 'women', 'unisex'] as GenderPreference[]).map((g) => {
              const isSelected = gender === g;
              return (
                <TouchableOpacity
                  key={g}
                  onPress={() => {
                    setGender(g);
                    setSaveSuccess(false);
                  }}
                  style={[
                    styles.genderButton,
                    isSelected && styles.genderButtonActive,
                  ]}
                >
                  <Ionicons
                    name={
                      g === 'men'
                        ? 'man-outline'
                        : g === 'women'
                        ? 'woman-outline'
                        : 'people-outline'
                    }
                    size={18}
                    color={isSelected ? '#FFFFFF' : Colors.textPrimary}
                  />
                  <Text
                    style={[
                      styles.genderButtonText,
                      isSelected && styles.genderButtonTextActive,
                    ]}
                  >
                    {g.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* FAVORITE COLOURS */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Favorite Colors</Text>
          <Text style={styles.sectionSub}>
            Selected shades receive subtle priority in outfit recommendations
          </Text>
          <View style={styles.colorsGrid}>
            {FASHION_COLORS.map((col) => {
              const isSelected = favColors.includes(col.id);
              return (
                <View key={col.id} style={styles.chipCell}>
                  <ColorChip
                    color={col}
                    isSelected={isSelected}
                    onSelect={() => toggleColor(col.id)}
                    size="sm"
                  />
                </View>
              );
            })}
          </View>
        </View>

        {/* PREFERRED STYLES */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Preferred Aesthetics</Text>
          <View style={styles.stylesGrid}>
            {STYLES.map((st) => {
              const isSelected = prefStyles.includes(st);
              return (
                <TouchableOpacity
                  key={st}
                  onPress={() => toggleStyle(st)}
                  style={[
                    styles.stylePill,
                    isSelected && styles.stylePillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stylePillText,
                      isSelected && styles.stylePillTextActive,
                    ]}
                  >
                    {st}
                  </Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color="#FFFFFF"
                      style={{ marginLeft: 4 }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* SAVE CHANGES BUTTON */}
        <PrimaryButton
          title={saveSuccess ? 'Preferences Saved!' : 'Update Preferences'}
          onPress={handleSave}
          loading={saving}
          variant={saveSuccess ? 'gold' : 'primary'}
          size="lg"
          icon={
            <Ionicons
              name={saveSuccess ? 'checkmark-circle' : 'save-outline'}
              size={18}
              color="#FFFFFF"
            />
          }
          style={styles.saveBtn}
        />

        {/* ABOUT VASTHRA & BRAND VISION */}
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>VASTHRA</Text>
          <Text style={styles.aboutTagline}>Wear Your Confidence.</Text>
          <Text style={styles.aboutDesc}>
            Built with mathematical color harmony, timeless menswear & womenswear sartorial rules, and tailored local intelligence. Version 1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* PHOTO UPLOAD SHEET MODAL */}
      <Modal
        visible={isUploadSheetOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsUploadSheetOpen(false)}
      >
        <TouchableOpacity
          style={styles.sheetOverlay}
          activeOpacity={1}
          onPress={() => setIsUploadSheetOpen(false)}
        >
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>
              Upload {PHOTO_TYPE_CONFIG[uploadPhotoType]?.title}
            </Text>
            <Text style={styles.sheetSubtitle}>
              {PHOTO_TYPE_CONFIG[uploadPhotoType]?.subtitle}
            </Text>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={handleCapturePhoto}
            >
              <View style={styles.sheetOptionIconWrap}>
                <Ionicons name="camera" size={20} color={Colors.primary} />
              </View>
              <View style={styles.sheetOptionTextWrap}>
                <Text style={styles.sheetOptionTitle}>Take Photo with Camera</Text>
                <Text style={styles.sheetOptionDesc}>Capture live with natural lighting</Text>
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
                <Text style={styles.sheetOptionDesc}>Select an existing image from your gallery</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetCancelBtn}
              onPress={() => setIsUploadSheetOpen(false)}
            >
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* PHOTO PREVIEW & ACTIONS MODAL */}
      <Modal
        visible={!!previewPhoto}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewPhoto(null)}
      >
        <View style={styles.previewOverlay}>
          <View style={styles.previewCard}>
            {previewPhoto && (
              <>
                <View style={styles.previewImageContainer}>
                  <Image
                    source={{ uri: previewPhoto.uri }}
                    style={styles.previewLargeImage}
                    resizeMode="contain"
                  />
                  <TouchableOpacity
                    style={styles.previewCloseBtn}
                    onPress={() => setPreviewPhoto(null)}
                  >
                    <Ionicons name="close" size={20} color="#FFFFFF" />
                  </TouchableOpacity>

                  {previewPhoto.isPrimary && (
                    <View style={styles.primaryBadgePill}>
                      <Ionicons name="star" size={12} color="#FFFFFF" />
                      <Text style={styles.primaryBadgeText}>Primary Profile Photo</Text>
                    </View>
                  )}
                </View>

                <View style={styles.previewMetaSection}>
                  <Text style={styles.previewPhotoTitle}>{previewPhoto.label}</Text>
                  <Text style={styles.previewPhotoDate}>
                    Uploaded {new Date(previewPhoto.createdAt).toLocaleDateString()}
                  </Text>

                  {/* Actions */}
                  <View style={styles.previewActionsGrid}>
                    {!previewPhoto.isPrimary && (
                      <TouchableOpacity
                        style={styles.setPrimaryBtn}
                        onPress={() => handleSetPrimary(previewPhoto.id)}
                      >
                        <Ionicons name="star-outline" size={16} color={Colors.primaryGold} />
                        <Text style={styles.setPrimaryText}>Set as Primary Profile</Text>
                      </TouchableOpacity>
                    )}

                    <View style={styles.previewRowBtns}>
                      <TouchableOpacity
                        style={styles.previewReplaceBtn}
                        onPress={() => handleReplacePhoto(previewPhoto)}
                      >
                        <Ionicons name="camera-reverse-outline" size={16} color={Colors.primary} />
                        <Text style={styles.previewReplaceText}>Replace</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.previewDeleteBtn}
                        onPress={() => handleDeletePhoto(previewPhoto)}
                      >
                        <Ionicons name="trash-outline" size={16} color={Colors.scorePoor} />
                        <Text style={styles.previewDeleteText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

interface PersonalPhotoCardProps {
  photo: PersonalPhoto;
  onPress: () => void;
  onSetPrimary: () => void;
  onReplace: () => void;
  onDelete: () => void;
}

const PersonalPhotoCard: React.FC<PersonalPhotoCardProps> = ({
  photo,
  onPress,
  onSetPrimary,
  onReplace,
  onDelete,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={styles.photoCard}
    >
      <Image source={{ uri: photo.uri }} style={styles.photoCardImage} />

      {photo.isPrimary && (
        <View style={styles.photoPrimaryStar}>
          <Ionicons name="star" size={10} color="#FFFFFF" />
        </View>
      )}

      <View style={styles.photoCardOverlay}>
        <TouchableOpacity
          style={styles.photoMiniBtn}
          onPress={(e) => {
            e.stopPropagation();
            onReplace();
          }}
        >
          <Ionicons name="camera-reverse-outline" size={11} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.photoMiniBtn, styles.deleteMiniBtn]}
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Ionicons name="trash-outline" size={11} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
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
  profileHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primaryGold,
    position: 'relative',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(20,20,20,0.6)',
    alignItems: 'center',
    paddingVertical: 2,
  },
  profileMeta: {
    flex: 1,
  },
  nameInput: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  personaTag: {
    fontSize: 11,
    color: Colors.accentTaupe,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  photoCountText: {
    fontSize: 11,
    color: Colors.primaryGold,
    fontWeight: '600',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
    ...Shadows.subtle,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  addPhotoIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primaryGold,
    gap: 6,
    marginBottom: Spacing.md,
  },
  privacyBannerText: {
    fontSize: 11,
    color: Colors.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  photoSlotsContainer: {
    gap: Spacing.md,
  },
  slotBlock: {
    backgroundColor: Colors.surfaceElevated,
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  slotTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  slotRequiredBadge: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Colors.primaryGold,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  slotOptionalBadge: {
    fontSize: 9.5,
    fontWeight: '600',
    color: Colors.textMuted,
    backgroundColor: Colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  slotHelpText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    marginBottom: 8,
  },
  photoCardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emptySlotButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  emptySlotTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptySlotDesc: {
    fontSize: 10.5,
    color: Colors.textMuted,
  },
  photoCard: {
    width: 76,
    height: 98,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  photoCardImage: {
    width: '100%',
    height: '100%',
  },
  photoPrimaryStar: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: Colors.primaryGold,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCardOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    flexDirection: 'row',
    gap: 3,
  },
  photoMiniBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(20,20,20,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteMiniBtn: {
    backgroundColor: 'rgba(193, 41, 46, 0.8)',
  },
  addMiniPhotoCard: {
    width: 76,
    height: 98,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    gap: 2,
  },
  addMiniText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  genderRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    backgroundColor: Colors.surfaceElevated,
    gap: 6,
  },
  genderButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  genderButtonTextActive: {
    color: '#FFFFFF',
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.xs,
  },
  chipCell: {
    marginBottom: 4,
  },
  stylesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.xs,
  },
  stylePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    backgroundColor: Colors.surfaceElevated,
  },
  stylePillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stylePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  stylePillTextActive: {
    color: '#FFFFFF',
  },
  saveBtn: {
    marginBottom: Spacing.xl,
  },
  aboutCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 3,
    color: Colors.primary,
    marginBottom: 4,
  },
  aboutTagline: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primaryGold,
    letterSpacing: 1,
    marginBottom: 8,
  },
  aboutDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 280,
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
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  previewCard: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.card,
  },
  previewImageContainer: {
    height: 340,
    backgroundColor: '#0D0D0D',
    position: 'relative',
  },
  previewLargeImage: {
    width: '100%',
    height: '100%',
  },
  previewCloseBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(20,20,20,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBadgePill: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryGold,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  primaryBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  previewMetaSection: {
    padding: Spacing.md,
  },
  previewPhotoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  previewPhotoDate: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  previewActionsGrid: {
    gap: 8,
  },
  setPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: Colors.primaryGold,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  setPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryGold,
  },
  previewRowBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  previewReplaceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  previewReplaceText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  previewDeleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(193, 41, 46, 0.1)',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  previewDeleteText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.scorePoor,
  },
});
