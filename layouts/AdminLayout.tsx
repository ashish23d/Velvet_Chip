


import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar.tsx';
import AdminHeader from '../components/admin/AdminHeader.tsx';
import AdminBreadcrumb from '../components/admin/AdminBreadcrumb.tsx';
import { useAppContext } from '../context/AppContext.tsx';

const AdminLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { currentUser, isLoading } = useAppContext();
    const navigate = ReactRouterDOM.useNavigate();

    useEffect(() => {
        // Only redirect if we are sure loading is done and user status is known
        if (!isLoading) {
            if (!currentUser) {
                navigate('/login');
            } else if (currentUser.role !== 'admin') {
                navigate('/');
            }
        }
    }, [currentUser, navigate, isLoading]);

    // If global loading is still happening, or user isn't confirmed admin yet, show a generic loading
    // But if we have currentUser and they are admin, we render the layout immediately.
    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-100">
                <div className="text-center">
                    <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-500 mt-4">Loading...</p>
                </div>
            </div>
        );
    }

    if (!currentUser || currentUser.role !== 'admin') {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader setSidebarOpen={setSidebarOpen} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6 lg:p-8">
                    <AdminBreadcrumb />

                    <ReactRouterDOM.Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
