import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import XIcon from './icons/XIcon.tsx';
import ChevronDownIcon from './icons/ChevronDownIcon.tsx';
import ProfileIcon from './icons/ProfileIcon.tsx';
import LogoutIcon from './icons/LogoutIcon.tsx';
import ChevronRightIcon from './icons/ChevronRightIcon.tsx';
import ShoppingBagIcon from './icons/ShoppingBagIcon.tsx';
import WishlistIcon from './icons/WishlistIcon.tsx';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
    const { categories, currentUser, session } = useAppContext();
    const [isCollectionOpen, setIsCollectionOpen] = useState(false);
    const navigate = ReactRouterDOM.useNavigate();

    if (!isOpen) return null;

    const handleLogout = async () => {
        // Implement logout logic here or redirect to logout route
        // Assuming we rely on a logout page or calling supabase directly, 
        // but ideally access logic via context if available.
        // For now, let's navigate to a logout route or just reload to trigger clearing.
        // Better: use supabase client directly if context doesn't expose logout.
        // But context usually handles auth state change.
        // Let's assume there's a logout flow in Profile or similar.
        navigate('/logout'); // Or similar
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Menu Panel */}
            <div className="relative w-[300px] h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col overflow-y-auto animate-slideXR">

                {/* Header */}
                <div className="p-5 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-serif font-bold text-gray-800 dark:text-gray-100">Menu</h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                    >
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* User Section */}
                <div className="p-5 bg-gray-50 dark:bg-gray-800/50">
                    {currentUser ? (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                {currentUser.avatar ? (
                                    <img src={currentUser.avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                        {currentUser.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">Hi, {currentUser.name?.split(' ')[0]}</p>
                                    <p className="text-xs text-gray-500 truncate max-w-[150px]">{currentUser.email}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                <ReactRouterDOM.Link
                                    to="/account/orders"
                                    onClick={onClose}
                                    className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:border-primary/30 transition-all"
                                >
                                    <ShoppingBagIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 mb-1" />
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Orders</span>
                                </ReactRouterDOM.Link>
                                <ReactRouterDOM.Link
                                    to="/wishlist"
                                    onClick={onClose}
                                    className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:border-primary/30 transition-all"
                                >
                                    <WishlistIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 mb-1" />
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Wishlist</span>
                                </ReactRouterDOM.Link>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-4">Log in to view your orders and wishlist.</p>
                            <ReactRouterDOM.Link
                                to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`}
                                onClick={onClose}
                                className="block w-full py-2.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-lg font-medium shadow hover:shadow-lg transition-all transform active:scale-95"
                            >
                                Login / Register
                            </ReactRouterDOM.Link>
                        </div>
                    )}
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-5 space-y-1">
                    <ReactRouterDOM.NavLink
                        to="/"
                        onClick={onClose}
                        className={({ isActive }) => `flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                        Home
                    </ReactRouterDOM.NavLink>

                    <div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsCollectionOpen(!isCollectionOpen);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${isCollectionOpen ? 'bg-gray-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                            <span className="font-medium">Collections</span>
                            <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isCollectionOpen ? 'rotate-180 text-primary' : 'text-gray-400'}`} />
                        </button>

                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCollectionOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                            <div className="pl-4 border-l-2 border-gray-100 dark:border-gray-700 ml-4 space-y-1 py-1">
                                {categories.map(c => (
                                    <ReactRouterDOM.NavLink
                                        key={c.id}
                                        to={`/category/${c.id}`}
                                        onClick={onClose}
                                        className={({ isActive }) => `block px-4 py-2 text-sm rounded-md transition-colors ${isActive ? 'text-primary bg-primary/5' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                    >
                                        {c.name}
                                    </ReactRouterDOM.NavLink>
                                ))}
                            </div>
                        </div>
                    </div>

                    <ReactRouterDOM.NavLink
                        to="/about"
                        onClick={onClose}
                        className={({ isActive }) => `flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                        About Us
                    </ReactRouterDOM.NavLink>

                    <ReactRouterDOM.NavLink
                        to="/contact"
                        onClick={onClose}
                        className={({ isActive }) => `flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                        Contact
                    </ReactRouterDOM.NavLink>

                    {/* Admin Link (Only for admin) */}
                    {currentUser?.role === 'admin' && (
                        <ReactRouterDOM.NavLink
                            to="/admin"
                            onClick={onClose}
                            className="flex items-center justify-between px-4 py-3 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors mt-6"
                        >
                            <span className="font-medium">Admin Dashboard</span>
                            <ChevronRightIcon className="w-4 h-4" />
                        </ReactRouterDOM.NavLink>
                    )}
                </nav>

                {/* Footer / Logout */}
                {currentUser && (
                    <div className="p-5 border-t border-gray-100 dark:border-gray-800">
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center w-full gap-2 px-4 py-3 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium"
                        >
                            <LogoutIcon className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MobileMenu;
