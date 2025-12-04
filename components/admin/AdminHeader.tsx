import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../../context/AppContext.tsx';
import { Bars3Icon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import Avatar from '../Avatar.tsx';

interface AdminHeaderProps {
    setSidebarOpen: (open: boolean) => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ setSidebarOpen }) => {
    const location = ReactRouterDOM.useLocation();
    const navigate = ReactRouterDOM.useNavigate();
    const { currentUser, logout } = useAppContext();

    const getTitle = () => {
        const path = location.pathname.split('/').pop() || 'dashboard';
        if (path === 'admin') return 'Dashboard';
        if (path === 'new' || !isNaN(Number(path))) {
            const parts = location.pathname.split('/');
            const parentPath = parts[parts.length-2];
            return `Manage ${parentPath.charAt(0).toUpperCase() + parentPath.slice(1, -1)}`;
        }
        return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
    };
    
    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    return (
        <header className="flex-shrink-0 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between p-4 h-16">
                <div className="flex items-center">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-500 focus:outline-none lg:hidden"
                        aria-label="Open sidebar"
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    <h1 className="text-xl font-semibold text-gray-800 ml-4">{getTitle()}</h1>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Avatar user={currentUser} className="h-8 w-8 rounded-full object-cover" />
                        <span className="hidden md:block text-sm font-medium text-gray-700">{currentUser?.name || 'Admin'}</span>
                    </div>
                    <button onClick={handleLogout} className="text-gray-500 hover:text-primary" aria-label="Log out">
                        <ArrowRightOnRectangleIcon className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;