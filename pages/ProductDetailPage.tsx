
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';
import { useProduct, useProductsByCategory } from '../services/api/products.api'; // Added hooks
import { supabase } from '../services/supabaseClient';
import { Product, Address } from '../types.ts';
import SupabaseImage from '../components/shared/SupabaseImage';
import { BUCKETS } from '../constants.ts';
import Rating from '../components/product/Rating';
import WishlistIcon from '../components/icons/WishlistIcon.tsx';
import PlusIcon from '../components/icons/PlusIcon.tsx';
import MinusIcon from '../components/icons/MinusIcon.tsx';
import ReviewsList from '../components/product/ReviewsList';
import CustomerPhotos from '../components/media/CustomerPhotos';
import ProductCard from '../components/product/ProductCard';
import EditableWrapper from '../components/shared/EditableWrapper';
import SimilarProductsModal from '../components/product/SimilarProductsModal';
import MapPinIcon from '../components/icons/MapPinIcon.tsx';
import AddressSelectionModal from '../components/checkout/AddressSelectionModal';
import CardRenderer from '../components/home/CardRenderer';

const ProductDetailSkeleton = () => (
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
      <div className="flex flex-col-reverse md:flex-row gap-6">
        <div className="flex md:flex-col gap-4 md:w-24 flex-shrink-0">
          <div className="w-20 h-24 md:w-full bg-gray-200 rounded-lg"></div>
          <div className="w-20 h-24 md:w-full bg-gray-200 rounded-lg"></div>
          <div className="w-20 h-24 md:w-full bg-gray-200 rounded-lg"></div>
        </div>
        <div className="flex-grow aspect-[3/4] bg-gray-200 rounded-xl"></div>
      </div>
      <div className="py-4 space-y-8">
        <div className="h-12 bg-gray-300 rounded w-3/4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="h-10 bg-gray-300 rounded w-1/2"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-14 bg-gray-300 rounded"></div>
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
    addToCart,
    toggleWishlist,
    isProductInWishlist,
    triggerFlyToCartAnimation,
    currentUser,
    cardAddons,
    deliverySettings,
    serviceableRules
  } = useAppContext();

  // 1. Fetch Main Product
  const { data: productData, isLoading: isProductLoading } = useProduct(Number(id) || 0);

  // 2. Fetch Similar Products (dependent on product category)
  // We can't fetch similar until we have the product, so we pass an empty string if no category yet
  // Ideally we'd use 'enabled' option, but useProductsByCategory handles empty input gracefully (returns empty/loading)
  // Note: The hook doesn't support limit yet, so we fetch all and slice locally or rely on the hook to return what's available.
  const { data: similarDataRaw } = useProductsByCategory(productData?.category || '');

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);

  // Sync Query Data to Local State
  useEffect(() => {
    if (productData) {
      setProduct(productData);

      // Initialize selection states only if they aren't set (to avoid resetting on background refetch)
      // Actually, if we get fresh data that changes variants, we might want to reset.
      // For now, let's simplistic approach: set default only if selectedColor is null

      const initialColor = productData.colors?.[0] || null;
      if (!selectedColor) { // Only set defaults on first load
        setSelectedColor(initialColor);
        const availableSizes = (initialColor?.sizes && initialColor.sizes.length > 0)
          ? initialColor.sizes.map(s => s.size)
          : productData.sizes;
        setSelectedSize(availableSizes?.[0] || null);
        setMainImage(initialColor?.images?.[0] || productData.images?.[0] || '');
      }
    }
  }, [productData]); // Removed selectedColor dependency to prevent loop, only run when data arrives

  useEffect(() => {
    if (similarDataRaw && productData) {
      setSimilarProducts(similarDataRaw.filter(p => p.id !== productData.id));
    }
  }, [similarDataRaw, productData]);


  const isLoading = isProductLoading;

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

  // Calculate dynamic rating
  const { averageRating, totalReviews } = useMemo(() => {
    if (!productReviews || productReviews.length === 0) return { averageRating: 0, totalReviews: 0 };
    const total = productReviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      averageRating: Number((total / productReviews.length).toFixed(1)),
      totalReviews: productReviews.length
    };
  }, [productReviews]);

  const customerPhotos = useMemo(() => {
    return productReviews.flatMap(r => r.productImages || []);
  }, [productReviews]);

  // Real delivery check function
  const checkDelivery = async (pincode: string) => {
    if (!pincode || pincode.length !== 6) {
      setDeliveryInfo(null);
      return;
    }

    try {
      let isDeliverable = false;
      let isPickupAvailable = false;
      let locationData: any = null;

      // 1. Fetch Location Details to know City/State
      const { data } = await supabase.from('master_locations').select('*').eq('pincode', pincode).single();
      locationData = data;

      const userCity = locationData?.city;
      const userState = locationData?.state;

      // 2. Check Pickup Availability (User City == Store City)
      if (deliverySettings?.store_city && userCity && deliverySettings.store_city.toLowerCase() === userCity.toLowerCase()) {
        isPickupAvailable = true;
      }

      // 3. Check Delivery Availability
      if (deliverySettings?.is_all_india_serviceable) {
        isDeliverable = true;
      } else {
        // Check Rules Preference: Pincode -> City -> State
        const pincodeRule = serviceableRules.find(r => r.rule_type === 'pincode' && r.value === pincode);
        if (pincodeRule) {
          isDeliverable = pincodeRule.is_allowed;
        } else {
          const cityRule = userCity ? serviceableRules.find(r => r.rule_type === 'city' && r.value.toLowerCase() === userCity.toLowerCase()) : null;
          if (cityRule) {
            isDeliverable = cityRule.is_allowed;
          } else {
            const stateRule = userState ? serviceableRules.find(r => r.rule_type === 'state' && r.value.toLowerCase() === userState.toLowerCase()) : null;
            if (stateRule) {
              isDeliverable = stateRule.is_allowed;
            }
          }
        }
      }

      if (isDeliverable || isPickupAvailable) {
        const today = new Date();
        const deliveryDate = new Date(today);
        deliveryDate.setDate(today.getDate() + (isPickupAvailable ? 1 : 5)); // 1 day for pickup, 5 for delivery

        setDeliveryInfo({
          date: deliveryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          cod: true, // Assuming COD available for now
          isPickup: isPickupAvailable && !isDeliverable ? true : false, // Just a flag if strictly pickup, but UI handles flexible
          message: isPickupAvailable ? (isDeliverable ? "Delivery & Store Pickup Available" : "Store Pickup Only") : "Standard Delivery Available"
        });
      } else {
        setDeliveryInfo({ date: '', cod: false, message: "Not deliverable at this location." });
      }

    } catch (error) {
      console.error("Delivery Check Error", error);
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
        <h1 className="text-3xl font-bold text-gray-900">Product not found</h1>
        <button onClick={() => navigate('/')} className="text-primary mt-6 inline-block font-medium hover:underline">Go back to Home</button>
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">

          {/* Image Gallery */}
          <div className="flex flex-col-reverse md:flex-row gap-4 lg:gap-6 lg:sticky lg:top-24">
            <div className={`flex md:flex-col gap-3 lg:gap-4 overflow-x-auto md:overflow-y-auto no-scrollbar md:w-20 lg:w-24 flex-shrink-0 transition-all duration-300`}>
              {/* Show only first 4 images or all if expanded */}
              {(isGalleryExpanded ? allImagesForProduct : allImagesForProduct.slice(0, 4)).map(img => (
                <button
                  key={img}
                  onClick={() => setMainImage(img)}
                  className={`w-16 h-20 md:w-full md:h-24 lg:h-28 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${mainImage === img ? 'border-gray-900 ring-1 ring-gray-900' : 'border-transparent hover:border-gray-300'}`}
                >
                  <SupabaseImage bucket={BUCKETS.PRODUCTS} imagePath={img} alt={`${product.name} thumbnail`} className="w-full h-full object-cover" />
                </button>
              ))}
              {allImagesForProduct.length > 4 && (
                <button
                  onClick={() => setIsGalleryExpanded(!isGalleryExpanded)}
                  className="w-16 h-20 md:w-full md:h-12 flex-shrink-0 bg-gray-50 rounded-lg flex items-center justify-center text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  {isGalleryExpanded ? 'Show Less' : `+${allImagesForProduct.length - 4}`}
                </button>
              )}
            </div>

            <div className="flex-grow aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden relative shadow-sm">
              <SupabaseImage
                bucket={BUCKETS.PRODUCTS}
                imagePath={mainImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Details - Right Column */}
          <div className="py-2 space-y-6 lg:space-y-8">
            <EditableWrapper editUrl={`/admin/products/edit/${product.id}`}>
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold tracking-tight text-gray-900 font-serif leading-tight">{product.name}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <div className="flex items-center gap-1">
                    <Rating rating={averageRating} />
                    <span className="text-sm font-bold text-gray-900 ml-1">{averageRating}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-500 border-l pl-4 border-gray-300">
                    {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}
                  </span>
                </div>
              </div>

              <p className="text-base text-gray-600 leading-relaxed max-w-2xl">{product.description}</p>

              {(() => {
                // Calculate price and MRP based on selected variant
                const currentVariantSize = selectedColor?.sizes?.find(s => s.size === selectedSize);
                const displayPrice = currentVariantSize?.price || product.price;
                const displayMrp = currentVariantSize?.mrp || product.mrp;
                const discountPercentage = Math.round(((displayMrp - displayPrice) / displayMrp) * 100);

                return (
                  <div className="flex flex-col mt-2">
                    <div className="flex items-end gap-3">
                      <p className="text-4xl font-bold text-gray-900">₹{displayPrice}</p>
                      {discountPercentage > 0 && (
                        <>
                          <p className="text-xl text-gray-400 line-through mb-1">₹{displayMrp}</p>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 mb-2">
                            SAVE {discountPercentage}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}
            </EditableWrapper>

            <div className="border-t border-gray-100 pt-8 space-y-8">
              {/* Color Selector */}
              {product.show_colors !== false && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3 uppercase tracking-wide">Color: <span className="font-bold ml-1">{selectedColor?.name}</span></h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map(color => (
                      <button
                        key={color.uuid}
                        onClick={() => handleColorSelect(color)}
                        className={`w-10 h-10 rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 ${selectedColor?.name === color.name ? 'border-gray-900 scale-110' : 'border-gray-200 hover:border-gray-400'}`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                        aria-label={`Select color ${color.name}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Variant Selector (Cards) */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">{product.variant_label || 'Size'}</h3>

                </div>

                <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar snap-x">
                  {currentAvailableSizes.length > 0 ? (
                    (() => {
                      // Resolve full variant objects if possible
                      const variantsToDisplay = selectedColor?.sizes || product.sizes.map(s => ({ size: s, price: undefined, mrp: undefined, image: undefined }));

                      return variantsToDisplay.map((variantObj: any, idx) => {
                        const sizeName = typeof variantObj === 'string' ? variantObj : variantObj.size;
                        const isSelected = selectedSize === sizeName;
                        const variantPrice = typeof variantObj !== 'string' ? variantObj.price : undefined;
                        const variantImage = typeof variantObj !== 'string' ? variantObj.image : undefined;

                        // Check availability if needed (though we show all usually)

                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedSize(sizeName);
                              if (variantImage) {
                                setMainImage(variantImage);
                              } else {
                                if (selectedColor?.images?.[0]) {
                                  setMainImage(selectedColor.images[0]);
                                } else if (product.images?.[0]) {
                                  setMainImage(product.images[0]);
                                }
                              }
                            }}
                            className={`
                              flex-shrink-0 snap-start
                              relative flex flex-col items-center justify-between
                              min-w-[5rem] md:min-w-[6rem] p-2 rounded-xl border-2 transition-all duration-200
                              ${isSelected
                                ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900 shadow-sm'
                                : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm'}
                            `}
                          >
                            {/* Variant Image (Small) */}
                            {variantImage ? (
                              <div className="w-10 h-10 mb-2 rounded-md overflow-hidden bg-gray-100 border border-gray-100">
                                <SupabaseImage
                                  bucket={BUCKETS.PRODUCTS}
                                  imagePath={variantImage}
                                  alt={sizeName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              // Fallback icon or spacer if no image specific to variant, 
                              // maybe show nothing to keep it compact? Or show main image?
                              // User asked for "small img". If missing, maybe just name/price.
                              null
                            )}

                            <span className={`text-sm font-bold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                              {sizeName}
                            </span>

                            {/* Optional Variant Price */}
                            {/* Only show if different/specific? Or always if available? User logic implies override. */}
                            {variantPrice && (
                              <span className="text-xs text-gray-500 font-medium mt-1">₹{variantPrice}</span>
                            )}
                          </button>
                        );
                      });
                    })()
                  ) : (
                    <p className="text-sm text-gray-500 italic">No variants available.</p>
                  )}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-3">Quantity</h3>
                <div className="flex items-center border border-gray-300 rounded-lg w-fit transition-colors hover:border-gray-400">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 text-gray-600 hover:text-primary transition-colors"><MinusIcon className="w-4 h-4" /></button>
                  <span className="w-12 text-center text-base font-semibold text-gray-900">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="p-3 text-gray-600 hover:text-primary transition-colors"><PlusIcon className="w-4 h-4" /></button>
                </div>
              </div>

              {/* Customization / Special Instructions */}
              {product.allow_customization && (
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
                    Personalize Your Order
                  </h3>

                  {product.customization_options && product.customization_options.length > 0 ? (
                    <div className="space-y-4">
                      {product.customization_options.map(opt => (
                        <div key={opt.id}>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {opt.label} {opt.required && <span className="text-red-500">*</span>}
                          </label>

                          {opt.type === 'text' && (
                            <input
                              type="text"
                              value={customizationValues[opt.id] || ''}
                              onChange={e => setCustomizationValues(prev => ({ ...prev, [opt.id]: e.target.value }))}
                              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm py-2.5 transition-shadow"
                              placeholder={`Enter ${opt.label}`}
                            />
                          )}

                          {opt.type === 'radio' && (
                            <div className="space-y-2 mt-2">
                              {opt.options?.map(val => (
                                <div key={val} className="flex items-center">
                                  <input
                                    type="radio"
                                    id={`${opt.id}-${val}`}
                                    name={opt.id}
                                    value={val}
                                    checked={customizationValues[opt.id] === val}
                                    onChange={e => setCustomizationValues(prev => ({ ...prev, [opt.id]: e.target.value }))}
                                    className="focus:ring-gray-900 h-4 w-4 text-gray-900 border-gray-300"
                                  />
                                  <label htmlFor={`${opt.id}-${val}`} className="ml-3 block text-sm font-medium text-gray-700">
                                    {val}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}

                          {opt.type === 'checkbox' && (
                            <div className="space-y-2 mt-2">
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
                                      className="focus:ring-gray-900 h-4 w-4 text-gray-900 border-gray-300 rounded"
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
                      placeholder="Enter specific instructions or customization details..."
                      rows={3}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 sm:text-sm py-2.5 resize-y transform transition-shadow"
                    />
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  ref={addToCartButtonRef}
                  onClick={handleAddToCart}
                  disabled={!selectedSize || !selectedColor}
                  className="flex-1 bg-gray-900 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-black transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleToggleWishlist}
                  className={`p-4 border rounded-xl transition-colors ${inWishlist ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600'}`}
                  aria-label={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <WishlistIcon className="w-6 h-6" isFilled={inWishlist} />
                </button>
              </div>
            </div>

            {/* Delivery Options Section */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
                <MapPinIcon className="w-5 h-5 text-gray-900" />
                Delivery Availability
              </h3>
              {currentUser && selectedDeliveryAddress ? (
                // Logged-in user with addresses view
                <div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800">{selectedDeliveryAddress.pincode}</p>
                        <span className="text-[10px] font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full uppercase">Home</span>
                      </div>
                      <p className="text-sm text-gray-500 truncate max-w-xs mt-0.5">{selectedDeliveryAddress.address}, {selectedDeliveryAddress.city}</p>
                    </div>
                    <button onClick={() => setIsAddressModalOpen(true)} className="text-sm font-semibold text-primary hover:text-pink-700 underline transition-colors">Change</button>
                  </div>
                  {deliveryInfo && (
                    <div className="mt-4 text-sm text-gray-700 flex flex-col gap-1 pl-1">
                      {deliveryInfo.message && (
                        <div className={`font-semibold ${deliveryInfo.message.includes('Not') ? 'text-red-600' : 'text-green-600'}`}>
                          {deliveryInfo.message}
                        </div>
                      )}

                      {deliveryInfo.date && (
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          <p>Estimated by <span className="font-bold">{deliveryInfo.date}</span></p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                // Guest or user with no addresses view
                <div>
                  <form onSubmit={handlePincodeCheck} className="flex items-center gap-2 max-w-sm">
                    <input
                      type="text"
                      maxLength={6}
                      value={deliveryPincode}
                      onChange={(e) => setDeliveryPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter pincode"
                      className="flex-grow px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 text-sm font-semibold text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Check
                    </button>
                  </form>
                  {deliveryInfo ? (
                    <div className="mt-4 text-sm text-gray-700 flex flex-col gap-1 pl-1">
                      {deliveryInfo.message && (
                        <div className={`font-semibold ${deliveryInfo.message.includes('Not') ? 'text-red-600' : 'text-green-600'}`}>
                          {deliveryInfo.message}
                        </div>
                      )}
                      {deliveryInfo.date && (
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          <p>By <span className="font-bold">{deliveryInfo.date}</span></p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 mt-2 pl-1">Enter pincode to see delivery dates.</p>
                  )}
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className="border-t border-gray-100 pt-6">
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer list-none py-2">
                  <h3 className="text-base font-bold text-gray-900">Product Specifications</h3>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform duration-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </summary>
                <div className="mt-4 text-sm text-gray-600 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <dt className="text-gray-500 text-xs uppercase tracking-wider font-medium">{key}</dt>
                      <dd className="text-gray-900 font-medium mt-0.5">{value}</dd>
                    </div>
                  ))}
                </div>
              </details>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setIsSimilarModalOpen(true)}
                className="text-sm font-semibold text-primary hover:text-pink-700 hover:underline transition-colors flex items-center gap-1"
              >
                View Similar Products
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
            </div>
          </div>
        </div>

        <CustomerPhotos photoPaths={customerPhotos} />

        <div className="my-20 border-t border-gray-100 pt-16">
          <h2 className="text-3xl font-bold font-serif text-center text-gray-900 mb-10">Ratings & Reviews</h2>
          <ReviewsList reviews={productReviews} productRating={product.rating} totalReviews={product.reviews} />
        </div>

        {similarProducts.length > 0 && (
          <div className="my-20 border-t border-gray-100 pt-16" id="similar-products-section">
            <h2 className="text-3xl font-bold font-serif text-center text-gray-900 mb-10">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
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
