
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Logo from './icons/Logo.tsx';
import WishlistIcon from './icons/WishlistIcon.tsx';
import ProfileIcon from './icons/ProfileIcon.tsx';
import CheckoutStepper from './CheckoutStepper.tsx';
import { useAppContext } from '../context/AppContext.tsx';

const CartHeader: React.FC = () => {
  const { wishlist, currentUser } = useAppContext();
  const location = ReactRouterDOM.useLocation();
  
  const getCurrentStep = () => {
    const path = location.pathname;
    if (path.startsWith('/cart')) return 'cart';
    if (path.startsWith('/address')) return 'address';
    if (path.startsWith('/payment')) return 'payment';
    return 'cart';
  }

  const getLoginLink = () => {
      // If already on login page, don't append recursive redirects
      if (location.pathname === '/login') return location.pathname + location.search;
      return `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`;
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left side: Logo */}
          <div className="flex-shrink-0">
            <Logo className="h-10 md:h-12 w-auto text-primary" />
          </div>

          {/* Center: Checkout Stepper */}
          <div className="flex-1 hidden sm:flex justify-center px-8">
            <div className="w-full max-w-md">
                 <CheckoutStepper currentStep={getCurrentStep()} />
            </div>
          </div>

          {/* Right side: Action Icons */}
          <div className="flex items-center space-x-4">
             <span className="text-sm text-gray-700 hidden md:block">{currentUser ? `Hi, ${currentUser.name}` : 'Hi, Guest'}</span>
             <ReactRouterDOM.Link to="/wishlist" className="relative text-primary hover:text-gray-700 transition-colors" aria-label={`Wishlist, ${wishlist.length} items`}>
               <WishlistIcon className="h-6 w-6" />
               {wishlist.length > 0 && (
                 <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                   {wishlist.length}
                 </span>
               )}
             </ReactRouterDOM.Link>
             <ReactRouterDOM.Link 
                to={currentUser ? "/profile" : getLoginLink()} 
                className="text-primary hover:text-gray-700 transition-colors" 
                aria-label="User profile"
             >
               <ProfileIcon className="h-6 w-6" />
             </ReactRouterDOM.Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CartHeader;
