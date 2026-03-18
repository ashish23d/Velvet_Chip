
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import { Address } from '../types.ts';
import AddressForm from '../components/checkout/AddressForm';
import OrderSummary from '../components/checkout/OrderSummary';
import PlusIcon from '../components/icons/PlusIcon.tsx';
import PencilIcon from '../components/icons/PencilIcon.tsx';

const AddressPage: React.FC = () => {
  const { currentUser, cart, addAddress, updateAddress, setSelectedAddressForCheckout, setDefaultAddress } = useAppContext();
  const navigate = useNavigate();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login?redirect=/address');
      return;
    }
    if (cart.length === 0) {
      navigate('/cart');
      return;
    }

    const defaultAddress = currentUser.addresses?.find(a => a.isDefault);
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
    } else if (currentUser.addresses?.length > 0) {
      setSelectedAddressId(currentUser.addresses[0].id);
    } else {
      setShowForm(true); // If no addresses, show form immediately
    }
  }, [currentUser, cart, navigate]);


  if (!currentUser) {
    return null;
  }

  const handleAddNew = () => {
    setAddressToEdit(null);
    setShowForm(true);
  };

  const handleEdit = (address: Address) => {
    setAddressToEdit(address);
    setShowForm(true);
  };

  const handleCancel = () => {
    // Only allow canceling if there's at least one address to fall back to
    if (currentUser.addresses && currentUser.addresses.length > 0) {
      setShowForm(false);
      setAddressToEdit(null);
    } else {
      alert("Please add an address to continue.")
    }
  };

  const handleSave = (addressData: any) => {
    if (addressData.id) {
      updateAddress(addressData);
    } else {
      addAddress(addressData);
    }
    setShowForm(false);
    setAddressToEdit(null);
  };

  const handleProceed = () => {
    if (selectedAddressId) {
      setSelectedAddressForCheckout(selectedAddressId);
      navigate('/payment');
    }
  };

  const addresses = currentUser.addresses || [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-6">
        Select Delivery Address
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 items-start">
        {/* Address Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">My Addresses</h2>
              {!showForm && (
                <button
                  onClick={handleAddNew}
                  className="flex items-center gap-2 text-sm font-medium text-primary hover:text-pink-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  Add New Address
                </button>
              )}
            </div>

            {showForm ? (
              <AddressForm
                addressToEdit={addressToEdit}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            ) : (
              <div role="radiogroup" className="space-y-4">
                {addresses
                  .sort((a, b) => (a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1))
                  .map(addr => (
                    <div
                      key={addr.id}
                      role="radio"
                      aria-checked={selectedAddressId === addr.id}
                      tabIndex={0}
                      onClick={() => setSelectedAddressId(addr.id)}
                      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setSelectedAddressId(addr.id); } }}
                      className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded-lg relative group"
                    >
                      <div className={`p-4 rounded-lg border-2 transition-all ${selectedAddressId === addr.id ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white hover:border-primary/50'}`}>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            {addr.name}
                            {addr.isDefault && (
                              <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide">Primary</span>
                            )}
                          </h3>
                          <div className="flex items-center gap-2">
                            {!addr.isDefault && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDefaultAddress(addr.id);
                                }}
                                className="text-xs text-gray-500 hover:text-primary underline opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                Set as Primary
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(addr);
                              }}
                              className="text-gray-400 hover:text-primary"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>{addr.address}</p>
                          <p>{addr.locality}</p>
                          <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                          <p className="pt-2">Mobile: <span className="font-medium text-gray-800">{addr.mobile}</span></p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <OrderSummary
            cart={cart}
            ctaText="Proceed to Payment"
            onClick={handleProceed}
            disabled={!selectedAddressId}
          />
        </div>
      </div>
    </div>
  );
};

export default AddressPage;
