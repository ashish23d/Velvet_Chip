import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import HomeIcon from '../icons/HomeIcon.tsx';
import ChevronRightIcon from '../icons/ChevronRightIcon.tsx';

const breadcrumbNameMap: { [key: string]: string } = {
  admin: 'Dashboard',
  products: 'Products',
  categories: 'Categories',
  orders: 'Orders',
  users: 'Users',
  reviews: 'Reviews',
  approvals: 'Approvals',
  appearance: 'Appearance',
  subscribers: 'Subscribers',
  marketing: 'Marketing',
  settings: 'Settings',
  new: 'New',
  edit: 'Edit',
};

// Function to check if a string is likely an ID (numeric or UUID-like)
const isDynamicSegment = (segment: string): boolean => {
    return !isNaN(Number(segment)) || (segment.length > 20 && segment.includes('-'));
};

const AdminBreadcrumb: React.FC = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    if (pathnames.length <= 1 || pathnames[0] !== 'admin') {
        return null;
    }

    const breadcrumbs = [
        { name: 'Home', path: '/', isFirst: true },
    ];

    let currentPath = '';
    pathnames.forEach(segment => {
        currentPath += `/${segment}`;

        // Skip specific path segments that don't have their own pages
        if (segment === 'promotions') {
            return;
        }

        if (!isDynamicSegment(segment)) {
            breadcrumbs.push({
                name: breadcrumbNameMap[segment] || segment,
                path: currentPath,
                isFirst: false
            });
        }
    });

    return (
        <nav className="mb-6" aria-label="Breadcrumb">
            <ol role="list" className="flex items-center space-x-2 text-sm">
                {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    return (
                        <li key={crumb.path}>
                            <div className="flex items-center">
                                {index > 0 && (
                                    <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-gray-400 mx-2" aria-hidden="true" />
                                )}
                                {isLast ? (
                                    <span className="font-semibold text-gray-700 flex items-center gap-2">
                                        {crumb.isFirst && <HomeIcon className="h-4 w-4" />}
                                        {crumb.name}
                                    </span>
                                ) : (
                                    <Link to={crumb.path} className="text-gray-500 hover:text-primary transition-colors flex items-center gap-2">
                                        {crumb.isFirst && <HomeIcon className="h-4 w-4" />}
                                        <span>{crumb.name}</span>
                                    </Link>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default AdminBreadcrumb;