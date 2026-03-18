
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import ChevronRightIcon from '../icons/ChevronRightIcon';

const Breadcrumb: React.FC = () => {
  const location = ReactRouterDOM.useLocation();
  const { categories, products } = useAppContext();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const builtCrumbs: { name: string; path?: string }[] = [];

  if (pathnames.length === 0) {
    return null; // Don't render on homepage
  }
  
  builtCrumbs.push({ name: 'Home', path: '/' });
  
  if (pathnames[0] === 'category' && pathnames[1]) {
    const categoryId = pathnames[1];
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      builtCrumbs.push({ name: category.name, path: `/category/${categoryId}` });
    }
  } else if (pathnames[0] === 'product' && pathnames[1]) {
    const productId = parseInt(pathnames[1], 10);
    const product = products.find(p => p.id === productId);
    if (product) {
      const category = categories.find(c => c.id === product.category);
      if (category) {
        builtCrumbs.push({ name: category.name, path: `/category/${category.id}` });
      }
      builtCrumbs.push({ name: product.name, path: `/product/${productId}` });
    }
  } else if (!['category', 'product'].includes(pathnames[0])) {
     const pageName = pathnames[0].charAt(0).toUpperCase() + pathnames[0].slice(1);
     builtCrumbs.push({ name: pageName, path: `/${pathnames[0]}` });
  }

  if (builtCrumbs.length <= 1) {
      return null;
  }
  
  return (
    <nav aria-label="Breadcrumb" className="bg-gray-50 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ol role="list" className="flex items-center flex-wrap py-3">
          {builtCrumbs.map((crumb, index) => {
            const isLast = index === builtCrumbs.length - 1;
            // Safety check for path
            const path = crumb.path || '/';
            
            return (
              <li key={crumb.name} className="text-sm">
                <div className="flex items-center">
                  {index > 0 && (
                    <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-300 mx-2" aria-hidden="true" />
                  )}
                  {isLast ? (
                    <span className="font-medium text-gray-700 truncate" aria-current="page">
                      {crumb.name}
                    </span>
                  ) : (
                    <ReactRouterDOM.Link to={path} className="font-medium text-gray-500 hover:text-primary transition-colors">
                      {crumb.name}
                    </ReactRouterDOM.Link>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb;
