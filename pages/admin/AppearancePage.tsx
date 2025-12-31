import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext.tsx';
import { Slide, Category, SiteContent, MediaItem } from '../../types.ts';
import ImageUploader from '../../components/admin/ImageUploader.tsx';
import TrashIcon from '../../components/icons/TrashIcon.tsx';
import PlusIcon from '../../components/icons/PlusIcon.tsx';
import { BUCKETS } from '../../constants.ts';

const AboutSectionEditor: React.FC = () => {
    const { siteContent, updateSiteContent } = useAppContext();
    const [content, setContent] = useState<SiteContent | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const hasUserEdited = React.useRef(false);
    useEffect(() => {
        const aboutContent = siteContent.find(c => c.id === 'home_about_section');
        if (aboutContent && !hasUserEdited.current) {
            setContent(JSON.parse(JSON.stringify(aboutContent))); // Deep copy
        }
    }, [siteContent]);

    if (!content) {
        return <div>Loading about section editor...</div>;
    }

    const originalContent = siteContent.find(c => c.id === 'home_about_section');
    const isChanged = JSON.stringify(originalContent) !== JSON.stringify(content);

    const handleChange = (field: 'title' | 'text', value: string) => {
        hasUserEdited.current = true;
        setContent(prev => prev ? ({ ...prev, data: { ...prev.data, [field]: value } }) : null);
    };

    const handleImageUpload = (publicId: string) => {
        hasUserEdited.current = true;
        setContent(prev => prev ? ({ ...prev, data: { ...prev.data, imagePath: publicId } }) : null);
    };

    const handleImageRemove = () => {
        hasUserEdited.current = true;
        setContent(prev => prev ? ({ ...prev, data: { ...prev.data, imagePath: '' } }) : null);
    };

    const handleSave = async () => {
        if (!content) return;
        setIsSaving(true);
        setError(null);
        setSuccess(false);
        try {
            await updateSiteContent(content);
            hasUserEdited.current = false;
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsSaving(false);
        }
    };

    const labelClass = "block text-sm font-medium text-gray-700";
    const inputClass = "block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Homepage 'About' Section</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={labelClass}>Section Image</label>
                    <div className="mt-2">
                        <ImageUploader
                            bucket={BUCKETS.SITE_ASSETS}
                            pathPrefix={`site/about-section`}
                            images={content.data.imagePath ? [content.data.imagePath] : []}
                            onImageUpload={handleImageUpload}
                            onImageRemove={handleImageRemove}
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="about-title" className={labelClass}>Title</label>
                        <input
                            id="about-title"
                            type="text"
                            value={content.data.title || ''}
                            onChange={(e) => handleChange('title', e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label htmlFor="about-text" className={labelClass}>Text</label>
                        <textarea
                            id="about-text"
                            value={content.data.text || ''}
                            onChange={(e) => handleChange('text', e.target.value)}
                            rows={6}
                            className={inputClass}
                        />
                    </div>
                </div>
            </div>
            <div className="flex justify-end items-center gap-4 mt-4">
                {error && <p className="text-xs text-red-500 mr-auto">{error}</p>}
                {success && <p className="text-xs text-green-600">Saved successfully!</p>}
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving || !isChanged}
                    className="bg-primary text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Saving...' : 'Save About Section'}
                </button>
            </div>
        </div>
    );
};

