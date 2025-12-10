
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext.tsx';
import { Category } from '../../types.ts';
import PlusIcon from '../../components/icons/PlusIcon.tsx';
import PencilIcon from '../../components/icons/PencilIcon.tsx';
import TrashIcon from '../../components/icons/TrashIcon.tsx';

const CategoryListPage: React.FC = () => {
  const { categories, updateCategory, deleteCategory } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Category>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const handleEditClick = (category: Category) => {
    setEditingId(category.id);
    setEditForm({
      id: category.id,
      name: category.name,
      heroImage: category.heroImage,
      appImagePath: category.appImagePath,
      pageHeroText: category.pageHeroText,
      showPageHeroText: category.showPageHeroText,
      pageHeroMedia: category.pageHeroMedia
    });
    setError(null);
    setUpdateSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setError(null);
    setUpdateSuccess(null);
  };

  const handleUpdateCategory = async (categoryId: string) => {
    setIsUpdating(true);
    setError(null);
    setUpdateSuccess(null);

    try {
      console.log('🔄 Updating category:', editForm);
      await updateCategory(editForm);
      setUpdateSuccess(categoryId);
      setEditingId(null);
      setEditForm({});

      // Clear success message after 3 seconds
      setTimeout(() => setUpdateSuccess(null), 3000);
    } catch (err: any) {
      console.error('❌ Update error:', err);
      setError(err.message || 'Failed to update category');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteCategory(id);
      } catch (err: any) {
        alert('Failed to delete category: ' + err.message);
      }
    }
  };

  const inputClass = "px-2 py-1 border border-gray-300 rounded text-sm w-full";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Categories</h1>
        <Link
          to="/admin/categories/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Add New Category
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      {/* Global Error/Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Hero Text
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Show Text
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredCategories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {editingId === category.id ? (
                  /* EDIT MODE */
                  <>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className={inputClass}
                        placeholder="Category name"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={editForm.pageHeroText || ''}
                        onChange={(e) => setEditForm({ ...editForm, pageHeroText: e.target.value })}
                        className={inputClass}
                        placeholder="Hero text"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={editForm.showPageHeroText || false}
                        onChange={(e) => setEditForm({ ...editForm, showPageHeroText: e.target.checked })}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleUpdateCategory(category.id)}
                        disabled={isUpdating}
                        className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-400"
                      >
                        {isUpdating ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                        className="inline-flex items-center px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 disabled:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  /* VIEW MODE */
                  <>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {category.name}
                        </div>
                        {updateSuccess === category.id && (
                          <span className="ml-2 text-xs text-green-600 font-semibold">
                            ✓ Updated!
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {category.pageHeroText || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${category.showPageHeroText ? 'text-green-600' : 'text-gray-400'}`}>
                        {category.showPageHeroText ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEditClick(category)}
                        className="inline-flex items-center p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded"
                        title="Quick Edit"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/admin/categories/edit/${category.id}`}
                        className="inline-flex items-center p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                        title="Full Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
                        className="inline-flex items-center p-2 text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No categories found.
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryListPage;
