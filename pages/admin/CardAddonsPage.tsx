import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext.tsx';
import { TrashIcon, PencilSquareIcon as EditIcon, PlusIcon, EyeIcon, EyeSlashIcon as EyeOffIcon } from '@heroicons/react/24/outline';

const CardAddonsPage: React.FC = () => {
    const { cardAddons, fetchCardAddons, deleteCardAddon, updateCardAddon } = useAppContext();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            await fetchCardAddons();
            setIsLoading(false);
        };
        load();
    }, [fetchCardAddons]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this addon?')) {
            try {
                await deleteCardAddon(id);
            } catch (error) {
                console.error('Failed to delete addon:', error);
                alert('Failed to delete addon');
            }
        }
    };

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await updateCardAddon(id, { is_active: !currentStatus });
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading addons...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Card Addons</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage custom content sections for your site.</p>
                </div>
                <Link
                    to="/admin/card-addons/new"
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    Create New Addon
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {cardAddons.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                        <p className="text-lg">No addons created yet.</p>
                        <p className="mt-2">Click the button above to create your first content section.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200">
                                <tr>
                                    <th className="p-4 font-semibold">Type</th>
                                    <th className="p-4 font-semibold">Title</th>
                                    <th className="p-4 font-semibold">Placement</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {cardAddons.map((addon) => (
                                    <tr key={addon.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="p-4">
                                            <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded capitalize">
                                                {addon.type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-gray-900 dark:text-white">
                                            {addon.title || <span className="text-gray-400 italic">No Title</span>}
                                        </td>
                                        <td className="p-4 text-gray-600 dark:text-gray-300 capitalize">
                                            {addon.placement.replace('_', ' ')}
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => toggleActive(addon.id, addon.is_active)}
                                                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${addon.is_active
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                                    }`}
                                            >
                                                {addon.is_active ? (
                                                    <>
                                                        <EyeIcon className="w-3 h-3" /> Active
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeOffIcon className="w-3 h-3" /> Inactive
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    to={`/admin/card-addons/edit/${addon.id}`}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <EditIcon className="w-5 h-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(addon.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CardAddonsPage;
