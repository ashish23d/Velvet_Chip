import React, { useState, useRef } from 'react';
import { uploadImage } from '../../services/supabaseImageService.ts';
import PlusIcon from '../icons/PlusIcon.tsx';
import TrashIcon from '../icons/TrashIcon.tsx';
import SupabaseImage from '../shared/SupabaseImage';

interface ImageUploaderProps {
  bucket: string;
  pathPrefix: string;
  images: string[];
  onImageUpload: (path: string) => void;
  onImageRemove: (path: string) => void;
  accept?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ bucket, pathPrefix, images, onImageUpload, onImageRemove, accept }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploading(true);
    setError(null);

    // Compression Helper
    const compressImage = async (imageFile: File): Promise<File> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = (e) => {
          const img = new Image();
          img.src = e.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) { reject(new Error('Canvas context not available')); return; }
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
              if (!blob) { reject(new Error('Compression failed')); return; }
              resolve(new File([blob], imageFile.name, { type: 'image/jpeg', lastModified: Date.now() }));
            }, 'image/jpeg', 0.85); // 85% quality
          };
          img.onerror = reject;
        };
        reader.onerror = reject;
      });
    };

    try {
      const compressedFile = await compressImage(file);

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Upload timed out. Please try again.')), 90000);
      });

      // Race between upload and timeout
      const path = await Promise.race([
        uploadImage({ file: compressedFile, bucket, pathPrefix }),
        timeoutPromise
      ]) as string;

      onImageUpload(path);
    } catch (err: unknown) {
      console.error('Upload failed:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {images.map((path, index) => (
          <div key={index} className="relative group aspect-square">
            <SupabaseImage
              bucket={bucket}
              imagePath={path}
              alt={`Uploaded ${index + 1}`}
              className="w-full h-full object-cover rounded-md shadow-sm"
              width={200}
              height={200}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-md">
              <button
                type="button"
                onClick={() => onImageRemove(path)}
                className="p-2 bg-white/80 text-red-500 rounded-full hover:bg-white"
                aria-label="Remove image"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept || "image/png, image/jpeg, image/webp"}
          className="hidden"
          disabled={isUploading}
        />
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={isUploading}
          className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md hover:border-primary hover:text-primary transition-colors text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-xs mt-2">Uploading...</span>
            </>
          ) : (
            <>
              <PlusIcon className="w-8 h-8" />
              <span className="text-xs mt-1">Add Image</span>
            </>
          )}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default ImageUploader;
