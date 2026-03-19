import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { User } from '../../types';
import RecentOrderItem from '../order/RecentOrderItem';
import { useUserOrders } from '../../services/api/user.api';
import { sanitizeForm, validatePhone } from '../../utils/sanitization';

interface ProfileInformationProps {
  setActiveSection: (section: string) => void;
}

const ProfileInformation: React.FC<ProfileInformationProps> = ({ setActiveSection }) => {
  const { currentUser, updateUser } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    name: currentUser?.name || '',
    mobile: currentUser?.mobile || '',
    dob: currentUser?.dob || '',
    gender: currentUser?.gender || undefined,
  });

  const { data: userOrders = [] } = useUserOrders(currentUser?.id);

  const recentOrders = userOrders
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 3);

  const recentItems = recentOrders.flatMap(order =>
    order.items.map(item => ({ item, order }))
  ).slice(0, 3);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.mobile && !validatePhone(formData.mobile)) {
      setError('Please enter a valid mobile number.');
      return;
    }

    const sanitizedData = sanitizeForm(formData);
    
    updateUser(sanitizedData);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        mobile: currentUser.mobile || '',
        dob: currentUser.dob || '',
        gender: currentUser.gender || undefined,
      });
    }
    setIsEditing(true);
  }

  const handleCancelClick = () => {
    setIsEditing(false);
  }

  if (!currentUser) return null;

  const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white";
  const disabledInputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed";

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Profile Information</h2>
          {!isEditing && (
            <button
              onClick={handleEditClick}
              className="bg-primary text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-pink-700 transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className={inputClasses} />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address (cannot be changed)</label>
              <input type="email" name="email" id="email" value={currentUser.email || ''} disabled className={disabledInputClasses} />
            </div>

            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
              <input type="tel" name="mobile" id="mobile" value={formData.mobile} onChange={handleInputChange} className={inputClasses} />
            </div>

            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
              <input type="date" name="dob" id="dob" value={formData.dob} onChange={handleInputChange} className={inputClasses} />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
              <select name="gender" id="gender" value={formData.gender || ''} onChange={handleInputChange} className={inputClasses}>
                <option value="">Select...</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>

            <div className="flex justify-end gap-4">
              {error && <p className="text-red-600 text-sm flex-1">{error}</p>}
              <button type="button" onClick={handleCancelClick} className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                Cancel
              </button>
              <button type="submit" className="bg-primary text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-pink-700 transition-colors">
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</p>
                <p className="text-md text-gray-800 dark:text-white">{currentUser.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</p>
                <p className="text-md text-gray-800 dark:text-white">{currentUser.email || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Mobile Number</p>
                <p className="text-md text-gray-800 dark:text-white">{currentUser.mobile || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</p>
                <p className="text-md text-gray-800 dark:text-white">{currentUser.dob || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</p>
                <p className="text-md text-gray-800 dark:text-white capitalize">{currentUser.gender || 'Not set'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mt-8">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Orders</h2>
          <button
            onClick={() => setActiveSection('orders')}
            className="text-sm font-medium text-primary hover:underline"
          >
            View All
          </button>
        </div>
        <div className="p-6">
          {recentItems.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentItems.map(({ item, order }) => (
                <RecentOrderItem key={`${order.id}-${item.id}`} item={item} order={order} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">You have no recent orders.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileInformation;
