import React, { useEffect, useState, forwardRef } from 'react';
import { supabase } from '../services/supabaseClient.ts';
import { BUCKETS } from '../constants.ts';

interface SupabaseImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  bucket: string;
  imagePath: string | undefined | null;
  // alt, className, width, height are already in ImgHTMLAttributes but we can leave explicit if we want or just remove. 
  // keeping explicit ones that were there for clarity if needed, but extending covers them.
}

const SupabaseImage = forwardRef<HTMLImageElement, SupabaseImageProps>(
  ({ bucket, imagePath, alt, className, width, height, ...props }, ref) => {
    const [imageUrl, setImageUrl] = useState<string>('');

    useEffect(() => {
      let currentBucket = bucket;
      let currentPath = imagePath;

      if (!currentPath) {
        // Provide a standard "not found" image if path is missing
        currentBucket = BUCKETS.SITE_ASSETS;
        currentPath = 'awaany_placeholders/util/not_found.jpg';
      } else if (currentPath.startsWith('awaany_placeholders/')) {
        // Handle legacy placeholder paths
        currentBucket = BUCKETS.SITE_ASSETS;
      }

      // Append .jpg if no extension is present. This handles legacy placeholder data.
      if (currentPath && !/\.[^/.]+$/.test(currentPath)) {
        currentPath += '.jpg';
      }

      const { data } = supabase.storage
        .from(currentBucket)
        .getPublicUrl(currentPath);

      setImageUrl(data.publicUrl);

    }, [bucket, imagePath]);

    // Render a skeleton/placeholder while the URL is being constructed or if it's missing
    if (!imageUrl) {
      return <div className={`bg-gray-200 animate-pulse ${className}`} style={{ width: width, height: height }}></div>;
    }

    return (
      <img
        ref={ref}
        src={imageUrl}
        alt={alt}
        className={className}
        loading="lazy"
        width={width}
        height={height}
        {...props}
      />
    );
  }
);

SupabaseImage.displayName = 'SupabaseImage';

export default SupabaseImage;