
import React, { useState, useEffect, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import { Product } from '../types.ts';
import SearchIcon from './icons/SearchIcon.tsx';
import SupabaseImage from './SupabaseImage.tsx';
import { BUCKETS } from '../constants.ts';
import FolderIcon from './icons/FolderIcon.tsx';
import LightBulbIcon from './icons/LightBulbIcon.tsx';
import { ClockIcon } from '@heroicons/react/24/outline';
import XIcon from './icons/XIcon.tsx';

interface SearchBarProps {
    className?: string;
    onResultClick?: () => void;
    isMobileOverlay?: boolean;
    autofocusOnOpen?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ className, onResultClick, isMobileOverlay, autofocusOnOpen }) => {
    const { searchProducts, getSearchSuggestions, categories, searchHistory, clearSearchHistory } = useAppContext();
    const navigate = ReactRouterDOM.useNavigate();
    
    // Global query state for sync
    const [query, setQuery] = useState('');
    
    // Logic state
    const [productResults, setProductResults] = useState<Product[]>([]);
    const [suggestedQueries, setSuggestedQueries] = useState<string[]>([]);
    const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // UI State for Desktop Modal
    const [isExpanded, setIsExpanded] = useState(false); // Logical open/close
    const [isVisible, setIsVisible] = useState(false); // Visual transition state
    
    const modalInputRef = useRef<HTMLInputElement>(null);
    const headerInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // --- SEARCH LOGIC ---

    useEffect(() => {
        const debounceTimer = setTimeout(async () => {
            if (query.length < 2) {
                setProductResults([]);
                setSuggestedQueries([]);
                setSuggestedCategories([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const [products, suggestions] = await Promise.all([
                    searchProducts(query),
                    getSearchSuggestions(query)
                ]);
                
                setProductResults(products.slice(0, 4));
                setSuggestedQueries(suggestions.suggestedQueries || []);
                setSuggestedCategories(suggestions.suggestedCategories || []);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsLoading(false);
            }
        }, 350); 

        return () => clearTimeout(debounceTimer);
    }, [query, searchProducts, getSearchSuggestions, categories]);

    // --- DESKTOP EXPANSION HANDLERS ---

    const openExpanded = () => {
        if (isMobileOverlay) return;
        setIsExpanded(true);
        // Small delay to allow DOM mount before starting CSS transition
        setTimeout(() => setIsVisible(true), 10);
    };

    const closeExpanded = () => {
        if (isMobileOverlay) return;
        setIsVisible(false); // Start exit animation
        setTimeout(() => {
            setIsExpanded(false); // Unmount after animation
            if (onResultClick) onResultClick();
        }, 300); // Match transition duration
    };

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                closeExpanded();
            }
        };
        if (isExpanded) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isExpanded]);

    // Esc key handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeExpanded();
            }
        };
        if (isExpanded) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isExpanded]);

    // Auto-focus the modal input when opened
    useEffect(() => {
        if (isExpanded && modalInputRef.current) {
            modalInputRef.current.focus();
        }
    }, [isExpanded]);

    // --- ACTIONS ---

    const executeSearch = (searchQuery: string) => {
        const trimmed = searchQuery.trim();
        if (trimmed) {
            navigate(`/search?q=${encodeURIComponent(trimmed)}`);
            closeExpanded();
            if(isMobileOverlay && onResultClick) onResultClick();
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        executeSearch(query);
    };

    const handleHistoryClick = (hQuery: string) => {
        setQuery(hQuery);
        executeSearch(hQuery);
    };

    const handleCategoryClick = (categoryName: string) => {
        const category = categories.find(c => c.name === categoryName);
        if (category) {
            navigate(`/category/${category.id}`);
            closeExpanded();
            if(isMobileOverlay && onResultClick) onResultClick();
        }
    };

    // --- SUB-COMPONENTS ---

    const ResultsContent = () => {
        const showSearchResults = query.length >= 2;

        if (isLoading) {
            return (
                <div className="p-8 text-center">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                </div>
            );
        }

        if (!showSearchResults) {
            return (
                <div className="p-4">
                    {searchHistory.length > 0 && (
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-3 px-2">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recent Searches</h3>
                                <button onClick={clearSearchHistory} className="text-xs text-primary hover:underline">Clear</button>
                            </div>
                            <div className="space-y-1">
                                {searchHistory.map((entry) => (
                                    <button
                                        key={entry.id}
                                        onClick={() => handleHistoryClick(entry.query)}
                                        className="flex items-center gap-3 w-full text-left text-sm text-gray-700 hover:bg-gray-50 p-2 rounded-md transition-colors group"
                                    >
                                        <ClockIcon className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                                        <span>{entry.query}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Trending Categories</h3>
                        <div className="flex flex-wrap gap-2 px-2">
                            {categories.slice(0, 5).map(cat => (
                                <button 
                                    key={cat.id} 
                                    onClick={() => handleCategoryClick(cat.name)}
                                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        const hasProducts = productResults.length > 0;
        const hasQueries = suggestedQueries.length > 0;
        const hasCategories = suggestedCategories.length > 0;

        if (!hasProducts && !hasQueries && !hasCategories) {
            return <div className="p-8 text-center text-gray-500 text-sm">No results found for "{query}".</div>;
        }

        return (
            <div className="p-4 space-y-6">
                {hasProducts && (
                    <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Products</h3>
                        <div className="space-y-2">
                            {productResults.map(product => (
                                <ReactRouterDOM.Link 
                                    key={product.id}
                                    to={`/product/${product.id}`}
                                    onClick={() => { closeExpanded(); if(isMobileOverlay && onResultClick) onResultClick(); }}
                                    className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg transition-colors group"
                                >
                                    <SupabaseImage bucket={BUCKETS.PRODUCTS} imagePath={product.images[0]} alt={product.name} className="w-10 h-14 object-cover rounded bg-gray-100" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 group-hover:text-primary">{product.name}</p>
                                        <p className="text-xs text-gray-500">₹{product.price}</p>
                                    </div>
                                </ReactRouterDOM.Link>
                            ))}
                        </div>
                    </div>
                )}

                {(hasQueries || hasCategories) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                        {hasQueries && (
                            <div>
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <LightBulbIcon className="w-4 h-4"/> Suggestions
                                </h3>
                                {suggestedQueries.map(sq => (
                                    <button key={sq} onClick={() => handleHistoryClick(sq)} className="flex items-center gap-3 w-full text-left text-sm text-gray-700 hover:bg-gray-50 p-2 rounded-md">
                                        <SearchIcon className="w-4 h-4 text-gray-400" />
                                        <span>{sq}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        {hasCategories && (
                            <div>
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <FolderIcon className="w-4 h-4"/> Collections
                                </h3>
                                {suggestedCategories.map(sc => (
                                    <button key={sc} onClick={() => handleCategoryClick(sc)} className="flex items-center gap-3 w-full text-left text-sm text-gray-700 hover:bg-gray-50 p-2 rounded-md">
                                        <FolderIcon className="w-4 h-4 text-gray-400" />
                                        <span>{sc}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // --- RENDER: MOBILE OVERLAY ---
    // This is a full-screen distinct view passed via props from Header/Overlay component
    if (isMobileOverlay) {
        return (
            <div className="w-full h-full flex flex-col">
                <form onSubmit={handleFormSubmit} className="relative flex items-center w-full">
                    <input
                        ref={(el) => { if (autofocusOnOpen && el) el.focus(); }}
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for products..."
                        className="w-full pl-10 pr-4 py-3 border-none bg-gray-100 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-0 [&::-webkit-search-cancel-button]:hidden"
                        autoComplete="off"
                    />
                    <div className="absolute left-3 text-gray-400"><SearchIcon className="h-5 w-5" /></div>
                    {query && (
                        <button type="button" onClick={() => setQuery('')} className="absolute right-3 text-gray-400 p-1">
                            <XIcon className="h-5 w-5" />
                        </button>
                    )}
                </form>
                <div className="flex-grow overflow-y-auto mt-4">
                    <ResultsContent />
                </div>
            </div>
        );
    }

    // --- RENDER: DESKTOP HEADER + EXPANDED MODAL ---
    return (
        <>
            {/* 1. Header Trigger Input (Visible in Navbar) */}
            <div className={`relative flex items-center w-full ${className}`}>
                <div className="relative w-full flex items-center">
                    <input
                        ref={headerInputRef}
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={openExpanded}
                        placeholder="Search for products..."
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-100 border-transparent rounded-full text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all duration-200 [&::-webkit-search-cancel-button]:hidden"
                        autoComplete="off"
                    />
                    <div className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center justify-center">
                        <SearchIcon className="h-4 w-4" />
                    </div>
                </div>
            </div>

            {/* 2. Expanded Search Modal (Fixed Overlay) */}
            {isExpanded && (
                <>
                    {/* Backdrop */}
                    <div 
                        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
                        aria-hidden="true"
                        onClick={closeExpanded}
                    />

                    {/* Modal Container */}
                    <div 
                        ref={containerRef}
                        className={`fixed top-24 left-1/2 -translate-x-1/2 w-[90vw] max-w-3xl z-50 transition-all duration-300 ease-out transform ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4'}`}
                    >
                        <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden">
                            <form onSubmit={handleFormSubmit} className="relative flex items-center w-full p-2">
                                <div className="relative w-full">
                                    <input
                                        ref={modalInputRef}
                                        type="search"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search for products, brands and more"
                                        className="w-full pl-12 pr-10 py-4 text-lg border-none text-gray-900 placeholder-gray-400 focus:ring-0 bg-transparent [&::-webkit-search-cancel-button]:hidden"
                                        autoComplete="off"
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                                        <SearchIcon className="h-6 w-6" />
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={closeExpanded} 
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                        aria-label="Close search"
                                    >
                                        <XIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </form>

                            {/* Results Area */}
                            <div className="border-t border-gray-100 max-h-[60vh] overflow-y-auto custom-scrollbar bg-white">
                                <ResultsContent />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default SearchBar;
