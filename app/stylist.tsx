import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import { BrandHeader } from '../components/BrandHeader';
import { BorderRadius, Colors, Shadows, Spacing } from '../constants/theme';
import {
  captureImageWithCamera,
  pickImageFromGallery,
} from '../services/imageStorage';
import {
  getUserProfile,
  getWardrobeItems,
} from '../services/storage';
import { getStylistResponse, INITIAL_STYLIST_MESSAGES } from '../services/stylistBot';
import { PersonalPhoto, StylistMessage, WardrobeItem } from '../types';

export default function StylistChatScreen() {
  const [messages, setMessages] = useState<StylistMessage[]>(INITIAL_STYLIST_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [attachedImageUri, setAttachedImageUri] = useState<string | null>(null);
  const [attachedWardrobeItem, setAttachedWardrobeItem] = useState<WardrobeItem | null>(null);
  const [isPersonalPhotoAttachment, setIsPersonalPhotoAttachment] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Attachment Source Sheet & Wardrobe Picker
  const [isAttachSheetOpen, setIsAttachSheetOpen] = useState(false);
  const [isWardrobePickerOpen, setIsWardrobePickerOpen] = useState(false);
  const [isProfilePhotoPickerOpen, setIsProfilePhotoPickerOpen] = useState(false);

  // Data
  const [wardrobeList, setWardrobeList] = useState<WardrobeItem[]>([]);
  const [personalPhotos, setPersonalPhotos] = useState<PersonalPhoto[]>([]);

  useEffect(() => {
    async function loadData() {
      const items = await getWardrobeItems();
      setWardrobeList(items);
      const profile = await getUserProfile();
      setPersonalPhotos(profile.photos || []);
    }
    loadData();
  }, []);

  const sendMessage = (textToSend?: string) => {
    const content = textToSend || inputText.trim();
    if (!content && !attachedImageUri && !attachedWardrobeItem) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    const defaultText = attachedWardrobeItem
      ? `How should I style my ${attachedWardrobeItem.name}?`
      : attachedImageUri
      ? 'How should I style this clothing piece?'
      : '';

    const userMsg: StylistMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: content || defaultText,
      timestamp: Date.now(),
      imageUri: attachedImageUri || attachedWardrobeItem?.imageUri,
      attachedWardrobeItem: attachedWardrobeItem || undefined,
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInputText('');

    const queryOptions = {
      hasImage: !!attachedImageUri || !!attachedWardrobeItem,
      imageUri: attachedImageUri || attachedWardrobeItem?.imageUri,
      attachedItem: attachedWardrobeItem || undefined,
      isPersonalPhoto: isPersonalPhotoAttachment,
      wardrobeContext: wardrobeList,
    };

    setAttachedImageUri(null);
    setAttachedWardrobeItem(null);
    setIsPersonalPhotoAttachment(false);
    setIsTyping(true);

    setTimeout(() => {
      const response = getStylistResponse(content || defaultText, queryOptions);
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 550);
  };

  // Handlers for image attachment options
  const handleCameraCapture = async () => {
    setIsAttachSheetOpen(false);
    const uri = await captureImageWithCamera([1, 1]);
    if (uri) {
      setAttachedImageUri(uri);
      setAttachedWardrobeItem(null);
      setIsPersonalPhotoAttachment(false);
    }
  };

  const handleGalleryPick = async () => {
    setIsAttachSheetOpen(false);
    const uri = await pickImageFromGallery([1, 1]);
    if (uri) {
      setAttachedImageUri(uri);
      setAttachedWardrobeItem(null);
      setIsPersonalPhotoAttachment(false);
    }
  };

  const handleSelectWardrobeItem = (item: WardrobeItem) => {
    setAttachedWardrobeItem(item);
    setAttachedImageUri(item.imageUri);
    setIsPersonalPhotoAttachment(false);
    setIsWardrobePickerOpen(false);
    setIsAttachSheetOpen(false);
  };

  const handleSelectPersonalPhoto = (photo: PersonalPhoto) => {
    setAttachedImageUri(photo.uri);
    setAttachedWardrobeItem(null);
    setIsPersonalPhotoAttachment(true);
    setIsProfilePhotoPickerOpen(false);
    setIsAttachSheetOpen(false);
  };

  const handleRemoveAttachment = () => {
    setAttachedImageUri(null);
    setAttachedWardrobeItem(null);
    setIsPersonalPhotoAttachment(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <BrandHeader
        title="VASTHRA"
        subtitle="AI Fashion Stylist"
        showBack={true}
        rightAction="none"
      />

      {/* AI VISION TRANSPARENT NOTICE BANNER */}
      <View style={styles.aiVisionBanner}>
        <Ionicons name="sparkles" size={14} color={Colors.primaryGold} />
        <Text style={styles.aiVisionBannerText}>
          VASTHRA Rule-Based Sartorial Engine active. Real-time wardrobe & color matching.
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const isUser = item.sender === 'user';
            return (
              <View
                style={[
                  styles.messageRow,
                  isUser ? styles.messageRowUser : styles.messageRowStylist,
                ]}
              >
                {!isUser && (
                  <View style={styles.stylistAvatar}>
                    <Ionicons name="sparkles" size={14} color={Colors.primaryGold} />
                  </View>
                )}

                <View
                  style={[
                    styles.bubble,
                    isUser ? styles.userBubble : styles.stylistBubble,
                  ]}
                >
                  {/* Attached Image Preview */}
                  {item.imageUri && (
                    <View style={styles.attachedImageContainer}>
                      <Image
                        source={{ uri: item.imageUri }}
                        style={styles.attachedPreview}
                        resizeMode="cover"
                      />
                      {item.attachedWardrobeItem && (
                        <View style={styles.garmentTagPill}>
                          <Text style={styles.garmentTagText}>
                            {item.attachedWardrobeItem.name}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Message Text */}
                  <Text
                    style={[
                      styles.messageText,
                      isUser ? styles.userMessageText : styles.stylistMessageText,
                    ]}
                  >
                    {item.text}
                  </Text>

                  {/* AI Vision Disclosure Card for transparent communication */}
                  {item.isAiVisionNotice && (
                    <View style={styles.visionNoticeCard}>
                      <Ionicons name="information-circle-outline" size={16} color={Colors.primaryGold} />
                      <Text style={styles.visionNoticeCardText}>
                        Cloud AI Vision API is ready to connect for automatic pixel segmentation. Currently, advice is generated via mathematical color theory and your cataloged wardrobe.
                      </Text>
                    </View>
                  )}

                  {/* Swatches preview if provided */}
                  {item.colorSwatches && item.colorSwatches.length > 0 && (
                    <View style={styles.swatchesRow}>
                      <Text style={styles.swatchesLabel}>Suggested Palette:</Text>
                      <View style={styles.swatchDotsList}>
                        {item.colorSwatches.map((colorHex: string, idx: number) => (
                          <View
                            key={idx}
                            style={[
                              styles.swatchDot,
                              { backgroundColor: colorHex },
                              (colorHex === '#FFFFFF' || colorHex === '#F5EFE6') && styles.lightBorder,
                            ]}
                          />
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Suggested Chips */}
                  {item.chips && item.chips.length > 0 && (
                    <View style={styles.chipsContainer}>
                      {item.chips.map((chip: string, idx: number) => (
                        <TouchableOpacity
                          key={idx}
                          activeOpacity={0.7}
                          onPress={() => {
                            if (chip === 'Pick from my wardrobe') {
                              setIsWardrobePickerOpen(true);
                            } else {
                              sendMessage(chip);
                            }
                          }}
                          style={styles.chipButton}
                        >
                          <Text style={styles.chipButtonText}>{chip}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            );
          }}
        />

        {isTyping && (
          <View style={styles.typingIndicatorRow}>
            <View style={styles.stylistAvatar}>
              <Ionicons name="sparkles" size={12} color={Colors.primaryGold} />
            </View>
            <Text style={styles.typingText}>Stylist is analyzing satorial harmony...</Text>
          </View>
        )}

        {/* ATTACHED IMAGE PRE-SEND BAR */}
        {attachedImageUri && (
          <View style={styles.attachedImageBar}>
            <Image
              source={{ uri: attachedImageUri }}
              style={styles.thumbnail}
            />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text numberOfLines={1} style={styles.attachedImageText}>
                {attachedWardrobeItem
                  ? `Wardrobe: ${attachedWardrobeItem.name}`
                  : isPersonalPhotoAttachment
                  ? 'Personal Reference Photo'
                  : 'Clothing Photo Attached'}
              </Text>
              <Text style={styles.attachedImageSub}>Ready to send to Stylist</Text>
            </View>
            <TouchableOpacity
              onPress={handleRemoveAttachment}
              style={styles.removeAttachedBtn}
            >
              <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* INPUT BAR */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsAttachSheetOpen(true)}
            style={styles.attachBtn}
          >
            <Ionicons name="camera-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Ask about matching, shoes, wedding look..."
            placeholderTextColor={Colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline={true}
            maxLength={400}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => sendMessage()}
            disabled={!inputText.trim() && !attachedImageUri && !attachedWardrobeItem}
            style={[
              styles.sendBtn,
              (!inputText.trim() && !attachedImageUri && !attachedWardrobeItem) &&
                styles.sendBtnDisabled,
            ]}
          >
            <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ATTACH PHOTO OPTIONS SHEET */}
      <Modal
        visible={isAttachSheetOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAttachSheetOpen(false)}
      >
        <TouchableOpacity
          style={styles.sheetOverlay}
          activeOpacity={1}
          onPress={() => setIsAttachSheetOpen(false)}
        >
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Attach Image to Stylist</Text>
            <Text style={styles.sheetSubtitle}>
              Select real clothes or a personal photo to receive tailored advice.
            </Text>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => {
                setIsAttachSheetOpen(false);
                setIsWardrobePickerOpen(true);
              }}
            >
              <View style={styles.sheetOptionIconWrap}>
                <Ionicons name="shirt" size={20} color={Colors.primary} />
              </View>
              <View style={styles.sheetOptionTextWrap}>
                <Text style={styles.sheetOptionTitle}>Pick from Digital Wardrobe</Text>
                <Text style={styles.sheetOptionDesc}>
                  Select from your {wardrobeList.length} cataloged garments
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={handleCameraCapture}
            >
              <View style={styles.sheetOptionIconWrap}>
                <Ionicons name="camera" size={20} color={Colors.primaryGold} />
              </View>
              <View style={styles.sheetOptionTextWrap}>
                <Text style={styles.sheetOptionTitle}>Take Photo with Camera</Text>
                <Text style={styles.sheetOptionDesc}>Photograph an item right now</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={handleGalleryPick}
            >
              <View style={styles.sheetOptionIconWrap}>
                <Ionicons name="images" size={20} color={Colors.accentOlive} />
              </View>
              <View style={styles.sheetOptionTextWrap}>
                <Text style={styles.sheetOptionTitle}>Choose from Photo Library</Text>
                <Text style={styles.sheetOptionDesc}>Upload from phone gallery</Text>
              </View>
            </TouchableOpacity>

            {personalPhotos.length > 0 && (
              <TouchableOpacity
                style={styles.sheetOption}
                onPress={() => {
                  setIsAttachSheetOpen(false);
                  setIsProfilePhotoPickerOpen(true);
                }}
              >
                <View style={styles.sheetOptionIconWrap}>
                  <Ionicons name="person" size={20} color={Colors.primary} />
                </View>
                <View style={styles.sheetOptionTextWrap}>
                  <Text style={styles.sheetOptionTitle}>My Profile Style Photos</Text>
                  <Text style={styles.sheetOptionDesc}>
                    Use your uploaded face or full-body reference
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.sheetCancelBtn}
              onPress={() => setIsAttachSheetOpen(false)}
            >
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* WARDROBE PICKER MODAL */}
      <Modal
        visible={isWardrobePickerOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsWardrobePickerOpen(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderTitle}>Pick from Your Wardrobe</Text>
            <TouchableOpacity
              onPress={() => setIsWardrobePickerOpen(false)}
              style={styles.modalCloseBtn}
            >
              <Ionicons name="close" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={wardrobeList}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.wardrobePickerGrid}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.wardrobePickerCard}
                onPress={() => handleSelectWardrobeItem(item)}
              >
                <Image source={{ uri: item.imageUri }} style={styles.wardrobePickerImg} />
                <View style={styles.wardrobePickerContent}>
                  <Text numberOfLines={1} style={styles.wardrobePickerName}>
                    {item.name}
                  </Text>
                  <Text style={styles.wardrobePickerMeta}>
                    {item.color} • {item.category}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* PROFILE STYLE PHOTOS PICKER MODAL */}
      <Modal
        visible={isProfilePhotoPickerOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsProfilePhotoPickerOpen(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderTitle}>My Style Reference Photos</Text>
            <TouchableOpacity
              onPress={() => setIsProfilePhotoPickerOpen(false)}
              style={styles.modalCloseBtn}
            >
              <Ionicons name="close" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={personalPhotos}
            keyExtractor={(p) => p.id}
            numColumns={2}
            contentContainerStyle={styles.wardrobePickerGrid}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.wardrobePickerCard}
                onPress={() => handleSelectPersonalPhoto(item)}
              >
                <Image source={{ uri: item.uri }} style={styles.wardrobePickerImg} />
                <View style={styles.wardrobePickerContent}>
                  <Text numberOfLines={1} style={styles.wardrobePickerName}>
                    {item.label}
                  </Text>
                  <Text style={styles.wardrobePickerMeta}>
                    {item.isPrimary ? 'Primary Profile' : 'Style Reference'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  aiVisionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    gap: 6,
  },
  aiVisionBannerText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  messagesList: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    maxWidth: '85%',
  },
  messageRowStylist: {
    alignSelf: 'flex-start',
  },
  messageRowUser: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  stylistAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
    ...Shadows.subtle,
  },
  bubble: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  stylistBubble: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    ...Shadows.subtle,
    borderTopLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderTopRightRadius: 4,
  },
  attachedImageContainer: {
    marginBottom: 8,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  attachedPreview: {
    width: 200,
    height: 160,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
  },
  garmentTagPill: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(20,20,20,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  garmentTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  messageText: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  stylistMessageText: {
    color: Colors.textPrimary,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  visionNoticeCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    padding: 8,
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 2,
    borderLeftColor: Colors.primaryGold,
    marginTop: 8,
    gap: 6,
  },
  visionNoticeCardText: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
    flex: 1,
  },
  swatchesRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  swatchesLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  swatchDotsList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swatchDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  lightBorder: {
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  chipButton: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  chipButtonText: {
    fontSize: 11.5,
    color: Colors.primary,
    fontWeight: '600',
  },
  typingIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    gap: 8,
  },
  typingText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  attachedImageBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  thumbnail: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceElevated,
  },
  attachedImageText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  attachedImageSub: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  removeAttachedBtn: {
    padding: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    gap: 8,
  },
  attachBtn: {
    padding: 6,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13.5,
    color: Colors.textPrimary,
    maxHeight: 90,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.35,
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
  modalSafeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalCloseBtn: {
    padding: 4,
  },
  wardrobePickerGrid: {
    padding: Spacing.sm,
  },
  wardrobePickerCard: {
    flex: 1,
    margin: 4,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    ...Shadows.subtle,
  },
  wardrobePickerImg: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.surfaceElevated,
  },
  wardrobePickerContent: {
    padding: Spacing.sm,
  },
  wardrobePickerName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  wardrobePickerMeta: {
    fontSize: 10.5,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
