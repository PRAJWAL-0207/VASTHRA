import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';

const VASTHRA_IMG_SUBDIR = 'vasthra_images/';
const URI_PREFIX = 'vasthra-img://';

// ============================================================================
// WEB PERSISTENCE HELPER (IndexedDB + In-Memory Cache)
// ============================================================================
const DB_NAME = 'vasthra_storage_db';
const DB_STORE = 'images';
const webImageCache = new Map<string, string>();

function getWebDB(): Promise<IDBDatabase | null> {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function saveWebImageToDB(key: string, dataUrl: string): Promise<void> {
  webImageCache.set(key, dataUrl);
  const db = await getWebDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(DB_STORE, 'readwrite');
      const store = tx.objectStore(DB_STORE);
      store.put(dataUrl, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function getWebImageFromDB(key: string): Promise<string | null> {
  if (webImageCache.has(key)) {
    return webImageCache.get(key) || null;
  }
  const db = await getWebDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(DB_STORE, 'readonly');
      const store = tx.objectStore(DB_STORE);
      const req = store.get(key);
      req.onsuccess = () => {
        const result = req.result as string | undefined;
        if (result) {
          webImageCache.set(key, result);
          resolve(result);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function deleteWebImageFromDB(key: string): Promise<void> {
  webImageCache.delete(key);
  const db = await getWebDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(DB_STORE, 'readwrite');
      const store = tx.objectStore(DB_STORE);
      store.delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function convertBlobToDataUrl(blobUri: string): Promise<string> {
  try {
    const response = await fetch(blobUri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          resolve(blobUri);
        }
      };
      reader.onerror = () => reject(new Error('Failed reading blob'));
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('Web blob conversion failed:', err);
    return blobUri;
  }
}

// ============================================================================
// NATIVE FILE SYSTEM HELPERS
// ============================================================================
async function ensureDirExists(): Promise<string | null> {
  if (Platform.OS === 'web' || !FileSystem.documentDirectory) {
    return null;
  }
  const dir = `${FileSystem.documentDirectory}${VASTHRA_IMG_SUBDIR}`;
  try {
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
    return dir;
  } catch (error) {
    console.warn('Error creating persistent images directory:', error);
    return null;
  }
}

// ============================================================================
// PERMISSION MANAGERS
// ============================================================================
export async function requestCameraPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return true;
  try {
    const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Needed',
        canAskAgain
          ? 'VASTHRA needs camera access so you can photograph your clothes and personal style references.'
          : 'Camera access is disabled. Please enable camera access in your device settings.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error requesting camera permissions:', err);
    return false;
  }
}

export async function requestGalleryPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return true;
  try {
    const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Gallery Permission Needed',
        canAskAgain
          ? 'VASTHRA needs access to your photo library to select clothing photographs.'
          : 'Photo library access is disabled. Please enable photo access in your device settings.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error requesting gallery permissions:', err);
    return false;
  }
}

// ============================================================================
// IMAGE PICKER & CAMERA LAUNCHERS
// ============================================================================
export async function pickImage(aspect: [number, number] = [1, 1]): Promise<string | null> {
  const hasPerm = await requestGalleryPermission();
  if (!hasPerm) return null;

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect,
      quality: 0.85,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    return null;
  } catch (e) {
    console.warn('Gallery pick error:', e);
    return null;
  }
}

export async function capturePhoto(aspect: [number, number] = [1, 1]): Promise<string | null> {
  const hasPerm = await requestCameraPermission();
  if (!hasPerm) return null;

  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect,
      quality: 0.85,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    return null;
  } catch (e) {
    console.warn('Camera capture error:', e);
    return null;
  }
}

// Backward-compatible aliases
export const pickImageFromGallery = pickImage;
export const captureImageWithCamera = capturePhoto;

// ============================================================================
// CORE IMAGE STORAGE SERVICE (saveImage, deleteImage, replaceImage, getImage, validateImage)
// ============================================================================

/**
 * Optimizes an image (resizing large dimensions & compressing JPEG) before storing.
 */
