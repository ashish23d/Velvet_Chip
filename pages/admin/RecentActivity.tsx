

import React from 'react';
import { User, Order } from '../../types.ts';
import SupabaseImage from '../../components/shared/SupabaseImage';
import Avatar from '../../components/profile/Avatar';
import { BUCKETS } from '../../constants.ts';

interface RecentActivityProps {
    users: User[];
    orders: Order[];
}

const formatTimeAgo = (dateString: string) => {
    if (!dateString) return 'a while ago';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)}y ago`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)}mo ago`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)}d ago`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)}h ago`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)}m ago`;
    return `${Math.floor(seconds)}s ago`;
};

interface ActivityItemProps {
    item: any;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ item }) => {
    if (item.type === 'order') {
        return (
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <SupabaseImage
                      bucket={BUCKETS.PRODUCTS}
                      imagePath={item.items[0].product.images[0]} 
                      alt={item.items[0].product.name} 
                      className="w-full h-full object-cover rounded-full"
                    />
                </div>
                <div className="flex-1">
                    <p className="text-sm text-gray-800">
                        New order <span className="font-semibold text-primary">#{item.id.slice(-6)}</span> from {item.shippingAddress.name}.
                    </p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(item.timestamp)}</p>
                </div>
                <p className="text-sm font-semibold text-gray-800">₹{item.totalAmount}</p>
            </div>
        )
    }
    if (item.type === 'user') {
         return (
            <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                    <Avatar user={item} className="w-10 h-10 rounded-full object-cover" />
                </div>
                <div className="flex-1">
                    <p className="text-sm text-gray-800">
                       New user <span className="font-semibold text-primary">{item.name}</span> registered.
                    </p>
                     <p className="text-xs text-gray-500">{formatTimeAgo(item.timestamp)}</p>
                </div>
            </div>
        )
    }
    return null;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ users, orders }) => {
    const combinedActivities = React.useMemo(() => {
        const orderActivities = orders.map(order => ({
            ...order,
            type: 'order',
            timestamp: order.orderDate
        }));

        const userActivities = users.map(user => ({
            ...user,
            type: 'user',
            timestamp: user.createdAt || new Date(0).toISOString()
        }));

        return [...orderActivities, ...userActivities]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5);
    }, [orders, users]);


    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
            <div className="space-y-6">
                {combinedActivities.length > 0 ? (
                    combinedActivities.map((item) => <ActivityItem key={`${item.type}-${item.id}`} item={item} />)
                ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No recent activity.</p>
                )}
            </div>
        </div>
    );
};

export default RecentActivity;