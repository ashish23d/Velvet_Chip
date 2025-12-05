import React from 'react';
import { Link } from 'react-router-dom';
import { CardAddon } from '../types.ts';
import { useAppContext } from '../context/AppContext.tsx';
import SupabaseImage from './SupabaseImage.tsx';
import { BUCKETS } from '../constants.ts';
import ProductCard from './ProductCard.tsx';
import NewArrivalCard from './NewArrivalCard.tsx';

interface CardRendererProps {
    addon: CardAddon;
}

const CardRenderer: React.FC<CardRendererProps> = ({ addon }) => {
    const { config } = addon;
    const { categories, products } = useAppContext();

    const containerStyle: React.CSSProperties = {
        backgroundColor: config.backgroundColor || '#ffffff',
        color: config.textColor || '#000000',
        textAlign: (config.textAlignment as any) || 'left',
    };

    const wrapperClass = config.fullWidth ? 'w-full' : 'container mx-auto px-4';

    const renderContent = () => {
        switch (addon.type) {
            case 'hero':
            case 'banner':
                return (
                    <div className="relative overflow-hidden rounded-xl" style={{ height: addon.type === 'hero' ? '500px' : '300px' }}>
                        {addon.image_path && (
                            <div className="absolute inset-0">
                                <SupabaseImage
                                    imagePath={addon.image_path}
                                    bucket={BUCKETS.CARD_ADDONS}
                                    alt={addon.title || 'Banner'}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/30" />
                            </div>
                        )}
                        <div className="relative h-full flex flex-col justify-center items-center text-center p-8 z-10">
                            {addon.title && <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">{addon.title}</h2>}
                            {addon.subtitle && <p className="text-xl md:text-2xl mb-8 text-white/90">{addon.subtitle}</p>}
                            {addon.cta_text && addon.cta_link && (
                                <Link
                                    to={addon.cta_link}
                                    className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                                >
                                    {addon.cta_text}
                                </Link>
                            )}
                        </div>
                    </div>
                );

            case 'text':
                return (
                    <div className="py-12">
                        {addon.title && <h2 className="text-3xl font-bold mb-4">{addon.title}</h2>}
                        {addon.subtitle && <h3 className="text-xl text-gray-500 mb-6">{addon.subtitle}</h3>}
                        {addon.content && <div className="prose dark:prose-invert max-w-none">{addon.content}</div>}
                        {addon.cta_text && addon.cta_link && (
                            <div className="mt-8">
                                <Link
                                    to={addon.cta_link}
                                    className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    {addon.cta_text}
                                </Link>
                            </div>
                        )}
                    </div>
                );

            case 'image':
                return (
                    <div className="py-8">
                        {addon.image_path && (
                            <Link to={addon.cta_link || '#'} className={addon.cta_link ? 'cursor-pointer' : ''}>
                                <SupabaseImage
                                    imagePath={addon.image_path}
                                    bucket={BUCKETS.CARD_ADDONS}
                                    alt={addon.title || 'Image'}
                                    className="w-full h-auto rounded-xl shadow-sm"
                                />
                            </Link>
                        )}
                    </div>
                );

            case 'split':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-12">
                        <div className={`order-2 ${config.textAlignment === 'right' ? 'md:order-1' : 'md:order-2'}`}>
                            {addon.image_path && (
                                <SupabaseImage
                                    imagePath={addon.image_path}
                                    bucket={BUCKETS.CARD_ADDONS}
                                    alt={addon.title || 'Image'}
                                    className="w-full h-auto rounded-xl shadow-sm"
                                />
                            )}
                        </div>
                        <div className={`order-1 ${config.textAlignment === 'right' ? 'md:order-2' : 'md:order-1'}`}>
                            {addon.title && <h2 className="text-3xl font-bold mb-4">{addon.title}</h2>}
                            {addon.subtitle && <h3 className="text-xl text-gray-500 mb-6">{addon.subtitle}</h3>}
                            {addon.content && <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">{addon.content}</p>}
                            {addon.cta_text && addon.cta_link && (
                                <Link
                                    to={addon.cta_link}
                                    className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    {addon.cta_text}
                                </Link>
                            )}
                        </div>
                    </div>
                );

            case 'category_highlight': {
                const category = categories.find(c => c.id === addon.target_id);
                if (!category) return null;

                return (
                    <div className="py-12">
                        <div className="relative rounded-xl overflow-hidden group">
                            <div className="aspect-[21/9] w-full">
                                <SupabaseImage
                                    imagePath={category.appImagePath || category.heroImage || ''}
                                    bucket={BUCKETS.CATEGORIES}
                                    alt={category.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                            <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center p-8">
                                <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">{addon.title || category.name}</h2>
                                {addon.subtitle && <p className="text-xl text-white/90 mb-8">{addon.subtitle}</p>}
                                <Link
                                    to={`/category/${category.id}`}
                                    className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                                >
                                    {addon.cta_text || 'Shop Collection'}
                                </Link>
                            </div>
                        </div>
                    </div>
                );
            }

            case 'product_grid': {
                let displayProducts = products;
                if (addon.target_type === 'category' && addon.target_id) {
                    displayProducts = products.filter(p => p.category === addon.target_id);
                } else if (addon.target_type === 'product' && addon.target_id) {
                    // If a specific product is selected, maybe show it and related items?
                    // For now, let's just show the selected product + others in same category
                    const selectedProduct = products.find(p => p.id === Number(addon.target_id));
                    if (selectedProduct) {
                        displayProducts = products.filter(p => p.category === selectedProduct.category);
                    }
                }

                // Limit to 8 products for grid
                displayProducts = displayProducts.slice(0, 8);

                if (displayProducts.length === 0) return null;

                return (
                    <div className="py-12">
                        <div className="text-center mb-8">
                            {addon.title && <h2 className="text-3xl font-bold mb-2">{addon.title}</h2>}
                            {addon.subtitle && <p className="text-gray-500">{addon.subtitle}</p>}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {displayProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                        {addon.cta_text && addon.cta_link && (
                            <div className="text-center mt-8">
                                <Link
                                    to={addon.cta_link}
                                    className="inline-block bg-transparent text-primary py-3 px-8 rounded-full font-semibold border-2 border-primary hover:bg-primary hover:text-white transition-colors duration-300"
                                >
                                    {addon.cta_text}
                                </Link>
                            </div>
                        )}
                    </div>
                );
            }

            case 'product_carousel': {
                let displayProducts = products;
                if (addon.target_type === 'category' && addon.target_id) {
                    displayProducts = products.filter(p => p.category === addon.target_id);
                }
                // Limit to 10 products for carousel
                displayProducts = displayProducts.slice(0, 10);

                if (displayProducts.length === 0) return null;

                return (
                    <div className="py-12">
                        <div className="text-center mb-8">
                            {addon.title && <h2 className="text-3xl font-bold mb-2">{addon.title}</h2>}
                            {addon.subtitle && <p className="text-gray-500">{addon.subtitle}</p>}
                        </div>
                        <div className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar pb-4">
                            {displayProducts.map(product => (
                                <div key={product.id} className="snap-start flex-shrink-0 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5">
                                    <NewArrivalCard product={product} />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }

            default:
                return (
                    <div className="p-8 border-2 border-dashed border-gray-300 rounded-xl text-center">
                        <p className="text-gray-500">Card type "{addon.type}" renderer not implemented yet.</p>
                    </div>
                );
        }
    };

    return (
        <section style={containerStyle} className="py-8">
            <div className={wrapperClass}>
                {renderContent()}
            </div>
        </section>
    );
};

export default CardRenderer;
