import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAppContext } from '../../context/AppContext';
import { ShippingSettings } from '../../types';
import { LockClosedIcon, LockOpenIcon, EyeIcon, EyeSlashIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ShippingSettingsPage: React.FC = () => {
    const { currentUser } = useAppContext();
    const [settings, setSettings] = useState<ShippingSettings[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showSecrets, setShowSecrets] = useState(false);

    // OTP State
    const [otpModalOpen, setOtpModalOpen] = useState(false);
    const [otp, setOtp] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState<string | null>(null); // Ideally stored in DB, strictly logic here for now + DB
    const [otpSentAt, setOtpSentAt] = useState<Date | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<ShippingSettings>>({
        provider_name: 'Shiprocket',
        api_key: '',
        api_secret: '',
        is_active: true
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase.from('shipping_settings').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setSettings(data || []);
            // Pre-fill form if active exists
            const active = data?.find(s => s.is_active);
            if (active) {
                setFormData(active);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to load shipping settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartEdit = async () => {
        // Trigger OTP Flow
        setOtpModalOpen(true);
        sendOtp();
    };

    const sendOtp = async () => {
        if (!currentUser?.email) return toast.error("No admin email found.");

        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

        // 1. Store in DB (Security Best Practice)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);

        const { error: dbError } = await supabase.from('admin_otps').insert({
            user_id: currentUser.id,
            otp: newOtp,
            expires_at: expiresAt.toISOString(),
            verified: false
        });

        if (dbError) {
            console.error("OTP DB Error", dbError);
            return toast.error("Failed to generate security token.");
        }

        // 2. Send Email via Dedicated OTP Edge Function
        const { error: mailError } = await supabase.functions.invoke('send-admin-otp', {
            body: {
                email: currentUser.email,
                otp: newOtp
            }
        });

        if (mailError) {
            console.error("OTP Mail Error", mailError);
            toast.error("Failed to send email. Check console.");
        } else {
            toast.success(`OTP sent to ${currentUser.email}`);
            setOtpSentAt(new Date());
        }
    };

    const verifyOtp = async () => {
        if (!currentUser?.id || otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }

        try {
            // Verify against DB - get the most recent valid OTP
            const { data, error } = await supabase
                .from('admin_otps')
                .select('*')
                .eq('user_id', currentUser.id)
                .eq('otp', otp)
                .eq('verified', false)
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) {
                console.error("OTP query error:", error);
                toast.error("Verification failed. Please try again.");
                return;
            }

            // Check if we got a valid OTP
            if (!data || data.length === 0) {
                // Check if OTP exists but is expired or already used
                const { data: existingOtp } = await supabase
                    .from('admin_otps')
                    .select('*')
                    .eq('user_id', currentUser.id)
                    .eq('otp', otp)
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (existingOtp && existingOtp.length > 0) {
                    const otpRecord = existingOtp[0];
                    if (otpRecord.verified) {
                        toast.error("This OTP has already been used. Please request a new code.");
                    } else if (new Date(otpRecord.expires_at) < new Date()) {
                        toast.error("OTP has expired. Please request a new code.");
                    } else {
                        toast.error("Invalid OTP. Please check and try again.");
                    }
                } else {
                    toast.error("Invalid OTP. Please check and try again.");
                }
                setOtp(''); // Clear the input
                return;
            }

            const validOtp = data[0];

            // Mark verified
            const { error: updateError } = await supabase
                .from('admin_otps')
                .update({ verified: true, updated_at: new Date().toISOString() })
                .eq('id', validOtp.id);

            if (updateError) {
                console.error("Update error:", updateError);
                toast.error("Verification failed. Please try again.");
                return;
            }

            toast.success("✅ Access Granted! You can now edit shipping settings.");
            setOtpModalOpen(false);
            setOtp('');
            setIsEditing(true);
        } catch (err) {
            console.error("Verification error:", err);
            toast.error("Verification failed. Please try again.");
        }
    };

    const handleSave = async () => {
        try {
            // Upsert (since we might modify existing active one)
            // Or strictly insert new version? Let's upsert by ID if exists, or insert new.
            const payload = {
                ...formData,
                updated_at: new Date().toISOString()
            };

            // If we have an existing ID for the SAME provider, update it.
            // If switching providers, maybe create new?
            // To keep simple: Update the row if ID exists, else insert.

            const { error } = await supabase.from('shipping_settings').upsert(payload);
            if (error) throw error;

            toast.success("Settings Saved Securely");
            setIsEditing(false);
            fetchSettings();
        } catch (error) {
            toast.error("Failed to save settings");
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading Secure Settings...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Shipping Configuration</h1>
                    <p className="text-sm text-gray-500">Manage delivery partners and API keys securely.</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={handleStartEdit}
                        className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition"
                    >
                        <LockClosedIcon className="w-5 h-5" />
                        <span>Unlock & Edit</span>
                    </button>
                )}
            </div>

            {/* OTP Modal */}
            {otpModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full animate-in fade-in zoom-in-95">
                        <div className="text-center mb-6">
                            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldCheckIcon className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Security Check</h3>
                            <p className="text-gray-500 text-sm mt-2">
                                Please enter the 6-digit code sent to
                                <br />
                                <span className="font-semibold text-gray-800">{currentUser?.email}</span>
                            </p>
                        </div>

                        <input
                            type="text"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && otp.length === 6) {
                                    verifyOtp();
                                }
                            }}
                            className="w-full text-center text-3xl tracking-widest font-bold border-2 border-gray-200 rounded-lg py-3 focus:border-primary focus:ring-0 mb-6"
                            placeholder="000000"
                            autoFocus
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setOtpModalOpen(false);
                                    setOtp('');
                                }}
                                className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={verifyOtp}
                                disabled={otp.length !== 6}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Verify Access
                            </button>
                        </div>
                        <div className="mt-4 text-center">
                            <button
                                onClick={sendOtp}
                                className="text-xs text-primary hover:underline"
                            >
                                Resend Code
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Form */}
            <div className={`bg-white rounded-xl shadow border border-gray-100 overflow-hidden relative ${!isEditing ? 'opacity-75 pointer-events-none grayscale-[0.5]' : ''}`}>
                {!isEditing && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50/20 backdrop-blur-sm">
                        <div className="bg-white px-6 py-3 rounded-full shadow-lg border border-gray-200 flex items-center space-x-2">
                            <LockClosedIcon className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-600 font-medium">Settings are locked</span>
                        </div>
                    </div>
                )}

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                            <select
                                value={formData.provider_name}
                                onChange={e => setFormData({ ...formData, provider_name: e.target.value as any })}
                                className="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary"
                            >
                                <option value="Shiprocket">Shiprocket (Recommended)</option>
                                <option value="eKart">eKart Logistics</option>
                                <option value="Manual">Manual (Self Ship)</option>
                            </select>
                        </div>
                        <div>
                            <div className="flex justify-between">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            </div>
                            <div className="flex items-center space-x-3 mt-2">
                                <button
                                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_active ? 'bg-green-500' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                                <span className="text-sm text-gray-600">{formData.is_active ? 'Active' : 'Inactive'}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">API Key / Email</label>
                        <div className="relative">
                            <input
                                type={showSecrets ? "text" : "password"}
                                value={formData.api_key}
                                onChange={e => setFormData({ ...formData, api_key: e.target.value })}
                                placeholder="Enter API Key from Provider Dashboard"
                                className="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary pr-10"
                            />
                            <button
                                onClick={() => setShowSecrets(!showSecrets)}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                            >
                                {showSecrets ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">API Secret / Password</label>
                        <div className="relative">
                            <input
                                type={showSecrets ? "text" : "password"}
                                value={formData.api_secret || ''}
                                onChange={e => setFormData({ ...formData, api_secret: e.target.value })}
                                placeholder="Enter API Secret (if applicable)"
                                className="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary pr-10"
                            />
                        </div>
                    </div>
                </div>

                {isEditing && (
                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-100">
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                fetchSettings(); // Revert
                            }}
                            className="text-gray-600 hover:text-gray-800 text-sm font-medium px-4 py-2"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-hover shadow-sm transition-all active:scale-95 font-medium"
                        >
                            Save Configuration
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShippingSettingsPage;
