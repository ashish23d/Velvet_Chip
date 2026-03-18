

import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import OrderCard from '../components/order/OrderCard';
import ArchiveBoxIcon from '../components/icons/ArchiveBoxIcon.tsx';

const MyOrders: React.FC = () => {
  const { currentUser, isLoading } = useAppContext();

  // Sort orders by date, most recent first.
  const sortedOrders = (currentUser?.orders || []).sort(
    (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="h-16 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-semibold text-gray-800">Orders &amp; Returns</h2>
        <p className="mt-1 text-sm text-gray-500">View your order history or manage returns.</p>
      </div>

      {sortedOrders.length === 0 ? (
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
          {sortedOrders.map(order => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </div>
  );
};

export default MyOrders;