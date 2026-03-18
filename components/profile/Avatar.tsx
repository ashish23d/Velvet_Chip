
import React from 'react';
import { User } from '../../types';
import SupabaseImage from '../shared/SupabaseImage';
import { BUCKETS } from '../../constants';

interface AvatarProps {
  user: Partial<User> | null;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ user, className = 'h-10 w-10 rounded-full object-cover' }) => {
  const name = user?.name || 'Guest';
  const avatarPath = user?.avatar;

  if (avatarPath) {
    const width = parseInt(className?.match(/w-(\d+)/)?.[1] ?? '40', 10) * 4;
    const height = parseInt(className?.match(/h-(\d+)/)?.[1] ?? '40', 10) * 4;
    return (
      <SupabaseImage
        bucket={BUCKETS.AVATARS}
        imagePath={avatarPath}
        alt={`${name}'s avatar`}
        className={className}
        width={width}
        height={height}
      />
    );
  }

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=C22255&color=fff&size=128`;

  return (
    <img
      src={avatarUrl}
      alt={`${name}'s avatar`}
      className={className}
      loading="lazy"
    />
  );
};

export default Avatar;
