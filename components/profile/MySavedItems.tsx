import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import SavedItemCard from '../SavedItemCard';
import BookmarkIcon from '../icons/BookmarkIcon';

const MySavedItems: React.FC = () => {
  const { savedItems } = useAppContext();

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-semibold text-gray-800">Saved Items</h2>
        <p className="mt-1 text-sm text-gray-500">Products you've saved for later.</p>
      </div>

      {savedItems.length === 0 ? (
        <div className="p-6 text-center py-16">
          <BookmarkIcon className="w-16 h-16 mx-auto text-gray-300" />
          <h3 className="mt-4 text-xl font-semibold text-gray-700">You have no saved items</h3>
          <p className="mt-2 text-gray-500">Use the bookmark icon on products to save them here for later.</p>
          <Link to="/" className="mt-6 inline-block bg-primary text-white py-2 px-6 rounded-full font-medium hover:bg-pink-700 transition-colors">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedItems.map(product => <SavedItemCard key={product.id} product={product} />)}
        </div>
      )}
    </div>
  );
};

export default MySavedItems;
