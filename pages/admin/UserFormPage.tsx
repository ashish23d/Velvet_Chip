
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext.tsx';
import { User } from '../../types.ts';
import { supabase } from '../../services/supabaseClient.ts';

const UserFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentUser, adminCreateUser, adminUpdateUser, getUserById } = useAppContext();

    const isEditing = Boolean(id);
    const userToEdit = isEditing ? getUserById(id!) : undefined;
    const userToEditJSON = useMemo(() => JSON.stringify(userToEdit), [userToEdit]);

    const [formData, setFormData] = useState<Partial<User>>({
        name: '',
        email: '',
        password: '',
        role: 'customer',
        mobile: '',
    });
    const [error, setError] = useState('');

    // State for admin verification
    const isEditingAdmin = isEditing && userToEdit?.role === 'admin';
    const [isVerified, setIsVerified] = useState(!isEditingAdmin);
    const [password, setPassword] = useState('');
    const [verificationError, setVerificationError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        if (isEditing && userToEdit) {
            setFormData({
                name: userToEdit.name,
                email: userToEdit.email,
                password: '', // Always clear password field for security
                role: userToEdit.role,
                mobile: userToEdit.mobile || '',
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditing, userToEditJSON]);

    const handleVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser?.email) {
            setVerificationError("Verification failed: Could not find your email.");
            return;
        }
        setIsVerifying(true);
        setVerificationError('');

        const { error } = await supabase.auth.signInWithPassword({
            email: currentUser.email,
            password: password,
        });

        setIsVerifying(false);

        if (error) {
            setVerificationError('Incorrect password. Please try again.');
        } else {
            setIsVerified(true);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (isEditing && userToEdit) {
                const { password, ...dataToUpdate } = formData;
                const updatedUser: User = { ...userToEdit, ...dataToUpdate };
                await adminUpdateUser(updatedUser);
            } else {
                if (!formData.password) {
                    setError('Password is required for new users.');
                    return;
                }
                await adminCreateUser(formData);
            }
            navigate('/admin/users');
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        }
    };

    const handleCancel = () => {
        navigate('/admin/users');
    };
    
    const inputClass = "block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

    if (isEditingAdmin && !isVerified) {
        return (
            <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mt-10 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Admin Verification Required</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">To edit an administrator's profile, please enter your password to continue.</p>
                <form onSubmit={handleVerification}>
                    <div>
                        <label htmlFor="admin-password-verification" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Password</label>
                        <input
                            type="password"
                            id="admin-password-verification"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white"
                            required
                            autoFocus
                        />
                    </div>
                    {verificationError && <p className="text-red-500 text-sm mt-2">{verificationError}</p>}
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={() => navigate('/admin/users')} className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md text-sm font-medium">
                            Cancel
                        </button>
                        <button type="submit" disabled={isVerifying} className="bg-primary text-white py-2 px-4 rounded-md text-sm font-medium disabled:bg-gray-400">
                            {isVerifying ? 'Verifying...' : 'Verify & Continue'}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
             <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {isEditing ? `Edit User: ${userToEdit?.name}` : 'Create New User'}
                </h1>
                 <button type="button" onClick={handleCancel} className="text-sm font-medium text-primary hover:underline">
                   &larr; Back to Users
                </button>
            </div>


            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="name" className={labelClass}>Full Name</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                        <label htmlFor="email" className={labelClass}>Email Address</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email || ''}
                          onChange={handleChange}
                          className={`${inputClass} ${isEditing ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400' : ''}`}
                          required
                          disabled={isEditing}
                        />
                        {isEditing && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Email address cannot be changed.</p>}
                    </div>
                    <div>
                        <label htmlFor="mobile" className={labelClass}>Mobile Number</label>
                        <input type="tel" id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} className={inputClass} />
                    </div>
                    {!isEditing && (
                        <div>
                            <label htmlFor="password" className={labelClass}>Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={inputClass}
                                required={!isEditing}
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="role" className={labelClass}>Role</label>
                        <select id="role" name="role" value={formData.role} onChange={handleChange} className={inputClass} required>
                            <option value="customer">Customer</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div className="flex justify-end gap-4">
                <button type="button" onClick={handleCancel} className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
                <button type="submit" className="bg-primary text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-pink-700">
                    {isEditing ? 'Save Changes' : 'Create User'}
                </button>
            </div>
        </form>
    );
};

export default UserFormPage;
