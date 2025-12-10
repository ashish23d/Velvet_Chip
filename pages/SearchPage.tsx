
import React, { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import ProductCard from '../components/ProductCard.tsx';
import { Product } from '../types.ts';
import FilterSidebar from '../components/FilterSidebar.tsx';
import MobileFilterSortSheet from '../components/MobileFilterSortSheet.tsx';
import AdjustmentsHorizontalIcon from '../components/icons/AdjustmentsHorizontalIcon.tsx';
import ArrowsUpDownIcon from '../components/icons/ArrowsUpDownIcon.tsx';

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

    // Filter/Sort State
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
    const [sortBy, setSortBy] = useState('popular');

    // Mobile Sheet State
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [sheetView, setSheetView] = useState<'sort' | 'filter' | null>(null);

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);

        if (searchQuery.trim()) {
            addToSearchHistory(searchQuery);
        }

        searchProducts(searchQuery).then(results => {
            if (isMounted) {
                setSearchResults(results);
                setIsLoading(false);
                // Reset filters on new search
                setSelectedSizes([]);
                setSelectedColors([]);
                setSelectedTags([]);
                // We'll reset price range based on new results in the useMemo below effectively, 
                // but explicit reset to defaults here is safer or we can calc min/max immediately.
            }
        });
        return () => { isMounted = false; };
    }, [searchQuery, searchProducts, addToSearchHistory]);

    // Derive available filters from search results
    const { availableSizes, availableColors, availableTags, minPrice, maxPrice } = useMemo(() => {
        const sizes = new Set<string>();
        const colors = new Map<string, { name: string; hex: string }>();
        const tags = new Set<string>();
        let min = Infinity;
        let max = 0;

        searchResults.forEach(product => {
            product.sizes.forEach(size => sizes.add(size));
            product.colors.forEach(color => {
                if (!colors.has(color.name)) {
                    colors.set(color.name, color);
                }
            });
            if (product.tags) product.tags.forEach(tag => tags.add(tag));
            if (product.price < min) min = product.price;
            if (product.price > max) max = product.price;
        });

        return {
            availableSizes: Array.from(sizes),
            availableColors: Array.from(colors.values()),
            availableTags: Array.from(tags),
            minPrice: min === Infinity ? 0 : min,
            maxPrice: max === 0 ? 10000 : max,
        };
    }, [searchResults]);

    // Sync price range with results initially or when range changes dramatically
    useEffect(() => {
        setPriceRange(prev => ({
            min: Math.max(minPrice, prev.min), // Keep user selection if valid, else clamp
            max: Math.min(maxPrice, prev.max) || maxPrice // Ensure we cover the range if user hasn't touched it much
        }));
        // Actually simplest UX: Reset to full range on new search, sticky on filter.
        // For now, let's just ensure it encompasses the content on load.
        if (!isLoading) {
            setPriceRange({ min: minPrice, max: maxPrice });
        }
    }, [minPrice, maxPrice, isLoading]);


    // Filter and Sort Logic
    const filteredAndSortedProducts = useMemo(() => {
        let filtered = [...searchResults];

        if (selectedSizes.length > 0) {
            filtered = filtered.filter(p => p.sizes.some(s => selectedSizes.includes(s)));
        }
        if (selectedColors.length > 0) {
            filtered = filtered.filter(p => p.colors.some(c => selectedColors.includes(c.name)));
        }
        if (selectedTags.length > 0) {
            filtered = filtered.filter(p => p.tags && p.tags.some(t => selectedTags.includes(t)));
        }

        filtered = filtered.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'price-asc': return a.price - b.price;
                case 'price-desc': return b.price - a.price;
                case 'rating': return b.rating - a.rating;
                case 'latest': return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                case 'popular':
                default:
                    return b.reviews - a.reviews;
            }
        });

        return filtered;
    }, [searchResults, selectedSizes, selectedColors, selectedTags, priceRange, sortBy]);


    const onClearFilters = () => {
        setSelectedSizes([]);
        setSelectedColors([]);
        setSelectedTags([]);
        setPriceRange({ min: minPrice, max: maxPrice });
    };

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
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-serif font-bold text-gray-900">
                        Search Results
                    </h1>
                    {searchQuery && (
                        <p className="mt-2 text-lg text-gray-600">
                            {filteredAndSortedProducts.length} result{filteredAndSortedProducts.length !== 1 ? 's' : ''} for "{searchQuery}"
                        </p>
                    )}
                </div>

                <div className="flex gap-8 items-start">
                    {/* Desktop Sidebar */}
                    <div className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
                        <FilterSidebar
                            availableSizes={availableSizes}
                            availableColors={availableColors}
                            availableTags={availableTags}
                            priceRange={priceRange}
                            selectedSizes={selectedSizes}
                            selectedColors={selectedColors}
                            selectedTags={selectedTags}
                            onPriceChange={setPriceRange}
                            onSizeToggle={(size) => setSelectedSizes(p => p.includes(size) ? p.filter(s => s !== size) : [...p, size])}
                            onColorToggle={(color) => setSelectedColors(p => p.includes(color) ? p.filter(c => c !== color) : [...p, color])}
                            onTagToggle={(tag) => setSelectedTags(t => t.includes(tag) ? t.filter(x => x !== tag) : [...t, tag])}
                            onClearFilters={onClearFilters}
                            minPrice={minPrice}
                            maxPrice={maxPrice}
                        />
                    </div>

                    {/* Product Grid */}
                    <main className="flex-1">
                        {filteredAndSortedProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {filteredAndSortedProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-gray-50 rounded-lg">
                                <h2 className="text-2xl font-semibold text-gray-700">No Products Found</h2>
                                <p className="mt-2 text-gray-500 max-w-md mx-auto">
                                    We couldn't find any products matching your filters. Try clearing some filters.
                                </p>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Filter/Sort Bar */}
            <div className="lg:hidden sticky bottom-0 z-30 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
                <div className="grid grid-cols-2 h-14">
                    <button
                        onClick={() => { setSheetView('sort'); setIsSheetOpen(true); }}
                        className="flex items-center justify-center gap-2 font-medium border-r"
                    >
                        <ArrowsUpDownIcon className="w-5 h-5" />
                        Sort
                    </button>
                    <button
                        onClick={() => { setSheetView('filter'); setIsSheetOpen(true); }}
                        className="flex items-center justify-center gap-2 font-medium"
                    >
                        <AdjustmentsHorizontalIcon className="w-5 h-5" />
                        Filter
                    </button>
                </div>
            </div>

            <MobileFilterSortSheet
                isOpen={isSheetOpen}
                view={sheetView}
                onClose={() => setIsSheetOpen(false)}
                currentSortBy={sortBy}
                onSortChange={(newSort) => { setSortBy(newSort); setIsSheetOpen(false); }}
                onApplyFilters={() => setIsSheetOpen(false)}
                availableSizes={availableSizes}
                availableColors={availableColors}
                availableTags={availableTags}
                priceRange={priceRange}
                selectedSizes={selectedSizes}
                selectedColors={selectedColors}
                selectedTags={selectedTags}
                onPriceChange={setPriceRange}
                onSizeToggle={(size) => setSelectedSizes(p => p.includes(size) ? p.filter(s => s !== size) : [...p, size])}
                onColorToggle={(color) => setSelectedColors(p => p.includes(color) ? p.filter(c => c !== color) : [...p, color])}
                onTagToggle={(tag) => setSelectedTags(t => t.includes(tag) ? t.filter(x => x !== tag) : [...t, tag])}
                onClearFilters={onClearFilters}
                minPrice={minPrice}
                maxPrice={maxPrice}
            />
        </div>
    );
};

export default SearchPage;