const CategoryHeroEditor: React.FC<{ category: Category }> = ({ category }) => {
    const { updateCategory } = useAppContext();
    const [formState, setFormState] = useState(category);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleTextChange = (newText: string) => {
        setFormState(prev => ({ ...prev, pageHeroText: newText }));
    };

    const handleMediaUpload = (publicId: string) => {
        const type = /\.(mp4|webm)$/i.test(publicId) ? 'video' : 'image';
        setFormState(prev => ({ ...prev, pageHeroMedia: [...(prev.pageHeroMedia || []), { path: publicId, type }] }));
    };

    const handleMediaRemove = (publicIdToRemove: string) => {
        setFormState(prev => ({ ...prev, pageHeroMedia: (prev.pageHeroMedia || []).filter(item => item.path !== publicIdToRemove) }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        setSuccess(false);
        try {
            await updateCategory(formState);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (err: any) {
            const message = err.message || 'An unexpected error occurred while updating the category.';
            setError(message);
            console.error("Full Supabase category update error:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const isChanged = JSON.stringify(category) !== JSON.stringify(formState);

    const labelClass = "block text-sm font-medium text-gray-700";
    const inputClass = "block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";

    return (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
            <h4 className="font-semibold text-gray-800 mb-4">{category.name}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={labelClass}>Category Page Hero Media (Image/Video)</label>
                    <p className="text-xs text-gray-500 mt-1 mb-2">Upload one or more files. Videos under 5MB are recommended.</p>
                    <div className="mt-2">
                        <ImageUploader
                            bucket={BUCKETS.CATEGORIES}
                            pathPrefix={`${category.id}/hero`}
                            images={(formState.pageHeroMedia || []).map(item => item.path)}
                            onImageUpload={handleMediaUpload}
                            onImageRemove={handleMediaRemove}
                            accept="image/*,video/mp4,video/webm"
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label htmlFor={`category-text-${category.id}`} className={labelClass}>Hero Text</label>
                        <textarea
                            id={`category-text-${category.id}`}
                            value={formState.pageHeroText || ''}
                            onChange={(e) => handleTextChange(e.target.value)}
                            rows={3}
                            className={inputClass}
                            placeholder={`e.g. Explore our ${category.name} Collection`}
                        />
                    </div>
                    <div className="flex items-center">
                        <input id={`show-text-${category.id}`} type="checkbox" checked={formState.showPageHeroText} onChange={e => setFormState(p => ({ ...p, showPageHeroText: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                        <label htmlFor={`show-text-${category.id}`} className="ml-2 text-sm text-gray-700">Show text on hero</label>
                    </div>
                </div>
            </div>
            <div className="flex justify-end items-center gap-4 mt-4">
                {error && <p className="text-xs text-red-500">{error}</p>}
                {success && <p className="text-xs text-green-600">Saved successfully!</p>}
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving || !isChanged}
                    className="bg-primary text-white py-1.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Saving...' : 'Save'}
                </button>
            </div>
        </div>
    );
}


const AppearancePage: React.FC = () => {
    const { slides, categories, updateSlides } = useAppContext();
    const navigate = useNavigate();
    const [formSlides, setFormSlides] = useState<Slide[]>([]);
    const [isSavingSlides, setIsSavingSlides] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hasUserEditedSlides = React.useRef(false);
    useEffect(() => {
        // Deep copy to avoid direct state mutation
        if (slides && !hasUserEditedSlides.current) {
            setFormSlides(JSON.parse(JSON.stringify(slides)));
        }
    }, [slides]);

    const handleTextChange = (id: string, newText: string) => {
        hasUserEditedSlides.current = true;
        setFormSlides(prev => prev.map(slide => slide.id === id ? { ...slide, text: newText } : slide));
    };

    const handleShowTextToggle = (id: string, isChecked: boolean) => {
        hasUserEditedSlides.current = true;
        setFormSlides(prev => prev.map(slide => slide.id === id ? { ...slide, showText: isChecked } : slide));
    };

    const handleMediaUpload = (id: string, publicId: string) => {
        const type = /\.(mp4|webm)$/i.test(publicId) ? 'video' : 'image';
        hasUserEditedSlides.current = true;
        setFormSlides(prev => prev.map(slide =>
            slide.id === id ? { ...slide, media: [...slide.media, { path: publicId, type }] } : slide
        ));
    };

    const handleMediaRemove = (id: string, publicIdToRemove: string) => {
        hasUserEditedSlides.current = true;
        setFormSlides(prev => prev.map(slide =>
            slide.id === id ? { ...slide, media: slide.media.filter(item => item.path !== publicIdToRemove) } : slide
        ));
    };

    // Simple UUID generator fallback
    const generateUUID = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const handleAddSlide = () => {
        const newSlide: Slide = {
            id: generateUUID(),
            media: [],
            text: 'New Slide Caption',
            showText: true,
        };
        hasUserEditedSlides.current = true;
        setFormSlides(prev => [...prev, newSlide]);
    };

    const handleRemoveSlide = (id: string) => {
        if (formSlides.length <= 1) {
            alert('The slider must have at least one slide.');
            return;
        }
        hasUserEditedSlides.current = true;
        setFormSlides(prev => prev.filter(slide => slide.id !== id));
    };

    const handleSaveSlides = async () => {
        setIsSavingSlides(true);
        setError(null);
        try {
            await updateSlides(formSlides);
            hasUserEditedSlides.current = false;
            alert("Homepage slides saved successfully!");
        } catch (err: any) {
            const message = err.message || 'An error occurred while saving slides.';
            setError(message);
            console.error("Full Supabase slides update error:", err);
        } finally {
            setIsSavingSlides(false);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    const labelClass = "block text-sm font-medium text-gray-700";
    const inputClass = "block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Site Appearance</h1>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            <AboutSectionEditor />

            <div className="p-6 bg-white rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Homepage Hero Slider</h3>
                    <button
                        type="button"
                        onClick={handleAddSlide}
                        className="flex items-center gap-1 text-sm font-medium text-primary hover:text-pink-700"
                    >
                        <PlusIcon className="w-4 h-4" /> Add Slide
                    </button>
                </div>
                <div className="space-y-6">
                    {formSlides.map((slide) => (
                        <div key={slide.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                            <div className="flex justify-end mb-2">
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSlide(slide.id)}
                                    className="text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={formSlides.length <= 1}
                                    aria-label="Remove slide"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClass}>Slide Media (Images & Videos)</label>
                                    <p className="text-xs text-gray-500 mt-1 mb-2">Max 5MB. Recommended: short, looping MP4/WebM files.</p>
                                    <div className="mt-2">
                                        <ImageUploader
                                            bucket={BUCKETS.SITE_ASSETS}
                                            pathPrefix={`hero-slider/${slide.id.substring(0, 8)}`}
                                            images={slide.media.map(item => item.path)}
                                            onImageUpload={(publicId) => handleMediaUpload(slide.id, publicId)}
                                            onImageRemove={(publicId) => handleMediaRemove(slide.id, publicId)}
                                            accept="image/*,video/mp4,video/webm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor={`slide-text-${slide.id}`} className={labelClass}>Slide Caption</label>
                                        <textarea
                                            id={`slide-text-${slide.id}`}
                                            value={slide.text}
                                            onChange={(e) => handleTextChange(slide.id, e.target.value)}
                                            rows={3}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id={`show-text-${slide.id}`}
                                            type="checkbox"
                                            checked={slide.showText}
                                            onChange={(e) => handleShowTextToggle(slide.id, e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <label htmlFor={`show-text-${slide.id}`} className="ml-2 text-sm text-gray-700">Show caption on slide</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end mt-6">
                    <button type="button" onClick={handleSaveSlides} disabled={isSavingSlides} className="bg-primary text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-pink-700 disabled:bg-gray-400">
                        {isSavingSlides ? 'Saving Slides...' : 'Save Homepage Slides'}
                    </button>
                </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Category Page Heroes</h3>
                <div className="space-y-6">
                    {categories.map(category => (
                        <CategoryHeroEditor key={category.id} category={category} />
                    ))}
                </div>
            </div>


            {/* Actions */}
            <div className="flex justify-end gap-4">
                <button type="button" onClick={handleCancel} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Done</button>
            </div>
        </div>
    );
};

export default AppearancePage;