async function optimizeImage(sourceUri: string): Promise<string> {
  if (sourceUri.startsWith('http://') || sourceUri.startsWith('https://')) {
    return sourceUri;
  }
  if (Platform.OS === 'web') {
    return sourceUri;
  }
  try {
    const manipulated = await ImageManipulator.manipulateAsync(
      sourceUri,
      [{ resize: { width: 1080 } }],
      { compress: 0.82, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipulated.uri;
  } catch {
    return sourceUri;
  }
}

/**
 * Saves a temporary image URI into persistent storage.
 * Returns a canonical relative URI (e.g. `vasthra-img://garment_123.jpg`).
 * This protects AsyncStorage from large base64 strings and prevents iOS container UUID invalidation.
 */
export async function saveImage(sourceUri: string, prefix = 'garment'): Promise<string> {
  if (!sourceUri) return '';

  // Remote URLs remain as-is
  if (sourceUri.startsWith('http://') || sourceUri.startsWith('https://')) {
    return sourceUri;
  }

  // Already a canonical stored image
  if (sourceUri.startsWith(URI_PREFIX)) {
    return sourceUri;
  }

  const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;

  // Web persistence via IndexedDB
  if (Platform.OS === 'web') {
    let dataUrl = sourceUri;
    if (sourceUri.startsWith('blob:')) {
      dataUrl = await convertBlobToDataUrl(sourceUri);
    }
    await saveWebImageToDB(filename, dataUrl);
    return `${URI_PREFIX}${filename}`;
  }

  // Native persistent file storage (iOS & Android)
  try {
    const dir = await ensureDirExists();
    if (!dir) return sourceUri;

    const optimized = await optimizeImage(sourceUri);
    const destination = `${dir}${filename}`;

    await FileSystem.copyAsync({
      from: optimized,
      to: destination,
    });

    return `${URI_PREFIX}${filename}`;
  } catch (err) {
    console.warn('Failed saving persistent image to disk:', err);
    return sourceUri;
  }
}

export const savePersistentImage = saveImage;

/**
 * Deletes a persistently stored image.
 */
export async function deleteImage(uri?: string): Promise<void> {
  if (!uri) return;

  // Never delete remote web image seeds
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    return;
  }

  if (Platform.OS === 'web') {
    const key = uri.startsWith(URI_PREFIX)
      ? uri.replace(URI_PREFIX, '')
      : uri;
    await deleteWebImageFromDB(key);
    return;
  }

  try {
    const filename = uri.startsWith(URI_PREFIX)
      ? uri.replace(URI_PREFIX, '')
      : uri.includes(VASTHRA_IMG_SUBDIR)
      ? uri.split(VASTHRA_IMG_SUBDIR).pop()
      : null;

    if (filename && FileSystem.documentDirectory) {
      const fullPath = `${FileSystem.documentDirectory}${VASTHRA_IMG_SUBDIR}${filename}`;
      const info = await FileSystem.getInfoAsync(fullPath);
      if (info.exists) {
        await FileSystem.deleteAsync(fullPath, { idempotent: true });
      }
    }
  } catch (err) {
    console.warn('Error deleting persistent image file:', err);
  }
}

export const deletePersistentImage = deleteImage;

/**
 * Replaces an existing image with a new source image.
 * Safely removes the old image file if it is local.
 */
export async function replaceImage(oldUri: string, newSourceUri: string, prefix = 'garment'): Promise<string> {
  if (oldUri === newSourceUri) return oldUri;
  const newCanonical = await saveImage(newSourceUri, prefix);
  if (oldUri && oldUri !== newCanonical) {
    await deleteImage(oldUri);
  }
  return newCanonical;
}

/**
 * Resolves a canonical relative URI (vasthra-img://...) or legacy file path into
 * a live, displayable URI suitable for <Image source={{ uri }} />.
 */
export function resolveImageUri(uri?: string): string {
  if (!uri) return '';

  if (uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('data:') || uri.startsWith('blob:')) {
    return uri;
  }

  // Web resolution
  if (Platform.OS === 'web') {
    if (uri.startsWith(URI_PREFIX)) {
      const key = uri.replace(URI_PREFIX, '');
      const cached = webImageCache.get(key);
      if (cached) return cached;
      // Trigger background retrieval if not yet loaded
      getWebImageFromDB(key);
      return cached || uri;
    }
    return uri;
  }

  // Native resolution (heals iOS container UUID shifts across app restarts)
  if (FileSystem.documentDirectory) {
    if (uri.startsWith(URI_PREFIX)) {
      const filename = uri.replace(URI_PREFIX, '');
      return `${FileSystem.documentDirectory}${VASTHRA_IMG_SUBDIR}${filename}`;
    }
    // Heal legacy absolute file paths where the UUID changed
    if (uri.includes(VASTHRA_IMG_SUBDIR)) {
      const filename = uri.split(VASTHRA_IMG_SUBDIR).pop();
      if (filename) {
        return `${FileSystem.documentDirectory}${VASTHRA_IMG_SUBDIR}${filename}`;
      }
    }
  }

  return uri;
}

/**
 * Async version of getImage that ensures Web IndexedDB images are fully loaded.
 */
export async function getImage(uri: string): Promise<string> {
  if (!uri) return '';
  if (Platform.OS === 'web' && uri.startsWith(URI_PREFIX)) {
    const key = uri.replace(URI_PREFIX, '');
    const dataUrl = await getWebImageFromDB(key);
    if (dataUrl) return dataUrl;
  }
  return resolveImageUri(uri);
}

/**
 * Validates that an image file or web entry exists and is accessible.
 */
export async function validateImage(uri: string): Promise<boolean> {
  if (!uri) return false;
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    return true;
  }

  if (Platform.OS === 'web') {
    if (uri.startsWith(URI_PREFIX)) {
      const key = uri.replace(URI_PREFIX, '');
      const val = await getWebImageFromDB(key);
      return !!val;
    }
    return true;
  }

  try {
    const livePath = resolveImageUri(uri);
    const info = await FileSystem.getInfoAsync(livePath);
    return info.exists;
  } catch {
    return false;
  }
}

/**
 * Checks an array of items and recovers any with broken or missing local images.
 */
export async function recoverMissingImages<T extends { imageUri: string; category?: string }>(
  items: T[],
  fallbackMap: Record<string, string>
): Promise<T[]> {
  const recovered: T[] = [];
  for (const item of items) {
    const isValid = await validateImage(item.imageUri);
    if (!isValid && item.category && fallbackMap[item.category]) {
      recovered.push({ ...item, imageUri: fallbackMap[item.category] });
    } else {
      recovered.push(item);
    }
  }
  return recovered;
}

// ============================================================================
// CROSS-PLATFORM CONFIRMATION DIALOG (Works on iOS, Android, and Web)
// ============================================================================
export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText = 'Delete',
  isDestructive = true
): void {
  if (Platform.OS === 'web') {
    const confirmed = typeof window !== 'undefined' && window.confirm
      ? window.confirm(`${title}\n\n${message}`)
      : true;
    if (confirmed) {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: confirmText,
        style: isDestructive ? 'destructive' : 'default',
        onPress: onConfirm,
      },
    ]);
  }
}
