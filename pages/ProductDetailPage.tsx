
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import { Product, Address } from '../types.ts';
import SupabaseImage from '../components/SupabaseImage.tsx';
import { BUCKETS } from '../constants.ts';
import Rating from '../components/Rating.tsx';
import WishlistIcon from '../components/icons/WishlistIcon.tsx';
import PlusIcon from '../components/icons/PlusIcon.tsx';
import MinusIcon from '../components/icons/MinusIcon.tsx';
import ReviewsList from '../components/ReviewsList.tsx';
import CustomerPhotos from '../components/CustomerPhotos.tsx';
import ProductCard from '../components/ProductCard.tsx';
import EditableWrapper from '../components/EditableWrapper.tsx';
import SimilarProductsModal from '../components/SimilarProductsModal.tsx';
import MapPinIcon from '../components/icons/MapPinIcon.tsx';
import AddressSelectionModal from '../components/AddressSelectionModal.tsx';
import CardRenderer from '../components/CardRenderer.tsx';

const ProductDetailSkeleton = () => (
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="flex flex-col-reverse md:flex-row gap-4">
        <div className="flex md:flex-col gap-2 md:w-24 flex-shrink-0">
          <div className="w-20 h-24 md:w-full bg-gray-200 rounded-md"></div>
          <div className="w-20 h-24 md:w-full bg-gray-200 rounded-md"></div>
          <div className="w-20 h-24 md:w-full bg-gray-200 rounded-md"></div>
        </div>
        <div className="flex-grow aspect-[3/4] bg-gray-200 rounded-lg"></div>
      </div>
      <div className="py-4 space-y-6">
        <div className="h-10 bg-gray-300 rounded w-3/4"></div>
        <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="h-8 bg-gray-300 rounded w-1/2"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-300 rounded"></div>
      </div>
    </div>
  </div>
);

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    reviews,
    getProductById,
    addToCart,
    toggleWishlist,
    isProductInWishlist,
    triggerFlyToCartAnimation,
    currentUser,
    fetchProducts,
    cardAddons,
  } = useAppContext();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedColor, setSelectedColor] = useState<Product['colors'][0] | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customizationValues, setCustomizationValues] = useState<Record<string, string>>({});
  const [customizationText, setCustomizationText] = useState(''); // Legacy simple text
  const [mainImage, setMainImage] = useState<string>('');
  const addToCartButtonRef = React.useRef<HTMLButtonElement>(null);
  const [isSimilarModalOpen, setIsSimilarModalOpen] = useState(false);
  const [isGalleryExpanded, setIsGalleryExpanded] = useState(false);

  // State for delivery options
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [deliveryPincode, setDeliveryPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState<{ date: string; cod: boolean } | null>(null);
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState<Address | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProduct = async () => {
      if (id) {
        setIsLoading(true);
        const fetchedProduct = await getProductById(Number(id));
        if (fetchedProduct) {
          setProduct(fetchedProduct);
          const initialColor = fetchedProduct.colors?.[0] || null;
          setSelectedColor(initialColor);

          // Smart size selection: use color-specific size if available, else global
          const availableSizes = (initialColor?.sizes && initialColor.sizes.length > 0)
            ? initialColor.sizes.map(s => s.size)
            : fetchedProduct.sizes;

          setSelectedSize(availableSizes?.[0] || null);

          setMainImage(initialColor?.images?.[0] || fetchedProduct.images?.[0] || '');
          setQuantity(1);

          // Fetch similar products
          const { data: similarData } = await fetchProducts({ categoryId: fetchedProduct.category, limit: 5 });
          setSimilarProducts(similarData.filter(p => p.id !== fetchedProduct.id));

        } else {
          // Handle product not found
        }
        setIsLoading(false);
      }
    };
    loadProduct();
  }, [id, getProductById, fetchProducts]);

  // Effect to set the initial delivery address for a logged-in user
  useEffect(() => {
    if (currentUser?.addresses && currentUser.addresses.length > 0) {
      const defaultAddress = currentUser.addresses.find(a => a.isDefault);
      const addressToSet = defaultAddress || currentUser.addresses[0];
      setSelectedDeliveryAddress(addressToSet);
      // Simulate checking delivery for this initial address
      checkDelivery(addressToSet.pincode);
    } else {
      setSelectedDeliveryAddress(null);
      setDeliveryInfo(null);
    }
  }, [currentUser]);

  const productReviews = useMemo(() => reviews.filter(r =>
    r.productId === product?.id && (r.status === 'approved' || r.userId === currentUser?.id)
  ), [reviews, product, currentUser]);

  const customerPhotos = useMemo(() => {
    return productReviews.flatMap(r => r.productImages || []);
  }, [productReviews]);

  // Dummy delivery check function
  const checkDelivery = (pincode: string) => {
    if (pincode && pincode.length === 6) {
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 5); // 5 days from now
      setDeliveryInfo({
        date: deliveryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        cod: !['4', '8'].includes(pincode.charAt(0)) // Some dummy logic for COD
      });
    } else {
      setDeliveryInfo(null);
    }
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    checkDelivery(deliveryPincode);
  };

  const handleAddressSelect = (addressId: string) => {
    const newAddress = currentUser?.addresses?.find(a => a.id === addressId);
    if (newAddress) {
      setSelectedDeliveryAddress(newAddress);
      checkDelivery(newAddress.pincode);
    }
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold">Product not found</h1>
        <button onClick={() => navigate('/')} className="text-primary mt-4 inline-block">Go back to Home</button>
      </div>
    );
  }

  const handleColorSelect = (color: Product['colors'][0]) => {
    setSelectedColor(color);

    // Update available sizes when color changes
    const newAvailableSizes = (color.sizes && color.sizes.length > 0)
      ? color.sizes.map(s => s.size)
      : product.sizes;

    // Reset selection if current selection is not available in new color
    if (selectedSize && !newAvailableSizes.includes(selectedSize)) {
      setSelectedSize(newAvailableSizes[0] || null);
    }

    if (color.images && color.images.length > 0) {
      setMainImage(color.images[0]);
    } else {
      setMainImage(product.images[0]);
    }
  };

  const handleAddToCart = () => {
    if (!currentUser) {
      navigate(`/login?redirect=${location.pathname}`);
      return;
    }
    if (selectedSize && selectedColor && addToCartButtonRef.current) {
      triggerFlyToCartAnimation(product, addToCartButtonRef.current);

      let finalCustomizationString = '';

      // Handle dynamic options
      if (product.customization_options && product.customization_options.length > 0) {
        const parts: string[] = [];

        // Validate required fields
        const missingRequired = product.customization_options
          .filter(opt => opt.required && !customizationValues[opt.id])
          .map(opt => opt.label);

        if (missingRequired.length > 0) {
          alert(`Please fill in the following required customization fields: ${missingRequired.join(', ')}`);
          return;
        }

        product.customization_options.forEach(opt => {
          if (customizationValues[opt.id]) {
            parts.push(`${opt.label}: ${customizationValues[opt.id]}`);
          }
        });
        finalCustomizationString = parts.join('\n');
      } else {
        // Fallback to legacy text
        finalCustomizationString = customizationText;
      }

      addToCart(product, selectedSize, selectedColor, quantity, finalCustomizationString);
      setCustomizationText(''); // Reset
      setCustomizationValues({});
    } else {
      alert("Please select a size and color.");
    }
  };

  const handleToggleWishlist = () => {
    if (!currentUser) {
      navigate(`/login?redirect=${location.pathname}`);
      return;
    }
    toggleWishlist(product);
  };

  const inWishlist = isProductInWishlist(product.id);
  const allImagesForProduct = [...new Set([...product.images, ...product.colors.flatMap(c => c.images || [])])];

  // Determine available sizes for display
  const currentAvailableSizes = (selectedColor && selectedColor.sizes && selectedColor.sizes.length > 0)
    ? selectedColor.sizes.map(s => s.size)
    : product.sizes;

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            <div className={`flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto no-scrollbar md:w-24 flex-shrink-0 transition-all duration-300`}>
              {/* Show only first 4 images or all if expanded */}
              {(isGalleryExpanded ? allImagesForProduct : allImagesForProduct.slice(0, 4)).map(img => (
                <button
                  key={img}
                  onClick={() => setMainImage(img)}
                  className={`w-20 h-24 md:w-full md:h-24 flex-shrink-0 rounded-md overflow-hidden border-2 ${mainImage === img ? 'border-primary' : 'border-transparent'}`}
                >
                  <SupabaseImage bucket={BUCKETS.PRODUCTS} imagePath={img} alt={`${product.name} thumbnail`} className="w-full h-full object-cover" />
                </button>
              ))}
              {allImagesForProduct.length > 4 && (
                <button
                  onClick={() => setIsGalleryExpanded(!isGalleryExpanded)}
                  className="w-20 h-24 md:w-full md:h-10 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center text-xs font-medium text-gray-600 hover:bg-gray-200"
                >
                  {isGalleryExpanded ? 'Less' : `+${allImagesForProduct.length - 4} More`}
                </button>
              )}
            </div>
            <div className="flex-grow aspect-[6/7] bg-gray-100 rounded-lg overflow-hidden relative cursor-zoom-in">
              <div
                className="w-full h-full overflow-hidden"
                onMouseMove={(e) => {
                  const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - left) / width) * 100;
                  const y = ((e.clientY - top) / height) * 100;
                  const img = e.currentTarget.querySelector('img');
                  if (img) {
                    img.style.transformOrigin = `${x}% ${y}%`;
                    img.style.transform = "scale(2)";
                  }
                }}
                onMouseLeave={(e) => {
                  const img = e.currentTarget.querySelector('img');
                  if (img) {
                    img.style.transform = "scale(1)";
                    img.style.transformOrigin = "center center";
                  }
                }}
              >
                <SupabaseImage
                  bucket={BUCKETS.PRODUCTS}
                  imagePath={mainImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-200 ease-out"
                />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="py-4">
            <EditableWrapper editUrl={`/admin/products/edit/${product.id}`}>
              <h1 className="text-3xl lg:text-4xl font-bold font-serif text-gray-900">{product.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <Rating rating={product.rating} />
                <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
              </div>
              <p className="text-sm text-gray-600 mt-4">{product.description}</p>

              {(() => {
                // Calculate price and MRP based on selected variant
                const currentVariantSize = selectedColor?.sizes?.find(s => s.size === selectedSize);
                const displayPrice = currentVariantSize?.price || product.price;
                const displayMrp = currentVariantSize?.mrp || product.mrp;
                const discountPercentage = Math.round(((displayMrp - displayPrice) / displayMrp) * 100);

                return (
                  <div className="flex items-baseline gap-2 mt-4">
                    <p className="text-3xl font-bold text-gray-900">₹{displayPrice}</p>
                    <p className="text-xl text-gray-400 line-through">₹{displayMrp}</p>
                    <p className="text-lg font-semibold text-green-600">
                      ({discountPercentage}% OFF)
                    </p>
                  </div>
                );
              })()}
            </EditableWrapper>

            <div className="mt-6 space-y-6">
              {/* Color Selector */}
              {product.show_colors !== false && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Color: <span className="font-semibold">{selectedColor?.name}</span></h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {product.colors.map(color => (
                      <button
                        key={color.uuid}
                        onClick={() => handleColorSelect(color)}
                        className={`w-8 h-8 rounded-full border border-gray-300 transition-transform transform hover:scale-110 ${selectedColor?.name === color.name ? 'ring-2 ring-offset-1 ring-primary' : ''}`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                        aria-label={`Select color ${color.name}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              <div>
                <h3 className="text-sm font-medium text-gray-900">{product.variant_label || 'Size'}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentAvailableSizes.length > 0 ? currentAvailableSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-1 border rounded-md text-sm font-medium transition-colors ${selectedSize === size ? 'bg-primary text-white border-primary' : 'border-gray-300 hover:border-primary hover:text-primary'}`}
                    >
                      {size}
                    </button>
                  )) : (
                    <p className="text-sm text-gray-500 italic">No sizes available for this color.</p>
                  )}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
                <div className="flex items-center border border-gray-300 rounded-md w-fit mt-2">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2 text-gray-600 hover:text-primary"><MinusIcon className="w-4 h-4" /></button>
                  <span className="px-4 text-sm font-medium text-gray-800">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="p-2 text-gray-600 hover:text-primary"><PlusIcon className="w-4 h-4" /></button>
                </div>
              </div>

              {/* Customization / Special Instructions */}
              {product.allow_customization && (
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Customization Options
                  </h3>

                  {product.customization_options && product.customization_options.length > 0 ? (
                    <div className="space-y-4">
                      {product.customization_options.map(opt => (
                        <div key={opt.id}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {opt.label} {opt.required && <span className="text-red-500">*</span>}
                          </label>

                          {opt.type === 'text' && (
                            <input
                              type="text"
                              value={customizationValues[opt.id] || ''}
                              onChange={e => setCustomizationValues(prev => ({ ...prev, [opt.id]: e.target.value }))}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                              placeholder={`Enter ${opt.label}`}
                            />
                          )}

                          {opt.type === 'radio' && (
                            <div className="space-y-2">
                              {opt.options?.map(val => (
                                <div key={val} className="flex items-center">
                                  <input
                                    type="radio"
                                    id={`${opt.id}-${val}`}
                                    name={opt.id}
                                    value={val}
                                    checked={customizationValues[opt.id] === val}
                                    onChange={e => setCustomizationValues(prev => ({ ...prev, [opt.id]: e.target.value }))}
                                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                                  />
                                  <label htmlFor={`${opt.id}-${val}`} className="ml-3 block text-sm font-medium text-gray-700">
                                    {val}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}

                          {opt.type === 'checkbox' && (
                            <div className="space-y-2">
                              {opt.options?.map(val => {
                                const currentVals = customizationValues[opt.id] ? customizationValues[opt.id].split(', ') : [];
                                const isChecked = currentVals.includes(val);
                                return (
                                  <div key={val} className="flex items-center">
                                    <input
                                      type="checkbox"
                                      id={`${opt.id}-${val}`}
                                      checked={isChecked}
                                      onChange={e => {
                                        let newVals: string[];
                                        if (e.target.checked) {
                                          newVals = [...currentVals, val];
                                        } else {
                                          newVals = currentVals.filter(v => v !== val);
                                        }
                                        setCustomizationValues(prev => ({ ...prev, [opt.id]: newVals.join(', ') }));
                                      }}
                                      className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                                    />
                                    <label htmlFor={`${opt.id}-${val}`} className="ml-3 block text-sm font-medium text-gray-700">
                                      {val}
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Fallback to legacy textarea */
                    <textarea
                      value={customizationText}
                      onChange={(e) => setCustomizationText(e.target.value)}
                      placeholder="Enter any specific instructions or customization details here..."
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm resize-y"
                    />
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  ref={addToCartButtonRef}
                  onClick={handleAddToCart}
                  disabled={!selectedSize || !selectedColor}
                  className="flex-1 bg-primary text-white py-3 px-6 rounded-md font-semibold hover:bg-pink-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleToggleWishlist}
                  className="p-3 border border-gray-300 rounded-md text-primary hover:bg-pink-50"
                  aria-label={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <WishlistIcon className="w-6 h-6" isFilled={inWishlist} />
                </button>
              </div>
            </div>

            {/* Delivery Options Section */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <MapPinIcon className="w-6 h-6 text-primary" />
                Delivery Options
              </h3>
              {currentUser && selectedDeliveryAddress ? (
                // Logged-in user with addresses view
                <div>
                  <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800">{selectedDeliveryAddress.pincode}</p>
                        <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Home</span>
                      </div>
                      <p className="text-sm text-gray-500 truncate max-w-xs">{selectedDeliveryAddress.address}, {selectedDeliveryAddress.city}</p>
                    </div>
                    <button onClick={() => setIsAddressModalOpen(true)} className="text-sm font-semibold text-primary hover:underline flex-shrink-0">Change</button>
                  </div>
                  {deliveryInfo && (
                    <div className="mt-3 text-sm text-gray-700 space-y-1">
                      <p>Delivery by <span className="font-bold">{deliveryInfo.date}</span></p>
                      <p>{deliveryInfo.cod ? 'Cash on Delivery Available' : 'Cash on Delivery Not Available'}</p>
                    </div>
                  )}
                </div>
              ) : (
                // Guest or user with no addresses view
                <div>
                  <form onSubmit={handlePincodeCheck} className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={deliveryPincode}
                      onChange={(e) => setDeliveryPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter delivery pincode"
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-semibold text-primary border border-primary/50 rounded-md hover:bg-primary/5"
                    >
                      Check
                    </button>
                  </form>
                  {deliveryInfo ? (
                    <div className="mt-3 text-sm text-gray-700 space-y-1">
                      <p>Delivery by <span className="font-bold">{deliveryInfo.date}</span></p>
                      <p>{deliveryInfo.cod ? 'Cash on Delivery Available' : 'Cash on Delivery Not Available'}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 mt-2">Please enter pincode to check delivery availability.</p>
                  )}
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className="mt-10 border-t pt-6">
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <h3 className="text-lg font-medium text-gray-900">Specifications</h3>
                  <span className="text-primary group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </summary>
                <div className="mt-4 text-sm text-gray-600 grid grid-cols-2 gap-x-4 gap-y-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <React.Fragment key={key}>
                      <dt className="font-medium text-gray-500">{key}</dt>
                      <dd className="text-gray-700">{value}</dd>
                    </React.Fragment>
                  ))}
                </div>
              </details>
            </div>
            <div className="mt-4 border-t pt-4">
              <button
                onClick={() => setIsSimilarModalOpen(true)}
                className="text-lg font-medium text-primary hover:underline"
              >
                View Similar Products
              </button>
            </div>
          </div>
        </div>

        <CustomerPhotos photoPaths={customerPhotos} />

        <div className="my-16 border-t pt-12">
          <h2 className="text-2xl lg:text-3xl font-serif text-center text-gray-800 mb-8">Ratings & Reviews</h2>
          <ReviewsList reviews={productReviews} productRating={product.rating} totalReviews={product.reviews} />
        </div>

        {similarProducts.length > 0 && (
          <div className="my-16 border-t pt-12" id="similar-products-section">
            <h2 className="text-2xl lg:text-3xl font-serif text-center text-gray-800 mb-8">Similar Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {similarProducts.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
      <SimilarProductsModal
        isOpen={isSimilarModalOpen}
        onClose={() => setIsSimilarModalOpen(false)}
        products={similarProducts}
      />
      <AddressSelectionModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSelect={handleAddressSelect}
      />


      {/* Card Addons */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {cardAddons
          .filter(addon => addon.placement === 'product_page' && addon.isActive)
          .sort((a, b) => a.order - b.order)
          .map(addon => (
            <CardRenderer key={addon.id} addon={addon} />
          ))
        }
      </div>
    </div>
  );
};

export default ProductDetailPage;
