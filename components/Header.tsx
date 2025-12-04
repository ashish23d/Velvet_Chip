
import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import Logo from './icons/Logo.tsx';
import CartIcon from './icons/CartIcon.tsx';
import WishlistIcon from './icons/WishlistIcon.tsx';
import ProfileIcon from './icons/ProfileIcon.tsx';
import MenuIcon from './icons/MenuIcon.tsx';
import XIcon from './icons/XIcon.tsx';
import SearchBar from './SearchBar.tsx';
import BellIcon from './icons/BellIcon.tsx';
import Squares2X2Icon from './icons/Squares2X2Icon.tsx';
import ChevronDownIcon from './icons/ChevronDownIcon.tsx';

const Header: React.FC = () => {
  const { categories, cartCount, wishlist, currentUser, unreadNotificationCount, isCartShaking } = useAppContext();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = ReactRouterDOM.useLocation();

  const navLinkClass = 'text-primary hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300 font-medium text-sm uppercase tracking-wider';
  
  const mobileNavLinkClass = 'block py-3 px-4 text-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-gray-800 hover:text-primary rounded-md transition-colors duration-200';

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Determine login link with redirect
  const getLoginLink = () => {
      // If already on login page, don't append recursive redirects
      if (location.pathname === '/login') return location.pathname + location.search;
      return `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`;
  };

  const MobileNav = () => (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      ></div>
      
      {/* Panel */}
      <div
        className={`fixed top-0 left-0 w-full max-w-sm h-full bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-title"
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
          <div id="mobile-menu-title">
            <Logo className="h-12 w-auto text-primary" />
          </div>
          <button onClick={closeMobileMenu} className="text-gray-500 hover:text-primary dark:text-gray-400" aria-label="Close menu">
             <XIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
            <ReactRouterDOM.NavLink to="/" className={({ isActive }) => `${mobileNavLinkClass} ${isActive ? 'bg-pink-50 dark:bg-gray-800 text-primary' : ''}`} onClick={closeMobileMenu}>Home</ReactRouterDOM.NavLink>
            <div>
                 <h3 className="px-4 pt-4 pb-2 font-semibold text-primary uppercase text-sm tracking-wider">Collections</h3>
                 <div className="pl-4 border-l-2 border-primary/20 ml-4 space-y-1">
                     {categories.map(category => (
                      <ReactRouterDOM.Link
                        key={category.id}
                        to={`/category/${category.id}`}
                        className="block py-2 text-md text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                        onClick={closeMobileMenu}
                      >
                        {category.name}
                      </ReactRouterDOM.Link>
                    ))}
                 </div>
            </div>

            {currentUser ? (
                <div className="pt-4">
                    <h3 className="px-4 pb-2 font-semibold text-primary uppercase text-sm tracking-wider">My Account</h3>
                    <ReactRouterDOM.NavLink to="/profile" className={mobileNavLinkClass} onClick={closeMobileMenu}>My Profile</ReactRouterDOM.NavLink>
                    <ReactRouterDOM.NavLink to="/notifications" className={mobileNavLinkClass} onClick={closeMobileMenu}>Notifications</ReactRouterDOM.NavLink>
                    <ReactRouterDOM.NavLink to="/wishlist" className={mobileNavLinkClass} onClick={closeMobileMenu}>My Wishlist</ReactRouterDOM.NavLink>
                     {currentUser.role === 'admin' && <ReactRouterDOM.NavLink to="/admin" className={mobileNavLinkClass} onClick={closeMobileMenu}>Admin Panel</ReactRouterDOM.NavLink>}
                </div>
            ) : (
                <div className="pt-4">
                    <ReactRouterDOM.NavLink to={getLoginLink()} className={mobileNavLinkClass} onClick={closeMobileMenu}>Login / Register</ReactRouterDOM.NavLink>
                </div>
            )}

            <div className="py-2"><hr className="border-gray-200 dark:border-gray-700" /></div>
            
            <div>
                <ReactRouterDOM.NavLink to="/help-and-returns" className={mobileNavLinkClass} onClick={closeMobileMenu}>Help Center</ReactRouterDOM.NavLink>
                <ReactRouterDOM.NavLink to="/about" className={({ isActive }) => `${mobileNavLinkClass} ${isActive ? 'bg-pink-50 dark:bg-gray-800 text-primary' : ''}`} onClick={closeMobileMenu}>About</ReactRouterDOM.NavLink>
                <ReactRouterDOM.NavLink to="/contact" className={({ isActive }) => `${mobileNavLinkClass} ${isActive ? 'bg-pink-50 dark:bg-gray-800 text-primary' : ''}`} onClick={closeMobileMenu}>Contact</ReactRouterDOM.NavLink>
            </div>
        </nav>
      </div>
    </>
  );

  return (
    <>
      <header className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-none dark:border-b dark:border-gray-800 sticky top-0 z-40 transition-colors duration-200">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left side: Menu button and Logo */}
            <div className="flex items-center flex-shrink-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden text-primary hover:text-gray-700 dark:hover:text-gray-300"
                aria-label="Open menu"
              >
                <MenuIcon className="h-6 w-6" />
              </button>
              <div className="ml-4 md:ml-0 flex-shrink-0">
                <Logo className="h-10 md:h-14 w-auto text-primary" />
              </div>
            </div>

            {/* Center: Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-8 min-w-0 px-4">
              <ReactRouterDOM.NavLink to="/" className={({ isActive }) => `${navLinkClass} ${isActive ? 'font-bold' : ''}`}>Home</ReactRouterDOM.NavLink>
              <div
                className="relative group"
              >
                <button className={`${navLinkClass} flex items-center`}>
                  Collection
                  <ChevronDownIcon className="w-4 h-4 ml-1" />
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4 w-56 z-50 opacity-0 group-hover:opacity-100 group-hover:pt-2 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
                    <div className="rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 border dark:border-gray-700">
                      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        {categories.map(category => (
                          <ReactRouterDOM.Link
                            key={category.id}
                            to={`/category/${category.id}`}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                            role="menuitem"
                          >
                            {category.name}
                          </ReactRouterDOM.Link>
                        ))}
                      </div>
                    </div>
                  </div>
              </div>
              <ReactRouterDOM.NavLink to="/about" className={({ isActive }) => `hidden lg:block ${navLinkClass} ${isActive ? 'font-bold' : ''}`}>About</ReactRouterDOM.NavLink>
              <ReactRouterDOM.NavLink to="/contact" className={({ isActive }) => `hidden lg:block ${navLinkClass} ${isActive ? 'font-bold' : ''}`}>Contact</ReactRouterDOM.NavLink>

              {/* "More" Dropdown for medium screens */}
              <div className="relative group hidden md:block lg:hidden">
                  <button className={`${navLinkClass} flex items-center`}>
                      More
                      <ChevronDownIcon className="w-4 h-4 ml-1" />
                  </button>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full pt-4 w-48 z-50 opacity-0 group-hover:opacity-100 group-hover:pt-2 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
                      <div className="rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 border dark:border-gray-700">
                          <div className="py-1" role="menu" aria-orientation="vertical">
                              <ReactRouterDOM.Link to="/about" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                                  About
                              </ReactRouterDOM.Link>
                              <ReactRouterDOM.Link to="/contact" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">
                                  Contact
                              </ReactRouterDOM.Link>
                          </div>
                      </div>
                  </div>
              </div>
            </div>

            {/* Right side: Search and Action Icons */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
               {/* Search: Bar on desktop, stripe below on mobile (in App.tsx) */}
               <div className="hidden md:block w-48 lg:w-64">
                    <SearchBar />
                </div>

              {/* Desktop-only Icons */}
              <div className="hidden md:flex items-center space-x-2 sm:space-x-4">
                  <ReactRouterDOM.Link to="/notifications" className="relative text-primary hover:text-gray-700 dark:hover:text-gray-300 transition-colors" aria-label={`Notifications, ${unreadNotificationCount} unread`}>
                    <BellIcon className="h-6 w-6" />
                    {unreadNotificationCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadNotificationCount}
                      </span>
                    )}
                  </ReactRouterDOM.Link>
                  <ReactRouterDOM.Link to="/wishlist" className="relative text-primary hover:text-gray-700 dark:hover:text-gray-300 transition-colors" aria-label={`Wishlist, ${wishlist.length} items`}>
                    <WishlistIcon className="h-6 w-6" />
                    {wishlist.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {wishlist.length}
                      </span>
                    )}
                  </ReactRouterDOM.Link>
                  {currentUser && currentUser.role === 'admin' && (
                      <ReactRouterDOM.Link
                        to="/admin"
                        className="relative text-primary hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        aria-label="Admin Panel"
                      >
                          <Squares2X2Icon className="h-6 w-6" />
                      </ReactRouterDOM.Link>
                  )}
                  <ReactRouterDOM.Link 
                    to={currentUser ? "/profile" : getLoginLink()} 
                    className="text-primary hover:text-gray-700 dark:hover:text-gray-300 transition-colors" 
                    aria-label="User profile"
                  >
                    <ProfileIcon className="h-6 w-6" />
                  </ReactRouterDOM.Link>
              </div>

              {/* Cart Icon (Always Visible) */}
              <ReactRouterDOM.Link
                id="header-cart-icon"
                to="/cart"
                className={`relative text-primary hover:text-gray-700 dark:hover:text-gray-300 transition-colors ${
                  isCartShaking ? 'animate-jiggle' : ''
                }`}
                aria-label={`Cart, ${cartCount} items`}
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
      <MobileNav />
    </>
  );
};

export default Header;
