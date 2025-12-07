
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { Address } from '../types.ts';
import AddressCard from './AddressCard.tsx';
import AddressForm from './AddressForm.tsx';
import PlusIcon from './icons/PlusIcon.tsx';

const MyAddresses: React.FC = () => {
  const { currentUser, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);

  const handleAddNew = () => {
    setAddressToEdit(null);
    setShowForm(true);
  };

  const handleEdit = (address: Address) => {
    setAddressToEdit(address);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setAddressToEdit(null);
  };

  const handleSave = (addressData: Address) => {
    if (addressData.id) { // This means we are editing
      updateAddress(addressData);
    } else { // This means we are adding
      addAddress(addressData);
    }
    setShowForm(false);
    setAddressToEdit(null);
  };

  const addresses = (currentUser?.addresses || []).sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return 0;
  });
  const canAddMore = addresses.length < 5;

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">My Addresses</h2>
        {canAddMore && !showForm && (
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-pink-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Add New Address
          </button>
        )}
      </div>

      <div className="p-6">
        {showForm ? (
          <AddressForm
            addressToEdit={addressToEdit}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          addresses.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">You have no saved addresses.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {addresses.map(addr => (
                <AddressCard
                  key={addr.id}
                  address={addr}
                  onEdit={handleEdit}
                  onDelete={(id) => { if (window.confirm('Are you sure you want to delete this address?')) deleteAddress(id); }}
                  onSetDefault={setDefaultAddress}
                />
              ))}
            </div>
          )
        )}

        {!canAddMore && !showForm && (
          <p className="text-center text-sm text-gray-500 mt-6">You have reached the maximum of 5 saved addresses.</p>
        )}
      </div>
    </div>
  );
};

export default MyAddresses;
