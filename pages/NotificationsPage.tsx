import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import SupabaseImage from '../components/SupabaseImage';
import { BUCKETS } from '../constants';

const NotificationsPage: React.FC = () => {
    const { orderUpdates, promotions } = useAppContext();
    const [activeTab, setActiveTab] = useState<'updates' | 'promotions'>('updates');
    const navigate = useNavigate();

    const handleBroadcastClick = (broadcast: any) => {
        if (!broadcast) return;

        console.log("Broadcast clicked:", broadcast);

        if (broadcast.action_type === 'product' && broadcast.action_id) {
            navigate(`/product/${broadcast.action_id}`);
        } else if (broadcast.action_type === 'category' && broadcast.action_id) {
            // Navigate to specific category page
            // Assuming path is /category/:categoryId or a filter on home
            navigate(`/category/${broadcast.action_id}`);
        } else if (broadcast.action_type === 'url' && broadcast.action_id) {
            // External or absolute URL
            try {
                const url = new URL(broadcast.action_id);
                window.location.href = url.href;
            } catch (e) {
                // If not a valid full URL, treat as relative path
                window.location.href = broadcast.action_id.startsWith('http') ? broadcast.action_id : `https://${broadcast.action_id}`;
            }
        } else {
            console.warn("Notification clicked with no valid action:", broadcast);
            // Optional: fallback navigation or just do nothing
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl min-h-[80vh]">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Notification Center</h1>

            {/* Tabs */}
            <div className="flex border-b mb-6">
                <button
                    onClick={() => setActiveTab('updates')}
                    className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${activeTab === 'updates'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Updates
                </button>
                <button
                    onClick={() => setActiveTab('promotions')}
                    className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${activeTab === 'promotions'
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Notifications
                </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
                {activeTab === 'updates' && (
                    <div className="animate-fade-in">
                        {orderUpdates.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                <p>No order updates yet.</p>
                            </div>
                        ) : (
                            orderUpdates.map((update, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-start gap-3">
                                    <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                                        📦
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 text-sm">{update.title}</h3>
                                        <p className="text-gray-600 text-xs mt-1">{update.message}</p>
                                        <span className="text-[10px] text-gray-400 mt-2 block">
                                            {update.timestamp ? new Date(update.timestamp).toLocaleString() : ''}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'promotions' && (
                    <div className="animate-fade-in space-y-4">
                        {promotions.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                <p>No new notifications.</p>
                            </div>
                        ) : (
                            promotions.map((promo) => (
                                <div
                                    key={promo.id}
                                    onClick={() => handleBroadcastClick(promo)}
                                    className={`bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${promo.action_type !== 'none' ? 'cursor-pointer' : ''}`}
                                >
                                    {promo.image_path && (
                                        <div className="w-full h-32 bg-gray-100 relative">
                                            <SupabaseImage
                                                bucket={BUCKETS.PRODUCTS} // Or notifications bucket
                                                imagePath={promo.image_path}
                                                alt={promo.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-gray-800">{promo.title}</h3>
                                            <span className="text-[10px] text-gray-400">
                                                {new Date(promo.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2">{promo.message}</p>

                                        {promo.action_type !== 'none' && (
                                            <div className="mt-3 text-xs font-semibold text-primary flex items-center gap-1">
                                                {promo.action_label || 'View Details'} &rarr;
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;