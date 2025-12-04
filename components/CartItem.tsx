import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { CartItem as CartItemType } from '../types.ts';
import { useAppContext } from '../context/AppContext.tsx';
import TrashIcon from './icons/TrashIcon.tsx';
import PlusIcon from './icons/PlusIcon.tsx';
import MinusIcon from './icons/MinusIcon.tsx';
import SupabaseImage from './SupabaseImage.tsx';
import { BUCKETS } from '../constants.ts';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { removeFromCart, updateCartItemQuantity } = useAppContext();

  const colorVariant = item.product.colors.find(c => c.name === item.selectedColor.name);
  const imagePath = colorVariant?.images?.[0] || item.product.images?.[0];

  return (
    <div className="flex items-start gap-4 p-4 border-b border-gray-200">
      <ReactRouterDOM.Link to={`/product/${item.product.id}`} className="flex-shrink-0">
        <SupabaseImage
          bucket={BUCKETS.PRODUCTS}
          imagePath={imagePath} 
          alt={item.product.name} 
          className="w-24 h-32 object-cover rounded-lg"
          width={96}
          height={128}
        />
      </ReactRouterDOM.Link>
      <div className="flex-grow flex flex-col justify-between h-32">
        <div>
            <div className="flex justify-between items-start">
                <ReactRouterDOM.Link to={`/product/${item.product.id}`} className="font-semibold text-gray-800 hover:text-primary">{item.product.name}</ReactRouterDOM.Link>
                <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 p-1" aria-label="Remove item">
                    <TrashIcon className="w-5 h-5"/>
                </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
                Size: {item.selectedSize} &middot; Color: {item.selectedColor.name}
            </p>
        </div>
        <div className="flex justify-between items-center mt-2">
            <div className="flex items-center border border-gray-300 rounded-md">
                <button 
                    onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                    className="p-1.5 text-gray-600 hover:text-primary disabled:text-gray-300"
                    disabled={item.quantity <= 1}
                    aria-label="Decrease quantity"
                >
                    <MinusIcon className="w-4 h-4" />
                </button>
                <span className="px-3 text-sm font-medium text-gray-800">{item.quantity}</span>
                <button 
                    onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                    className="p-1.5 text-gray-600 hover:text-primary"
                    aria-label="Increase quantity"
                >
                    <PlusIcon className="w-4 h-4" />
                </button>
            </div>
            <div className="flex items-baseline gap-2">
                 <p className="text-md font-bold text-gray-900">₹{item.product.price * item.quantity}</p>
                 {item.product.price !== item.product.mrp &&
                    <p className="text-sm text-gray-500 line-through">₹{item.product.mrp * item.quantity}</p>
                 }
            </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;