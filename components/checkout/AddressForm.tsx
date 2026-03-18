
import React, { useState, useEffect } from 'react';
import { Address } from '../../types';

interface AddressFormProps {
  addressToEdit?: Address | null;
  onSave: (address: any) => void;
  onCancel: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ addressToEdit, onSave, onCancel }) => {
  const initialFormState = {
    name: '',
    mobile: '',
    pincode: '',
    address: '',
    locality: '',
    city: '',
    state: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (addressToEdit) {
      setFormData({
        name: addressToEdit.name,
        mobile: addressToEdit.mobile,
        pincode: addressToEdit.pincode,
        address: addressToEdit.address,
        locality: addressToEdit.locality,
        city: addressToEdit.city,
        state: addressToEdit.state,
      });
    } else {
      setFormData(initialFormState);
    }
  }, [addressToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...addressToEdit, ...formData });
  };

  const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-primary/20">
      <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">{addressToEdit ? 'Edit Address' : 'Add a New Address'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputClasses} />
          </div>
          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
            <input type="tel" name="mobile" id="mobile" value={formData.mobile} onChange={handleChange} required className={inputClasses} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pincode</label>
            <input type="text" name="pincode" id="pincode" value={formData.pincode} onChange={handleChange} required className={inputClasses} />
          </div>
          <div>
            <label htmlFor="locality" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Locality/Town</label>
            <input type="text" name="locality" id="locality" value={formData.locality} onChange={handleChange} required className={inputClasses} />
          </div>
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address (Area and Street)</label>
          <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} required className={inputClasses} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">City/District</label>
            <input type="text" name="city" id="city" value={formData.city} onChange={handleChange} required className={inputClasses} />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
            <input type="text" name="state" id="state" value={formData.state} onChange={handleChange} required className={inputClasses} />
          </div>
        </div>
        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={onCancel} className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 px-6 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            Cancel
          </button>
          <button type="submit" className="bg-primary text-white py-2 px-6 rounded-md text-sm font-medium hover:bg-pink-700 transition-colors">
            Save Address
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
