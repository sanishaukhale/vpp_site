import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../../utils/cropImage";
import { uploadImage } from "../../firebase/storage";

/**
 * Image Upload Component with built-in Cropper Modal
 * @param {Function} onUploadComplete - Callback when upload finishes, receives URL string
 * @param {number} aspect - Aspect ratio (width / height)
 * @param {string} folder - Destination folder name in storage
 */
const ImageUploadWithCrop = ({ onUploadComplete, aspect = 4 / 3, folder = "images" }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploading, setUploading] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setUploading(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const imageUrl = await uploadImage(croppedBlob, folder);
      onUploadComplete(imageUrl);
      setImageSrc(null); // Clear cropper modal
    } catch (error) {
      console.error("Failed to crop and upload image:", error);
      alert("Failed to process and upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setImageSrc(null);
  };

  return (
    <div className="image-upload-wrapper">
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} 
        className="form-control" 
        style={{ padding: "0.5rem" }}
      />
      
      {imageSrc && (
        <div 
          className="cropper-modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem"
          }}
        >
          <div 
            className="cropper-modal-content"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "600px",
              height: "400px",
              backgroundColor: "#fff",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              marginBottom: "1.5rem"
            }}
          >
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>

          {/* Cropper controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", maxWidth: "600px", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", width: "100%", color: "#fff" }}>
              <span>Zoom:</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                style={{ flex: 1 }}
              />
            </div>
            
            <div style={{ display: "flex", gap: "1rem" }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleCancel}
                disabled={uploading}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleSaveCrop}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Crop & Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadWithCrop;
