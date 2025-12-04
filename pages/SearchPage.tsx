
import React, { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import ProductCard from '../components/ProductCard.tsx';
import { Product } from '../types.ts';

function useQuery() {
    const { search } = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
}

const SearchPage: React.FC = () => {
    const query = useQuery();
    const searchQuery = query.get('q') || '';
    const { searchProducts, addToSearchHistory } = useAppContext();
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        
        // Save to history here, only when the user actually navigates to the search page
        if (searchQuery.trim()) {
            addToSearchHistory(searchQuery);
        }

        searchProducts(searchQuery).then(results => {
            if (isMounted) {
                setSearchResults(results);
                setIsLoading(false);
            }
        });
        return () => { isMounted = false; };
    }, [searchQuery, searchProducts, addToSearchHistory]);

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-300px)] items-center justify-center">
                 <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }

    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-serif font-bold text-gray-900">
                        Search Results
                    </h1>
                    {searchQuery && (
                        <p className="mt-2 text-lg text-gray-600">
                            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                        </p>
                    )}
                </div>

                {searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {searchResults.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-lg">
                        <h2 className="text-2xl font-semibold text-gray-700">No Products Found</h2>
                        <p className="mt-2 text-gray-500 max-w-md mx-auto">
                            We couldn't find any products matching your search for "{searchQuery}". Please try a different keyword or check your spelling.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
