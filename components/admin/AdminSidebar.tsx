import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Logo from '../icons/Logo.tsx';
import Squares2X2Icon from '../icons/Squares2X2Icon.tsx';
import { CubeIcon, DocumentDuplicateIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import FolderIcon from '../icons/FolderIcon.tsx';
import ArchiveBoxIcon from '../icons/ArchiveBoxIcon.tsx';
import UserGroupIcon from '../icons/UserGroupIcon.tsx';
import StarOutlineIcon from '../icons/StarOutlineIcon.tsx';
import MegaphoneIcon from '../icons/MegaphoneIcon.tsx';
import Cog6ToothIcon from '../icons/Cog6ToothIcon.tsx';
import ChevronDoubleRightIcon from '../icons/ChevronDoubleRightIcon.tsx';
import PhotoIcon from '../icons/PhotoIcon.tsx';
import CheckBadgeIcon from '../icons/CheckBadgeIcon.tsx';
import EnvelopeIcon from '../icons/EnvelopeIcon.tsx';
import InboxArrowDownIcon from '../icons/InboxArrowDownIcon.tsx';
import EnvelopeOpenIcon from '../icons/EnvelopeOpenIcon.tsx';
import DocumentTextIcon from '../icons/DocumentTextIcon.tsx';
import ArrowUturnLeftIcon from '../icons/ArrowUturnLeftIcon.tsx';

interface AdminSidebarProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ open, setOpen }) => {

    const navItems = [
        { to: '/admin', icon: Squares2X2Icon, label: 'Dashboard' },
        { to: '/admin/analytics', icon: ChartBarIcon, label: 'Analytics' },
        { to: '/admin/products', icon: CubeIcon, label: 'Products' },
        { to: '/admin/orders', icon: ArchiveBoxIcon, label: 'Orders' },
        { to: '/admin/returns', icon: ArrowUturnLeftIcon, label: 'Returns' },
        { to: '/admin/invoices', icon: DocumentDuplicateIcon, label: 'Invoices' },
        { to: '/admin/users', icon: UserGroupIcon, label: 'Users' },
        { to: '/admin/inbox', icon: InboxArrowDownIcon, label: 'Inbox' },
        { to: '/admin/categories', icon: FolderIcon, label: 'Categories' },
        { to: '/admin/reviews', icon: StarOutlineIcon, label: 'Reviews' },
        { to: '/admin/approvals', icon: CheckBadgeIcon, label: 'Approvals' },
        { to: '/admin/appearance', icon: PhotoIcon, label: 'Appearance' },
        { to: '/admin/content', icon: DocumentTextIcon, label: 'Site Content' },
        { to: '/admin/mails', icon: EnvelopeOpenIcon, label: 'Mails' },
        { to: '/admin/subscribers', icon: EnvelopeIcon, label: 'Subscribers' },
        { to: '/admin/marketing', icon: MegaphoneIcon, label: 'Marketing' },
        { to: '/admin/settings', icon: Cog6ToothIcon, label: 'Settings' },
    ];

    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${isActive
            ? 'bg-primary text-white shadow'
            : 'text-gray-600 hover:bg-primary/10 hover:text-primary'
        }`;

    return (
        <>
            {/* Overlay for mobile */}
            <div
                onClick={() => setOpen(false)}
                className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            ></div>

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:relative lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between h-16 px-4 border-b">
                        <div className="flex-shrink-0">
                            <Logo className="h-10 w-auto" />
                        </div>
                        <button onClick={() => setOpen(false)} className="lg:hidden text-gray-500 hover:text-primary">
                            <ChevronDoubleRightIcon className="h-6 w-6 transform rotate-180" />
                        </button>
                    </div>

                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar">
                        {navItems.map(({ to, icon: Icon, label }) => (
                            <ReactRouterDOM.NavLink
                                key={to}
                                to={to}
                                end={to === '/admin'}
                                className={navLinkClasses}
                                onClick={() => setOpen(false)}
                            >
                                <Icon className="h-5 w-5 mr-3" />
                                {label}
                            </ReactRouterDOM.NavLink>
                        ))}
                    </nav>
                </div>
            </div>
        </>
    );
};

export default AdminSidebar;