
import React from 'react';
import { Address } from '../../types';
import PencilIcon from '../icons/PencilIcon';
import TrashIcon from '../icons/TrashIcon';
import CheckCircleIcon from '../icons/CheckCircleIcon';

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (addressId: string) => void;
  onSetDefault: (addressId: string) => void;
}

const AddressCard: React.FC<AddressCardProps> = ({ address, onEdit, onDelete, onSetDefault }) => {
  return (
    <div className={`p-6 rounded-lg border-2 transition-all ${address.isDefault ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white'}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-gray-800">{address.name}</h3>
          {address.isDefault && (
            <div className="mt-1 inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
              <CheckCircleIcon className="w-4 h-4" />
              Default Address
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => onEdit(address)} className="p-1 text-gray-500 hover:text-primary" aria-label="Edit address">
                <PencilIcon className="w-5 h-5" />
            </button>
            <button onClick={() => onDelete(address.id)} className="p-1 text-gray-500 hover:text-red-500" aria-label="Delete address">
                <TrashIcon className="w-5 h-5" />
            </button>
        </div>
      </div>
      <div className="mt-4 space-y-1 text-sm text-gray-600">
        <p>{address.address}</p>
        <p>{address.locality}</p>
        <p>{address.city}, {address.state} - {address.pincode}</p>
        <p className="pt-2">Mobile: <span className="font-medium text-gray-800">{address.mobile}</span></p>
      </div>
      {!address.isDefault && (
        <button 
          onClick={() => onSetDefault(address.id)}
          className="mt-4 text-sm font-semibold text-primary hover:underline"
        >
          Set as Default
        </button>
      )}
    </div>
  );
};

export default AddressCard;