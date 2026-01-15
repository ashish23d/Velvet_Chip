import React, { useState, useEffect, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import HeroSlider from '../components/HeroSlider.tsx';
import CategoryShowcase from '../components/CategoryShowcase.tsx';
import NewArrivalCard from '../components/NewArrivalCard.tsx';
import SeasonalCard from '../components/SeasonalCard.tsx';
import ProductCard from '../components/ProductCard.tsx';
import { useAppContext } from '../context/AppContext.tsx';
import { BUCKETS } from '../constants.ts';
import { Product } from '../types.ts';
import ChevronLeftIcon from '../components/icons/ChevronLeftIcon.tsx';
import ChevronRightIcon from '../components/icons/ChevronRightIcon.tsx';
import CardRenderer from '../components/CardRenderer.tsx';

const HomePage: React.FC = () => {
    const { slides, seasonalEditCards, fetchProducts, lastProductUpdate, siteContent, products, categories, isLoading, cardAddons } = useAppContext();

    // Helper to get content with fallback
    const getContent = (id: string, defaultTitle: string, defaultDesc: string) => {
        const content = siteContent.find(c => c.id === id)?.data;
        return {
            title: content?.title || defaultTitle,
            description: content?.description || defaultDesc
        };
    };

    const fabulousRange = getContent('home_fabulous_range', 'Our Fabulous Range', 'Discover collections that resonate with your personal style.');
    const newArrivals = getContent('home_new_arrivals', 'New Arrivals', 'Fresh picks from our latest collection.');
    const featuredCollection = getContent('home_featured_collection', 'Featured Collections', 'Handpicked styles from our most popular collections.');
    const seasonalEdit = getContent('home_seasonal_edit', 'The Seasonal Edit', 'Curated styles for the season, just for you.');

    // State for New Arrivals Carousel
    const [carouselProducts, setCarouselProducts] = useState<Product[]>([]);
    const [isLoadingCarousel, setIsLoadingCarousel] = useState(true);
    const carouselRef = useRef<HTMLDivElement>(null);

    // State for Featured Collections Grid
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [isLoadingGrid, setIsLoadingGrid] = useState(true);
    const productsPerPage = 12;

    // Fetch products for carousel
    useEffect(() => {
        const loadCarouselProducts = async () => {
            setIsLoadingCarousel(true);
            try {
                // Fetch latest 10 products
                const { data } = await fetchProducts({ limit: 10, sort: 'latest' });
                setCarouselProducts(data);
            } catch (error) {
                console.error("Failed to fetch carousel products:", error);
            } finally {
                setIsLoadingCarousel(false);
            }
        };
        loadCarouselProducts();
    }, [fetchProducts]);

    // Auto-scroll for carousel
    useEffect(() => {
        const interval = setInterval(() => {
            if (carouselRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
                if (scrollWidth <= clientWidth) return; // Don't scroll if not needed

                // Add a small tolerance for floating point inaccuracies
                const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 2;
                if (isAtEnd) {
                    carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    // Scroll by a consistent amount, typically half the client width for a smoother feel
                    carouselRef.current.scrollBy({ left: clientWidth / 2, behavior: 'smooth' });
                }
            }
        }, 5000); // every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const scrollCarousel = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const scrollAmount = carouselRef.current.clientWidth;
            carouselRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };


    // Fetch products for paginated grid
    useEffect(() => {
        const loadGridProducts = async () => {
            setIsLoadingGrid(true);
            try {
                const { data } = await fetchProducts({ page: 1, perPage: productsPerPage });
                setFeaturedProducts(data);
            } catch (error) {
                console.error("Failed to fetch grid products:", error);
            } finally {
                setIsLoadingGrid(false);
            }
        };
        loadGridProducts();
    }, [fetchProducts, lastProductUpdate]);

    const GridSkeleton = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mt-2 w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mt-1 w-1/2"></div>
                </div>
            ))}
        </div>
    );

    const CarouselSkeleton = () => (
        <div className="flex gap-4 md:gap-6">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex-shrink-0 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5">
                    <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                </div>
            ))}
        </div>
    );

    const SectionHeaderSkeleton = () => (
        <div className="text-center mb-8 animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mx-auto"></div>
        </div>
    );

    return (
        <div className="space-y-12 sm:space-y-16 lg:space-y-24">
            {/* Hero Slider Section */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                {isLoading || slides.length === 0 ? (
                    <div className="animate-pulse relative w-full h-[60vh] overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800"></div>
                ) : (
                    <HeroSlider slides={slides} bucket={BUCKETS.SITE_ASSETS} />
                )}
            </section>

            {/* Dynamic Card Addons */}
            <div className="flex flex-col gap-8 mb-12">
                {cardAddons
                    .filter(addon => addon.placement === 'home' && addon.is_active)
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map(addon => (
                        <CardRenderer key={addon.id} addon={addon} />
                    ))
                }
            </div>

            {/* Category Showcase Section */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8">
                {isLoading ? (
                    <SectionHeaderSkeleton />
                ) : (
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-serif text-gray-800 dark:text-gray-100">{fabulousRange.title}</h2>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">{fabulousRange.description}</p>
                    </div>
                )}
                <CategoryShowcase />
            </section>

            {/* New Arrivals Section - CAROUSEL */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8">
                {isLoading ? (
                    <SectionHeaderSkeleton />
                ) : (
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-serif text-gray-800 dark:text-gray-100">{newArrivals.title}</h2>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">{newArrivals.description}</p>
                    </div>
                )}
                <div className="relative">
                    <button onClick={() => scrollCarousel('left')} className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white dark:hover:bg-gray-700 transition hidden md:block z-10" aria-label="Scroll left">
                        <ChevronLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                    </button>
                    <div
                        ref={carouselRef}
                        className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
                    >
                        {isLoadingCarousel ? (
                            <CarouselSkeleton />
                        ) : (
                            carouselProducts.map(product => (
                                <div key={product.id} className="snap-start flex-shrink-0 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5">
                                    <NewArrivalCard product={product} />
                                </div>
                            ))
                        )}
                    </div>
                    <button onClick={() => scrollCarousel('right')} className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white dark:hover:bg-gray-700 transition hidden md:block z-10" aria-label="Scroll right">
                        <ChevronRightIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                    </button>
                </div>
            </section>
            {/* Featured Collections Section */}
            <section className="w-full bg-gray-50 dark:bg-gray-900 py-16">
                <div className="max-w-6xl mx-auto px-6 lg:px-10">

                    {/* Heading */}
                    {isLoading ? (
                        <SectionHeaderSkeleton />
                    ) : (
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-serif text-gray-800 dark:text-gray-100">
                                {featuredCollection.title}
                            </h2>
                            <p className="mt-3 max-w-2xl mx-auto text-gray-500 dark:text-gray-400">
                                {featuredCollection.description}
                            </p>
                        </div>
                    )}

                    {/* Grid */}
                    {isLoadingGrid ? (
                        <GridSkeleton />
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
                            {featuredProducts.map(product => (
                                <div
                                    key={product.id}
                                    className="transition-transform duration-300 hover:-translate-y-2"
                                >
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CTA */}
                    <div className="text-center mt-16">
                        <ReactRouterDOM.Link
                            to="/search"
                            className="inline-flex items-center justify-center 
                   px-10 py-3 rounded-full 
                   border-2 border-primary text-primary 
                   font-semibold tracking-wide
                   hover:bg-primary hover:text-white
                   transition-all duration-300"
                        >
                            See More Collections →
                        </ReactRouterDOM.Link>
                    </div>

                </div>
            </section>




            {/* Seasonal Edit Section */}
            <section className="bg-pink-50/40 dark:bg-gray-800/50 py-16 transition-colors duration-200">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {isLoading ? (
                        <SectionHeaderSkeleton />
                    ) : (
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-serif text-primary">{seasonalEdit.title}</h2>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">{seasonalEdit.description}</p>
                        </div>
                    )}
                    <div className="space-y-8">
                        {seasonalEditCards
                            .filter(card => card.is_active)
                            .map(card => (
                                <SeasonalCard key={card.id} card={card} />
                            ))}
                    </div>
                </div>
            </section>
        </div>
    );
};


export default HomePage;