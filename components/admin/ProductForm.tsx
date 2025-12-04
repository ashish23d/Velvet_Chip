
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
  
  // State for color variants, which will hold images and sizes
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([]);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setDescription(productToEdit.description);
      setCategory(productToEdit.category);
      setMrp(productToEdit.mrp);
      setPrice(productToEdit.price);
      setHsnCode(productToEdit.hsnCode || '');
      
      const initialVariants: ColorVariant[] = productToEdit.colors.map((color, index) => ({
        id: `color-${productToEdit.id}-${index}`,
        name: color.name,
        hex: color.hex,
        uuid: color.uuid,
        images: color.images || (index === 0 ? productToEdit.images : []), // Backward compatibility
        // Load sizes from the color variant if available, otherwise fallback to global sizes
        sizes: (color.sizes && color.sizes.length > 0) 
            ? color.sizes 
            : (productToEdit.sizes.map(size => ({ size, stock: 10 }))) 
      }));
      setColorVariants(initialVariants);

    } else {
      // Set up a default empty variant for new products
      setColorVariants([{ 
          id: `new-${Date.now()}`, 
          name: '', 
          hex: '#FFFFFF',
          uuid: crypto.randomUUID(),
          images: [], 
          sizes: [{size: 'S', stock: 10}]
      }]);
    }
  }, [productToEdit]);
  
  const addColorVariant = () => {
    setColorVariants(prev => [...prev, { 
      id: `new-${Date.now()}`, 
      name: '', 
      hex: '#000000', 
      uuid: crypto.randomUUID(),
      images: [], 
      sizes: [{size: 'S', stock: 10}]
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
    setColorVariants(prev => prev.map(v => v.id === id ? {...v, [field]: value} : v));
  };
  
  const addSizeToColor = (colorId: string) => {
      setColorVariants(prev => prev.map(v => 
        v.id === colorId ? {...v, sizes: [...v.sizes, {size: '', stock: 10}]} : v
      ));
  };

  const removeSizeFromColor = (colorId: string, sizeIndex: number) => {
      setColorVariants(prev => prev.map(v => {
          if (v.id === colorId && v.sizes.length > 1) {
             return {...v, sizes: v.sizes.filter((_, i) => i !== sizeIndex)}
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
          i === sizeIndex ? {...s, [field]: value} : s
        );
        return {...v, sizes: newSizes};
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
      colors: colorVariants.map(cv => ({
          name: cv.name,
          hex: cv.hex,
          uuid: cv.uuid,
          images: (cv.images && cv.images.length > 0) ? cv.images : [mainImages[0]],
          sizes: cv.sizes // Save variant-specific sizes and stock
      })),
      sizes: Array.from(allSizes), // Flatten sizes for global searching/filtering
      images: mainImages, 
      specifications: productToEdit?.specifications || {},
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
            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className={inputClass} required/>
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
            <input type="text" id="hsnCode" value={hsnCode} onChange={e => setHsnCode(e.target.value)} className={inputClass} placeholder="e.g., 6204"/>
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
              <input type="number" id="price" value={price} onChange={e => setPrice(Number(e.target.value))} className={inputClass} required/>
            </div>
          </div>
      </div>

      {/* Variants */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
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
                                    <input type="color" value={variant.hex} onChange={e => handleColorChange(variant.id, 'hex', e.target.value)} className="h-9 w-10 p-0.5 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer bg-white dark:bg-gray-700"/>
                                </div>
                             </div>
                          </div>
                          {colorVariants.length > 1 && (
                            <button type="button" onClick={() => removeColorVariant(variant.id)} className="mt-6 text-gray-400 hover:text-red-500">
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                          )}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <label className={labelClass}>Sizes & Stock</label>
                          <div className="space-y-2 mt-2">
                              {variant.sizes.map((size, sizeIndex) => (
                                <div key={sizeIndex} className="flex items-center gap-2">
                                    <input type="text" placeholder="Size (e.g. XL)" value={size.size} onChange={e => handleSizeChange(variant.id, sizeIndex, 'size', e.target.value)} className={inputClass} required />
                                    <input type="number" placeholder="Stock" value={size.stock} onChange={e => handleSizeChange(variant.id, sizeIndex, 'stock', Number(e.target.value))} className={inputClass} required />
                                     {variant.sizes.length > 1 && (
                                        <button type="button" onClick={() => removeSizeFromColor(variant.id, sizeIndex)} className="text-gray-400 hover:text-red-500">
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                     )}
                                </div>
                              ))}
                          </div>
                          <button type="button" onClick={() => addSizeToColor(variant.id)} className="mt-2 flex items-center gap-1 text-sm font-medium text-primary hover:text-pink-700">
                              <PlusIcon className="w-4 h-4"/> Add Size
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
