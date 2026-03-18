import React, { useState, useEffect, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

import { supabase } from '../../services/supabaseClient';
import { BUCKETS } from '../../constants';
import Logo from '../icons/Logo';
import CartIcon from '../icons/CartIcon';
import WishlistIcon from '../icons/WishlistIcon';
import ProfileIcon from '../icons/ProfileIcon';
import MenuIcon from '../icons/MenuIcon';
import XIcon from '../icons/XIcon';
import BellIcon from '../icons/BellIcon';
import Squares2X2Icon from '../icons/Squares2X2Icon';
import ChevronDownIcon from '../icons/ChevronDownIcon';
import MobileMenu from './MobileMenu';
import SearchBar from '../search/SearchBar';
// CartIcon imported above

const NotificationDropdown = ({ onClose, navigate }: { onClose: () => void, navigate: any }) => {
  const { orderUpdates, notifications, promotions, markAllNotificationsAsRead, markNotificationAsRead } = useAppContext();
  const [activeTab, setActiveTab] = useState<'updates' | 'promotions'>('updates');

  // Show all notifications (updates)
  const displayUpdates = notifications; // No filter, show all

  const displayPromotions = promotions.slice(0, 5);

  const handleBroadcastClick = (promo: any) => {
    markNotificationAsRead(promo.id);
    onClose();
    if (promo.action_type === 'product' && promo.action_id) {
      navigate(`/product/${promo.action_id}`);
    } else if (promo.action_type === 'category' && promo.action_id) {
      navigate(`/`); // Or correct category route
    } else if (promo.action_type === 'url' && promo.action_id) {
      window.location.href = promo.action_id;
    }
  };

  return (
    <div className="fixed top-20 right-4 left-4 md:absolute md:top-full md:right-0 md:left-auto md:w-96 md:mt-3 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 max-h-[80vh] md:max-h-[32rem] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Header with Tabs */}
      <div className="flex border-b border-gray-100 bg-gray-50/50 backdrop-blur-sm">
        <button
          onClick={() => setActiveTab('updates')}
          className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${activeTab === 'updates' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Updates
        </button>
        <button
          onClick={() => setActiveTab('promotions')}
          className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${activeTab === 'promotions' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Notifications
        </button>
        <button onClick={onClose} className="px-4 text-gray-400 hover:text-gray-600 md:hidden">
          <XIcon className="h-5 w-5" />
        </button>
      </div>

      {/* List Content */}
      <div className="overflow-y-auto flex-1 p-2">
        {activeTab === 'updates' && (
          <div className="space-y-2">
            {displayUpdates.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No order updates.</p>
            ) : (
              displayUpdates.map((u, i) => (
                <div
                  key={i}
                  className={`p-3 bg-gray-50 rounded-lg flex gap-3 items-start ${u.order_id ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                  onClick={() => {
                    markNotificationAsRead(u.id);
                    if (u.link) {
                      onClose();
                      navigate(u.link);
                    } else if (u.order_id) {
                      onClose();
                      navigate(`/account/orders/${u.order_id}`);
                    }
                  }}
                >
                  <div className="bg-blue-100 text-blue-600 p-1.5 rounded-full shrink-0">
                    <CartIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{u.title}</p>
                    <p className="text-xs text-gray-600">{u.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{u.created_at ? new Date(u.created_at).toLocaleDateString() : ''}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'promotions' && (
          <div className="space-y-2">
            {displayPromotions.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No notifications.</p>
            ) : (
              displayPromotions.map((p, i) => (
                <div
                  key={i}
                  onClick={() => handleBroadcastClick(p)}
                  className="p-3 bg-white border border-gray-100 rounded-lg hover:shadow-sm cursor-pointer transition-shadow"
                >
                  {p.image_path && (
                    <img
                      src={supabase.storage.from(BUCKETS.PRODUCTS).getPublicUrl(p.image_path).data.publicUrl}
                      alt=""
                      className="w-full h-24 object-cover rounded-md mb-2"
                    />
                  )}
                  <p className="text-sm font-semibold text-gray-800">{p.title}</p>
                  <p className="text-xs text-gray-600 line-clamp-2">{p.message}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer Button: Mark Read / Clear */}
      <div className="p-2 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center text-xs">
        <button onClick={() => markAllNotificationsAsRead()} className="text-gray-500 hover:text-gray-700 font-medium">
          Mark Read
        </button>
        <ReactRouterDOM.Link
          to="/notifications"
          onClick={onClose}
          className="text-primary hover:text-primary-hover font-semibold uppercase"
        >
          View All
        </ReactRouterDOM.Link>
      </div>
    </div>
  );
}


const Header: React.FC = () => {
  const {
    categories,
    cartCount,
    wishlist,
    currentUser,
    isLoading,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    isCartShaking
  } = useAppContext();

  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = ReactRouterDOM.useNavigate();
  const location = ReactRouterDOM.useLocation();

  // USER notifications only
  const userNotifications = notifications.filter(
    n => n.type === 'order' || n.type === 'return' || n.type === 'system' || n.type === 'offer'
  );

  // Close notification dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close collection dropdown on outside click
  useEffect(() => {
    const closeCollection = () => setIsCollectionOpen(false);
    window.addEventListener('click', closeCollection);
    return () => window.removeEventListener('click', closeCollection);
  }, []);

  const getLoginLink = () => {
    if (location.pathname === '/login') return location.pathname;
    return `/login?redirect=${encodeURIComponent(location.pathname)}`;
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">

            {/* LEFT */}
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden text-primary"
              >
                <MenuIcon className="h-6 w-6" />
              </button>

              <div className="ml-4">
                <Logo className="h-10 w-auto text-primary" />
              </div>
            </div>

            {/* CENTER */}
            <div className="hidden md:flex items-center space-x-8">

              <ReactRouterDOM.NavLink to="/" className="font-medium">
                Home
              </ReactRouterDOM.NavLink>

              {/* ✅ COLLECTION DROPDOWN (CLICK BASED) */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCollectionOpen(!isCollectionOpen);
                  }}
                  className="flex items-center font-medium text-gray-700 hover:text-primary-hover"
                >
                  Collection
                  <ChevronDownIcon className="w-4 h-4 ml-1 mt-[2px]" />
                </button>

                {isCollectionOpen && (
                  <div
                    className="absolute top-full left-0 mt-3
                               w-64 bg-white
                               border border-gray-200
                               rounded-md
                               shadow-xl
                               z-50"
                  >
                    <ul className="py-2">
                      {categories.map(c => (
                        <li key={c.id}>
                          <ReactRouterDOM.Link
                            to={`/category/${c.id}`}
                            onClick={() => setIsCollectionOpen(false)}
                            className="block px-5 py-2.5
                                       text-sm text-gray-700
                                       hover:bg-gray-100
                                       hover:text-primary-hover
                                       transition"
                          >
                            {c.name}
                          </ReactRouterDOM.Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <ReactRouterDOM.NavLink to="/about">About</ReactRouterDOM.NavLink>
              <ReactRouterDOM.NavLink to="/contact">Contact</ReactRouterDOM.NavLink>
            </div>

            {/* RIGHT */}
            <div className="flex items-center space-x-4">

              {/* SEARCH */}
              <div className="hidden md:block w-64">
                <SearchBar />
              </div>

              {/* 🔔 NOTIFICATIONS */}
              {isLoading ? (
                <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse"></div>
              ) : currentUser ? (
                <div className="relative flex items-center" ref={notifRef}>
                  <button
                    onClick={() => {
                      const newOpen = !notifOpen;
                      setNotifOpen(newOpen);
                    }}
                    className="relative text-primary transition-transform active:scale-95"
                  >
                    <BellIcon className={`h-6 w-6 ${notifOpen ? 'fill-current' : ''}`} />
                    {unreadNotificationCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                        {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <NotificationDropdown
                      onClose={() => setNotifOpen(false)}
                      navigate={navigate}
                    />
                  )}
                </div>
              ) : null}

              {/* WISHLIST */}
              <ReactRouterDOM.Link to="/wishlist" className="relative">
                <WishlistIcon className="h-6 w-6 text-primary" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </ReactRouterDOM.Link>

              {/* ADMIN */}
              {!isLoading && currentUser?.role === 'admin' && (
                <ReactRouterDOM.Link to="/admin">
                  <Squares2X2Icon className="h-6 w-6 text-primary" />
                </ReactRouterDOM.Link>
              )}

              {/* PROFILE */}
              {isLoading ? (
                <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse"></div>
              ) : (
                <ReactRouterDOM.Link to={currentUser ? '/profile' : getLoginLink()}>
                  <ProfileIcon className="h-6 w-6 text-primary" />
                </ReactRouterDOM.Link>
              )}

              {/* CART */}
              <ReactRouterDOM.Link
                to="/cart"
                className={`relative text-primary ${isCartShaking ? 'animate-jiggle' : ''
                  }`}
              >
                <CartIcon className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </ReactRouterDOM.Link>
            </div>
          </div>
        </nav>
      </header>

      {/* MOBILE MENU */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
};

export default Header;
