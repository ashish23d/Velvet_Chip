import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import OrderProductCard from './OrderProductCard.tsx';
import ArchiveBoxIcon from './icons/ArchiveBoxIcon.tsx';

const MyOrders: React.FC = () => {
  const { currentUser, fetchUserOrders } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Fetch orders only if they haven't been loaded yet.
    if (currentUser && !currentUser.orders) {
        setIsLoading(true);
        fetchUserOrders().finally(() => setIsLoading(false));
    }
  }, [currentUser, fetchUserOrders]);

  const sortedOrders = (currentUser?.orders || []).sort(
    (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
  );

  const allItems = sortedOrders.flatMap(order => 
    order.items.map(item => ({ item, order }))
  );

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-semibold text-gray-800">Orders &amp; Returns</h2>
        <p className="mt-1 text-sm text-gray-500">View your order history or manage returns.</p>
      </div>
      
      {isLoading ? (
        <div className="p-6 text-center py-16">
          <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-500">Loading your orders...</p>
        </div>
      ) : allItems.length === 0 ? (
        <div className="p-6 text-center py-16">
          <ArchiveBoxIcon className="w-16 h-16 mx-auto text-gray-300" />
          <h3 className="mt-4 text-xl font-semibold text-gray-700">You have no orders</h3>
          <p className="mt-2 text-gray-500">Any orders you place will appear here.</p>
          <Link to="/" className="mt-6 inline-block bg-primary text-white py-2 px-6 rounded-full font-medium hover:bg-pink-700 transition-colors">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="p-4 sm:p-6 space-y-4">
          {allItems.map(({ item, order }) => 
            <OrderProductCard key={`${order.id}-${item.id}`} item={item} order={order} />
          )}
        </div>
      )}
    </div>
  );
};

export default MyOrders;