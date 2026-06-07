export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // avoid CORS issues
    image.src = url;
  });

/**
 * Returns the cropped image blob from pixel dimensions
 * @param {string} imageSrc - URL or DataURL of source image
 * @param {Object} pixelCrop - { x, y, width, height } pixel crop values
 * @returns {Promise<Blob>} Cropped image file as blob
 */
export async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error("Could not get 2D canvas context");
  }

  // Set canvas size to the cropped dimensions
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped portion of the image onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Return a promise that resolves with the cropped image blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Canvas is empty"));
      }
    }, 'image/jpeg', 0.85); // 85% quality jpeg
  });
}
