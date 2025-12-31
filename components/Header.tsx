import React, { useState, useEffect, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';

import { supabase } from '../services/supabaseClient.ts';
import { BUCKETS } from '../constants.ts';
import Logo from './icons/Logo.tsx';
import CartIcon from './icons/CartIcon.tsx';
import WishlistIcon from './icons/WishlistIcon.tsx';
import ProfileIcon from './icons/ProfileIcon.tsx';
import MenuIcon from './icons/MenuIcon.tsx';
import XIcon from './icons/XIcon.tsx';
import BellIcon from './icons/BellIcon.tsx';
import Squares2X2Icon from './icons/Squares2X2Icon.tsx';
import ChevronDownIcon from './icons/ChevronDownIcon.tsx';
import SearchBar from './SearchBar.tsx';

const Header: React.FC = () => {
  const {
    categories,
    cartCount,
    wishlist,
    currentUser,
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
              {currentUser && (
                <div className="relative flex items-center" ref={notifRef}>
                  <button
                    onClick={() => {
                      const newOpen = !notifOpen;
                      setNotifOpen(newOpen);
                      if (newOpen && unreadNotificationCount > 0) {
                        markAllNotificationsAsRead();
                      }
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
                    <div className="fixed top-20 right-4 left-4 md:absolute md:top-full md:right-0 md:left-auto md:w-96 md:mt-3 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 max-h-[80vh] md:max-h-[32rem] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center backdrop-blur-sm">
                        <div>
                          <h3 className="font-bold text-gray-800">Notifications</h3>
                          <p className="text-xs text-gray-500 mt-0.5">Recent updates</p>
                        </div>
                        <button onClick={() => setNotifOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600">
                          <XIcon className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="overflow-y-auto flex-1">
                        {userNotifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <div className="bg-gray-100 p-3 rounded-full mb-3">
                              <BellIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium">No recent notifications</p>
                            <p className="text-xs text-gray-400 mt-1">We'll notify you when something arrives.</p>
                          </div>
                        ) : (
                          userNotifications.map(n => (
                            <div
                              key={n.id}
                              onClick={() => {
                                setNotifOpen(false);
                                if (n.link) navigate(n.link);
                              }}
                              className={`p-4 cursor-pointer border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors group relative ${!n.is_read ? 'bg-blue-50/30' : ''
                                }`}
                            >
                              {!n.is_read && (
                                <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r"></span>
                              )}
                              <div className="flex justify-between items-start gap-3">
                                <div className="bg-primary/10 p-2 rounded-full flex-shrink-0 text-primary">
                                  {n.type === 'order' ? <CartIcon className="w-4 h-4" /> : <BellIcon className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm ${!n.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                    {n.title}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{n.message}</p>
                                  {(n as any).image_path && (
                                    <img
                                      src={supabase.storage.from(BUCKETS.PRODUCTS).getPublicUrl((n as any).image_path).data.publicUrl}
                                      alt="Broadcast"
                                      className="w-full h-24 object-cover rounded-md mt-2 border border-gray-200"
                                    />
                                  )}
                                  <p className="text-[10px] text-gray-400 mt-2 font-medium">
                                    {new Date(n.created_at).toLocaleDateString()} • {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Footer if needed, e.g. View All */}
                      {userNotifications.length > 0 && (
                        <div className="p-2 border-t border-gray-100 bg-gray-50/50 text-center">
                          <ReactRouterDOM.Link
                            to="/notifications"
                            onClick={() => setNotifOpen(false)}
                            className="text-xs font-semibold text-primary hover:text-primary-hover uppercase tracking-wider"
                          >
                            View Full History
                          </ReactRouterDOM.Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

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
              {currentUser?.role === 'admin' && (
                <ReactRouterDOM.Link to="/admin">
                  <Squares2X2Icon className="h-6 w-6 text-primary" />
                </ReactRouterDOM.Link>
              )}

              {/* PROFILE */}
              <ReactRouterDOM.Link to={currentUser ? '/profile' : getLoginLink()}>
                <ProfileIcon className="h-6 w-6 text-primary" />
              </ReactRouterDOM.Link>

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
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="bg-white w-80 h-full p-6 shadow-xl flex flex-col overflow-y-auto animate-slideXR">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-gray-800">Menu</h2>
              <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500 hover:text-red-500 transition">
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex flex-col space-y-4">
              <ReactRouterDOM.NavLink
                to="/"
                className={({ isActive }) => `text-lg font-medium transition ${isActive ? 'text-primary' : 'text-gray-700 hover:text-primary-hover'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </ReactRouterDOM.NavLink>

              {/* Mobile Collection Dropdown */}
              <div>
                <button
                  onClick={() => setIsCollectionOpen(!isCollectionOpen)}
                  className="flex items-center justify-between w-full text-lg font-medium text-gray-700 hover:text-primary-hover transition"
                >
                  Collection
                  <ChevronDownIcon className={`w-5 h-5 transition-transform ${isCollectionOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCollectionOpen && (
                  <ul className="pl-4 mt-2 space-y-2 border-l-2 border-gray-100 ml-1">
                    {categories.map(c => (
                      <li key={c.id}>
                        <ReactRouterDOM.Link
                          to={`/category/${c.id}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-1 text-gray-600 hover:text-primary-hover transition"
                        >
                          {c.name}
                        </ReactRouterDOM.Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <ReactRouterDOM.NavLink
                to="/about"
                className={({ isActive }) => `text-lg font-medium transition ${isActive ? 'text-primary' : 'text-gray-700 hover:text-primary-hover'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </ReactRouterDOM.NavLink>

              <ReactRouterDOM.NavLink
                to="/contact"
                className={({ isActive }) => `text-lg font-medium transition ${isActive ? 'text-primary' : 'text-gray-700 hover:text-primary-hover'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </ReactRouterDOM.NavLink>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
