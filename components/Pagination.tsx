import React from 'react';
import ChevronLeftIcon from './icons/ChevronLeftIcon.tsx';
import ChevronRightIcon from './icons/ChevronRightIcon.tsx';

interface PaginationProps {
  currentPage: number;
  totalProducts: number;
  productsPerPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalProducts, productsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  if (totalPages <= 1) {
    return null;
  }

  const getPageNumbers = () => {
    const pages = new Set<number | string>();
    pages.add(1);
    pages.add(totalPages);

    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      if (i > 1 && i < totalPages) {
        pages.add(i);
      }
    }
    
    const pageList: (number | string)[] = Array.from(pages).sort((a,b) => (a as number) - (b as number));
    
    const withEllipsis: (number|string)[] = [];
    let lastPage: number | string | null = null;
    for (const page of pageList) {
        if (lastPage !== null && (page as number) - (lastPage as number) > 1) {
            withEllipsis.push('...');
        }
        withEllipsis.push(page);
        lastPage = page;
    }
    return withEllipsis;
  };
  
  const pageNumbers = getPageNumbers();

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
  
  const navButtonClass = "relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50";
  const activeNavButtonClass = "z-10 bg-primary/10 border-primary text-primary relative inline-flex items-center px-4 py-2 border text-sm font-medium";
  const arrowButtonClass = (isDisabled: boolean) => `relative inline-flex items-center px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`;

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-12">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * productsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * productsPerPage, totalProducts)}</span> of{' '}
            <span className="font-medium">{totalProducts}</span> results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={isFirstPage}
              className={`${arrowButtonClass(isFirstPage)} rounded-l-md`}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            
            {pageNumbers.map((page, index) =>
              typeof page === 'number' ? (
                <button
                  key={index}
                  onClick={() => onPageChange(page)}
                  className={page === currentPage ? activeNavButtonClass : navButtonClass}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              ) : (
                <span key={index} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  ...
                </span>
              )
            )}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={isLastPage}
              className={`${arrowButtonClass(isLastPage)} rounded-r-md`}
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
