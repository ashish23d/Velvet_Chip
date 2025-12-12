
import React, { useState, useEffect } from 'react';
import { Product, Category } from '../../types.ts';
import PlusIcon from '../../components/icons/PlusIcon.tsx';
import TrashIcon from '../../components/icons/TrashIcon.tsx';
import ImageUploader from './ImageUploader.tsx';
import { BUCKETS } from '../../constants.ts';

interface ProductFormProps {
  productToEdit?: Product;
  categories: Category[];
  onSave: (product: any) => void;
  onCancel: () => void;
}

// Interfaces for local state management of variants
interface Variant {
  size: string;
  stock: number;
  price?: number;
  mrp?: number;
  sku?: string;
}
interface ColorVariant {
  id: string; // for React key
  name: string;
  hex: string;
  uuid: string;
  images: string[]; // Now stores publicIds
  sizes: Variant[];
}

const ProductForm: React.FC<ProductFormProps> = ({ productToEdit, categories, onSave, onCancel }) => {
  // Main product details state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [mrp, setMrp] = useState(0);
  const [price, setPrice] = useState(0);

  const [hsnCode, setHsnCode] = useState('');
  const [sku, setSku] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // State for color variants, which will hold images and sizes
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([]);
  const [showColors, setShowColors] = useState(true);
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);

  // Simple UUID generator fallback
  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setDescription(productToEdit.description);
      setCategory(productToEdit.category);
      setMrp(productToEdit.mrp);
      setPrice(productToEdit.price);
      setPrice(productToEdit.price);
      setHsnCode(productToEdit.hsnCode || '');
      setSku(productToEdit.sku || '');
      setTags(productToEdit.tags || []);
      setShowColors(productToEdit.show_colors !== false);

      const initialVariants: ColorVariant[] = productToEdit.colors.map((color, index) => ({
        id: `color-${productToEdit.id}-${index}`,
        name: color.name,
        hex: color.hex,
        uuid: color.uuid,
        images: color.images || (index === 0 ? productToEdit.images : []), // Backward compatibility
        // Load sizes from the color variant if available, otherwise fallback to global sizes
        sizes: (color.sizes && color.sizes.length > 0)
          ? color.sizes.map(s => ({
            size: s.size,
            stock: s.stock,
            price: s.price,
            mrp: s.mrp,
            sku: s.sku
          }))
          : (productToEdit.sizes.map(size => ({ size, stock: 10, price: undefined, mrp: undefined, sku: '' })))
      }));
      setColorVariants(initialVariants);

    } else {
      // Set up a default empty variant for new products
      setColorVariants([{
        id: `new-${Date.now()}`,
        name: '',
        hex: '#FFFFFF',
        uuid: generateUUID(),
        images: [],
        sizes: [{ size: 'S', stock: 10, price: undefined, mrp: undefined, sku: '' }]
      }]);
    }
  }, [productToEdit]);

  const addColorVariant = () => {
    setColorVariants(prev => [...prev, {
      id: `new-${Date.now()}`,
      name: '',
      hex: '#000000',
      uuid: generateUUID(),
      images: [],
      sizes: [{ size: 'S', stock: 10, price: undefined, mrp: undefined, sku: '' }]
    }]);
    setActiveVariantIndex(colorVariants.length); // Switch to new variant
  };

  const removeColorVariant = (id: string) => {
    if (colorVariants.length > 1) {
      setColorVariants(prev => prev.filter(v => v.id !== id));
      setActiveVariantIndex(0); // Reset to first variant to avoid index out of bounds
    } else {
      alert("A product must have at least one variant.");
    }
  };

  const handleColorChange = (id: string, field: 'name' | 'hex', value: string) => {
    setColorVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const addSizeToColor = (colorId: string) => {
    setColorVariants(prev => prev.map(v =>
      v.id === colorId ? { ...v, sizes: [...v.sizes, { size: '', stock: 10, price: undefined, mrp: undefined, sku: '' }] } : v
    ));
  };

  const removeSizeFromColor = (colorId: string, sizeIndex: number) => {
    setColorVariants(prev => prev.map(v => {
      if (v.id === colorId && v.sizes.length > 1) {
        return { ...v, sizes: v.sizes.filter((_, i) => i !== sizeIndex) }
      }
      if (v.id === colorId && v.sizes.length <= 1) {
        alert("A color variant must have at least one size.");
      }
      return v;
    }
    ));
  };

  const handleSizeChange = (colorId: string, sizeIndex: number, field: keyof Variant, value: string | number) => {
    setColorVariants(prev => prev.map(v => {
      if (v.id === colorId) {
        const newSizes = v.sizes.map((s, i) =>
          i === sizeIndex ? { ...s, [field]: value } : s
        );
        return { ...v, sizes: newSizes };
      }
      return v;
    }));
  };

  const handleImageUploadSuccess = (colorId: string, publicId: string) => {
    setColorVariants(prevVariants => prevVariants.map(v => {
      if (v.id === colorId) {
        // When a real image is uploaded, filter out any default placeholder images.
        const existingImages = v.images.filter(img => !img.includes('awaany_placeholders/'));
        return { ...v, images: [...existingImages, publicId] };
      }
      return v;
    }));
  };

  const handleImageRemove = (colorId: string, publicId: string) => {
    setColorVariants(prev => prev.map(v =>
      v.id === colorId ? { ...v, images: v.images.filter(img => img !== publicId) } : v
    ));

  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^,|,$/g, ''); // Clean leading/trailing commas
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allSizes = new Set<string>();
    colorVariants.forEach(cv => cv.sizes.forEach(s => {
      if (s.size) allSizes.add(s.size);
    }));

    const allVariantImages = colorVariants.flatMap(cv => cv.images || []);
    const mainImages = [...new Set(allVariantImages)];

    if (mainImages.length === 0) {
      mainImages.push(`awaany_placeholders/products/${name.replace(/\s+/g, '-') || 'default'}`);
    }

    /**
     * The final product data object is assembled here for saving.
     */
    const productData = {
      name,
      description,
      category,
      mrp: Number(mrp),
      price: Number(price),
      hsnCode,
      sku,
      show_colors: showColors,
      colors: colorVariants.map(cv => ({
        name: cv.name,
        hex: cv.hex,
        uuid: cv.uuid,
        images: (cv.images && cv.images.length > 0) ? cv.images : [mainImages[0]],
        sizes: cv.sizes.map(s => ({
          size: s.size,
          stock: Number(s.stock),
          price: s.price ? Number(s.price) : undefined,
          mrp: s.mrp ? Number(s.mrp) : undefined,
          sku: s.sku
        })) // Save variant-specific fields
      })),
      sizes: Array.from(allSizes), // Flatten sizes for global searching/filtering
      images: mainImages,
      specifications: productToEdit?.specifications || {},
      tags: tags,
    };

    if (productToEdit) {
      onSave({ ...productToEdit, ...productData });
    } else {
      onSave(productData);
    }
  };

  const inputClass = "block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Main Details */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Product Details</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
          <div className="sm:col-span-6">
            <label htmlFor="name" className={labelClass}>Product Name</label>
            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className={inputClass} required />
          </div>
          <div className="sm:col-span-6">
            <label htmlFor="description" className={labelClass}>Description</label>
            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className={inputClass}></textarea>
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="category" className={labelClass}>Category</label>
            <select id="category" value={category} onChange={e => setCategory(e.target.value)} className={inputClass} required>
              <option value="">Select a category</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="hsnCode" className={labelClass}>HSN Code</label>
            <input type="text" id="hsnCode" value={hsnCode} onChange={e => setHsnCode(e.target.value)} className={inputClass} placeholder="e.g., 6204" />
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="sku" className={labelClass}>SKU (Main Product Code)</label>
            <input type="text" id="sku" value={sku} onChange={e => setSku(e.target.value)} className={inputClass} placeholder="e.g., PROD-001" />
          </div>
          <div className="sm:col-span-6">
            <label className={labelClass}>Tags (for search & filtering)</label>
            <p className="text-xs text-gray-500 mb-2">Type a tag and press Enter or Comma to add. E.g. "Vanilla", "1kg", "Sugar Free"</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="ml-1.5 inline-flex items-center justify-center text-primary hover:text-pink-700">
                    <span className="sr-only">Remove {tag}</span>
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              className={inputClass}
              placeholder="Add tags..."
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Pricing</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="mrp" className={labelClass}>MRP (Maximum Retail Price)</label>
            <input type="number" id="mrp" value={mrp} onChange={e => setMrp(Number(e.target.value))} className={inputClass} />
          </div>
          <div>
            <label htmlFor="price" className={labelClass}>Sale Price</label>
            <input type="number" id="price" value={price} onChange={e => setPrice(Number(e.target.value))} className={inputClass} required />
          </div>
        </div>
      </div>

      {/* Variants */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Variants (Colors, Sizes & Images)</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Colors</label>
              <button
                type="button"
                role="switch"
                aria-checked={showColors}
                onClick={() => setShowColors(!showColors)}
                className={`${showColors ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
              >
                <span aria-hidden="true" className={`${showColors ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
              </button>
            </div>
            {showColors && (
              <button type="button" onClick={addColorVariant} className="flex items-center gap-1 text-sm font-medium text-primary hover:text-pink-700">
                <PlusIcon className="w-4 h-4" /> Add Color
              </button>
            )}
          </div>
        </div>
        <div className="space-y-6">

          {/* Variant Selector Tabs */}
          {showColors && (
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
              {colorVariants.map((variant, index) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setActiveVariantIndex(index)}
                  className={`px-4 py-2 rounded-t-md text-sm font-medium transition-colors ${activeVariantIndex === index ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  {variant.name || `Color ${index + 1}`}
                </button>
              ))}
            </div>
          )}

          {/* Active Variant Form */}
          {colorVariants.length > 0 && colorVariants[activeVariantIndex] && (
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/50 dark:bg-gray-900/50">
              {(() => {
                const variant = colorVariants[activeVariantIndex];
                return (
                  <>
                    <div className="flex justify-between items-start gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
                        {showColors && (
                          <>
                            <div>
                              <label htmlFor={`color-name-${variant.id}`} className={labelClass}>Color Name</label>
                              <input type="text" id={`color-name-${variant.id}`} value={variant.name} onChange={e => handleColorChange(variant.id, 'name', e.target.value)} placeholder="e.g. Royal Blue" className={inputClass} required={showColors} />
                            </div>
                            <div>
                              <label htmlFor={`color-hex-${variant.id}`} className={labelClass}>Color Hex</label>
                              <div className="flex items-center gap-2">
                                <input type="text" id={`color-hex-${variant.id}`} value={variant.hex} onChange={e => handleColorChange(variant.id, 'hex', e.target.value)} placeholder="#4169E1" className={inputClass} required={showColors} />
                                <input type="color" value={variant.hex} onChange={e => handleColorChange(variant.id, 'hex', e.target.value)} className="h-9 w-10 p-0.5 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer bg-white dark:bg-gray-700" />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      {showColors && colorVariants.length > 1 && (
                        <button type="button" onClick={() => removeColorVariant(variant.id)} className="mt-6 text-gray-400 hover:text-red-500">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <label className={labelClass}>
                        Sizes & Stock
                        <span className="block text-xs font-normal text-gray-500 mt-1">
                          This field is changeable as per product. You can type the size, grams, weight, etc.
                        </span>
                      </label>
                      <div className="space-y-2 mt-2">
                        {variant.sizes.map((size, sizeIndex) => (
                          <div key={sizeIndex} className="flex items-center gap-2">
                            <input type="text" placeholder="Size (e.g. XL)" value={size.size} onChange={e => handleSizeChange(variant.id, sizeIndex, 'size', e.target.value)} className={`${inputClass} w-24`} required />
                            <input type="number" placeholder="Stock" min="0" value={size.stock} onChange={e => handleSizeChange(variant.id, sizeIndex, 'stock', Number(e.target.value))} className={`${inputClass} w-24`} required />
                            <input type="number" placeholder="Price (Opt)" min="0" value={size.price || ''} onChange={e => handleSizeChange(variant.id, sizeIndex, 'price', Number(e.target.value))} className={`${inputClass} w-28`} title="Override base price for this variant" />
                            <input type="number" placeholder="MRP (Opt)" min="0" value={size.mrp || ''} onChange={e => handleSizeChange(variant.id, sizeIndex, 'mrp', Number(e.target.value))} className={`${inputClass} w-28`} title="Override base MRP for this variant" />
                            <input type="text" placeholder="Variant SKU" value={size.sku || ''} onChange={e => handleSizeChange(variant.id, sizeIndex, 'sku', e.target.value)} className={`${inputClass} flex-grow`} />
                            {variant.sizes.length > 1 && (
                              <button type="button" onClick={() => removeSizeFromColor(variant.id, sizeIndex)} className="text-gray-400 hover:text-red-500 flex-shrink-0">
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button type="button" onClick={() => addSizeToColor(variant.id)} className="mt-2 flex items-center gap-1 text-sm font-medium text-primary hover:text-pink-700">
                        <PlusIcon className="w-4 h-4" /> Add Variant
                      </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <label className={labelClass}>Images for this color</label>
                      <div className="mt-2">
                        <ImageUploader
                          bucket={BUCKETS.PRODUCTS}
                          pathPrefix={`prod_${productToEdit?.id || 'new'}/${name || 'untitled'}/${variant.name || 'default'}`}
                          images={variant.images}
                          onImageUpload={(publicId) => handleImageUploadSuccess(variant.id, publicId)}
                          onImageRemove={(publicId) => handleImageRemove(variant.id, publicId)}
                        />
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
          {colorVariants.length === 0 && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">No variants defined. Please add at least one color variant.</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <button type="button" onClick={onCancel} className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
        <button type="submit" className="bg-primary text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-pink-700">Save Product</button>
      </div>
    </form>
  );
};

export default ProductForm;
