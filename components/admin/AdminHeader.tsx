import React, { useState, useEffect, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Bars3Icon, BellIcon } from '@heroicons/react/24/outline';
import { useAppContext } from '../../context/AppContext';

interface AdminHeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ setSidebarOpen }) => {
  const navigate = ReactRouterDOM.useNavigate();

  const {
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
  } = useAppContext();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 🔔 ONLY ADMIN NOTIFICATIONS
  const adminNotifications = notifications.filter(
    n => n.type === 'admin'
  );

  // 🔔 Auto-open dropdown when new notification arrives
  useEffect(() => {
    if (unreadNotificationCount > 0) {
      setOpen(true);
    }
  }, [unreadNotificationCount]);

  // 🔔 Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow px-4 py-3 flex justify-between items-center">

      {/* LEFT */}
      <div className="flex items-center gap-3">
        <button onClick={() => setSidebarOpen(true)}>
          <Bars3Icon className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="font-semibold text-lg">Admin Panel</h1>
      </div>

      {/* RIGHT */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen(prev => !prev);
          }}
          className="relative"
        >
          <BellIcon className="w-6 h-6 text-gray-700" />

          {unreadNotificationCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2">
              {unreadNotificationCount}
            </span>
          )}
        </button>

        {/* 🔔 DROPDOWN */}
        {open && (
          <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50 max-h-96 overflow-y-auto">
            <div className="p-3 border-b font-semibold">
              Notifications
            </div>

            {adminNotifications.length === 0 && (
              <p className="p-3 text-gray-500 text-sm">
                No notifications
              </p>
            )}

            {adminNotifications.map(notification => (
              <div
                key={notification.id}
                onClick={() => {
                  markNotificationAsRead(notification.id);
                  if (notification.link) navigate(notification.link);
                }}
                className={`p-3 cursor-pointer border-b transition ${notification.is_read
                    ? 'bg-gray-100'
                    : 'bg-yellow-50 hover:bg-yellow-100'
                  }`}
              >
                <p className="font-medium">
                  {notification.title}
                </p>
                <p className="text-sm text-gray-600">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
