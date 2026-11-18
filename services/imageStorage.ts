import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

const VASTHRA_IMG_SUBDIR = 'vasthra_images/';

// IndexedDB Helper for Web persistence
const DB_NAME = 'vasthra_storage_db';
const DB_STORE = 'images';

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

async function deleteWebImageFromDB(key: string): Promise<void> {
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

// Convert a web blob URI into a persistent Data URL so browser reloads won't invalidate it
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
    console.warn('Web blob to Data URL conversion failed:', err);
    return blobUri;
  }
}

/**
 * Ensures the native persistent images directory exists.
 */
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

/**
 * Request camera permissions with user guidance.
 */
export async function requestCameraPermission(): Promise<boolean> {
  try {
    const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Needed',
        canAskAgain
          ? 'VASTHRA needs camera access so you can photograph your clothes and style references.'
          : 'Camera access is disabled. Please enable camera permissions in your device settings to take photos.',
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

/**
 * Request photo library permissions with user guidance.
 */
export async function requestGalleryPermission(): Promise<boolean> {
  try {
    const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Gallery Permission Needed',
        canAskAgain
          ? 'VASTHRA needs access to your photo library to import your clothing photos.'
          : 'Photo library access is disabled. Please enable it in your device settings.',
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

/**
 * Pick an image from device gallery with square/custom aspect editing.
 */
export async function pickImageFromGallery(aspect: [number, number] = [1, 1]): Promise<string | null> {
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
    console.warn('Failed to pick image from gallery:', e);
    return null;
  }
}

/**
 * Capture an image with device camera with cropping preview.
 */
export async function captureImageWithCamera(aspect: [number, number] = [1, 1]): Promise<string | null> {
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
    console.warn('Failed to capture photo with camera:', e);
    return null;
  }
}

/**
 * Saves a temporary image URI into permanent local app storage.
 * On Native: Copies to FileSystem.documentDirectory/vasthra_images/
 * On Web: Converts blob to persistent Data URL and mirrors to IndexedDB.
 */
export async function savePersistentImage(tempUri: string, prefix = 'garment'): Promise<string> {
  // If it's already an external HTTP URL, keep it
  if (tempUri.startsWith('http://') || tempUri.startsWith('https://')) {
    return tempUri;
  }

  // Web Environment handling
  if (Platform.OS === 'web') {
    if (tempUri.startsWith('data:')) {
      const key = `vasthra_${prefix}_${Date.now()}`;
      await saveWebImageToDB(key, tempUri);
      return tempUri;
    }
    if (tempUri.startsWith('blob:')) {
      const dataUrl = await convertBlobToDataUrl(tempUri);
      const key = `vasthra_${prefix}_${Date.now()}`;
      await saveWebImageToDB(key, dataUrl);
      return dataUrl;
    }
    return tempUri;
  }

  // Native iOS / Android handling
  try {
    const dir = await ensureDirExists();
    if (!dir) return tempUri;

    // Clean extension
    const cleanUri = tempUri.split('?')[0];
    const extMatch = cleanUri.match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? extMatch[1] : 'jpg';

    const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const destination = `${dir}${filename}`;

    await FileSystem.copyAsync({
      from: tempUri,
      to: destination,
    });

    return destination;
  } catch (err) {
    console.warn('Error saving persistent image to local documents:', err);
    return tempUri; // Graceful fallback
  }
}

/**
 * Deletes a persistently stored image when an item or personal photo is deleted.
 */
export async function deletePersistentImage(uri?: string): Promise<void> {
  if (!uri) return;

  // Never delete remote web image seeds
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    return;
  }

  if (Platform.OS === 'web') {
    // Clean up web storage if applicable
    return;
  }

  try {
    if (FileSystem.documentDirectory && uri.includes(VASTHRA_IMG_SUBDIR)) {
      const info = await FileSystem.getInfoAsync(uri);
      if (info.exists) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
    }
  } catch (err) {
    console.warn('Error deleting persistent image file:', err);
  }
}

