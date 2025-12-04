import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { Address } from '../types.ts';
import AddressForm from './AddressForm.tsx';
import XIcon from './icons/XIcon.tsx';
import PlusIcon from './icons/PlusIcon.tsx';

interface AddressSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (addressId: string) => void;
}

const AddressSelectionModal: React.FC<AddressSelectionModalProps> = ({ isOpen, onClose, onSelect }) => {
  const { currentUser, addAddress, updateAddress } = useAppContext();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);

  useEffect(() => {
    if (isOpen && currentUser?.addresses) {
      const defaultAddress = currentUser.addresses.find(a => a.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (currentUser.addresses.length > 0) {
        setSelectedAddressId(currentUser.addresses[0].id);
      } else {
        setShowForm(true); // If no addresses, show form
      }
    } else {
        // Reset state on close
        setShowForm(false);
        setAddressToEdit(null);
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  const handleSave = (addressData: any) => {
    if (addressData.id) {
      updateAddress(addressData);
    } else {
      addAddress(addressData);
    }
    setShowForm(false);
    setAddressToEdit(null);
  };

  const handleConfirm = () => {
    if (selectedAddressId) {
      onSelect(selectedAddressId);
      onClose();
    }
  };

  const addresses = currentUser.addresses || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex-shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {showForm ? (addressToEdit ? 'Edit Address' : 'Add New Address') : 'Select Delivery Address'}
            </h2>
            <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100" aria-label="Close">
              <XIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 flex-grow overflow-y-auto">
          {showForm ? (
            <AddressForm
              addressToEdit={addressToEdit}
              onSave={handleSave}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <div className="space-y-4">
                {addresses.map(addr => (
                    <div
                        key={addr.id}
                        role="radio"
                        aria-checked={selectedAddressId === addr.id}
                        tabIndex={0}
                        onClick={() => setSelectedAddressId(addr.id)}
                        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setSelectedAddressId(addr.id); } }}
                        className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
                    >
                        <div className={`p-4 rounded-lg border-2 transition-all ${selectedAddressId === addr.id ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white hover:border-primary/50'}`}>
                            <h3 className="font-bold text-gray-800">{addr.name}</h3>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                                <p>{addr.address}</p>
                                <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                                <p className="pt-2">Mobile: <span className="font-medium text-gray-800">{addr.mobile}</span></p>
                            </div>
                        </div>
                    </div>
                ))}
                <button
                    onClick={() => { setAddressToEdit(null); setShowForm(true); }}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-primary font-medium hover:bg-primary/5 transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    Add New Address
                </button>
            </div>
          )}
        </div>

        {!showForm && (
            <div className="p-4 flex-shrink-0 flex justify-end gap-3 border-t bg-gray-50 rounded-b-lg">
                <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleConfirm} disabled={!selectedAddressId} className="bg-primary text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-pink-700 disabled:bg-gray-400">
                    Confirm & Continue
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default AddressSelectionModal;
