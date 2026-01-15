import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient.ts';
import { useAppContext } from '../../context/AppContext.tsx';
import SupabaseImage from '../../components/SupabaseImage.tsx';
import { BUCKETS } from '../../constants.ts';
import TrashIcon from '../../components/icons/TrashIcon.tsx';

const BroadcastsPage: React.FC = () => {
    const { currentUser, showConfirmationModal, products, categories } = useAppContext();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [targetPlatform, setTargetPlatform] = useState('all');

    // Deep Linking State
    const [actionType, setActionType] = useState<string>('none');
    const [actionId, setActionId] = useState<string>('');
    const [actionLabel, setActionLabel] = useState<string>(''); // For products/categories, we can auto-fill this based on selection
    const [isSending, setIsSending] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        const { data } = await supabase
            .from('broadcast_notifications')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setHistory(data);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
            setImagePreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);

        try {
            let imagePath = null;
            if (image) {
                const fileName = `${Date.now()}_${image.name}`;
                const { data, error } = await supabase.storage
                    .from(BUCKETS.PRODUCTS) // Resusing products bucket or create 'notifications' bucket
                    .upload(`broadcasts/${fileName}`, image);

                if (error) throw error;
                imagePath = data.path;
            }

            const payload = {
                title,
                message,
                image_path: imagePath,
                target_platform: targetPlatform,

                action_type: actionType,
                action_id: actionId,
                action_label: actionLabel,
                is_active: true
            };

            const { error: dbError } = await supabase
                .from('broadcast_notifications')
                .insert(payload);

            if (dbError) throw dbError;

            // Reset Form
            setTitle('');
            setMessage('');
            setImage(null);
            setImage(null);
            setImagePreview(null);
            setActionType('none');
            setActionId('');
            setActionLabel('');
            fetchHistory();
            alert('Broadcast sent successfully! 🚀');

        } catch (error) {
            console.error('Error sending broadcast:', error);
            alert('Failed to send broadcast.');
        } finally {
            setIsSending(false);
        }
    };

    const handleDelete = async (id: number) => {
        showConfirmationModal({
            title: 'Delete Broadcast',
            message: 'Are you sure? This will remove it from history.',
            confirmText: 'Delete',
            isDestructive: true,
            onConfirm: async () => {
                await supabase.from('broadcast_notifications').delete().eq('id', id);
                fetchHistory();
            }
        });
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">📢 Broadcast Notifications</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form Section */}
                <div>
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">Send New Message</h2>
                    <form onSubmit={handleSend} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title (Supports Emojis 🚀)</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                                placeholder="Big Sale Alert! 🎉"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Message (Supports Emojis 📝)</label>
                            <textarea
                                required
                                rows={4}
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                                placeholder="Get 50% off on all items..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Image (Optional)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            />
                            {imagePreview && (
                                <img src={imagePreview} alt="Preview" className="mt-2 h-32 object-cover rounded-md border" />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Target Platform</label>
                            <select
                                value={targetPlatform}
                                onChange={e => setTargetPlatform(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border rounded-md focus:ring-primary focus:border-primary"
                            >
                                <option value="all">All Platforms (Web + Android)</option>
                                <option value="android">Android App Only</option>
                                <option value="web">Website Only</option>
                            </select>
                        </div>

                        {/* Action Type / Deep Linking */}
                        <div className="border-t pt-4 mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Deep Link Action (Where should this go?)</label>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <button
                                    type="button"
                                    onClick={() => { setActionType('none'); setActionId(''); }}
                                    className={`py-2 text-sm border rounded ${actionType === 'none' ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'}`}
                                >
                                    None
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setActionType('product'); setActionId(''); }}
                                    className={`py-2 text-sm border rounded ${actionType === 'product' ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'}`}
                                >
                                    Product
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setActionType('category'); setActionId(''); }}
                                    className={`py-2 text-sm border rounded ${actionType === 'category' ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'}`}
                                >
                                    Category
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setActionType('url'); setActionId(''); }}
                                    className={`py-2 text-sm border rounded ${actionType === 'url' ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'}`}
                                >
                                    External URL
                                </button>
                            </div>

                            {/* Inputs based on Action Type */}
                            {actionType === 'product' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Select Product</label>
                                    <select
                                        value={actionId}
                                        onChange={e => {
                                            setActionId(e.target.value);
                                            const p = products.find((p: any) => p.id === e.target.value);
                                            setActionLabel(p ? p.name : '');
                                        }}
                                        className="w-full px-3 py-2 border rounded-md text-sm"
                                        required
                                    >
                                        <option value="">-- Choose Product --</option>
                                        {products.map((p: any) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {actionType === 'category' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Select Category</label>
                                    <select
                                        value={actionId}
                                        onChange={e => {
                                            setActionId(e.target.value);
                                            const c = categories.find((c: any) => c.id === e.target.value);
                                            setActionLabel(c ? c.name : '');
                                        }}
                                        className="w-full px-3 py-2 border rounded-md text-sm"
                                        required
                                    >
                                        <option value="">-- Choose Category --</option>
                                        {categories.map((c: any) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {actionType === 'url' && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">External URL (https://...)</label>
                                    <input
                                        type="url"
                                        value={actionId}
                                        onChange={e => { setActionId(e.target.value); setActionLabel('External Link'); }}
                                        className="w-full px-3 py-2 border rounded-md text-sm"
                                        placeholder="https://google.com"
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSending}
                            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-pink-700 disabled:opacity-50 transition-colors font-medium"
                        >
                            {isSending ? 'Sending...' : 'Send Broadcast 🚀'}
                        </button>
                    </form>
                </div>

                {/* History Section */}
                <div className="border-l pl-8">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700">History</h2>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                        {history.length === 0 && <p className="text-gray-500 italic">No past broadcasts.</p>}
                        {history.map(item => (
                            <div key={item.id} className="bg-gray-50 p-4 rounded-lg border relative group">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-gray-800">{item.title}</h3>
                                    <span className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{item.message}</p>
                                {item.image_path && (
                                    <div className="mt-2 text-xs text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded">Has Image</div>
                                )}
                                <div className="mt-2 flex gap-2">
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${item.target_platform === 'all' ? 'bg-purple-100 text-purple-700' :
                                        item.target_platform === 'android' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {item.target_platform}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BroadcastsPage;
