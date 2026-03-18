import React, { useState } from 'react';
import { Promotion } from '../../types';

interface CouponCardProps {
    promotion: Promotion;
}

const CouponCard: React.FC<CouponCardProps> = ({ promotion }) => {
    const [isCopied, setIsCopied] = useState(false);
    const description = promotion.type === 'percentage'
        ? `Get ${promotion.value}% off on orders above ₹${promotion.minPurchase}`
        : `Get ₹${promotion.value} off on orders above ₹${promotion.minPurchase}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(promotion.code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="bg-white border-l-4 border-primary shadow-md rounded-r-lg p-4 flex flex-col justify-between gap-3">
            <div>
                <p className="text-gray-600 text-sm">{description}</p>
                <p className="text-xs text-gray-400 mt-1">Expires on: {new Date(promotion.expiresAt).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed">
                <span className="font-mono text-primary bg-primary/10 px-3 py-1 rounded-full text-sm">{promotion.code}</span>
                <button onClick={handleCopy} className="text-sm font-semibold text-primary hover:underline">
                    {isCopied ? 'Copied!' : 'Copy'}
                </button>
            </div>
        </div>
    );
};

export default CouponCard;
