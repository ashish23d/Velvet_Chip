
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext.tsx';
import { SiteSettings, ContactDetails } from '../../types.ts';
import ImageUploader from '../../components/admin/ImageUploader.tsx';
import { BUCKETS } from '../../constants.ts';
import SupabaseMedia from '../../components/SupabaseMedia.tsx';
import TrashIcon from '../../components/icons/TrashIcon.tsx';
import { CommandLineIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

const ContactSettings: React.FC = () => {
    const { contactDetails, updateContactDetails } = useAppContext();
    const [formState, setFormState] = useState<ContactDetails>({ email: '', phone: '', address: ''});
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if(contactDetails) {
            setFormState(contactDetails);
        }
    }, [contactDetails]);

    const isChanged = JSON.stringify(contactDetails) !== JSON.stringify(formState);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormState(prev => ({...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSuccess(false);
        await updateContactDetails(formState);
        setSuccess(true);
        setIsSaving(false);
        setTimeout(() => setSuccess(false), 3000);
    };

    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";
    const inputClass = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500";

    return (
        <div id="contact-settings" className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Contact Information</h3>
            <div className="space-y-4">
                <div>
                    <label htmlFor="contact-email" className={labelClass}>Email</label>
                    <input type="email" id="contact-email" name="email" value={formState.email} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                    <label htmlFor="contact-phone" className={labelClass}>Phone</label>
                    <input type="text" id="contact-phone" name="phone" value={formState.phone} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                    <label htmlFor="contact-address" className={labelClass}>Address</label>
                    <textarea id="contact-address" name="address" rows={3} value={formState.address} onChange={handleChange} className={inputClass} />
                </div>
            </div>
             <div className="flex justify-end items-center gap-4 mt-4">
                {success && <p className="text-xs text-green-600">Saved successfully!</p>}
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving || !isChanged}
                    className="bg-primary text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                 >
                    {isSaving ? 'Saving...' : 'Save Contact Info'}
                 </button>
            </div>
        </div>
    );
};

