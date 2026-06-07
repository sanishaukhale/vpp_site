import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, firebaseEnabled } from "./firebase";

/**
 * Uploads a Blob to Firebase Storage or converts to base64 in local mode
 * @param {Blob} blob - The image blob to upload
 * @param {string} folder - Destination folder name
 * @returns {Promise<string>} The download URL or base64 data URL
 */
export const uploadImage = async (blob, folder = "images") => {
  if (!firebaseEnabled || !storage) {
    // Local Storage Fallback: Convert to Base64 data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to read image file."));
      reader.readAsDataURL(blob);
    });
  }

  try {
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 11)}.jpg`;
    const storageRef = ref(storage, fileName);
    const metadata = { contentType: 'image/jpeg' };
    
    const snapshot = await uploadBytes(storageRef, blob, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.error("Firebase storage upload failed, falling back to Base64:", error);
    // Fallback to base64 if upload fails
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => reject(error);
      reader.readAsDataURL(blob);
    });
  }
};
