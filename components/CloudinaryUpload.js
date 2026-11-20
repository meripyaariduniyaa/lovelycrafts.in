'use client';

import { useState, useRef } from 'react';
import { triggerHaptic } from '@/lib/haptics';

export default function CloudinaryUpload({
  onUpload,
  maxPhotos = 6,
  currentCount = 0,
  images,
  setImages,
  maxImages,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'vkcgnlm1';
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'apology_images';

  const effectiveMax = maxImages ?? maxPhotos;
  const effectiveCount = Array.isArray(images) ? images.length : currentCount;

  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setUploadProgress(10);
    setUploadError('');

    const files = Array.from(fileList);
    let workingImages = Array.isArray(images) ? [...images] : [];
    let completed = 0;

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select image files only.');
        continue;
      }
      if (file.size > 15 * 1024 * 1024) {
        setUploadError('Image size should be under 15MB.');
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', 'user-uploads');

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data?.secure_url) {
          workingImages.push(data.secure_url);
          triggerHaptic('success');
          if (typeof onUpload === 'function') {
            onUpload(data.secure_url);
          }
          if (typeof setImages === 'function') {
            setImages([...workingImages]);
          }
        } else {
          triggerHaptic('warning');
          setUploadError(data?.error?.message || 'Failed to upload photo.');
        }
      } catch (err) {
        console.error('Cloudinary upload error:', err);
        triggerHaptic('error');
        setUploadError('Upload failed. Please check your internet connection.');
      } finally {
        completed += 1;
        setUploadProgress(Math.round((completed / files.length) * 100));
      }
    }

    setUploading(false);
    setUploadProgress(0);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleRemove = (indexToRemove) => {
    triggerHaptic('medium');
    if (typeof setImages === 'function') {
      const currentList = Array.isArray(images) ? images : [];
      const nextList = currentList.filter((_, i) => i !== indexToRemove);
      setImages(nextList);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* 2-Option Buttons Grid with large touch targets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.65rem' }}>
        <button
          type="button"
          disabled={uploading || effectiveCount >= effectiveMax}
          onClick={() => {
            triggerHaptic('light');
            cameraInputRef.current?.click();
          }}
          className="cloudinary-touch-btn"
          style={{
            minHeight: '52px',
            padding: '0.75rem 1rem',
            background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)',
            border: '1.5px dashed #f43f5e',
            borderRadius: '16px',
            color: '#be185d',
            fontWeight: 700,
            fontSize: '0.92rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            cursor: uploading || effectiveCount >= effectiveMax ? 'not-allowed' : 'pointer',
            opacity: uploading || effectiveCount >= effectiveMax ? 0.6 : 1,
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            transition: 'transform 0.15s ease, background 0.2s ease',
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>📸</span>
          <span>Take Photo</span>
        </button>

        <button
          type="button"
          disabled={uploading || effectiveCount >= effectiveMax}
          onClick={() => {
            triggerHaptic('light');
            galleryInputRef.current?.click();
          }}
          className="cloudinary-touch-btn"
          style={{
            minHeight: '52px',
            padding: '0.75rem 1rem',
            background: 'linear-gradient(135deg, #fdf2f8, #fce7f3)',
            border: '1.5px dashed #ec4899',
            borderRadius: '16px',
            color: '#9d174d',
            fontWeight: 700,
            fontSize: '0.92rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            cursor: uploading || effectiveCount >= effectiveMax ? 'not-allowed' : 'pointer',
            opacity: uploading || effectiveCount >= effectiveMax ? 0.6 : 1,
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            transition: 'transform 0.15s ease, background 0.2s ease',
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>🖼️</span>
          <span>Photo Gallery</span>
        </button>
      </div>

      {uploading && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            padding: '0.85rem 1rem',
            background: '#fff1f2',
            borderRadius: '14px',
            border: '1px solid #fecdd3',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.86rem', color: '#be185d', fontWeight: 700 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  border: '2px solid #be185d',
                  borderTopColor: 'transparent',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <span>Uploading photo to secure cloud...</span>
            </div>
            {uploadProgress > 0 && <span>{uploadProgress}%</span>}
          </div>
          <div style={{ width: '100%', height: '5px', background: '#fce7f3', borderRadius: '999px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${uploadProgress || 30}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #f43f5e, #be185d)',
                borderRadius: '999px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}

      {uploadError && (
        <div
          style={{
            color: '#e11d48',
            backgroundColor: '#fff1f2',
            border: '1px solid #fecdd3',
            padding: '8px 12px',
            borderRadius: '12px',
            fontSize: '0.84rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>⚠️</span>
          <span>{uploadError}</span>
        </div>
      )}

      {/* Render Image Thumbnails with 44px clean touch remove hit area */}
      {Array.isArray(images) && images.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(78px, 1fr))',
            gap: '10px',
            marginTop: '4px',
          }}
        >
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              style={{
                position: 'relative',
                aspectRatio: '1 / 1',
                width: '100%',
                borderRadius: '14px',
                overflow: 'visible',
              }}
            >
              <img
                src={url}
                alt={`Uploaded memory ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '14px',
                  objectFit: 'cover',
                  border: '1.5px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  display: 'block',
                }}
              />
              {typeof setImages === 'function' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(index);
                  }}
                  aria-label={`Remove photo ${index + 1}`}
                  style={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    width: 44,
                    height: 44,
                    padding: 0,
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 5,
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: '#ef4444',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                      border: '2px solid #ffffff',
                    }}
                  >
                    ✕
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
