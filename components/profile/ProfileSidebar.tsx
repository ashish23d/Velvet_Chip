import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { supabase } from '../../services/supabaseClient';
import UserCircleIcon from '../icons/UserCircleIcon';
import ArchiveBoxIcon from '../icons/ArchiveBoxIcon';
import HomeIcon from '../icons/HomeIcon';
import ArrowLeftOnRectangleIcon from '../icons/ArrowLeftOnRectangleIcon';
import Squares2X2Icon from '../icons/Squares2X2Icon';
import ArrowUturnLeftIcon from '../icons/ArrowUturnLeftIcon';
import BookmarkIcon from '../icons/BookmarkIcon';
import WishlistIcon from '../icons/WishlistIcon';
import TagIcon from '../icons/TagIcon';
import QuestionMarkCircleIcon from '../icons/QuestionMarkCircleIcon';

interface ProfileSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ activeSection, setActiveSection }) => {
  const { currentUser } = useAppContext();
  const navigate = ReactRouterDOM.useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navItems = [
    { id: 'profile', label: 'Profile Information', icon: UserCircleIcon },
    { id: 'orders', label: 'My Orders', icon: ArchiveBoxIcon },
    { id: 'returns', label: 'My Returns', icon: ArrowUturnLeftIcon },
    { id: 'addresses', label: 'My Addresses', icon: HomeIcon },
    { id: 'wishlist', label: 'My Wishlist', icon: WishlistIcon },
    { id: 'saved', label: 'Saved Items', icon: BookmarkIcon },
    { id: 'coupons', label: 'My Coupons', icon: TagIcon },
    { id: 'help', label: 'Help Center', icon: QuestionMarkCircleIcon },
  ];

  const NavButton: React.FC<{ item: typeof navItems[0] }> = ({ item }) => {
    const isActive = activeSection === item.id;
    const Icon = item.icon;
    return (
      <button
        onClick={() => setActiveSection(item.id)}
        className={`w-full flex items-center gap-4 px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-primary text-white shadow-md'
            : 'text-gray-600 hover:bg-pink-50 hover:text-primary'
        }`}
      >
        <Icon className="h-6 w-6 flex-shrink-0" />
        <span className="font-medium">{item.label}</span>
      </button>
    );
  };

  return (
    <aside className="w-full md:w-64 lg:w-72 flex-shrink-0">
      <div className="bg-white rounded-lg shadow-md p-4 space-y-2">
        {navItems.map(item => (
          <NavButton key={item.id} item={item} />
        ))}
        {currentUser?.role === 'admin' && (
          <ReactRouterDOM.Link
            to="/admin"
            className="w-full flex items-center gap-4 px-4 py-3 text-left rounded-lg transition-colors duration-200 text-gray-600 hover:bg-pink-50 hover:text-primary"
          >
            <Squares2X2Icon className="h-6 w-6 flex-shrink-0" />
            <span className="font-medium">Admin Panel</span>
          </ReactRouterDOM.Link>
        )}
        <div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-left rounded-lg transition-colors duration-200 text-gray-600 hover:bg-pink-50 hover:text-primary"
          >
            <ArrowLeftOnRectangleIcon className="h-6 w-6" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ProfileSidebar;
