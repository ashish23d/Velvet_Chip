
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext.tsx';
import { SiteSettings, ContactDetails } from '../../types.ts';
import ImageUploader from '../../components/admin/ImageUploader.tsx';
import { BUCKETS } from '../../constants.ts';
import SupabaseMedia from '../../components/SupabaseMedia.tsx';
import TrashIcon from '../../components/icons/TrashIcon.tsx';
import TruckIcon from '../../components/icons/TruckIcon.tsx';
import { CommandLineIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import AdminGuide from '../../components/admin/AdminGuide.tsx';
import { GooglePlayBadge, AppStoreBadge } from '../../components/icons/StoreBadges.tsx';


const MobileAppSettings: React.FC = () => {
    const { siteSettings, updateSiteSettings } = useAppContext();
    const [settings, setSettings] = useState<SiteSettings>({
        primaryColor: '', activeLogoPath: null, previousLogoPaths: []
    });
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (siteSettings) setSettings(siteSettings);
    }, [siteSettings]);

    const handleChange = (key: keyof SiteSettings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSuccess(false);
        try {
            await updateSiteSettings(settings);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to save mobile settings:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";
    const inputClass = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500";
    const toggleClass = "relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary";

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow mb-8 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Mobile App Download Section</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Configure the "Download Our App" section in the footer.</p>
                </div>
                <div className="flex items-center">
                    <button
                        type="button"
                        className={`${settings.showAppSection ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'} ${toggleClass}`}
                        onClick={() => handleChange('showAppSection', !settings.showAppSection)}
                    >
                        <span className={`${settings.showAppSection ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`} />
                    </button>
                    <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {settings.showAppSection ? 'Enabled' : 'Disabled'}
                    </span>
                </div>
            </div>

            {settings.showAppSection && (
                <div className="space-y-6 border-t dark:border-gray-700 pt-6">
                    <div>
                        <label className={labelClass}>App Name</label>
                        <input
                            type="text"
                            value={settings.appName || ''}
                            onChange={(e) => handleChange('appName', e.target.value)}
                            className={inputClass}
                            placeholder="e.g. Velvet Chip App"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Android Settings */}
                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <GooglePlayBadge className="w-24 h-auto" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Android</span>
                                </div>
                                <button
                                    type="button"
                                    className={`${settings.showAndroidBadge ? 'bg-green-500' : 'bg-gray-300'} relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
                                    onClick={() => handleChange('showAndroidBadge', !settings.showAndroidBadge)}
                                >
                                    <span className={`${settings.showAndroidBadge ? 'translate-x-4' : 'translate-x-0'} pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`} />
                                </button>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Play Store URL</label>
                                <input
                                    type="url"
                                    value={settings.androidAppLink || ''}
                                    onChange={(e) => handleChange('androidAppLink', e.target.value)}
                                    className={inputClass}
                                    placeholder="https://play.google.com/store/apps/details?id=..."
                                />
                            </div>
                            {/* Upload Play Store Badge Image */}
                            <ImageUploader
                                bucket={BUCKETS.SITE_ASSETS}
                                pathPrefix="badge"
                                images={settings.androidBadgeImg ? [settings.androidBadgeImg] : []}
                                onImageUpload={(path) => handleChange('androidBadgeImg', path)}
                                onImageRemove={() => handleChange('androidBadgeImg', '')}
                                accept="image/*"
                            />
                        </div>

                        {/* iOS Settings */}
                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <AppStoreBadge className="w-24 h-auto" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">iOS</span>
                                </div>
                                <button
                                    type="button"
                                    className={`${settings.showIosBadge ? 'bg-green-500' : 'bg-gray-300'} relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
                                    onClick={() => handleChange('showIosBadge', !settings.showIosBadge)}
                                >
                                    <span className={`${settings.showIosBadge ? 'translate-x-4' : 'translate-x-0'} pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`} />
                                </button>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs text-gray-500 uppercase font-semibold tracking-wider">App Store URL</label>
                                <input
                                    type="url"
                                    value={settings.iosAppLink || ''}
                                    onChange={(e) => handleChange('iosAppLink', e.target.value)}
                                    className={inputClass}
                                    placeholder="https://apps.apple.com/app/..."
                                />
                                {/* Upload iOS Badge Image */}
                                <ImageUploader
                                    bucket={BUCKETS.SITE_ASSETS}
                                    pathPrefix="badge"
                                    images={settings.iosBadgeImg ? [settings.iosBadgeImg] : []}
                                    onImageUpload={(path) => handleChange('iosBadgeImg', path)}
                                    onImageRemove={() => handleChange('iosBadgeImg', '')}
                                    accept="image/*"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end items-center gap-4 pt-4">
                        {success && <p className="text-xs text-green-600 font-medium">Saved!</p>}
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-primary text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium hover:bg-pink-700 disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save App Settings'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const ContactSettings: React.FC = () => {
    const { contactDetails, updateContactDetails } = useAppContext();
    const [formState, setFormState] = useState<ContactDetails>({ email: '', phone: '', address: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (contactDetails) {
            setFormState(contactDetails);
        }
    }, [contactDetails]);

    const isChanged = JSON.stringify(contactDetails) !== JSON.stringify(formState);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSuccess(false);
        try {
            await updateContactDetails(formState);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to save contact details:", error);
        } finally {
            setIsSaving(false);
        }
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

const EmailSettingsConfig: React.FC = () => {
    const { emailSettings, updateEmailSettings, isLoadingAdminData } = useAppContext();
    const [formState, setFormState] = useState<{ sender_email: string; sender_name: string }>({ sender_email: '', sender_name: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (emailSettings) {
            setFormState({ sender_email: emailSettings.sender_email, sender_name: emailSettings.sender_name });
        }
    }, [emailSettings]);

    const isChanged = emailSettings
        ? (emailSettings.sender_email !== formState.sender_email || emailSettings.sender_name !== formState.sender_name)
        : (formState.sender_email !== '' || formState.sender_name !== '');

    const handleSave = async () => {
        setIsSaving(true);
        setSuccess(false);
        try {
            const baseSettings = emailSettings || { id: 1, sender_email: '', sender_name: '', last_updated_at: new Date().toISOString() };

            await updateEmailSettings({
                ...baseSettings,
                sender_email: formState.sender_email,
                sender_name: formState.sender_name,
                last_updated_at: new Date().toISOString()
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to save email settings:", error);
            alert("Failed to save email settings");
        } finally {
            setIsSaving(false);
        }
    };

    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";
    const inputClass = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500";

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow mb-8 border border-l-4 border-l-blue-500 border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-2">Email Configuration</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Configure the sender identity for system emails.
                <br />
                <span className="text-amber-600 font-semibold">Important:</span> Ensure that <code>{formState.sender_email || 'this email'}</code> is verified in your SendGrid Account ("Sender Authentication").
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={labelClass}>Sender Email (From)</label>
                    <input
                        type="email"
                        value={formState.sender_email}
                        onChange={e => setFormState(prev => ({ ...prev, sender_email: e.target.value }))}
                        className={inputClass}
                        placeholder="support@example.com"
                    />
                </div>
                <div>
                    <label className={labelClass}>Sender Name</label>
                    <input
                        type="text"
                        value={formState.sender_name}
                        onChange={e => setFormState(prev => ({ ...prev, sender_name: e.target.value }))}
                        className={inputClass}
                        placeholder="Velvet Chip Support"
                    />
                </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t dark:border-gray-700">
                <div className="text-xs text-gray-500">
                    {emailSettings && (
                        <span>Last Updated: {new Date(emailSettings.last_updated_at).toLocaleString()}</span>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    {success && <p className="text-xs text-green-600 font-medium">Saved!</p>}
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving || !isChanged}
                        className="bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Saving...' : 'Update Email Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const DeliverySettingsLink: React.FC = () => {
    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow mb-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-2">Delivery & Shipping</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Manage your delivery zones, shipping partners, and pincode rules.
            </p>
            <div className="flex gap-4">
                <a href="#/admin/delivery" className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors">
                    <TruckIcon className="w-5 h-5" />
                    Manage Delivery Rules
                </a>
                <a href="#/admin/shipping" className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <TruckIcon className="w-5 h-5" />
                    Shipping Integration
                </a>
            </div>
        </div>
    );
};



const TaxSettingsConfig: React.FC = () => {
    const { taxSettings, updateTaxSettings } = useAppContext();
    const [settings, setSettings] = useState<Partial<SiteSettings & { enabled: boolean; mode: 'global' | 'category'; global_rate: number; label: string }>>({
        enabled: false, mode: 'global', global_rate: 0, label: 'GST'
    });
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (taxSettings) {
            setSettings({
                enabled: taxSettings.enabled,
                mode: taxSettings.mode,
                global_rate: taxSettings.global_rate,
                label: taxSettings.label
            });
        }
    }, [taxSettings]);

    const handleChange = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSuccess(false);
        try {
            // @ts-ignore
            await updateTaxSettings(settings);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to save tax settings:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow mb-8 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Tax Configuration</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage taxes (GST/VAT) for your store.</p>
                </div>
                <div className="flex items-center">
                    <button
                        type="button"
                        className={`${settings.enabled ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none`}
                        onClick={() => handleChange('enabled', !settings.enabled)}
                    >
                        <span className={`${settings.enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`} />
                    </button>
                    <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {settings.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                </div>
            </div>

            {settings.enabled && (
                <div className="space-y-6 border-t dark:border-gray-700 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tax Label</label>
                            <input
                                type="text"
                                value={settings.label || ''}
                                onChange={(e) => handleChange('label', e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 dark:text-white"
                                placeholder="e.g. GST"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Calculation Mode</label>
                            <select
                                value={settings.mode || 'global'}
                                onChange={(e) => handleChange('mode', e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 dark:text-white"
                            >
                                <option value="global">Global (Flat Rate)</option>
                                <option value="category">Category Wise</option>
                            </select>
                        </div>
                    </div>

                    {settings.mode === 'global' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Global Tax Rate (%)</label>
                            <input
                                type="number"
                                value={settings.global_rate || 0}
                                onChange={(e) => handleChange('global_rate', Number(e.target.value))}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 dark:text-white"
                                min="0" step="0.01"
                            />
                        </div>
                    )}

                    {settings.mode === 'category' && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        You have selected <strong>Category Wise</strong> mode. Please go to the <strong>Categories</strong> page to set tax rates for each category individually.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end items-center gap-4 pt-4">
                        {success && <p className="text-xs text-green-600 font-medium">Saved!</p>}
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-primary text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium hover:bg-pink-700 disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Tax Settings'}
                        </button>
                    </div>
                </div>
            )}
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

    const hasUserEdited = useRef(false);
    useEffect(() => {
        if (siteSettings && !hasUserEdited.current) {
            setSettings(siteSettings);
        }
    }, [siteSettings]);

    // Update the ref when user makes changes
    useEffect(() => {
        if (JSON.stringify(siteSettings) !== JSON.stringify(settings)) {
            hasUserEdited.current = true;
        }
    }, [settings, siteSettings]);

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
            hasUserEdited.current = false;
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Used for buttons, links, and brand accents.</p>
                    </div>

                    <div>
                        <label htmlFor="hoverColor" className={labelClass}>Link Hover Color</label>
                        <div className="mt-1 flex items-center gap-4">
                            <input
                                type="color"
                                id="hoverColorPicker"
                                value={settings.hoverColor || '#db2760'}
                                onChange={(e) => setSettings(prev => ({ ...prev, hoverColor: e.target.value }))}
                                className="p-1 h-10 w-14 block bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer"
                            />
                            <input
                                type="text"
                                id="hoverColor"
                                value={settings.hoverColor || '#db2760'}
                                onChange={(e) => setSettings(prev => ({ ...prev, hoverColor: e.target.value }))}
                                className={inputClass}
                            />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Color when hovering over links and buttons.</p>
                    </div>
                </div>
            </div>

            {/* Branding Settings */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow space-y-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Branding</h3>

                {/* Logo Type Selector */}
                <div>
                    <label className={labelClass}>Logo Type</label>
                    <div className="mt-2 flex items-center gap-4">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="form-radio text-primary"
                                name="logoType"
                                value="image"
                                checked={settings.logoType !== 'text'}
                                onChange={() => setSettings(prev => ({ ...prev, logoType: 'image' }))}
                            />
                            <span className="ml-2 text-gray-700 dark:text-gray-300">Image Logo</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="form-radio text-primary"
                                name="logoType"
                                value="text"
                                checked={settings.logoType === 'text'}
                                onChange={() => setSettings(prev => ({ ...prev, logoType: 'text' }))}
                            />
                            <span className="ml-2 text-gray-700 dark:text-gray-300">Text Logo</span>
                        </label>
                    </div>
                </div>

                {settings.logoType === 'text' ? (
                    <div className="space-y-4 border-t dark:border-gray-700 pt-4">
                        <div>
                            <label htmlFor="textLogo" className={labelClass}>Logo Text</label>
                            <input
                                type="text"
                                id="textLogo"
                                value={settings.textLogo || 'Awaany'}
                                onChange={(e) => setSettings(prev => ({ ...prev, textLogo: e.target.value }))}
                                className={inputClass}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="fontFamily" className={labelClass}>Font Family</label>
                                <select
                                    id="fontFamily"
                                    value={settings.fontFamily || 'sans-serif'}
                                    onChange={(e) => setSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
                                    className={inputClass}
                                >
                                    <option value="sans-serif">Sans Serif</option>
                                    <option value="serif">Serif</option>
                                    <option value="monospace">Monospace</option>
                                    <option value="'Inter', sans-serif">Inter</option>
                                    <option value="'Roboto', sans-serif">Roboto</option>
                                    <option value="'Playfair Display', serif">Playfair Display</option>
                                    <option value="'Montserrat', sans-serif">Montserrat</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="fontSize" className={labelClass}>Font Size ({settings.fontSize || '24px'})</label>
                                <input
                                    type="range"
                                    id="fontSize"
                                    min="12"
                                    max="72"
                                    value={parseInt(settings.fontSize || '24')}
                                    onChange={(e) => setSettings(prev => ({ ...prev, fontSize: `${e.target.value}px` }))}
                                    className="w-full mt-2"
                                />
                            </div>
                        </div>
                        <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center h-32">
                            <span style={{
                                fontFamily: settings.fontFamily || 'sans-serif',
                                fontSize: settings.fontSize || '24px',
                                fontWeight: 'bold',
                                color: settings.primaryColor
                            }}>
                                {settings.textLogo || 'Awaany'}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 border-t dark:border-gray-700 pt-4">
                        <div>
                            <label className={labelClass}>Upload New Logo</label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">Upload an animated GIF, MP4/WebM video, or static image. Recommended size: 450x120 pixels.</p>
                            <ImageUploader
                                bucket={BUCKETS.SITE_ASSETS}
                                pathPrefix="logo"
                                images={[]} // Uploader is only for adding new images
                                onImageUpload={handleNewLogoUpload}
                                onImageRemove={() => { }} // Not used here, management is separate
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

                        <div>
                            <label htmlFor="imageWidth" className={labelClass}>Logo Width ({settings.imageWidth === 'auto' || !settings.imageWidth ? 'Auto' : settings.imageWidth})</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    id="imageWidth"
                                    min="50"
                                    max="400"
                                    value={settings.imageWidth && settings.imageWidth !== 'auto' ? parseInt(settings.imageWidth) : 150}
                                    onChange={(e) => setSettings(prev => ({ ...prev, imageWidth: `${e.target.value}px` }))}
                                    className="w-full mt-2"
                                />
                                <button
                                    type="button"
                                    onClick={() => setSettings(prev => ({ ...prev, imageWidth: 'auto' }))}
                                    className="text-xs text-primary hover:underline whitespace-nowrap"
                                >
                                    Reset to Auto
                                </button>
                            </div>
                        </div>

                        <div className="border-t dark:border-gray-700 pt-4">
                            <label className={labelClass}>Manage Logos</label>
                            {/* Current Logo */}
                            <div className="mt-2">
                                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Logo</h4>
                                {settings.activeLogoPath ? (
                                    <div className="mt-2 inline-block p-2 border-2 border-primary rounded-lg bg-primary/10">
                                        <SupabaseMedia
                                            bucket={BUCKETS.SITE_ASSETS}
                                            imagePath={settings.activeLogoPath}
                                            alt="Current Logo"
                                            className="bg-white rounded"
                                            style={{ width: settings.imageWidth === 'auto' ? undefined : settings.imageWidth, height: 'auto', maxHeight: '60px' }}
                                        />
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
                )}
            </div>



            <MobileAppSettings />
            <TaxSettingsConfig />
            <DeliverySettingsLink />
            <EmailSettingsConfig />

            <ContactSettings />

            {/* Admin Guide */}
            <div className="mt-8">
                <AdminGuide />
            </div>

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
