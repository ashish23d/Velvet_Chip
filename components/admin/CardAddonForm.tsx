import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext.tsx';
import { CardAddon, CardType, CardPlacement } from '../../types.ts';
import ImageUploader from './ImageUploader.tsx';
import VideoUploader from './VideoUploader.tsx';
import { BUCKETS } from '../../constants.ts';

interface CardAddonFormProps {
    initialData?: CardAddon;
    isEditing?: boolean;
}

const CARD_TYPES: { value: CardType; label: string }[] = [
    { value: 'hero', label: 'Hero Section' },
    { value: 'banner', label: 'Banner' },
    { value: 'image', label: 'Image Only' },
    { value: 'text', label: 'Text Only' },
    { value: 'split', label: 'Split (Text + Image)' },
    { value: 'product_grid', label: 'Product Grid' },
    { value: 'product_carousel', label: 'Product Carousel' },
    { value: 'category_highlight', label: 'Category Highlight' },
    { value: 'info_card', label: 'Info Card' },
    { value: 'video', label: 'Video' },
];

const PLACEMENTS: { value: CardPlacement; label: string }[] = [
    { value: 'home', label: 'Home Page' },
    { value: 'category_page', label: 'Category Page' },
    { value: 'product_page', label: 'Product Page' },
    { value: 'cart_page', label: 'Cart Page' },
];

