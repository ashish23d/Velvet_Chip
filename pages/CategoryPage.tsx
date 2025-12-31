import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import ProductCard from '../components/ProductCard.tsx';
import FilterSidebar from '../components/FilterSidebar.tsx';
import MobileFilterSortSheet from '../components/MobileFilterSortSheet.tsx';
import AdjustmentsHorizontalIcon from '../components/icons/AdjustmentsHorizontalIcon.tsx';
import ArrowsUpDownIcon from '../components/icons/ArrowsUpDownIcon.tsx';
import { Product } from '../types.ts';
import SupabaseMedia from '../components/SupabaseMedia.tsx';
import { BUCKETS } from '../constants.ts';
import CardRenderer from '../components/CardRenderer.tsx';

const CategoryPage: React.FC = () => {
  const { id: categoryId } = useParams<{ id: string }>();
  const { categories, fetchProducts, lastProductUpdate, cardAddons, products: allGlobalProducts } = useAppContext();

  const category = useMemo(() => categories.find(c => c.id === categoryId), [categoryId, categories]);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const perPage = 12;

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetView, setSheetView] = useState<'sort' | 'filter' | null>(null);

  // Filters State
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState('popular');

  const loadProducts = async (reset = false) => {
    if (categoryId) {
      setIsLoading(true);
      const currentPage = reset ? 1 : page;
      try {
        const { data, count } = await fetchProducts({ categoryId, page: currentPage, perPage });
        setProducts(prev => reset ? data : [...prev, ...data]);
        setHasMore(count ? (currentPage * perPage < count) : false);
        if (reset) setPage(1);
      } catch (error) {
        console.error("Failed to fetch category products:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Initial load and reload on category change or product updates
  useEffect(() => {
    loadProducts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, fetchProducts, lastProductUpdate]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (page > 1) {
      loadProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);


  const { availableSizes, availableColors, availableTags, minPrice, maxPrice } = useMemo(() => {
    // USE GLOBAL PRODUCTS for filters to ensure all tags/options are visible regardless of pagination
    const categoryProducts = allGlobalProducts.filter(p => p.category === categoryId);

    // If global products aren't fully loaded yet (e.g. initial load), fall back to local products? 
    // Actually Context loads all products initially. If empty, it might mean loading.
    // But let's use categoryProducts if available, else products (local).
    const targetProducts = categoryProducts.length > 0 ? categoryProducts : products;

    const sizes = new Set<string>();
    const colors = new Map<string, { name: string; hex: string }>();
    const tags = new Set<string>();
    let min = Infinity;
    let max = 0;

    targetProducts.forEach(product => {
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
  }, [products, allGlobalProducts, categoryId]);

  // Reset price range when products change
  useEffect(() => {
    setPriceRange({ min: minPrice, max: maxPrice });
  }, [minPrice, maxPrice]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Note: Filtering is client-side. For large datasets, this should be done on the server.
    // Filter by size
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(p => p.sizes.some(s => selectedSizes.includes(s)));
    }
    // Filter by color
    if (selectedColors.length > 0) {
      filtered = filtered.filter(p => p.colors.some(c => selectedColors.includes(c.name)));
    }
    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(p => p.tags && p.tags.some(t => selectedTags.includes(t)));
    }
    // Filter by price
    filtered = filtered.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

    // Sort
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
  }, [products, selectedSizes, selectedColors, selectedTags, priceRange, sortBy]);

  const onClearFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedTags([]);
    setPriceRange({ min: minPrice, max: maxPrice });
  };

  const ProductGridSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] bg-gray-200 rounded-lg"></div>
          <div className="h-4 bg-gray-200 rounded mt-2 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded mt-1 w-1/2"></div>
        </div>
      ))}
    </div>
  );

  if (!category && isLoading) {
    return <div className="text-center py-20">Loading category...</div>;
  }

  if (!category) {
    return <div className="text-center py-20">Category not found.</div>;
  }

  return (
    <div className="bg-white">
      {/* Category Hero */}
      {category.pageHeroMedia && category.pageHeroMedia.length > 0 && (
        <div className="relative h-[40vh] bg-gray-200">
          <SupabaseMedia
            bucket={BUCKETS.CATEGORIES}
            imagePath={category.pageHeroMedia[0].path}
            alt={category.name}
            className="w-full h-full object-cover"
          />
          {category.showPageHeroText && category.pageHeroText && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <h1 className="text-4xl md:text-5xl font-serif text-white text-center drop-shadow-lg">{category.pageHeroText}</h1>
            </div>
          )}
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-900">{category.name}</h1>
          <p className="mt-2 text-gray-500">{isLoading && products.length === 0 ? 'Loading items...' : `${filteredAndSortedProducts.length} items found`}</p>
        </div>

        <div className="flex gap-8 items-start">
          {/* Filters (Desktop) */}
          <div className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
            <FilterSidebar
              availableSizes={availableSizes}
              availableColors={availableColors}
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
              availableTags={availableTags}
              categories={categories}
              currentCategoryId={category?.id}
            />
          </div>

          {/* Products Grid */}
          <main className="flex-1">
            {isLoading && products.length === 0 ? <ProductGridSkeleton /> : (
              filteredAndSortedProducts.length > 0 ?
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                    {filteredAndSortedProducts.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  {hasMore && (
                    <div className="text-center mt-12">
                      <button onClick={handleLoadMore} disabled={isLoading} className="bg-primary text-white py-2 px-8 rounded-full font-medium hover:bg-pink-700 transition-colors disabled:bg-gray-400">
                        {isLoading ? 'Loading...' : 'Load More'}
                      </button>
                    </div>
                  )}
                </>
                : (
                  <div className="text-center py-20 bg-gray-50 rounded-lg">
                    <h2 className="text-xl font-semibold text-gray-700">No Products Found</h2>
                    <p className="mt-2 text-gray-500">Try adjusting your filters to find what you're looking for.</p>
                  </div>
                )
            )}
          </main>
        </div>
      </div>

      {/* Card Addons */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {cardAddons
          .filter(addon => addon.placement === 'category_page' && addon.isActive)
          .sort((a, b) => a.order - b.order)
          .map(addon => (
            <CardRenderer key={addon.id} addon={addon} />
          ))
        }
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
        availableTags={availableTags}
      />
    </div>
  );
};

export default CategoryPage;
