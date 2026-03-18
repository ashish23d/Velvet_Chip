import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import CartItem from '../components/cart/CartItem';
import OrderSummary from '../components/checkout/OrderSummary';
import ShoppingBagIcon from '../components/icons/ShoppingBagIcon.tsx';
import CardRenderer from '../components/home/CardRenderer';

const CartPage: React.FC = () => {
  const { cart, cardAddons } = useAppContext();

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
        <ShoppingBagIcon className="w-16 h-16 mx-auto text-gray-300" />
        <h1 className="mt-4 text-2xl font-semibold text-gray-800">Your Cart is Empty</h1>
        <p className="mt-2 text-gray-500">Looks like you haven't added anything to your cart yet.</p>
        <ReactRouterDOM.Link
          to="/"
          className="mt-6 inline-block bg-primary text-white py-2 px-6 rounded-full font-medium hover:bg-pink-700 transition-colors"
        >
          Continue Shopping
        </ReactRouterDOM.Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-6">
        Shopping Cart
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 items-start">
        {/* Cart Items */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          {cart.map(item => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <OrderSummary cart={cart} ctaText="Proceed to Address" ctaLink="/address" />
        </div>
      </div>


      {/* Card Addons */}
      <div className="mt-12">
        {cardAddons
          .filter(addon => addon.placement === 'cart_page' && addon.isActive)
          .sort((a, b) => a.order - b.order)
          .map(addon => (
            <CardRenderer key={addon.id} addon={addon} />
          ))
        }
      </div>
    </div >
  );
};

export default CartPage;