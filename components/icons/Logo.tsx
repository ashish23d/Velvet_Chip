import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../../context/AppContext.tsx';
import SupabaseMedia from '../SupabaseMedia.tsx';
import { BUCKETS } from '../../constants.ts';

const Logo: React.FC<{ className?: string }> = ({ className = "h-14 w-auto" }) => {
  const { siteSettings } = useAppContext();

  const logoType = siteSettings?.logoType || 'image';
  const textLogo = siteSettings?.textLogo;
  const fontFamily = siteSettings?.fontFamily || 'sans-serif';
  const fontSize = siteSettings?.fontSize || '24px';
  const imageWidth = siteSettings?.imageWidth || 'auto';

  return (
    <ReactRouterDOM.Link to="/" aria-label="Awaany Home" className="flex items-center">
      {logoType === 'text' ? (
        <span style={{ fontFamily, fontSize, fontWeight: 'bold', color: siteSettings?.primaryColor || 'currentColor' }}>
          {textLogo || <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />}
        </span>
      ) : (
        siteSettings?.activeLogoPath ? (
          <SupabaseMedia
            bucket={BUCKETS.SITE_ASSETS}
            imagePath={siteSettings.activeLogoPath}
            alt="Logo"
            className={className}
            style={{ width: imageWidth === 'auto' ? undefined : imageWidth, height: 'auto', maxHeight: '100%' }}
          />
        ) : (
          <div className={`${className} bg-gray-200 dark:bg-gray-700 animate-pulse rounded`} style={{ width: imageWidth === 'auto' ? '150px' : imageWidth, height: '40px' }} />
        )
      )}
    </ReactRouterDOM.Link>
  );
};


export default Logo;
