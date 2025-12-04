import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import CouponCard from './CouponCard.tsx';
import TagIcon from './icons/TagIcon.tsx';

const MyCoupons: React.FC = () => {
  const { getAllPromotions } = useAppContext();
  const allPromotions = getAllPromotions();

  const availablePromotions = useMemo(() => {
    return allPromotions.filter(p => p.isActive && new Date(p.expiresAt) > new Date());
  }, [allPromotions]);

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-semibold text-gray-800">My Coupons</h2>
        <p className="mt-1 text-sm text-gray-500">Available coupons and offers for you.</p>
      </div>
      <div className="p-4 sm:p-6">
        {availablePromotions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availablePromotions.map(promo => <CouponCard key={promo.id} promotion={promo} />)}
          </div>
        ) : (
          <div className="text-center py-16">
            <TagIcon className="w-16 h-16 mx-auto text-gray-300" />
            <h2 className="mt-4 text-xl font-semibold text-gray-700">No Coupons Available</h2>
            <p className="mt-2 text-gray-500">Check back later for exciting offers!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCoupons;