const CardAddonForm: React.FC<CardAddonFormProps> = ({ initialData, isEditing }) => {
    const { addCardAddon, updateCardAddon, categories, products } = useAppContext();
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState<Partial<CardAddon>>({
        type: 'banner',
        title: '',
        subtitle: '',
        content: '',
        image_path: '',
        cta_text: '',
        cta_link: '',
        target_type: 'none',
        target_id: '',
        placement: 'home',
        order: 0,
        is_active: true,
        config: {
            backgroundColor: '#ffffff',
            textColor: '#000000',
            textAlignment: 'left',
            fullWidth: false,
        },
        ...initialData,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('config.')) {
            const configKey = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                config: { ...prev.config, [configKey]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        if (name.startsWith('config.')) {
            const configKey = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                config: { ...prev.config, [configKey]: checked }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: checked }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (isEditing && initialData?.id) {
                await updateCardAddon(initialData.id, formData);
            } else {
                await addCardAddon(formData as any);
            }
            navigate('/admin/card-addons');
        } catch (error) {
            console.error('Error saving addon:', error);
            alert('Failed to save addon');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card Type</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                        {CARD_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Placement</label>
                    <select
                        name="placement"
                        value={formData.placement}
                        onChange={handleChange}
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                        {PLACEMENTS.map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Content Fields - Dynamic based on Type */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">Content</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title || ''}
                            onChange={handleChange}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
                        <input
                            type="text"
                            name="subtitle"
                            value={formData.subtitle || ''}
                            onChange={handleChange}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Body Content</label>
                    <textarea
                        name="content"
                        rows={4}
                        value={formData.content || ''}
                        onChange={handleChange}
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* Image Uploader */}
                {(formData.type === 'hero' || formData.type === 'banner' || formData.type === 'image' || formData.type === 'split' || formData.type === 'info_card') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image</label>
                        <ImageUploader
                            bucket={BUCKETS.CARD_ADDONS}
                            pathPrefix="addons"
                            images={formData.image_path ? [formData.image_path] : []}
                            onImageUpload={(path) => setFormData(prev => ({ ...prev, image_path: path }))}
                            onImageRemove={() => setFormData(prev => ({ ...prev, image_path: '' }))}
                        />
                    </div>
                )}

                {/* Video Section - URL or Upload */}
                {formData.type === 'video' && (
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Video Source</label>

                        {/* Toggle between URL and Upload */}
                        <div className="flex gap-4 mb-4">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, video_url: '', image_path: '' }))}
                                className={`px-4 py-2 rounded-md font-medium transition-colors ${!formData.video_url && !formData.image_path
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Choose Mode
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, image_path: '' }))}
                                className={`px-4 py-2 rounded-md font-medium transition-colors ${formData.video_url
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                📎 Paste URL
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, video_url: '' }))}
                                className={`px-4 py-2 rounded-md font-medium transition-colors ${formData.image_path
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                📤 Upload File
                            </button>
                        </div>

                        {/* Video URL Input */}
                        {(formData.video_url !== undefined && !formData.image_path) && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Video URL
                                    <span className="text-xs text-gray-500 ml-2">(YouTube, Vimeo, or direct MP4/WebM link)</span>
                                </label>
                                <input
                                    type="url"
                                    value={formData.video_url || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                                    placeholder="https://www.youtube.com/watch?v=... or https://example.com/video.mp4"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                                />
                                {formData.video_url && (
                                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        Preview: {formData.video_url.includes('youtube.com') ? '🎥 YouTube' :
                                            formData.video_url.includes('vimeo.com') ? '🎥 Vimeo' :
                                                '📹 Direct Video'}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Video File Upload */}
                        {(!formData.video_url && formData.image_path !== undefined) && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Video File</label>
                                <VideoUploader
                                    bucket={BUCKETS.CARD_ADDONS}
                                    pathPrefix="addons-video"
                                    videoPath={formData.image_path || ''}
                                    onVideoUpload={(path) => setFormData(prev => ({ ...prev, image_path: path }))}
                                    onVideoRemove={() => setFormData(prev => ({ ...prev, image_path: '' }))}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Product/Category Selection for Grids/Carousels */}
                {(formData.type === 'product_grid' || formData.type === 'product_carousel' || formData.type === 'category_highlight') && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Type</label>
                                <select
                                    name="target_type"
                                    value={formData.target_type}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="none">None</option>
                                    <option value="category">Specific Category</option>
                                    <option value="product">Specific Product (Single)</option>
                                    <option value="manual">Manual Selection (Multiple)</option>
                                </select>
                            </div>

                            {formData.target_type === 'category' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Category</label>
                                    <select
                                        name="target_id"
                                        value={formData.target_id || ''}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Select a category...</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {formData.target_type === 'product' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Product</label>
                                    <select
                                        name="target_id"
                                        value={formData.target_id || ''}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Select a product...</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {formData.target_type === 'manual' && (
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select Products</label>

                                {/* Selected Products List */}
                                <div className="mb-4">
                                    <p className="text-xs text-gray-500 mb-2">Selected Products ({formData.config?.productIds?.length || 0})</p>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.config?.productIds?.map((id: number) => {
                                            const product = products.find(p => p.id === id);
                                            return (
                                                <div key={id} className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                                                    <span>{product?.name || `Product #${id}`}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const currentIds = formData.config?.productIds || [];
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                config: {
                                                                    ...prev.config,
                                                                    productIds: currentIds.filter((pid: number) => pid !== id)
                                                                }
                                                            }));
                                                        }}
                                                        className="hover:text-red-500"
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            );
                                        })}
                                        {(!formData.config?.productIds || formData.config.productIds.length === 0) && (
                                            <span className="text-sm text-gray-400 italic">No products selected</span>
                                        )}
                                    </div>
                                </div>

                                {/* Product Selector */}
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Search products to add..."
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white mb-2"
                                        onChange={(e) => {
                                            // Simple local search could be implemented here if list is long
                                            // For now, we rely on the select dropdown below
                                        }}
                                    />
                                    <select
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        onChange={(e) => {
                                            const id = Number(e.target.value);
                                            if (id) {
                                                const currentIds = formData.config?.productIds || [];
                                                if (!currentIds.includes(id)) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        config: {
                                                            ...prev.config,
                                                            productIds: [...currentIds, id]
                                                        }
                                                    }));
                                                }
                                                e.target.value = ""; // Reset select
                                            }
                                        }}
                                    >
                                        <option value="">Select product to add...</option>
                                        {products
                                            .filter(p => !formData.config?.productIds?.includes(p.id))
                                            .map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* CTA Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CTA Text</label>
                        <input
                            type="text"
                            name="cta_text"
                            value={formData.cta_text || ''}
                            onChange={handleChange}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            placeholder="e.g. Shop Now"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CTA Link</label>
                        <input
                            type="text"
                            name="cta_link"
                            value={formData.cta_link || ''}
                            onChange={handleChange}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            placeholder="e.g. /category/new-arrivals"
                        />
                    </div>
                </div>
            </div>

            {/* Styling Config */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">Styling</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Background Color</label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                name="config.backgroundColor"
                                value={formData.config?.backgroundColor || '#ffffff'}
                                onChange={handleChange}
                                className="h-10 w-10 rounded border border-gray-300"
                            />
                            <input
                                type="text"
                                name="config.backgroundColor"
                                value={formData.config?.backgroundColor || '#ffffff'}
                                onChange={handleChange}
                                className="flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Text Color</label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                name="config.textColor"
                                value={formData.config?.textColor || '#000000'}
                                onChange={handleChange}
                                className="h-10 w-10 rounded border border-gray-300"
                            />
                            <input
                                type="text"
                                name="config.textColor"
                                value={formData.config?.textColor || '#000000'}
                                onChange={handleChange}
                                className="flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Text Alignment</label>
                        <select
                            name="config.textAlignment"
                            value={formData.config?.textAlignment || 'left'}
                            onChange={handleChange}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-4">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="config.fullWidth"
                            checked={formData.config?.fullWidth || false}
                            onChange={handleCheckboxChange}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Width</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleCheckboxChange}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    type="button"
                    onClick={() => navigate('/admin/card-addons')}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {isSaving ? 'Saving...' : 'Save Addon'}
                </button>
            </div>
        </form>
    );
};

export default CardAddonForm;
