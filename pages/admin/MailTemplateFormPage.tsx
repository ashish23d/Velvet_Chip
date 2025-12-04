
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext.tsx';
import { MailTemplate } from '../../types.ts';
import ImageUploader from '../../components/admin/ImageUploader.tsx';
import { BUCKETS } from '../../constants.ts';
import { supabase } from '../../services/supabaseClient.ts';
import TrashIcon from '../../components/icons/TrashIcon.tsx';

const placeholderMap: Record<MailTemplate['templateType'], { [key: string]: string }> = {
  order_status: {
    '{{customer_name}}': 'The full name of the customer.',
    '{{order_id}}': 'The unique ID of the order.',
    '{{order_date}}': 'The date the order was placed.',
    '{{total_amount}}': 'The total amount of the order (e.g., ₹1,299.00).',
    '{{shipping_address}}': 'The full shipping address as a block of text.',
    '{{tracking_link}}': 'A link to track the order shipment.',
    '{{payment_method}}': 'The payment method used (e.g., COD, Online).',
    '{{item_list_table}}': 'An HTML table body (tbody) with rows (tr) for each item.',
    '{{subtotal}}': 'The subtotal of all items before discounts and shipping.',
    '{{shipping_fee}}': 'The shipping fee for the order.',
    '{{discount_amount}}': 'The discount amount applied to the order.',
  },
  return_process: {
    '{{customer_name}}': 'The full name of the customer.',
    '{{request_id}}': 'The ID for the return/complaint request.',
    '{{request_date}}': 'The date the request was made.',
    '{{request_status}}': 'The current status of the request (e.g., Approved, Rejected).',
    '{{order_id}}': 'The original order ID related to the request.',
  },
  promotional: {
    '{{customer_name}}': 'The name of the subscriber/customer.',
    '{{promo_code}}': 'A special promotion code.',
    '{{discount_value}}': 'The value of the discount (e.g., 20% or ₹500).',
    '{{expiry_date}}': 'The expiry date of the promotion.',
  },
  password_reset: {
    '{{ .ConfirmationURL }}': 'The unique URL for the user to reset their password. (Handled by Supabase)',
    '{{ .Token }}': 'The JWT token for the password reset. (Handled by Supabase)',
    '{{ .SiteURL }}': 'The URL of your website. (Handled by Supabase)',
    '{{ .Email }}': 'The user\'s email address. (Handled by Supabase)',
  },
  custom: {
    '{{customer_name}}': 'The name of the user.',
    '{{user_email}}': 'The email address of the user.',
  },
};

const MailTemplateFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getMailTemplateById, addMailTemplate, updateMailTemplate, deleteMailTemplate, showConfirmationModal } = useAppContext();

    const isEditing = Boolean(id);
    const templateToEdit = isEditing ? getMailTemplateById(Number(id)) : undefined;

    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [templateType, setTemplateType] = useState<MailTemplate['templateType']>('custom');
    const [htmlContent, setHtmlContent] = useState('');
    const [isActive, setIsActive] = useState(true);
    
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState('');

    useEffect(() => {
        if (isEditing && templateToEdit) {
            setName(templateToEdit.name);
            setSubject(templateToEdit.subject);
            setTemplateType(templateToEdit.templateType);
            setHtmlContent(templateToEdit.htmlContent);
            setIsActive(templateToEdit.isActive);
        }
    }, [isEditing, templateToEdit]);

    const handleImageUpload = (path: string) => {
        const { data } = supabase.storage.from(BUCKETS.SITE_ASSETS).getPublicUrl(path);
        setUploadedImageUrl(data.publicUrl);
    };

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(uploadedImageUrl);
        alert('URL copied to clipboard!');
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        const templateData = {
            name,
            subject,
            templateType,
            htmlContent,
            isActive,
            placeholders: placeholderMap[templateType],
        };

        try {
            if (isEditing && templateToEdit) {
                await updateMailTemplate({ ...templateToEdit, ...templateData });
            } else {
                await addMailTemplate(templateData);
            }
            navigate('/admin/mails');
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!templateToEdit) return;

        showConfirmationModal({
            title: 'Delete Template',
            message: `Are you sure you want to permanently delete the "${templateToEdit.name}" template? This action cannot be undone.`,
            onConfirm: async () => {
                setIsSaving(true);
                setError(null);
                try {
                    await deleteMailTemplate(templateToEdit.id);
                    navigate('/admin/mails');
                } catch (err: any) {
                    setError(err.message || 'Failed to delete the template.');
                    setIsSaving(false); // Re-enable buttons on failure
                    throw err; // re-throw to keep modal open
                }
            },
            confirmText: 'Delete Permanently',
            isDestructive: true,
        });
    };
    
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";
    const inputClass = "block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {isEditing ? 'Edit Mail Template' : 'Create New Mail Template'}
            </h1>
            {error && <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 rounded-md">{error}</div>}

            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className={labelClass}>Template Name</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className={inputClass} placeholder="e.g., Order Confirmation" />
                    </div>
                    <div>
                        <label htmlFor="templateType" className={labelClass}>Template Type</label>
                        <select id="templateType" value={templateType} onChange={e => setTemplateType(e.target.value as MailTemplate['templateType'])} required className={inputClass}>
                            <option value="order_status">Order Status</option>
                            <option value="return_process">Return Process</option>
                            <option value="promotional">Promotional</option>
                            <option value="password_reset">Password Reset</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="subject" className={labelClass}>Email Subject</label>
                    <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} required className={inputClass} placeholder="e.g., Your Awaany Order #{order_id} is Confirmed!" />
                </div>
                <div className="flex items-center pt-2">
                    <input
                        id="isActive"
                        name="isActive"
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-gray-900 dark:text-gray-300">
                        Activate this template
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Pane: Editor */}
                <div className="space-y-4">
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">HTML Content</h3>
                        <textarea
                            value={htmlContent}
                            onChange={e => setHtmlContent(e.target.value)}
                            className="w-full h-96 font-mono text-xs border border-gray-300 dark:border-gray-600 rounded-md p-2 flex-grow bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            placeholder="<p>Hello {{customer_name}},</p>"
                        />
                    </div>
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Assets & Placeholders</h3>
                        <div className="space-y-4">
                             <div>
                                <h4 className="font-semibold text-sm mb-2 text-gray-800 dark:text-gray-300">Upload Image</h4>
                                <ImageUploader bucket={BUCKETS.SITE_ASSETS} pathPrefix="mail_assets" images={[]} onImageUpload={handleImageUpload} onImageRemove={() => setUploadedImageUrl('')} />
                                {uploadedImageUrl && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <input type="text" readOnly value={uploadedImageUrl} className="flex-grow text-xs bg-gray-100 dark:bg-gray-700 p-1 border rounded text-gray-800 dark:text-white" />
                                        <button type="button" onClick={handleCopyUrl} className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded dark:text-white">Copy</button>
                                    </div>
                                )}
                            </div>
                            <div className="border-t dark:border-gray-700 pt-4">
                                <h4 className="font-semibold text-sm mb-2 text-gray-800 dark:text-gray-300">Available Placeholders</h4>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 max-h-40 overflow-y-auto">
                                    {Object.entries(placeholderMap[templateType]).map(([key, desc]) => (
                                        <div key={key} className="text-xs group">
                                            <code className="font-mono text-primary group-hover:underline cursor-pointer" onClick={() => navigator.clipboard.writeText(key)} title={`Click to copy: ${desc}`}>{key}</code>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Pane: Preview */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Live Preview</h3>
                    <iframe
                        srcDoc={`<!DOCTYPE html><html><head><style>body { margin: 0; font-family: sans-serif; }</style></head><body>${htmlContent}</body></html>`}
                        title="Email Preview"
                        className="w-full h-[600px] border border-gray-300 rounded-md bg-white"
                        sandbox="allow-same-origin"
                    />
                </div>
            </div>
            
            <div className="flex justify-between items-center gap-4">
                <div>
                    {isEditing && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isSaving}
                            className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed px-4 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                           <TrashIcon className="w-4 h-4" />
                           Delete Template
                        </button>
                    )}
                </div>
                <div className="flex justify-end gap-4">
                    <button type="button" onClick={() => navigate('/admin/mails')} className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200">Cancel</button>
                    <button type="submit" disabled={isSaving} className="bg-primary text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-pink-700 disabled:bg-gray-400">
                        {isSaving ? 'Saving...' : 'Save Template'}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default MailTemplateFormPage;
