
import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import ProfileSidebar from '../components/profile/ProfileSidebar';
import ProfileInformation from '../components/profile/ProfileInformation';
import ProfileCompletion from '../components/profile/ProfileCompletion';
import MyAddresses from '../components/profile/MyAddresses';
import MyOrders from '../components/profile/MyOrders';
import MyReturns from '../components/profile/MyReturns';
import MySavedItems from '../components/profile/MySavedItems';
import MyWishlist from '../components/profile/MyWishlist';
import HelpCenter from '../components/shared/HelpCenter';
import MyCoupons from '../components/profile/MyCoupons';

const ProfilePage: React.FC = () => {
  const { currentUser, isLoading } = useAppContext();
  const [activeSection, setActiveSection] = useState('profile');

  // The ProtectedRoute handles the case where there is no session.
  // The global loading state in App.tsx handles the case where currentUser is still being fetched.
  
  const navItems = [
    { id: 'profile', label: 'Profile' },
    { id: 'orders', label: 'Orders' },
    { id: 'returns', label: 'Returns' },
    { id: 'addresses', label: 'Addresses' },
    { id: 'wishlist', label: 'Wishlist' },
    { id: 'saved', label: 'Saved' },
    { id: 'coupons', label: 'Coupons' },
    { id: 'help', label: 'Help' },
  ];

  if (!currentUser && !isLoading) {
    // This state implies a fetch failure or session inconsistency
    return (
        <div className="flex h-[calc(100vh-160px)] flex-col items-center justify-center">
            <p className="text-lg text-gray-700 mb-4">Failed to load profile information.</p>
            <button onClick={() => window.location.reload()} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-pink-700">
                Retry
            </button>
        </div>
    );
  }
  
  if (!currentUser) {
      return (
        <div className="flex h-[calc(100vh-160px)] items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileInformation setActiveSection={setActiveSection} />;
      case 'orders':
        return <MyOrders />;
      case 'addresses':
        return <MyAddresses />;
      case 'returns':
        return <MyReturns />;
      case 'saved':
        return <MySavedItems />;
      case 'wishlist':
        return <MyWishlist />;
      case 'coupons':
        return <MyCoupons />;
      case 'help':
        return <HelpCenter />;
      default:
        return <ProfileInformation setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="bg-gray-50/70">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">My Account</h1>
            <p className="mt-1 text-gray-600">Welcome back, {currentUser.name}!</p>
          </div>
          <div className="w-full sm:w-auto sm:max-w-xs">
            <ProfileCompletion user={currentUser} />
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`${
                    activeSection === item.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
          <div className="hidden md:block w-full md:w-64 lg:w-72 flex-shrink-0">
            <ProfileSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
          </div>
          <main className="flex-1 w-full">
            {renderSection()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
