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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState('popular');
  // New Filters
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [minDiscount, setMinDiscount] = useState<number | null>(null);
  const [includeOutOfStock, setIncludeOutOfStock] = useState(true);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});

  const loadProducts = async (reset = false) => {
    // ... (existing loadProducts logic) ...
    if (categoryId) {
      setIsLoading(true);
      const currentPage = reset ? 1 : page;
      try {
        const { data, count } = await fetchProducts({ categoryId, page: currentPage, perPage });
        console.log("CategoryPage fetchProducts result:", { count, firstItem: data?.[0] });
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
    console.log("CategoryPage mounted/updated. ID:", categoryId);
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


  const { availableSizes, availableTags, minPrice, maxPrice, availableAttributes } = useMemo(() => {
    // USE GLOBAL PRODUCTS for filters to ensure all tags/options are visible regardless of pagination
    const categoryProducts = allGlobalProducts.filter(p => p.category === categoryId);

    // If global products aren't fully loaded yet (e.g. initial load), fall back to local products? 
    // Actually Context loads all products initially. If empty, it might mean loading.
    // But let's use categoryProducts if available, else products (local).
    const targetProducts = categoryProducts.length > 0 ? categoryProducts : products;

    const sizes = new Set<string>();
    const tags = new Set<string>();
    let min = Infinity;
    let max = 0;

    // Dynamic Attributes Extraction
    const attributesMap: Record<string, Set<string>> = {};

    targetProducts.forEach(product => {
      product.sizes.forEach(size => sizes.add(size));
      if (product.tags) product.tags.forEach(tag => tags.add(tag));
      if (product.price < min) min = product.price;
      if (product.price > max) max = product.price;

      // Extract attributes
      if (product.attributes) {
        Object.entries(product.attributes).forEach(([key, value]) => {
          if (!attributesMap[key]) {
            attributesMap[key] = new Set();
          }
          // Assuming value is string, if it's array handle it too?
          // For now assume simple key-value string
          if (typeof value === 'string') {
            attributesMap[key].add(value);
          }
        });
      }
    });

    // Convert Sets to Arrays for attributes
    const finalAttributes: Record<string, string[]> = {};
    Object.keys(attributesMap).sort().forEach(key => {
      finalAttributes[key] = Array.from(attributesMap[key]).sort();
    });

    return {
      availableSizes: Array.from(sizes),
      availableTags: Array.from(tags),
      minPrice: min === Infinity ? 0 : min,
      maxPrice: max === 0 ? 10000 : max,
      availableAttributes: finalAttributes
    };
  }, [products, allGlobalProducts, categoryId]);

  // Reset price range when products change
  useEffect(() => {
    setPriceRange({ min: minPrice, max: maxPrice });
  }, [minPrice, maxPrice]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // STOCK FILTER (Default: Show All if requested, otherwise Hide OOS)
    // User requested "initially should not apply any filter", so we will show OOS by default or if stock is missing.
    if (!includeOutOfStock) {
      // If the user actively Unchecks "Include Out of Stock" (meaning they WANT to hide OOS),
      // Then we filter. But wait, usually "Include OOS" being FALSE means "Hide OOS".
      // If we want "No filter initially", we should probably default includeOutOfStock to TRUE.
      // However, let's also make the check robust: if stock is undefined, don't hide it.
      filtered = filtered.filter(p => {
        const stock = (p as any).stock;
        // If stock is undefined, assume in-stock/show it. Only hide if explicitly 0.
        return stock === undefined || stock > 0;
      });
    }

    // Filter by size
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(p => p.sizes.some(s => selectedSizes.includes(s)));
    }
    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(p => p.tags && p.tags.some(t => selectedTags.includes(t)));
    }
    // Filter by price
    filtered = filtered.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

    // Filter by Rating
    if (selectedRating) {
      filtered = filtered.filter(p => (p.rating || 0) >= selectedRating);
    }

    // Filter by Discount
    if (minDiscount) {
      filtered = filtered.filter(p => {
        const mrp = p.mrp || p.price;
        if (mrp <= p.price) return false;
        const discount = ((mrp - p.price) / mrp) * 100;
        return discount >= minDiscount;
      });
    }

    // Filter by Dynamic Attributes
    Object.entries(selectedAttributes).forEach(([key, values]) => {
      if (values && values.length > 0) {
        filtered = filtered.filter(p => {
          if (!p.attributes || p.attributes[key] === undefined || p.attributes[key] === null) return false;
          return values.includes(String(p.attributes[key]));
        });
      }
    });

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
  }, [products, selectedSizes, selectedTags, priceRange, sortBy, selectedRating, minDiscount, includeOutOfStock, selectedAttributes]);

  const onClearFilters = () => {
    setSelectedSizes([]);
    setSelectedTags([]);
    setSelectedRating(null);
    setMinDiscount(null);
    setIncludeOutOfStock(false);
    setPriceRange({ min: minPrice, max: maxPrice });
    setSelectedAttributes({});
  };

  const handleAttributeToggle = (key: string, value: string) => {
    setSelectedAttributes(prev => {
      const currentValues = prev[key] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];

      return {
        ...prev,
        [key]: newValues
      };
    });
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
              priceRange={priceRange}
              selectedSizes={selectedSizes}
              selectedTags={selectedTags}
              onPriceChange={setPriceRange}
              onSizeToggle={(size) => setSelectedSizes(p => p.includes(size) ? p.filter(s => s !== size) : [...p, size])}
              onTagToggle={(tag) => setSelectedTags(t => t.includes(tag) ? t.filter(x => x !== tag) : [...t, tag])}
              onClearFilters={onClearFilters}
              minPrice={minPrice}
              maxPrice={maxPrice}
              availableTags={availableTags}
              categories={categories}
              currentCategoryId={category?.id}
              // New Props
              selectedRating={selectedRating}
              onRatingChange={setSelectedRating}
              minDiscount={minDiscount}
              onDiscountChange={setMinDiscount}
              includeOutOfStock={includeOutOfStock}
              onToggleOutOfStock={() => setIncludeOutOfStock(prev => !prev)}
              // Dynamic Attributes
              availableAttributes={availableAttributes}
              selectedAttributes={selectedAttributes}
              onAttributeToggle={handleAttributeToggle}
            />
          </div>


          {/* Products Grid */}
          <main className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-500 text-sm">{isLoading && products.length === 0 ? 'Loading items...' : `${filteredAndSortedProducts.length} items found`}</p>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-3 pr-8 py-1.5 text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-white cursor-pointer"
                >
                  <option value="popular">Popularity</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Average Rating</option>
                  <option value="latest">Newest First</option>
                </select>
              </div>
            </div>

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
        priceRange={priceRange}
        selectedSizes={selectedSizes}
        selectedTags={selectedTags}
        onPriceChange={setPriceRange}
        onSizeToggle={(size) => setSelectedSizes(p => p.includes(size) ? p.filter(s => s !== size) : [...p, size])}
        onTagToggle={(tag) => setSelectedTags(t => t.includes(tag) ? t.filter(x => x !== tag) : [...t, tag])}
        onClearFilters={onClearFilters}
        minPrice={minPrice}
        maxPrice={maxPrice}
        availableTags={availableTags}
        selectedRating={selectedRating}
        onRatingChange={setSelectedRating}
        minDiscount={minDiscount}
        onDiscountChange={setMinDiscount}
        includeOutOfStock={includeOutOfStock}
        onToggleOutOfStock={() => setIncludeOutOfStock(prev => !prev)}
      />
    </div >
  );
};

export default CategoryPage;
