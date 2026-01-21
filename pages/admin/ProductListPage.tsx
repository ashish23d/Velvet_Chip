import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext.tsx';
import { useAdminProductsList } from '../../services/api/admin.api'; // New Hook
import PencilIcon from '../../components/icons/PencilIcon.tsx';
import TrashIcon from '../../components/icons/TrashIcon.tsx';
import PlusIcon from '../../components/icons/PlusIcon.tsx';
import SupabaseImage from '../../components/SupabaseImage.tsx';
import Pagination from '../../components/Pagination.tsx';
import { BUCKETS } from '../../constants.ts';
import { Product } from '../../types.ts';

const ProductListPage: React.FC = () => {
  const { categories, deleteProduct, showConfirmationModal } = useAppContext();

  // Use Real-Time Hook
  const { data: productsData } = useAdminProductsList();
  const products = (productsData || []) as Product[];

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products
      .filter(product => categoryFilter === 'all' || product.category === categoryFilter)
      .filter(product => categoryFilter === 'all' || product.category === categoryFilter)
      .filter(product => {
        const lowerTerm = searchTerm.toLowerCase();
        // Search by Product Name or Main SKU
        // Note: Main SKU might not be in product root in some versions, but checking just in case
        if (product.name?.toLowerCase().includes(lowerTerm)) return true;
        if ((product as any).sku?.toLowerCase().includes(lowerTerm)) return true;

        // Search by Variant SKUs
        const hasVariantSkuMatch = product.colors?.some(color =>
          color.sizes?.some(size => size.sku?.toLowerCase().includes(lowerTerm))
        );

        return hasVariantSkuMatch;
      });

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'price-desc':
          return b.price - a.price;
        case 'price-asc':
          return a.price - b.price;
        case 'date-asc':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'date-desc':
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'stock-asc':
          return (
            (a.colors?.reduce((acc, c) => acc + (c.sizes?.reduce((s, si) => s + (Number(si.stock) || 0), 0) || 0), 0) || 0) -
            (b.colors?.reduce((acc, c) => acc + (c.sizes?.reduce((s, si) => s + (Number(si.stock) || 0), 0) || 0), 0) || 0)
          );
      }
    });

    return sorted;

  }, [products, searchTerm, categoryFilter, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, sortBy]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Product Management ({filteredAndSortedProducts.length})</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="name-asc">Name: A-Z</option>
            <option value="name-desc">Name: Z-A</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="stock-asc">Stock: Low to High</option>
          </select>
          <Link
            to="/admin/products/new"
            className="flex items-center justify-center gap-2 bg-primary text-white py-2 px-4 rounded-md font-medium hover:bg-pink-700 transition-colors flex-shrink-0"
          >
            <PlusIcon className="w-5 h-5" />
            Add Product
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentProducts.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <SupabaseImage
                        bucket={BUCKETS.PRODUCTS}
                        imagePath={product.images[0]}
                        alt={product.name}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">₹{product.price}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(() => {
                    const totalStock = product.colors?.reduce((acc, color) =>
                      acc + (color.sizes?.reduce((sAcc, size) => sAcc + (Number(size.stock) || 0), 0) || 0), 0) || 0;

                    const variantBreakdown = product.colors?.flatMap(c =>
                      c.sizes?.map(s => `${c.name}-${s.size}: ${s.stock}`)
                    ).join(', ');

                    let colorClass = 'text-green-800 bg-green-100'; // > 50
                    if (totalStock < 20) colorClass = 'text-red-800 bg-red-100';
                    else if (totalStock < 50) colorClass = 'text-orange-800 bg-orange-100';

                    return (
                      <div title={variantBreakdown}>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}>
                          {totalStock} Left
                        </span>
                        <div className="text-xs text-gray-400 truncate max-w-[150px] mt-1">{variantBreakdown}</div>
                      </div>
                    );
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center gap-4">
                    <Link to={`/admin/products/edit/${product.id}`} className="text-indigo-600 hover:text-indigo-900">
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                    <button onClick={() => {
                      showConfirmationModal({
                        title: 'Delete Product',
                        message: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
                        confirmText: 'Delete',
                        isDestructive: true,
                        onConfirm: () => deleteProduct(product.id)
                      });
                    }} className="text-red-600 hover:text-red-900">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAndSortedProducts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No products match the current filters.
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default ProductListPage;
