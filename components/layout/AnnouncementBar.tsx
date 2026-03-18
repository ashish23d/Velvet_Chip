import React from 'react';
import { useAppContext } from '../../context/AppContext';

const AnnouncementBar: React.FC = () => {
  const { announcement, openOfferModal } = useAppContext();

  if (!announcement || !announcement.isActive || !announcement.text) {
    return null;
  }

  const content = (
    <div className="bg-primary text-white text-sm font-medium text-center px-4 py-2.5">
      {announcement.text}
    </div>
  );

  return (
    <button onClick={openOfferModal} className="w-full block hover:opacity-90 transition-opacity">
      {content}
    </button>
  );
};

export default AnnouncementBar;