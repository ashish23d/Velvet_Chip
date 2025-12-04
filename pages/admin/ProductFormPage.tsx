
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../../context/AppContext.tsx';
import ProductForm from '../../components/admin/ProductForm.tsx';
import { Product } from '../../types.ts';

const ProductFormPage: React.FC = () => {
  const { id } = ReactRouterDOM.useParams<{ id: string }>();
  const navigate = ReactRouterDOM.useNavigate();
  const { getProductById, addProduct, updateProduct, categories } = useAppContext();

  const isEditing = Boolean(id);
  const [productToEdit, setProductToEdit] = useState<Product | undefined>();
  const [isLoading, setIsLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing && id) {
      const fetchProduct = async () => {
        setIsLoading(true);
        try {
            const product = await getProductById(Number(id));
            setProductToEdit(product);
        } catch (error) {
            console.error("Failed to fetch product for editing:", error);
            setError("Could not load product data.");
        } finally {
            setIsLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEditing, getProductById]);


  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (productData: Product | Omit<Product, 'id' | 'rating' | 'reviews' | 'uuid'>) => {
    setIsSaving(true);
    setError(null);
    try {
      if (isEditing) {
        await updateProduct(productData as Product);
      } else {
        await addProduct(productData as Omit<Product, 'id' | 'rating' | 'reviews' | 'uuid'>);
      }
      navigate('/admin/products');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  if (isLoading) {
    return <div>Loading product details...</div>;
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold text-gray-800">
           {isEditing ? `Edit Product: ${productToEdit?.name || ''}` : 'Create New Product'}
         </h1>
         <button onClick={handleCancel} className="text-sm font-medium text-primary hover:underline">
           &larr; Back to Products
         </button>
       </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {(isEditing && productToEdit) || !isEditing ? (
        <ProductForm
          productToEdit={productToEdit}
          categories={categories}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        !isLoading && <div>Product not found.</div>
      )}
    </div>
  );
};

export default ProductFormPage;