const DeploymentHelper: React.FC = () => {
    const functions = [
        { name: 'Courier Webhook', command: 'npx supabase functions deploy courier-webhook', desc: 'Enables real-time tracking updates from shipping partners.' },
        { name: 'Order Emails', command: 'npx supabase functions deploy send-order-confirmation', desc: 'Sends confirmation emails when a user places an order.' },
        { name: 'Invoice Gen', command: 'npx supabase functions deploy generate-invoice', desc: 'Generates PDF invoices for orders.' },
        { name: 'Order Updates', command: 'npx supabase functions deploy send-order-update', desc: 'Sends email updates when you change order status.' },
    ];

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Command copied to clipboard!');
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 mt-8">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <CommandLineIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Developer & Deployment</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Commands to deploy backend functions.</p>
                </div>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
                <div className="flex">
                    <div className="ml-3">
                        <p className="text-sm text-amber-700">
                            <strong>Important:</strong> You must run these commands from your <u>project root directory</u> in your terminal.
                            <br />
                            If you see <code>The system cannot find the path specified</code>, use <code>cd</code> to navigate to your project folder first.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {functions.map((fn) => (
                    <div key={fn.name} className="border dark:border-gray-700 rounded-md p-4">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{fn.name}</h4>
                            <button onClick={() => copyToClipboard(fn.command)} className="text-gray-400 hover:text-primary" title="Copy command">
                                <ClipboardDocumentIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{fn.desc}</p>
                        <code className="block bg-gray-900 text-gray-100 text-xs p-3 rounded font-mono overflow-x-auto">
                            {fn.command}
                        </code>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SettingsPage: React.FC = () => {
    const { siteSettings, updateSiteSettings, adminDeleteSiteAsset } = useAppContext();
    const [settings, setSettings] = useState<SiteSettings>({
        primaryColor: '#C22255',
        activeLogoPath: null,
        previousLogoPaths: [],
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // State for undo functionality
    const [previousSettingsForUndo, setPreviousSettingsForUndo] = useState<SiteSettings | null>(null);
    const [undoneLogoPath, setUndoneLogoPath] = useState<string | null>(null);
    const [showUndo, setShowUndo] = useState(false);
    const undoTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (siteSettings) {
            setSettings(siteSettings);
        }
    }, [siteSettings]);
    
    useEffect(() => {
        // Clear timeout on component unmount
        return () => {
            if (undoTimeoutRef.current) {
                clearTimeout(undoTimeoutRef.current);
            }
        };
    }, []);


    const isChanged = JSON.stringify(siteSettings) !== JSON.stringify(settings);

    const handleColorChange = (color: string) => {
        setSettings(prev => ({ ...prev, primaryColor: color }));
    };

    const handleNewLogoUpload = (newPath: string) => {
        if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
        
        const oldSettings = { ...settings };
        setPreviousSettingsForUndo(oldSettings);
        setUndoneLogoPath(newPath);
        setShowUndo(true);

        const updatedSettings: SiteSettings = {
            ...settings,
            activeLogoPath: newPath,
            previousLogoPaths: [
                ...(settings.activeLogoPath ? [settings.activeLogoPath] : []),
                ...(settings.previousLogoPaths || [])
            ].filter((p, i, a) => a.indexOf(p) === i).slice(0, 5)
        };
        
        // Auto-save the new logo setting
        updateSiteSettings(updatedSettings).catch(err => {
            setError(err.message || "Failed to auto-save new logo.");
            // Revert UI on failure
            setSettings(oldSettings);
        });

        undoTimeoutRef.current = window.setTimeout(() => {
            setShowUndo(false);
            setPreviousSettingsForUndo(null);
            setUndoneLogoPath(null);
        }, 10000); // 10 seconds to undo
    };
    
    const handleUndo = async () => {
        if (!previousSettingsForUndo || !undoneLogoPath) return;
        if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
        
        try {
            // Auto-save the reverted state
            await updateSiteSettings(previousSettingsForUndo);
            // Delete the file that was just uploaded
            await adminDeleteSiteAsset(undoneLogoPath);
        } catch (err: any) {
            setError(err.message || 'Failed to undo the logo change. Please refresh.');
        } finally {
            setShowUndo(false);
            setPreviousSettingsForUndo(null);
            setUndoneLogoPath(null);
        }
    };

    const handleSetActiveLogo = (path: string) => {
        setSettings(prev => {
            if (!prev.activeLogoPath || prev.activeLogoPath === path) return prev;
            
            const newPrevious = (prev.previousLogoPaths || []).filter(p => p !== path);
            newPrevious.unshift(prev.activeLogoPath);
            
            const uniquePrevious = [...new Set(newPrevious)].slice(0, 5);
            return { ...prev, activeLogoPath: path, previousLogoPaths: uniquePrevious };
        });
    };
    
    const handleDeletePreviousLogo = (path: string) => {
        setSettings(prev => ({
            ...prev,
            previousLogoPaths: (prev.previousLogoPaths || []).filter(p => p !== path)
        }));
    };


    const handleFinalSave = async () => {
        if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
        setShowUndo(false);
        setPreviousSettingsForUndo(null);
        setUndoneLogoPath(null);

        setIsSaving(true);
        setError(null);
        setSuccess(false);
        try {
            await updateSiteSettings(settings);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save settings.');
        } finally {
            setIsSaving(false);
        }
    };

    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";
    const inputClass = "block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500";

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Website Settings</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {/* Color Settings */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Color Scheme</h3>
                <div>
                    <label htmlFor="primaryColor" className={labelClass}>Primary Color</label>
                    <div className="mt-1 flex items-center gap-4">
                        <input
                            type="color"
                            id="primaryColorPicker"
                            value={settings.primaryColor}
                            onChange={(e) => handleColorChange(e.target.value)}
                            className="p-1 h-10 w-14 block bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer"
                        />
                        <input
                            type="text"
                            id="primaryColor"
                            value={settings.primaryColor}
                            onChange={(e) => handleColorChange(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">This color will be used for buttons, links, and other brand accents.</p>
                </div>
            </div>

            {/* Branding Settings */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow space-y-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Branding</h3>
                <div>
                    <label className={labelClass}>Upload New Logo</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">Upload an animated GIF, MP4/WebM video, or static image. Recommended size: 450x120 pixels.</p>
                    <ImageUploader
                        bucket={BUCKETS.SITE_ASSETS}
                        pathPrefix="logo"
                        images={[]} // Uploader is only for adding new images
                        onImageUpload={handleNewLogoUpload}
                        onImageRemove={() => {}} // Not used here, management is separate
                        accept="image/png, image/jpeg, image/webp, image/gif, video/mp4, video/webm"
                    />
                     {showUndo && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between transition-opacity duration-300">
                            <p className="text-sm text-blue-700">Logo updated.</p>
                            <button onClick={handleUndo} className="text-sm font-semibold text-blue-800 hover:underline">
                                Undo
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="border-t dark:border-gray-700 pt-4">
                     <label className={labelClass}>Manage Logos</label>
                     {/* Current Logo */}
                     <div className="mt-2">
                         <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Logo</h4>
                         {settings.activeLogoPath ? (
                              <div className="mt-2 inline-block p-2 border-2 border-primary rounded-lg bg-primary/10">
                                 <SupabaseMedia bucket={BUCKETS.SITE_ASSETS} imagePath={settings.activeLogoPath} alt="Current Logo" className="h-14 bg-white rounded" />
                              </div>
                         ) : (
                             <p className="text-sm text-gray-500 mt-2">No active logo set. The default will be used.</p>
                         )}
                     </div>
                     {/* Previous Logos */}
                     <div className="mt-4">
                         <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Previous Logos</h4>
                         {(settings.previousLogoPaths || []).length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-4">
                                {(settings.previousLogoPaths || []).map((path, index) => (
                                    <div key={index} className="relative group p-2 border border-gray-300 dark:border-gray-600 rounded-lg">
                                        <SupabaseMedia bucket={BUCKETS.SITE_ASSETS} imagePath={path} alt={`Previous Logo ${index + 1}`} className="h-14 bg-white rounded" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity rounded-lg">
                                            <button onClick={() => handleSetActiveLogo(path)} className="text-xs bg-white text-primary font-semibold py-1 px-2 rounded">Set Active</button>
                                            <button onClick={() => handleDeletePreviousLogo(path)} className="p-1.5 bg-white text-red-500 rounded-full" aria-label="Delete logo from history">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         ) : (
                              <p className="text-sm text-gray-500 mt-2">No previous logos saved.</p>
                         )}
                     </div>
                </div>
            </div>
            
            <ContactSettings />
            
            <DeploymentHelper />

            {/* Save Button */}
            <div className="flex justify-end items-center gap-4 sticky bottom-8">
                 {success && <p className="text-sm text-green-600">Settings saved successfully!</p>}
                <button
                    onClick={handleFinalSave}
                    disabled={!isChanged || isSaving}
                    className="bg-primary text-white py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Saving...' : 'Save General Settings'}
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;
