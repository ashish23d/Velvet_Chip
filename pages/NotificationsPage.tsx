import React, { useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import { Notification } from '../types.ts';
import BellIcon from '../components/icons/BellIcon.tsx';
import TagIcon from '../components/icons/TagIcon.tsx';
import ArchiveBoxIcon from '../components/icons/ArchiveBoxIcon.tsx';
import InformationCircleIcon from '../components/icons/InformationCircleIcon.tsx';
import ArrowUturnLeftIcon from '../components/icons/ArrowUturnLeftIcon.tsx';

const NotificationIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
    const commonClasses = "w-6 h-6 text-white";
    switch (type) {
        case 'order':
            return <ArchiveBoxIcon className={commonClasses} />;
        case 'offer':
            return <TagIcon className={commonClasses} />;
        case 'system':
            return <InformationCircleIcon className={commonClasses} />;
        case 'return':
            return <ArrowUturnLeftIcon className={commonClasses} />;
        default:
            return <BellIcon className={commonClasses} />;
    }
};

const getIconBgColor = (type: Notification['type']) => {
    switch (type) {
        case 'order': return 'bg-blue-500';
        case 'offer': return 'bg-green-500';
        case 'system': return 'bg-gray-500';
        case 'return': return 'bg-purple-500';
        default: return 'bg-primary';
    }
}

// A simple time formatting utility
const formatDistanceToNow = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)} years ago`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)} months ago`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)} days ago`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)} hours ago`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)} minutes ago`;
    return `${Math.floor(seconds)} seconds ago`;
};

const NotificationCard: React.FC<{ notification: Notification }> = ({ notification }) => {
    const { markNotificationAsRead } = useAppContext();
    const navigate = ReactRouterDOM.useNavigate();

    const handleClick = () => {
        if (!notification.read) {
            markNotificationAsRead(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const isClickable = !!notification.link;
    const CardComponent = isClickable ? 'button' : 'div';

    return (
        <CardComponent
            onClick={isClickable ? handleClick : undefined}
            className={`w-full text-left p-4 flex items-start gap-4 transition-colors duration-200 ${isClickable ? 'cursor-pointer hover:bg-gray-100' : ''} ${!notification.read ? 'bg-primary/5' : 'bg-white'}`}
        >
            {!notification.read && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" aria-label="Unread"></div>}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBgColor(notification.type)}`}>
                <NotificationIcon type={notification.type} />
            </div>
            <div className="flex-grow">
                <p className="font-semibold text-gray-800">{notification.title}</p>
                <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-2">{formatDistanceToNow(notification.timestamp)}</p>
            </div>
        </CardComponent>
    );
};

const NotificationsPage: React.FC = () => {
    const { currentUser, unreadNotificationCount, markAllNotificationsAsRead } = useAppContext();
    const navigate = ReactRouterDOM.useNavigate();

    useEffect(() => {
        // Redirect to login if user is not available after a short delay
        const timer = setTimeout(() => {
            if (!currentUser) {
                navigate('/login');
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [currentUser, navigate]);

    if (!currentUser) {
        return <div className="text-center p-20">Loading...</div>; // Or a spinner
    }

    const sortedNotifications = [...(currentUser.notifications || [])].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return (
        <div className="bg-gray-50/70 min-h-[calc(100vh-160px)]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-serif font-bold text-gray-900">Notifications</h1>
                        {unreadNotificationCount > 0 && (
                            <button onClick={markAllNotificationsAsRead} className="text-sm font-semibold text-primary hover:underline">
                                Mark all as read
                            </button>
                        )}
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                        {sortedNotifications.length === 0 ? (
                             <div className="p-16 text-center">
                                <BellIcon className="w-16 h-16 mx-auto text-gray-300"/>
                                <h2 className="mt-4 text-xl font-semibold text-gray-700">No Notifications Yet</h2>
                                <p className="mt-2 text-gray-500">We'll let you know when there's something new!</p>
                             </div>
                        ) : (
                           <div className="divide-y divide-gray-200">
                                {sortedNotifications.map(notification => (
                                    <NotificationCard key={notification.id} notification={notification} />
                                ))}
                           </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;