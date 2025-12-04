
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext.tsx';
import { Promotion } from '../../types.ts';
import { generateProductDescription } from '../../services/geminiService.ts'; // Re-using for text generation
import { SparklesIcon } from '@heroicons/react/24/outline';

const PromotionFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getPromotionById, addPromotion, updatePromotion } = useAppContext();

    const isEditing = Boolean(id);
    const promotionToEdit = isEditing ? getPromotionById(Number(id)) : undefined;
    
    const [formData, setFormData] = useState<Omit<Promotion, 'id' | 'uses' | 'createdAt'>>({
        code: '',
        type: 'percentage',
        value: 10,
        minPurchase: 0,
        usageLimit: 100,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        isActive: true,
    });
    
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    useEffect(() => {
        if (isEditing && promotionToEdit) {
            setFormData({
                ...promotionToEdit,
                expiresAt: new Date(promotionToEdit.expiresAt).toISOString().split('T')[0],
            });
        }
    }, [isEditing, promotionToEdit]);

    const handleGenerateSuggestions = async () => {
        setIsSuggesting(true);
        setSuggestions([]);
        try {
            // Using a generic text generation prompt with the Gemini service
            const response = await generateProductDescription({ name: "Promotion Codes", category: "Marketing", specifications: { "occasion": "general sale" }, } as any);
            const codes = response.split('\n').map(c => c.replace(/[^A-Z0-9]/g, '').substring(0, 12)).filter(Boolean).slice(0, 5);
            setSuggestions(codes);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSuggesting(false);
        }
    };
    
    const handleUseSuggestion = (code: string) => {
        setFormData(prev => ({ ...prev, code }));
        setSuggestions([]);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
             const { checked } = e.target as HTMLInputElement;
             setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            const numericFields = ['value', 'minPurchase', 'usageLimit'];
            setFormData(prev => ({ 
                ...prev, 
                [name]: numericFields.includes(name) ? Number(value) : value 
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        try {
            if (isEditing && promotionToEdit) {
                await updatePromotion({ ...promotionToEdit, ...formData });
            } else {
                await addPromotion(formData);
            }
            navigate('/admin/marketing');
        } catch (err: any) {
            console.error("Error saving promotion:", err);
            const message = err.message || 'An unexpected error occurred. Please check the console for details.';
            setError(message);
        } finally {
            setIsSaving(false);
        }
    };

    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";
    const inputClass = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500";

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                {isEditing ? 'Edit Promotion' : 'Create New Promotion'}
            </h1>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                {error && <div className="text-red-600 bg-red-50 dark:bg-red-900/30 p-3 rounded-md">{error}</div>}
                
                {/* Code */}
                <div>
                    <label htmlFor="code" className={labelClass}>Promotion Code</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <input type="text" name="code" id="code" value={formData.code} onChange={handleChange} required className={`flex-1 block w-full min-w-0 rounded-none rounded-l-md ${inputClass} !mt-0`} />
                        <button type="button" onClick={handleGenerateSuggestions} disabled={isSuggesting} className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-sm hover:bg-gray-100 dark:hover:bg-gray-600">
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            {isSuggesting ? 'Thinking...' : 'Suggest'}
                        </button>
                    </div>
                    {suggestions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {suggestions.map(s => (
                                <button type="button" key={s} onClick={() => handleUseSuggestion(s)} className="text-xs bg-primary/10 text-primary font-mono py-1 px-2 rounded-full hover:bg-primary/20">{s}</button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Type and Value */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>Discount Type</label>
                        <select name="type" value={formData.type} onChange={handleChange} className={inputClass}>
                            <option value="percentage">Percentage</option>
                            <option value="flat">Flat Amount</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="value" className={labelClass}>Value ({formData.type === 'percentage' ? '%' : '₹'})</label>
                        <input type="number" name="value" id="value" value={formData.value} onChange={handleChange} required className={inputClass} />
                    </div>
                </div>

                {/* Restrictions */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="minPurchase" className={labelClass}>Minimum Purchase (₹)</label>
                        <input type="number" name="minPurchase" id="minPurchase" value={formData.minPurchase} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="usageLimit" className={labelClass}>Total Usage Limit</label>
                        <input type="number" name="usageLimit" id="usageLimit" value={formData.usageLimit} onChange={handleChange} className={inputClass} />
                    </div>
                </div>

                {/* Expiry and Status */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <div>
                        <label htmlFor="expiresAt" className={labelClass}>Expires At</label>
                        <input type="date" name="expiresAt" id="expiresAt" value={formData.expiresAt} onChange={handleChange} required className={inputClass} />
                    </div>
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input id="isActive" name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded" />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="isActive" className="font-medium text-gray-700 dark:text-gray-300">Promotion is active</label>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-4 border-t dark:border-gray-700">
                    <button type="button" onClick={() => navigate('/admin/marketing')} className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
                    <button type="submit" disabled={isSaving} className="bg-primary text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-pink-700 disabled:bg-gray-400">
                        {isSaving ? 'Saving...' : 'Save Promotion'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PromotionFormPage;
