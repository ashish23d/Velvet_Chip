
import React, { useState, useEffect } from 'react';
import { Product, Category, CustomizationOption } from '../../types.ts';
import PlusIcon from '../../components/icons/PlusIcon.tsx';
import TrashIcon from '../../components/icons/TrashIcon.tsx';
import ImageUploader from '../../components/admin/ImageUploader.tsx';
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
  const [allowCustomization, setAllowCustomization] = useState(false);
  const [customizationOptions, setCustomizationOptions] = useState<CustomizationOption[]>([]);

  // State for color variants, which will hold images and sizes
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([]);
  // State for tags
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

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
      setAllowCustomization(productToEdit.allow_customization || false);
      setCustomizationOptions(productToEdit.customization_options || []);
      setTags(productToEdit.tags || []);

      const initialVariants: ColorVariant[] = productToEdit.colors.map((color, index) => ({
        id: `color-${productToEdit.id}-${index}`,
        name: color.name,
        hex: color.hex,
        uuid: color.uuid,
        images: color.images || (index === 0 ? productToEdit.images : []), // Backward compatibility
        // The existing data doesn't have stock per size, so we'll mock it.
        // This is a reasonable assumption for a form migration.
        sizes: (color.sizes && color.sizes.length > 0)
          ? color.sizes
          : productToEdit.sizes.map(size => ({ size, stock: 10 }))
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
        sizes: [{ size: 'S', stock: 10 }]
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
      sizes: [{ size: 'S', stock: 10 }]
    }]);
  };

  const removeColorVariant = (id: string) => {
    if (colorVariants.length > 1) {
      setColorVariants(prev => prev.filter(v => v.id !== id));
    } else {
      alert("A product must have at least one variant.");
    }
  };

  const handleColorChange = (id: string, field: 'name' | 'hex', value: string) => {
    setColorVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const addSizeToColor = (colorId: string) => {
    setColorVariants(prev => prev.map(v =>
      v.id === colorId ? { ...v, sizes: [...v.sizes, { size: '', stock: 10 }] } : v
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

  const handleSizeChange = (colorId: string, sizeIndex: number, field: 'size' | 'stock', value: string | number) => {
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

  const addCustomizationOption = () => {
    setCustomizationOptions(prev => [...prev, {
      id: generateUUID(),
      type: 'text',
      label: '',
      required: false,
      options: []
    }]);
  };

  const removeCustomizationOption = (id: string) => {
    setCustomizationOptions(prev => prev.filter(opt => opt.id !== id));
  };

  const updateCustomizationOption = (id: string, field: keyof CustomizationOption, value: any) => {
    setCustomizationOptions(prev => prev.map(opt => {
      if (opt.id === id) {
        return { ...opt, [field]: value };
      }
      return opt;
    }));
  };

  const handleOptionValuesChange = (id: string, value: string) => {
    // Split by comma and trim
    const optionsArray = value.split(',').map(s => s.trim()).filter(Boolean);
    updateCustomizationOption(id, 'options', optionsArray);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
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
      colors: colorVariants.map(cv => ({
        name: cv.name,
        hex: cv.hex,
        uuid: cv.uuid,
        images: (cv.images && cv.images.length > 0) ? cv.images : [mainImages[0]],
        sizes: cv.sizes.map(s => ({ size: s.size, stock: s.stock }))
      })),
      sizes: Array.from(allSizes),
      images: mainImages,
      specifications: productToEdit?.specifications || {},
      tags: tags,
      allow_customization: allowCustomization,
      customization_options: allowCustomization ? customizationOptions : []
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
          <div className="sm:col-span-6">
            <label htmlFor="tags" className={labelClass}>Tags</label>
            <div className="mt-1 flex flex-wrap gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 min-h-[42px] focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
              {tags.map(tag => (
                <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="ml-1.5 inline-flex text-primary hover:text-pink-700 focus:outline-none">
                    <span className="sr-only">Remove key</span>
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <title>Remove</title>
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              ))}
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Type tag and press Enter"
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-0 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">Separate tags with comma or enter.</p>
          </div>
        </div>
      </div>
    </div>
      </div >

  {/* Pricing */ }
  < div className = "p-6 bg-white dark:bg-gray-800 rounded-lg shadow" >
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
      </div >

  {/* Variants */ }
  < div className = "p-6 bg-white dark:bg-gray-800 rounded-lg shadow" >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Variants (Colors, Sizes & Images)</h3>
          <button type="button" onClick={addColorVariant} className="flex items-center gap-1 text-sm font-medium text-primary hover:text-pink-700">
            <PlusIcon className="w-4 h-4" /> Add Color
          </button>
        </div>
        <div className="space-y-6">
          {colorVariants.map(variant => (
            <div key={variant.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex justify-between items-start gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
                  <div>
                    <label htmlFor={`color-name-${variant.id}`} className={labelClass}>Color Name</label>
                    <input type="text" id={`color-name-${variant.id}`} value={variant.name} onChange={e => handleColorChange(variant.id, 'name', e.target.value)} placeholder="e.g. Royal Blue" className={inputClass} required />
                  </div>
                  <div>
                    <label htmlFor={`color-hex-${variant.id}`} className={labelClass}>Color Hex</label>
                    <div className="flex items-center gap-2">
                      <input type="text" id={`color-hex-${variant.id}`} value={variant.hex} onChange={e => handleColorChange(variant.id, 'hex', e.target.value)} placeholder="#4169E1" className={inputClass} required />
                      <input type="color" value={variant.hex} onChange={e => handleColorChange(variant.id, 'hex', e.target.value)} className="h-9 w-10 p-0.5 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer bg-white dark:bg-gray-700" />
                    </div>
                  </div>
                </div>
                {colorVariants.length > 1 && (
                  <button type="button" onClick={() => removeColorVariant(variant.id)} className="mt-6 text-gray-400 hover:text-red-500">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className={labelClass}>Sizes & Stock</label>
                <div className="space-y-2 mt-2">
                  {variant.sizes.map((size, sizeIndex) => (
                    <div key={sizeIndex} className="flex items-center gap-2">
                      <input type="text" placeholder="e.g. XL" value={size.size} onChange={e => handleSizeChange(variant.id, sizeIndex, 'size', e.target.value)} className={inputClass} required />
                      <input type="number" placeholder="Stock" value={size.stock} onChange={e => handleSizeChange(variant.id, sizeIndex, 'stock', Number(e.target.value))} className={inputClass} required />
                      {variant.sizes.length > 1 && (
                        <button type="button" onClick={() => removeSizeFromColor(variant.id, sizeIndex)} className="text-gray-400 hover:text-red-500">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => addSizeToColor(variant.id)} className="mt-2 flex items-center gap-1 text-sm font-medium text-primary hover:text-pink-700">
                  <PlusIcon className="w-4 h-4" /> Add Size
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
            </div>
          ))}
          {colorVariants.length === 0 && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">No variants defined. Please add at least one color variant.</p>
          )}
        </div>
      </div >

  {/* Customization Section */ }
  < div className = "p-6 bg-white dark:bg-gray-800 rounded-lg shadow" >
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Product Customization</h3>
        <div className="flex items-center gap-3 mb-4">
          <input
            id="allowCustomization"
            type="checkbox"
            checked={allowCustomization}
            onChange={(e) => setAllowCustomization(e.target.checked)}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <div className="flex flex-col">
            <label htmlFor="allowCustomization" className={labelClass}>
              Allow Customization / Special Instructions
            </label>
            <p className="text-xs text-gray-500">Enable if users should be able to add custom text notes for this product.</p>
          </div>
        </div>

{
  allowCustomization && (
    <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50/50 dark:bg-gray-900/50">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Customization Options</h4>
        <button type="button" onClick={addCustomizationOption} className="text-sm text-primary hover:text-pink-700 font-medium flex items-center gap-1">
          <PlusIcon className="w-4 h-4" /> Add Field
        </button>
      </div>
      <div className="space-y-4">
        {customizationOptions.map((opt, index) => (
          <div key={opt.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <div className="sm:col-span-4">
              <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
              <input
                type="text"
                value={opt.label}
                onChange={e => updateCustomizationOption(opt.id, 'label', e.target.value)}
                placeholder="e.g. Engraving Name"
                className={inputClass}
                required
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
              <select
                value={opt.type}
                onChange={e => updateCustomizationOption(opt.id, 'type', e.target.value)}
                className={inputClass}
              >
                <option value="text">Text Input</option>
                <option value="radio">Radio Buttons</option>
                <option value="checkbox">Checkbox</option>
              </select>
            </div>
            {(opt.type === 'radio' || opt.type === 'checkbox') && (
              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">Options (comma separated)</label>
                <input
                  type="text"
                  value={opt.options?.join(', ') || ''}
                  onChange={e => handleOptionValuesChange(opt.id, e.target.value)}
                  placeholder="Option 1, Option 2"
                  className={inputClass}
                />
              </div>
            )}
            <div className="sm:col-span-1 flex flex-col items-center justify-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={opt.required}
                  onChange={e => updateCustomizationOption(opt.id, 'required', e.target.checked)}
                  className="h-4 w-4 text-primary rounded"
                />
                <span className="text-xs text-gray-500">Req.</span>
              </label>
            </div>
            <div className="sm:col-span-1 pt-6 flex justify-end">
              <button type="button" onClick={() => removeCustomizationOption(opt.id)} className="text-gray-400 hover:text-red-500">
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        {customizationOptions.length === 0 && (
          <p className="text-xs text-center text-gray-400">No options added yet.</p>
        )}
      </div>
    </div>
  )
}
      </div >

  {/* Actions */ }
  < div className = "flex justify-end gap-4" >
        <button type="button" onClick={onCancel} className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
        <button type="submit" className="bg-primary text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-pink-700">Save Product</button>
      </div >
    </form >
  );
};

export default ProductForm;
