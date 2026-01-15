
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext.tsx';
import ImageUploader from '../../components/admin/ImageUploader.tsx';
import { MediaItem } from '../../types.ts';
import { BUCKETS } from '../../constants.ts';

const CategoryFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getCategoryById, addCategory, updateCategory } = useAppContext();

    const isEditing = Boolean(id);

    const [name, setName] = useState('');
    const [heroImage, setHeroImage] = useState<string>('');
    const [appImagePath, setAppImagePath] = useState<string>('');
    const [pageHeroMedia, setPageHeroMedia] = useState<MediaItem[]>([]);
    const [pageHeroText, setPageHeroText] = useState('');
    const [showPageHeroText, setShowPageHeroText] = useState(true);
    const [taxRate, setTaxRate] = useState<number>(0);

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isEditing && id) {
            const categoryToEdit = getCategoryById(id);
            if (categoryToEdit) {
                setName(categoryToEdit.name);
                setHeroImage(categoryToEdit.heroImage);
                // Load the existing app image path
                setAppImagePath(categoryToEdit.appImagePath || '');
                setPageHeroMedia(categoryToEdit.pageHeroMedia || []);
                setPageHeroText(categoryToEdit.pageHeroText || '');
                setShowPageHeroText(categoryToEdit.showPageHeroText ?? true);
                setTaxRate(categoryToEdit.tax_rate || 0);
            }
        }
    }, [isEditing, id, getCategoryById]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        const categoryData = {
            name,
            heroImage: heroImage || 'awaany_placeholders/categories/default',
            appImagePath: appImagePath || null, // Ensure this is passed to context
            pageHeroMedia,
            pageHeroText,
            showPageHeroText,
            tax_rate: Number(taxRate) || 0
        };

        try {
            if (isEditing && id) {
                await updateCategory({ id, ...categoryData });
            } else {
                await addCategory(categoryData);
                // Only navigate after creating new category
                navigate('/admin/categories');
                return;
            }
            // Don't navigate after update - just show success
            alert('Category updated successfully!');
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/admin/categories');
    };

    const handleMediaUpload = (publicId: string) => {
        const type = /\.(mp4|webm)$/i.test(publicId) ? 'video' : 'image';
        setPageHeroMedia(prev => [...prev, { path: publicId, type }]);
    };

    const handleMediaRemove = (publicIdToRemove: string) => {
        setPageHeroMedia(prev => prev.filter(item => item.path !== publicIdToRemove));
    };

    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";
    const inputClass = "block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500";

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {isEditing ? 'Edit Category' : 'Create New Category'}
            </h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Category Details</h3>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className={labelClass}>Category Name</label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className={inputClass} required />
                        </div>
                        <div>
                            <label htmlFor="taxRate" className={labelClass}>Tax Rate (%)</label>
                            <input
                                type="number"
                                id="taxRate"
                                value={taxRate}
                                onChange={e => setTaxRate(Number(e.target.value))}
                                className={inputClass}
                                min="0" max="100" step="0.01"
                                placeholder="e.g. 18"
                            />
                            <p className="text-xs text-gray-500 mt-1">Used if Global Tax Mode is set to 'Category'.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>Web Showcase Card Image</label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">This image appears on the website homepage.</p>
                            <ImageUploader
                                bucket={BUCKETS.CATEGORIES}
                                pathPrefix={name || 'new-category'}
                                images={heroImage ? [heroImage] : []}
                                onImageUpload={(publicId) => setHeroImage(publicId)}
                                onImageRemove={() => setHeroImage('')}
                                accept="image/*"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Category img for mobile</label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">Image displayed for this category in the mobile app (saved to <code>app_image_path</code>).</p>
                            <ImageUploader
                                bucket={BUCKETS.APP_ASSETS}
                                pathPrefix={name ? `${name}/app-icon` : 'new-category/app-icon'}
                                images={appImagePath ? [appImagePath] : []}
                                onImageUpload={(publicId) => setAppImagePath(publicId)}
                                onImageRemove={() => setAppImagePath('')}
                                accept="image/*"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Category Page Hero</h3>
                <div className="space-y-6">
                    <div>
                        <label className={labelClass}>Hero Media (Image/Video)</label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">Media for the banner at the top of the category page. Videos under 5MB are recommended.</p>
                        <ImageUploader
                            bucket={BUCKETS.CATEGORIES}
                            pathPrefix={`${name || 'new-category'}/page-hero`}
                            images={pageHeroMedia.map(item => item.path)}
                            onImageUpload={handleMediaUpload}
                            onImageRemove={handleMediaRemove}
                            accept="image/*,video/mp4,video/webm"
                        />
                    </div>
                    <div>
                        <label htmlFor="pageHeroText" className={labelClass}>Hero Text</label>
                        <input type="text" id="pageHeroText" value={pageHeroText} onChange={e => setPageHeroText(e.target.value)} className={inputClass} placeholder="e.g. Explore our new Saree collection" />
                    </div>
                    <div className="flex items-center">
                        <input id="showPageHeroText" type="checkbox" checked={showPageHeroText} onChange={e => setShowPageHeroText(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                        <label htmlFor="showPageHeroText" className="ml-2 text-sm text-gray-700 dark:text-gray-300">Show hero text on banner</label>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
                <button type="button" onClick={handleCancel} className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
                <button type="button" onClick={handleSave} disabled={isSaving} className="bg-primary text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-pink-700 disabled:bg-gray-400">
                    {isSaving ? 'Saving...' : 'Save Category'}
                </button>
            </div>
        </div>
    );
};

export default CategoryFormPage;
