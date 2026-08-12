import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, firebaseEnabled } from "./firebase";

/**
 * Uploads a Blob to Firebase Storage or converts to base64 in local mode
 * @param {Blob} blob - The image blob to upload
 * @param {string} folder - Destination folder name
 * @returns {Promise<string>} The download URL or base64 data URL
 */
export const uploadImage = async (blob, folder = "images") => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(blob);
  });
};
