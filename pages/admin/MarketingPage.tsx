
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext.tsx';
import { Promotion, Announcement } from '../../types.ts';
import PlusIcon from '../../components/icons/PlusIcon.tsx';
import TrashIcon from '../../components/icons/TrashIcon.tsx';
import PencilIcon from '../../components/icons/PencilIcon.tsx';
import { usePromotions, useDeletePromotion } from '../../services/api/promotions.api';

const PromotionTable: React.FC = () => {
    const { showConfirmationModal } = useAppContext();
    const { data: promotionsData, isLoading } = usePromotions();
    const { mutateAsync: deletePromotionAsync } = useDeletePromotion();
    const promotions = promotionsData || [];

    const handleDelete = async (promotion: Promotion) => {
        showConfirmationModal({
            title: 'Delete Promotion',
            message: `Are you sure you want to delete the promotion "${promotion.code}"? This action cannot be undone.`,
            onConfirm: async () => {
                try {
                    await deletePromotionAsync(promotion.id);
                } catch (error) {
                    console.error("Failed to delete promotion:", error);
                    alert(`Error: Could not delete promotion. ${(error as Error).message}`);
                    throw error; // Re-throw to keep modal open
                }
            },
            confirmText: 'Delete',
            isDestructive: true,
        });
    };

    const getStatus = (promotion: Promotion) => {
        if (!promotion.isActive) return { text: 'Inactive', color: 'bg-gray-100 text-gray-800' };
        if (new Date(promotion.expiresAt) < new Date()) return { text: 'Expired', color: 'bg-red-100 text-red-800' };
        return { text: 'Active', color: 'bg-green-100 text-green-800' };
    };

    return (
        <div className="overflow-x-auto">
            {isLoading ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading promotions...</div>
            ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Value</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Usage</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {promotions.map((promotion) => {
                            const status = getStatus(promotion);
                            return (
                                <tr key={promotion.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-primary">{promotion.code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{promotion.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white">
                                        {promotion.type === 'percentage' ? `${promotion.value}%` : `₹${promotion.value}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{promotion.uses} / {promotion.usageLimit}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                                            {status.text}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end items-center gap-4">
                                            <Link to={`/admin/marketing/promotions/edit/${promotion.id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                                                <PencilIcon className="h-5 w-5" />
                                            </Link>
                                            <button onClick={() => handleDelete(promotion)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
            {!isLoading && promotions.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">No promotions have been created yet.</div>
            )}
        </div>
    );
};

const AnnouncementEditor: React.FC = () => {
    const { announcement, updateAnnouncement } = useAppContext();
    const [formState, setFormState] = useState<Announcement>({ text: '', link: '', isActive: false });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (announcement) {
            setFormState(announcement);
        }
    }, [announcement]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormState(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        await updateAnnouncement(formState);
        setIsSaving(false);
    };

    const isChanged = JSON.stringify(announcement) !== JSON.stringify(formState);

    const inputClass = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500";

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="announcement-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Announcement Text</label>
                <input
                    type="text"
                    id="announcement-text"
                    name="text"
                    value={formState.text}
                    onChange={handleChange}
                    placeholder="e.g., Free Shipping on Orders Over ₹499"
                    className={inputClass}
                />
            </div>
            <div>
                <label htmlFor="announcement-link" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Link (Optional)</label>
                <input
                    type="text"
                    id="announcement-link"
                    name="link"
                    value={formState.link}
                    onChange={handleChange}
                    placeholder="e.g., /category/new-arrivals"
                    className={inputClass}
                />
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id="announcement-active"
                            name="isActive"
                            type="checkbox"
                            checked={formState.isActive}
                            onChange={handleChange}
                            className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="announcement-active" className="font-medium text-gray-700 dark:text-gray-300">Show announcement bar on site</label>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!isChanged || isSaving}
                    className="bg-primary text-white py-2 px-4 rounded-md font-medium hover:bg-pink-700 disabled:bg-gray-400"
                >
                    {isSaving ? 'Saving...' : 'Save'}
                </button>
            </div>
        </div>
    );
};


const MarketingPage: React.FC = () => {
    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Marketing & Promotions</h1>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Promotions & Coupons</h2>
                    <Link
                        to="/admin/marketing/promotions/new"
                        className="flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-md font-medium hover:bg-pink-700"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Create Promotion
                    </Link>
                </div>
                <PromotionTable />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Site Announcements</h2>
                <AnnouncementEditor />
            </div>
        </div>
    );
};

export default MarketingPage;
