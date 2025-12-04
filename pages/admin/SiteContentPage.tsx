
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext.tsx';
import { SiteContent, SeasonalEditCard, Product } from '../../types.ts';
import PlusIcon from '../../components/icons/PlusIcon.tsx';
import XIcon from '../../components/icons/XIcon.tsx';
import ImageUploader from '../../components/admin/ImageUploader.tsx';
import { BUCKETS } from '../../constants.ts';
import TrashIcon from '../../components/icons/TrashIcon.tsx';
import PencilIcon from '../../components/icons/PencilIcon.tsx';
import SupabaseImage from '../../components/SupabaseImage.tsx';

// --- Reusable & Standalone Components (Moved to top-level) ---

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        onChange(e.currentTarget.innerHTML);
    };

    const execCmd = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const editorClasses = `mt-1 block w-full h-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary overflow-y-auto prose prose-sm max-w-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white`;

    return (
        <div>
            <div className="flex items-center gap-2 mb-2 p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900">
                <button type="button" onClick={() => execCmd('bold')} className="font-bold px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300">B</button>
                <button type="button" onClick={() => execCmd('formatBlock', '<h2>')} className="font-semibold text-xl px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300">H2</button>
                <button type="button" onClick={() => execCmd('formatBlock', '<h3>')} className="font-semibold text-lg px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300">H3</button>
                <button type="button" onClick={() => execCmd('formatBlock', '<p>')} className="text-sm px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300">P</button>
            </div>
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                dangerouslySetInnerHTML={{ __html: value }}
                className={editorClasses}
            />
        </div>
    );
};

interface ContentBlockEditorProps {
    title: string;
    description: string;
    children: (
        formData: Record<string, any>,
        handleChange: (field: string, value: string) => void
    ) => React.ReactNode;
    contentId: string;
}

const ContentBlockEditor: React.FC<ContentBlockEditorProps> = ({ title, description, contentId, children }) => {
    const { siteContent, updateSiteContent } = useAppContext();
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const originalContent = siteContent.find(c => c.id === contentId)?.data || {};

    useEffect(() => {
        setFormData(originalContent);
    }, [JSON.stringify(originalContent)]);

    const isChanged = JSON.stringify(formData) !== JSON.stringify(originalContent);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError('');
        setSuccess(false);

        // Safety timeout to prevent infinite loading state
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timed out')), 30000)
        );

        try {
            const contentToUpdate: SiteContent = { id: contentId, data: formData };
            await Promise.race([
                updateSiteContent(contentToUpdate),
                timeoutPromise
            ]);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            console.error("Save error:", err);
            setError(err.message || 'Failed to save content.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">{description}</p>

            <div className="space-y-4">
                {children(formData, handleChange)}
            </div>

            <div className="flex justify-end items-center gap-4 mt-4">
                {error && <p className="text-xs text-red-500 mr-auto">{error}</p>}
                {success && <p className="text-xs text-green-600">Saved successfully!</p>}
                <button
                    onClick={handleSave}
                    disabled={isSaving || !isChanged}
                    className="bg-primary text-white py-2 px-4 rounded-md font-medium hover:bg-pink-700 disabled:bg-gray-400"
                >
                    {isSaving ? 'Saving...' : `Save ${title}`}
                </button>
            </div>
        </div>
    );
};

const SeasonalCardFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    cardToEdit: SeasonalEditCard | null;
}> = ({ isOpen, onClose, cardToEdit }) => {
    const { adminData, adminAddSeasonalCard, adminUpdateSeasonalCard } = useAppContext();
    const products = adminData?.products || [];
    const [formData, setFormData] = useState<Partial<SeasonalEditCard>>({
        card_type: 'product',
        is_active: true,
        reverse_layout: false,
        product_id: products[0]?.id || undefined,
        button_text: 'Explore Now',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (cardToEdit) {
            setFormData({
                ...cardToEdit,
                product_id: cardToEdit.product_id || (products[0]?.id || undefined)
            });
        } else {
            setFormData({ // Reset for new card
                card_type: 'product',
                is_active: true,
                reverse_layout: false,
                product_id: products[0]?.id || undefined,
                button_text: 'Explore Now',
            });
        }
    }, [cardToEdit, isOpen, products]);

    if (!isOpen) return null;

    const handleSave = async () => {
        setIsSaving(true);
        setError('');

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timed out')), 10000)
        );

        try {
            if (cardToEdit) {
                await Promise.race([
                    adminUpdateSeasonalCard(formData as SeasonalEditCard),
                    timeoutPromise
                ]);
            } else {
                await Promise.race([
                    adminAddSeasonalCard(formData as Omit<SeasonalEditCard, 'id' | 'created_at'>),
                    timeoutPromise
                ]);
            }
            onClose();
        } catch (err: any) {
            console.error("Save error:", err);
            setError(err.message || 'Failed to save card.');
            setIsSaving(false); // Only reset if error, otherwise onClose handles unmount
        }
    }

    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";
    const inputClass = "block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{cardToEdit ? 'Edit Card' : 'Add New Card'}</h3>
                    <button onClick={onClose}><XIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" /></button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* General Settings */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center">
                            <input id="is_active" type="checkbox" checked={formData.is_active} onChange={e => setFormData(p => ({ ...p, is_active: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active (Visible on Homepage)</label>
                        </div>
                        <div className="flex items-center">
                            <input id="reverse_layout" type="checkbox" checked={formData.reverse_layout} onChange={e => setFormData(p => ({ ...p, reverse_layout: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                            <label htmlFor="reverse_layout" className="ml-2 text-sm text-gray-700 dark:text-gray-300">Reverse Layout (Image on Right)</label>
                        </div>
                    </div>

                    {/* Card Type */}
                    <div>
                        <label className={labelClass}>Card Type</label>
                        <fieldset className="mt-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <label className={`relative flex cursor-pointer rounded-lg border bg-white dark:bg-gray-900 p-4 shadow-sm focus:outline-none ${formData.card_type === 'product' ? 'border-primary ring-2 ring-primary' : 'border-gray-300 dark:border-gray-600'}`}>
                                    <input type="radio" name="card_type" value="product" checked={formData.card_type === 'product'} onChange={() => setFormData(p => ({ ...p, card_type: 'product' }))} className="sr-only" aria-labelledby="card-type-product-label" />
                                    <span className="flex flex-1">
                                        <span className="flex flex-col">
                                            <span id="card-type-product-label" className="block text-sm font-medium text-gray-900 dark:text-white">Link to Product</span>
                                            <span className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">Auto-fill with product details.</span>
                                        </span>
                                    </span>
                                </label>
                                <label className={`relative flex cursor-pointer rounded-lg border bg-white dark:bg-gray-900 p-4 shadow-sm focus:outline-none ${formData.card_type === 'custom' ? 'border-primary ring-2 ring-primary' : 'border-gray-300 dark:border-gray-600'}`}>
                                    <input type="radio" name="card_type" value="custom" checked={formData.card_type === 'custom'} onChange={() => setFormData(p => ({ ...p, card_type: 'custom' }))} className="sr-only" aria-labelledby="card-type-custom-label" />
                                    <span className="flex flex-1">
                                        <span className="flex flex-col">
                                            <span id="card-type-custom-label" className="block text-sm font-medium text-gray-900 dark:text-white">Custom Content</span>
                                            <span className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">Upload an image and add text.</span>
                                        </span>
                                    </span>
                                </label>
                            </div>
                        </fieldset>
                    </div>

                    {/* Conditional Fields */}
                    <div className="animate-fade-in">
                        {formData.card_type === 'product' ? (
                            <div>
                                <label htmlFor="product_id" className={labelClass}>Select Product</label>
                                <select id="product_id" value={formData.product_id || ''} onChange={e => setFormData(p => ({ ...p, product_id: Number(e.target.value) }))} className={inputClass}>
                                    {products.map(prod => <option key={prod.id} value={prod.id}>{prod.name}</option>)}
                                </select>
                            </div>
                        ) : (
                            <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/50 dark:bg-gray-900/50">
                                <div>
                                    <label className={labelClass}>Image</label>
                                    <ImageUploader bucket={BUCKETS.SITE_ASSETS} pathPrefix="seasonal_cards" images={formData.image_path ? [formData.image_path] : []} onImageUpload={(path) => setFormData(p => ({ ...p, image_path: path }))} onImageRemove={() => setFormData(p => ({ ...p, image_path: null }))} />
                                </div>
                                <div><label htmlFor="title" className={labelClass}>Title</label><input type="text" id="title" value={formData.title || ''} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} className={inputClass} /></div>
                                <div><label htmlFor="description" className={labelClass}>Description</label><textarea id="description" rows={3} value={formData.description || ''} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className={inputClass} /></div>
                                <div><label htmlFor="button_link" className={labelClass}>Button Link</label><input type="text" id="button_link" placeholder="/category/sarees" value={formData.button_link || ''} onChange={e => setFormData(p => ({ ...p, button_link: e.target.value }))} className={inputClass} /></div>
                            </div>
                        )}
                    </div>
                    <div><label htmlFor="button_text" className={labelClass}>Button Text</label><input type="text" id="button_text" value={formData.button_text || ''} onChange={e => setFormData(p => ({ ...p, button_text: e.target.value }))} className={inputClass} /></div>

                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
                <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
                    <button type="button" onClick={onClose} className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
                    <button onClick={handleSave} disabled={isSaving} className="bg-primary text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-pink-700 disabled:bg-gray-400">{isSaving ? 'Saving...' : 'Save Card'}</button>
                </div>
            </div>
        </div>
    );
};

const SeasonalEditManager: React.FC = () => {
    const { seasonalEditCards, adminData, adminDeleteSeasonalCard, showConfirmationModal } = useAppContext();
    const products = adminData?.products || [];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cardToEdit, setCardToEdit] = useState<SeasonalEditCard | null>(null);

    const handleAdd = () => {
        setCardToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (card: SeasonalEditCard) => {
        setCardToEdit(card);
        setIsModalOpen(true);
    };

    const handleDelete = (card: SeasonalEditCard) => {
        const cardName = card.card_type === 'product' ? (products.find(p => p.id === card.product_id)?.name || 'Product Card') : (card.title || 'Custom Card');
        showConfirmationModal({
            title: 'Delete Card',
            message: `Are you sure you want to delete the "${cardName}" card?`,
            onConfirm: () => adminDeleteSeasonalCard(card.id),
            confirmText: 'Delete',
            isDestructive: true,
        });
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-white">Section Cards</h3>
                <button onClick={handleAdd} className="flex items-center gap-1 text-sm font-medium text-primary hover:text-pink-700">
                    <PlusIcon className="w-4 h-4" /> Add Card
                </button>
            </div>
            <div className="space-y-2">
                {seasonalEditCards.length > 0 ? (
                    seasonalEditCards.map(card => {
                        const product = card.product_id ? products.find(p => p.id === card.product_id) : null;
                        const title = card.card_type === 'product' ? product?.name : card.title;
                        const imageBucket = card.card_type === 'product' ? BUCKETS.PRODUCTS : BUCKETS.SITE_ASSETS;
                        const imagePath = card.card_type === 'product' ? product?.images[0] : card.image_path;

                        return (
                            <div key={card.id} className="flex items-center gap-4 p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900">
                                <SupabaseImage bucket={imageBucket} imagePath={imagePath} alt={title || ''} className="w-16 h-16 object-cover rounded flex-shrink-0" />
                                <div className="flex-grow min-w-0">
                                    <p className="font-semibold truncate text-gray-900 dark:text-white">{title || 'Untitled Card'}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{card.card_type} Card</p>
                                </div>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${card.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                    {card.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEdit(card)} className="p-1.5 text-gray-500 hover:text-primary"><PencilIcon className="w-5 h-5" /></button>
                                    <button onClick={() => handleDelete(card)} className="p-1.5 text-gray-500 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400">
                        <p>No seasonal cards have been added yet.</p>
                        <p className="text-sm mt-1">Click "Add Card" to create one.</p>
                    </div>
                )}
            </div>

            <SeasonalCardFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} cardToEdit={cardToEdit} />
        </div>
    );
};


// --- Main Page Component ---

const SiteContentPage: React.FC = () => {
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";
    const inputClass = "block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500";
    const socialPlatforms = ['instagram', 'twitter', 'facebook', 'website', 'myntra', 'amazon', 'flipkart'];

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Manage Site Content</h1>

            {/* Section #1: Fabulous Range */}
            <div id="section-home_fabulous_range" className="relative border-l-4 border-primary pl-4">
                <span className="absolute -left-7 top-0 bg-primary text-white text-xs font-bold px-2 py-1 rounded-r-md">#1</span>
                <ContentBlockEditor
                    title="Home: Fabulous Range"
                    description="First section on the homepage showcasing categories."
                    contentId="home_fabulous_range"
                >
                    {(formData, handleChange) => (
                        <>
                            <div><label className={labelClass}>Title</label><input type="text" value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} className={inputClass} /></div>
                            <div><label className={labelClass}>Description</label><textarea rows={2} value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} className={inputClass} /></div>
                        </>
                    )}
                </ContentBlockEditor>
            </div>

            {/* Section #2: New Arrivals */}
            <div id="section-home_new_arrivals" className="relative border-l-4 border-primary pl-4">
                <span className="absolute -left-7 top-0 bg-primary text-white text-xs font-bold px-2 py-1 rounded-r-md">#2</span>
                <ContentBlockEditor
                    title="Home: New Arrivals"
                    description="Second section showcasing new products."
                    contentId="home_new_arrivals"
                >
                    {(formData, handleChange) => (
                        <>
                            <div><label className={labelClass}>Title</label><input type="text" value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} className={inputClass} /></div>
                            <div><label className={labelClass}>Description</label><textarea rows={2} value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} className={inputClass} /></div>
                        </>
                    )}
                </ContentBlockEditor>
            </div>

            {/* Section #3: Featured Collections */}
            <div id="section-home_featured_collection" className="relative border-l-4 border-primary pl-4">
                <span className="absolute -left-7 top-0 bg-primary text-white text-xs font-bold px-2 py-1 rounded-r-md">#3</span>
                <ContentBlockEditor
                    title="Home: Featured Collections"
                    description="Third section showcasing featured products grid."
                    contentId="home_featured_collection"
                >
                    {(formData, handleChange) => (
                        <>
                            <div><label className={labelClass}>Title</label><input type="text" value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} className={inputClass} /></div>
                            <div><label className={labelClass}>Description</label><textarea rows={2} value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} className={inputClass} /></div>
                        </>
                    )}
                </ContentBlockEditor>
            </div>

            {/* Section #4: Seasonal Edit */}
            <div id="section-home_seasonal_edit" className="relative border-l-4 border-primary pl-4">
                <span className="absolute -left-7 top-0 bg-primary text-white text-xs font-bold px-2 py-1 rounded-r-md">#4</span>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <ContentBlockEditor
                        title="Home: Seasonal Edit"
                        description="Fourth section with promotional cards."
                        contentId="home_seasonal_edit"
                    >
                        {(formData, handleChange) => (
                            <>
                                <div><label className={labelClass}>Title</label><input type="text" value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} className={inputClass} /></div>
                                <div><label className={labelClass}>Description</label><textarea rows={2} value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} className={inputClass} /></div>
                            </>
                        )}
                    </ContentBlockEditor>
                    <div className="mt-6 pt-6 border-t dark:border-gray-700">
                        <SeasonalEditManager />
                    </div>
                </div>
            </div>

            <ContentBlockEditor
                title="Get in Touch Page"
                description="The introductory description on the contact page."
                contentId="contact_page_description"
            >
                {(formData, handleChange) => (
                    <textarea
                        rows={3}
                        value={formData.text || ''}
                        onChange={e => handleChange('text', e.target.value)}
                        className={inputClass}
                    />
                )}
            </ContentBlockEditor>

            <ContentBlockEditor
                title="Terms & Conditions"
                description="Use the tools to format your content. The preview below reflects the final appearance."
                contentId="terms_page_content"
            >
                {(formData, handleChange) => (
                    <RichTextEditor
                        value={formData.html || ''}
                        onChange={html => handleChange('html', html)}
                    />
                )}
            </ContentBlockEditor>

            <ContentBlockEditor
                title="Privacy Policy"
                description="Use the tools to format your content for the privacy policy page."
                contentId="privacy_policy_page_content"
            >
                {(formData, handleChange) => (
                    <RichTextEditor
                        value={formData.html || ''}
                        onChange={html => handleChange('html', html)}
                    />
                )}
            </ContentBlockEditor>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <ContentBlockEditor
                    title="Footer Description"
                    description="Short description below the logo."
                    contentId="footer_description"
                >
                    {(fd, hc) => (
                        <textarea rows={2} value={fd.text || ''} onChange={e => hc('text', e.target.value)} className={inputClass} />
                    )}
                </ContentBlockEditor>
                <div className="mt-6 pt-6 border-t dark:border-gray-700">
                    <ContentBlockEditor
                        title="Stay Connected Prompt"
                        description="Text for the newsletter subscription box."
                        contentId="footer_subscribe_text"
                    >
                        {(fd, hc) => (
                            <input type="text" value={fd.text || ''} onChange={e => hc('text', e.target.value)} className={inputClass} />
                        )}
                    </ContentBlockEditor>
                </div>
            </div>

            <ContentBlockEditor
                title="Social & Shopping Links"
                description="Enter the full URLs for your profiles. Leave blank to hide an icon."
                contentId="social_links"
            >
                {(formData, handleChange) => (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {socialPlatforms.map(platform => (
                            <div key={platform}>
                                <label htmlFor={`link_${platform}`} className={`${labelClass} capitalize`}>{platform === 'twitter' ? 'Twitter (X)' : platform}</label>
                                <input
                                    id={`link_${platform}`}
                                    type="url"
                                    value={formData[platform] || ''}
                                    onChange={e => handleChange(platform, e.target.value)}
                                    className={inputClass}
                                    placeholder="https://..."
                                />
                            </div>
                        ))}
                    </div>
                )}
            </ContentBlockEditor>
        </div>
    );
};

export default SiteContentPage;
