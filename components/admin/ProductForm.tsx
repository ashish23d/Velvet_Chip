import React, { useState, useEffect } from 'react';
import SupabaseImage from '../shared/SupabaseImage';
import { Product, Category, CustomizationOption } from '../../types.ts';
import PlusIcon from '../../components/icons/PlusIcon.tsx';
import TrashIcon from '../../components/icons/TrashIcon.tsx';
import ImageUploader from './ImageUploader.tsx';
import { BUCKETS } from '../../constants.ts';

interface ProductFormProps {
  productToEdit?: Product;
  categories: Category[];
  onSave: (product: any) => void;
  onCancel: () => void;
  isSaving?: boolean;
  taxSettings?: any; // Added taxSettings prop
}

// Interfaces for local state management of variants
interface Variant {
  size: string;
  stock: number;
  base_price?: number; // New: Variant Base Price
  price?: number;      // Calculated Final Selling Price
  mrp?: number;
  sku?: string;
  image?: string;
}
interface ColorVariant {
  id: string; // for React key
  name: string;
  hex: string;
  uuid: string;
  images: string[]; // Now stores publicIds
  sizes: Variant[];
}

const ProductForm: React.FC<ProductFormProps> = ({ productToEdit, categories, onSave, onCancel, isSaving = false, taxSettings }) => {
  // Main product details state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [basePrice, setBasePrice] = useState(0); // New: Base Price (Excl Tax)
  const [customTaxPercent, setCustomTaxPercent] = useState<number | ''>(''); // New: Optional Override
  const [taxPercent, setTaxPercent] = useState(0); // Calculated/Resolved Tax %
  const [taxAmount, setTaxAmount] = useState(0);   // Calculated Tax Amount
  const [price, setPrice] = useState(0);           // Final Selling Price (MRP)
  const [mrp, setMrp] = useState(0);               // Display MRP (List Price)


  const [sku, setSku] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [variantLabel, setVariantLabel] = useState('Size'); // Default to 'Size'

  // State for color variants, which will hold images and sizes
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([]);
  const [showColors, setShowColors] = useState(true);
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);

  // Customization Options State
  const [allowCustomization, setAllowCustomization] = useState(false);
  const [customizationOptions, setCustomizationOptions] = useState<CustomizationOption[]>([]);

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

  // Auto-Calculate Tax & Price
  // Triggered when: basePrice, category, customTaxPercent, or global settings change.
  useEffect(() => {
    // 1. Resolve Tax Rate
    let resolvedTaxRate = 0;

    if (customTaxPercent !== '' && customTaxPercent !== null && customTaxPercent !== undefined) {
      // Priority 1: Product Custom Override
      resolvedTaxRate = Number(customTaxPercent);
    } else if (category) {
      // Priority 2: Category Level Tax
      const selectedCat = categories.find(c => c.id === category);
      if (selectedCat && selectedCat.tax_rate !== undefined) {
        resolvedTaxRate = Number(selectedCat.tax_rate);
      } else {
        // Fallback if category has no specific tax (or 0) -> Check Global
        // However, plan says "Category tax (if exists)". If category tax is 0, is it "exists"?
        // Usually, 0 is a valid tax rate. So if undefined, use global.
        // But for safety, let's use global if category tax is explicitly not set or separate logic.
        // User's plan: "Category tax (if exists)".
        // Our DB column default is 0.
        // Let's assume if category tax is 0, it's 0.
        // But we need to know if it was *intended* to be fallback.
        // For simplicity: If category has tax_rate, use it.
        // If not found, use global.
        resolvedTaxRate = selectedCat?.tax_rate ?? (taxSettings?.global_rate || 0);
      }
    } else {
      // Priority 3: Global (Fallback)
      resolvedTaxRate = taxSettings?.global_rate || 0;
    }

    // Helper for safe rounding
    const round2 = (n: number) => Math.round(n * 100) / 100;

    // 2. Calculate Tax Amount
    // taxAmount = round2(basePrice * taxPercent / 100)
    const calculatedTaxAmount = round2(basePrice * resolvedTaxRate / 100);

    // 3. Calculate Final Selling Price
    // Round to nearest integer (Rupee) as per Indian standards (e.g. 299.65 -> 300)
    const calculatedSellingPrice = Math.round(basePrice + calculatedTaxAmount);

    setTaxPercent(resolvedTaxRate);
    setTaxAmount(calculatedTaxAmount);
    setPrice(calculatedSellingPrice);

  }, [basePrice, category, customTaxPercent, taxSettings, categories]);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setDescription(productToEdit.description);
      setCategory(productToEdit.category);
      // Initialize Pricing & Tax
      setBasePrice(productToEdit.base_price || productToEdit.price || 0);
      setCustomTaxPercent(productToEdit.custom_tax_percent ?? '');
      setTaxPercent(productToEdit.tax_percent || 0);
      setTaxAmount(productToEdit.tax_amount || 0);
      setPrice(productToEdit.price);
      setMrp(productToEdit.mrp);

      setPrice(productToEdit.price);
      setMrp(productToEdit.mrp);

      setSku(productToEdit.sku || '');
      setTags(productToEdit.tags || []);
      setVariantLabel(productToEdit.variant_label || 'Size');
      setShowColors(productToEdit.show_colors !== false);
      setAllowCustomization(productToEdit.allow_customization || false);

      // Sanitize customization options to ensure 'options' array exists
      const sanitizedOptions = (productToEdit.customization_options || []).map(opt => ({
        ...opt,
        options: opt.options || []
      }));
      setCustomizationOptions(sanitizedOptions);

      const initialVariants = productToEdit.colors.map((color, index) => ({
        id: `color-${productToEdit.id}-${index}`,
        name: color.name,
        hex: color.hex,
        uuid: color.uuid,
        images: color.images || (index === 0 ? productToEdit.images : []),
        sizes: (color.sizes && color.sizes.length > 0)
          ? color.sizes.map(s => ({
            size: s.size,
            stock: s.stock,
            base_price: (s as any).base_price || s.price, // Init base_price
            price: s.price,
            mrp: s.mrp,
            sku: s.sku,
            image: (s as any).image
          }))
          : (productToEdit.sizes.map(size => ({ size, stock: 10, base_price: undefined, price: undefined, mrp: undefined, sku: '', image: undefined })))
      }));
      setColorVariants(initialVariants);

    } else {
      // Set up a default empty variant for new products
      setColorVariants([{
        id: `new- ${Date.now()} `,
        name: '',
        hex: '#FFFFFF',
        uuid: generateUUID(),
        images: [],
        sizes: [{ size: 'S', stock: 10, base_price: undefined, price: undefined, mrp: undefined, sku: '', image: undefined }]
      }]);
    }
  }, [productToEdit?.id]);

  const addColorVariant = () => {
    setColorVariants(prev => [...prev, {
      id: `new- ${Date.now()} `,
      name: '',
      hex: '#000000',
      uuid: generateUUID(),
      images: [],
      sizes: [{ size: 'S', stock: 10, base_price: undefined, price: undefined, mrp: undefined, sku: '', image: undefined }]
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
      v.id === colorId ? { ...v, sizes: [...v.sizes, { size: '', stock: 10, base_price: undefined, price: undefined, mrp: undefined, sku: '', image: undefined }] } : v
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
        const newSizes = v.sizes.map((s, i) => {
          if (i !== sizeIndex) return s;

          const updatedSize = { ...s, [field]: value };

          // Auto-Calc Variant Price if Base Price changes
          if (field === 'base_price') {
            const base = Number(value);
            if (base > 0) {
              const tax = (base * taxPercent) / 100; // Use current taxPercent from state
              updatedSize.price = Math.round(base + tax);
            } else {
              updatedSize.price = undefined;
            }
          }
          return updatedSize;
        });
        return { ...v, sizes: newSizes };
      }
      return v;
    }));
  };

  const autoGenerateSKUs = () => {
    if (!name || name.length < 3) {
      alert("Please enter a valid product name (at least 3 chars) to generate SKUs.");
      return;
    }
    const productPrefix = name.substring(0, 3).toUpperCase().replace(/\s/g, '');

    setColorVariants(prevVariants => prevVariants.map(color => {
      // Use color name or 'VAR' if empty
      const colorCode = color.name ? color.name.toUpperCase().substring(0, 3) : 'VAR';

      const newSizes = color.sizes.map(size => {
        // Only generate if SKU is empty to avoid overwriting existing ones
        if (!size.sku || size.sku.trim() === '') {
          const sizeCode = size.size ? size.size.toUpperCase() : 'OS';
          return { ...size, sku: `${productPrefix} -${colorCode} -${sizeCode} ` };
        }
        return size;
      });
      return { ...color, sizes: newSizes };
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

  // Helper to handle single file upload for a specific variant row
  const handleVariantRowImageUpload = (colorId: string, sizeIndex: number, file: File) => {
    // We'll reuse the ImageUploader logic implicitly or just use a direct upload function
    // For now, let's assume we can upload to the same bucket
    const pathPrefix = `prod_${productToEdit?.id || 'new'}/${name || 'untitled'}/variants`;
    const filePath = `${pathPrefix}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;

    // We need to access supabase client here, but it's not in props.
    // However, ImageUploader uses it. Let's just use the `onImageUpload` prop strategy of ImageUploader
    import('../../services/supabaseClient.ts').then(({ supabase }) => {
      supabase.storage
        .from(BUCKETS.PRODUCTS)
        .upload(filePath, file)
        .then(({ data, error }) => {
          if (error) {
            console.error('Error uploading variant image:', error);
            alert('Failed to upload variant image');
          } else if (data) {
            const publicPath = data.path; // Or full public URL depending on how you store it.
            // Based on existing code, it seems we store the path relative to bucket?
            // Let's check ImageUploader... it returns publicId.
            // We'll store the path.
            handleSizeChange(colorId, sizeIndex, 'image', publicPath);
          }
        });
    });
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

  // Customization Handlers
  const addCustomizationOption = () => {
    setCustomizationOptions(prev => [...prev, {
      id: generateUUID(),
      type: 'text',
      label: '',
      options: [],
      required: false
    }]);
  };

  const removeCustomizationOption = (id: string) => {
    setCustomizationOptions(prev => prev.filter(opt => opt.id !== id));
  };

  const handleCustomizationChange = (id: string, field: keyof CustomizationOption, value: any) => {
    setCustomizationOptions(prev => prev.map(opt =>
      opt.id === id ? { ...opt, [field]: value } : opt
    ));
  };

  const addOptionValue = (customizationId: string) => {
    setCustomizationOptions(prev => prev.map(opt =>
      opt.id === customizationId ? { ...opt, options: [...opt.options, ''] } : opt
    ));
  };

  const updateOptionValue = (customizationId: string, optionIndex: number, value: string) => {
    setCustomizationOptions(prev => prev.map(opt => {
      if (opt.id === customizationId) {
        const newOptions = [...opt.options];
        newOptions[optionIndex] = value;
        return { ...opt, options: newOptions };
      }
      return opt;
    }));
  };

  const removeOptionValue = (customizationId: string, optionIndex: number) => {
    setCustomizationOptions(prev => prev.map(opt => {
      if (opt.id === customizationId) {
        return { ...opt, options: opt.options.filter((_, i) => i !== optionIndex) };
      }
      return opt;
    }));
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
      mainImages.push(`awaany_placeholders / products / ${name.replace(/\s+/g, '-') || 'default'} `);
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
      base_price: Number(basePrice),
      tax_percent: Number(taxPercent),
      tax_amount: Number(taxAmount),

      custom_tax_percent: customTaxPercent !== '' ? Number(customTaxPercent) : null,
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
          base_price: s.base_price ? Number(s.base_price) : undefined,
          price: s.price ? Number(s.price) : undefined,
          mrp: s.mrp ? Number(s.mrp) : undefined,
          sku: s.sku,
          image: s.image
        })) // Save variant-specific fields
      })),
      sizes: Array.from(allSizes), // Flatten sizes for global searching/filtering
      images: mainImages,
      specifications: productToEdit?.specifications || {},
      tags: tags,
      variant_label: variantLabel,
      allow_customization: allowCustomization,
      customization_options: allowCustomization ? customizationOptions : [],
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

      {/* Pricing & Tax Configuration */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Pricing & Tax</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

          {/* Base Price Input */}
          <div>
            <label htmlFor="basePrice" className={labelClass}>
              Base Price (Excl. Tax) <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₹</span>
              </div>
              <input
                type="number"
                id="basePrice"
                min="0"
                step="0.01"
                value={basePrice}
                onChange={e => setBasePrice(Number(e.target.value))}
                className={`${inputClass} pl-7`}
                required
              />
            </div>
          </div>

          {/* Tax Override Input */}
          <div>
            <label htmlFor="customTax" className={labelClass}>
              Tax Override (%) <span className="text-xs text-gray-500">(Optional)</span>
            </label>
            <input
              type="number"
              id="customTax"
              min="0"
              max="100"
              step="0.1"
              value={customTaxPercent}
              onChange={e => setCustomTaxPercent(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder={`Default: ${taxPercent}%`}
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Price Breakdown (Auto-Calculated)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md">
              <div>
                <span className="block text-xs text-gray-500">Tax Rate Applied</span>
                <span className="block text-lg font-bold text-gray-800 dark:text-gray-200">{taxPercent}%</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500">Tax Amount (GST)</span>
                <span className="block text-lg font-bold text-gray-800 dark:text-gray-200">₹{taxAmount.toFixed(2)}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500">Final Selling Price (MRP)</span>
                <span className="block text-xl font-bold text-green-600 dark:text-green-400">₹{price.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * The Final Selling Price is what customers will pay (Inclusive of Taxes).
            </p>
          </div>

          <div>
            <label htmlFor="mrp" className={labelClass}>List Price (Display MRP) <span className="text-xs text-gray-500">(Optional crossed-out price)</span></label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₹</span>
              </div>
              <input
                type="number"
                id="mrp"
                min="0"
                value={mrp}
                onChange={e => setMrp(Number(e.target.value))}
                className={`${inputClass} pl-7`}
              />
            </div>
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
                className={`${showColors ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'} relative inline - flex h - 6 w - 11 flex - shrink - 0 cursor - pointer rounded - full border - 2 border - transparent transition - colors duration - 200 ease -in -out focus: outline - none`}
              >
                <span aria-hidden="true" className={`${showColors ? 'translate-x-5' : 'translate-x-0'} pointer - events - none inline - block h - 5 w - 5 transform rounded - full bg - white shadow ring - 0 transition duration - 200 ease -in -out`} />
              </button>
            </div>
            {showColors && (
              <button type="button" onClick={addColorVariant} className="flex items-center gap-1 text-sm font-medium text-primary hover:text-pink-700">
                <PlusIcon className="w-4 h-4" /> Add Color
              </button>
            )}
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="variantLabel" className={labelClass}>Variant Label</label>
          <p className="text-xs text-gray-500 mb-2">The label to display for variants (e.g., "Size", "Weight", "Volume"). Default is "Size".</p>
          <input type="text" id="variantLabel" value={variantLabel} onChange={e => setVariantLabel(e.target.value)} className={inputClass} placeholder="e.g. Size" />
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
                  className={`px - 4 py - 2 rounded - t - md text - sm font - medium transition - colors ${activeVariantIndex === index ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'} `}
                >
                  {variant.name || `Color ${index + 1} `}
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
                              <label htmlFor={`color - name - ${variant.id} `} className={labelClass}>Color Name</label>
                              <input type="text" id={`color - name - ${variant.id} `} value={variant.name} onChange={e => handleColorChange(variant.id, 'name', e.target.value)} placeholder="e.g. Royal Blue" className={inputClass} required={showColors} />
                            </div>
                            <div>
                              <label htmlFor={`color - hex - ${variant.id} `} className={labelClass}>Color Hex</label>
                              <div className="flex items-center gap-2">
                                <input type="text" id={`color - hex - ${variant.id} `} value={variant.hex} onChange={e => handleColorChange(variant.id, 'hex', e.target.value)} placeholder="#4169E1" className={inputClass} required={showColors} />
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
                        Variants & Remaining Stock
                        <span className="block text-xs font-normal text-gray-500 mt-1">
                          Manage size/variant options and their current remaining stock levels.
                        </span>
                      </label>
                      <div className="space-y-2 mt-2">
                        {/* Column Headers */}
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                            <span className="w-24">Size/Variant</span>
                            <span className="w-16">Image</span>
                            <span className="w-28">Stock Qty</span>
                            <span className="w-28">Base Price (No Tax)</span>
                            <span className="w-20">Selling Price</span>
                            <span className="w-28">MRP (Crossed)</span>
                            <span className="flex-grow">Variant SKU</span>
                            <span className="w-5"></span> {/* Spacer for delete icon */}
                          </div>
                          <button
                            type="button"
                            onClick={autoGenerateSKUs}
                            className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100 transition-colors"
                            title="Auto-fill empty SKUs based on Name-Color-Size logic"
                          >
                            Auto-Generate SKUs
                          </button>
                        </div>

                        {variant.sizes.map((size, sizeIndex) => (
                          <div key={sizeIndex} className="flex items-center gap-2">
                            <input type="text" placeholder="Size (e.g. XL)" value={size.size} onChange={e => handleSizeChange(variant.id, sizeIndex, 'size', e.target.value)} className={`${inputClass} w-24`} required />

                            {/* Mini Image Uploader */}
                            <div className="w-16 h-10 relative flex-shrink-0">
                              {size.image ? (
                                <div className="relative w-full h-full group">
                                  <SupabaseImage
                                    bucket={BUCKETS.PRODUCTS}
                                    imagePath={size.image}
                                    alt="Variant"
                                    className="w-full h-full object-cover rounded border border-gray-200"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSizeChange(variant.id, sizeIndex, 'image', '')}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remove image"
                                  >
                                    <TrashIcon className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <label className="w-full h-full border border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:bg-gray-50 text-gray-400">
                                  <PlusIcon className="w-4 h-4" />
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                      if (e.target.files?.[0]) handleVariantRowImageUpload(variant.id, sizeIndex, e.target.files[0]);
                                    }}
                                  />
                                </label>
                              )}
                            </div>

                            <input type="number" placeholder="Qty" min="0" value={size.stock} onChange={e => handleSizeChange(variant.id, sizeIndex, 'stock', Number(e.target.value))} className={`${inputClass} w-28`} required title="Remaining Stock Quantity" />
                            <input type="number" placeholder="Override Base Price" min="0" value={size.base_price || ''} onChange={e => handleSizeChange(variant.id, sizeIndex, 'base_price', Number(e.target.value))} className={`${inputClass} w-28`} title="Optional: Override Base Price for this specific variant" />

                            {/* Read-only Final Price Display */}
                            <div className="w-20 px-2 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm text-center font-semibold text-gray-700 dark:text-gray-300" title="Final Selling Price (Tax Included)">
                              {size.price ? `₹${size.price}` : '-'}
                            </div>

                            <input type="number" placeholder="MRP" min="0" value={size.mrp || ''} onChange={e => handleSizeChange(variant.id, sizeIndex, 'mrp', Number(e.target.value))} className={`${inputClass} w-28`} title="Optional: Crossed-out list price" />
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
                          pathPrefix={`prod_${productToEdit?.id || 'new'} /${name || 'untitled'}/${variant.name || 'default'} `}
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
          )
          }
          {
            colorVariants.length === 0 && (
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">No variants defined. Please add at least one color variant.</p>
            )
          }
        </div >
      </div >

      {/* Product Customization */}
      < div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow" >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Product Customization</h3>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Customization</label>
            <button
              type="button"
              role="switch"
              aria-checked={allowCustomization}
              onClick={() => setAllowCustomization(!allowCustomization)}
              className={`${allowCustomization ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
            >
              <span aria-hidden="true" className={`${allowCustomization ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
            </button>
          </div>
        </div>

        {
          allowCustomization && (
            <div className="space-y-4">
              {customizationOptions.map((option, index) => (
                <div key={option.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/50 dark:bg-gray-900/50 relative">
                  <button
                    type="button"
                    onClick={() => removeCustomizationOption(option.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Field Label</label>
                      <input
                        type="text"
                        value={option.label}
                        onChange={(e) => handleCustomizationChange(option.id, 'label', e.target.value)}
                        placeholder="e.g. Engraving Name"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Field Type</label>
                      <select
                        value={option.type}
                        onChange={(e) => handleCustomizationChange(option.id, 'type', e.target.value)}
                        className={inputClass}
                      >
                        <option value="text">Text Input</option>
                        <option value="radio">Single Choice (Radio)</option>
                        <option value="checkbox">Multiple Choice (Checkbox)</option>
                      </select>
                    </div>
                    <div className="flex items-center mt-6">
                      <input
                        type="checkbox"
                        id={`req-${option.id}`}
                        checked={option.required}
                        onChange={(e) => handleCustomizationChange(option.id, 'required', e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor={`req-${option.id}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                        Required Field
                      </label>
                    </div>
                  </div>

                  {/* Options for Radio/Checkbox */}
                  {(option.type === 'radio' || option.type === 'checkbox') && (
                    <div className="mt-4">
                      <label className={labelClass}>Options</label>
                      <div className="mt-2 space-y-2">
                        {option.options.map((optVal, optIdx) => (
                          <div key={optIdx} className="flex gap-2">
                            <input
                              type="text"
                              value={optVal}
                              onChange={(e) => updateOptionValue(option.id, optIdx, e.target.value)}
                              placeholder={`Option ${optIdx + 1}`}
                              className={inputClass}
                            />
                            <button
                              type="button"
                              onClick={() => removeOptionValue(option.id, optIdx)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addOptionValue(option.id)}
                          className="text-sm text-primary hover:text-pink-700 font-medium flex items-center gap-1"
                        >
                          <PlusIcon className="w-4 h-4" /> Add Option
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addCustomizationOption}
                className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-gray-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
              >
                <PlusIcon className="w-5 h-5" /> Add Customization Field
              </button>
            </div>
          )
        }
      </div >

      {/* Actions */}
      < div className="flex justify-end gap-4" >
        <button type="button" onClick={onCancel} className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
        <button type="submit" disabled={isSaving} className={`bg-primary text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-pink-700 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {isSaving ? 'Saving...' : 'Save Product'}
        </button>
      </div >
    </form >
  );
};

export default ProductForm;
