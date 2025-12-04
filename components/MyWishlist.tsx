import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import WishlistCard from './WishlistCard.tsx';
import WishlistIcon from './icons/WishlistIcon.tsx';

const MyWishlist: React.FC = () => {
  const { wishlist } = useAppContext();

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-semibold text-gray-800">My Wishlist</h2>
        <p className="mt-1 text-sm text-gray-500">{wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="p-6 text-center py-16">
          <WishlistIcon className="w-16 h-16 mx-auto text-gray-300" />
          <h3 className="mt-4 text-xl font-semibold text-gray-700">Your Wishlist is Empty</h3>
          <p className="mt-2 text-gray-500">Add items that you like to your wishlist. Review them anytime and easily move them to the bag.</p>
          <Link to="/" className="mt-6 inline-block bg-primary text-white py-2 px-6 rounded-full font-medium hover:bg-pink-700 transition-colors">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {wishlist.map(product => <WishlistCard key={product.id} product={product} />)}
        </div>
      )}
    </div>
  );
};

export default MyWishlist;
