import React, { useState, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import { Promotion } from '../types.ts';
import NewArrivalCard from '../components/home/NewArrivalCard';
import TagIcon from '../components/icons/TagIcon.tsx';
import CouponCard from '../components/shared/CouponCard';
import { usePromotions } from '../services/api/promotions.api';

const CouponsPage: React.FC = () => {
    const { products } = useAppContext();
    const { data: allPromotionsData } = usePromotions();
    const allPromotions = allPromotionsData || [];

    const availablePromotions = useMemo(() => {
        return allPromotions.filter(p => p.isActive && new Date(p.expiresAt) > new Date());
    }, [allPromotions]);

    const suggestedProducts = useMemo(() => {
        return products.slice(0, 8);
    }, [products]);

    return (
        <div className="bg-gray-50/70">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Part 1: Coupon Details */}
                <div className="mb-16">
                    <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6">Available Coupons</h1>
                    {availablePromotions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {availablePromotions.map(promo => <CouponCard key={promo.id} promotion={promo} />)}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
                            <TagIcon className="w-16 h-16 mx-auto text-gray-300" />
                            <h2 className="mt-4 text-xl font-semibold text-gray-700">No Coupons Available</h2>
                            <p className="mt-2 text-gray-500">Check back later for exciting offers!</p>
                        </div>
                    )}
                </div>

                {/* Part 2: Suggestive Content */}
                <div>
                    <h2 className="text-3xl font-serif font-bold text-center text-gray-800 mb-8">Discover More</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                        {suggestedProducts.map((product) => (
                            <NewArrivalCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CouponsPage;
