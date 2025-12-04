import React, { useEffect, useState, forwardRef } from 'react';
import { supabase } from '../services/supabaseClient.ts';
import { BUCKETS } from '../constants.ts';

interface SupabaseMediaProps {
  bucket: string;
  imagePath: string | undefined | null;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

const SupabaseMedia = forwardRef<HTMLImageElement | HTMLVideoElement, SupabaseMediaProps>(
  ({ bucket, imagePath, alt, className, width, height }, ref) => {
    const [mediaUrl, setMediaUrl] = useState<string>('');
    const [mediaType, setMediaType] = useState<'image' | 'video' | 'unknown'>('unknown');

    useEffect(() => {
      let currentBucket = bucket;
      let currentPath = imagePath;
      let type: 'image' | 'video' | 'unknown' = 'unknown';

      if (!currentPath) {
        currentBucket = BUCKETS.SITE_ASSETS;
        currentPath = 'awaany_placeholders/util/not_found.jpg';
        type = 'image';
      } else if (currentPath.startsWith('awaany_placeholders/')) {
        currentBucket = BUCKETS.SITE_ASSETS;
      }
      
      if (currentPath) {
        // Append .jpg if no extension is present. This handles legacy placeholder data.
        if (!/\.[^/.]+$/.test(currentPath)) {
            currentPath += '.jpg';
        }

        if (/\.(mp4|webm)$/i.test(currentPath)) {
            type = 'video';
        } else {
            type = 'image';
        }
      }
      
      if (currentPath) {
        const { data } = supabase.storage
          .from(currentBucket)
          .getPublicUrl(currentPath);
        
        setMediaType(type);
        setMediaUrl(data.publicUrl);
      } else {
        setMediaType('unknown');
        setMediaUrl('');
      }

    }, [bucket, imagePath]);

    if (!mediaUrl || mediaType === 'unknown') {
      return <div className={`bg-gray-200 animate-pulse ${className}`} style={{ width: width, height: height }}></div>;
    }

    if (mediaType === 'video') {
        return (
            <video
                // @ts-ignore
                ref={ref as React.Ref<HTMLVideoElement>}
                src={mediaUrl}
                className={className}
                autoPlay
                loop
                muted
                playsInline
                width={width}
                height={height}
                aria-label={alt}
            />
        );
    }
    
    // Default to image
    return (
      <img
        // @ts-ignore
        ref={ref as React.Ref<HTMLImageElement>}
        src={mediaUrl}
        alt={alt}
        className={className}
        loading="lazy"
        width={width}
        height={height}
      />
    );
  }
);

SupabaseMedia.displayName = 'SupabaseMedia';

export default SupabaseMedia;