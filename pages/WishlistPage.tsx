import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import { Product } from '../types.ts';
import ProductCard from '../components/product/ProductCard';
import WishlistCard from '../components/WishlistCard.tsx'; // New import for mobile
import WishlistIcon from '../components/icons/WishlistIcon.tsx';

const WishlistPage: React.FC = () => {
  const { wishlist, categories } = useAppContext();

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
        <WishlistIcon className="w-20 h-20 mx-auto text-gray-300" />
        <h1 className="mt-4 text-2xl font-semibold text-gray-800">Your Wishlist is Empty</h1>
        <p className="mt-2 text-gray-500">Add items that you like to your wishlist. Review them anytime and easily move them to the bag.</p>
        <ReactRouterDOM.Link 
          to="/" 
          className="mt-6 inline-block bg-primary text-white py-2 px-6 rounded-full font-medium hover:bg-pink-700 transition-colors"
        >
          Continue Shopping
        </ReactRouterDOM.Link>
      </div>
    );
  }

  const groupedProducts = wishlist.reduce((acc, product) => {
    const categoryName = categories.find(c => c.id === product.category)?.name || 'Other';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <div className="bg-gray-50/70">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-gray-900">My Wishlist</h1>
                <p className="mt-1 text-gray-600">{wishlist.length} item{wishlist.length > 1 ? 's' : ''} saved</p>
            </div>
            
            <div className="space-y-12">
                {Object.entries(groupedProducts).map(([categoryName, products]: [string, Product[]]) => (
                    <section key={categoryName}>
                        <div className="flex items-center gap-4 mb-6">
                           <h2 className="text-xl font-semibold text-gray-800">{categoryName}</h2>
                           <div className="flex-grow h-px bg-gray-200"></div>
                        </div>

                        {/* Desktop View using ProductCard */}
                        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {/* Mobile View using new WishlistCard */}
                        <div className="md:hidden space-y-4">
                            {products.map(product => (
                                <WishlistCard key={product.id} product={product} />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    </div>
  );
};

export default WishlistPage;