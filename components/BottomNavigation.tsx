import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import HomeIcon from './icons/HomeIcon.tsx';
import SearchIcon from './icons/SearchIcon.tsx';
import WishlistIcon from './icons/WishlistIcon.tsx';
import ShoppingBagIcon from './icons/ShoppingBagIcon.tsx';
import UserCircleIcon from './icons/UserCircleIcon.tsx';
import { useAppContext } from '../context/AppContext.tsx';

const BottomNavigation: React.FC = () => {
    const location = ReactRouterDOM.useLocation();
    const { cart } = useAppContext();

    const cartItemCount = cart ? cart.reduce((total, item) => total + item.quantity, 0) : 0;

    const navItems = [
        { path: '/', icon: HomeIcon, label: 'Home' },
        { path: '/search', icon: SearchIcon, label: 'Search' },
        { path: '/wishlist', icon: WishlistIcon, label: 'Wishlist' },
        { path: '/cart', icon: ShoppingBagIcon, label: 'Cart', badge: cartItemCount },
        { path: '/profile', icon: UserCircleIcon, label: 'Profile' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 md:hidden">
            <nav className="flex items-center justify-around h-16 px-2 safe-area-pb">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <ReactRouterDOM.NavLink
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${isActive
                                    ? 'text-primary'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            <div className="relative p-1">
                                <Icon className={`w-6 h-6 ${isActive ? 'stroke-2' : 'stroke-1'}`} />
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm ring-1 ring-white dark:ring-gray-900">
                                        {item.badge > 9 ? '9+' : item.badge}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </ReactRouterDOM.NavLink>
                    );
                })}
            </nav>
            {/* Safe area for iPhone home indicator is handled by padding-bottom on nav if needed, or we can add a spacer */}
            <div className="h-[env(safe-area-inset-bottom)] w-full"></div>
        </div>
    );
};

export default BottomNavigation;
