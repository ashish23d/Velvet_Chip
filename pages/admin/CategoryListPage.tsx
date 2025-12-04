
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext.tsx';
import * as ReactRouterDOM from 'react-router-dom';
import TrashIcon from '../../components/icons/TrashIcon.tsx';
import PencilIcon from '../../components/icons/PencilIcon.tsx';
import PlusIcon from '../../components/icons/PlusIcon.tsx';

const CategoryListPage: React.FC = () => {
  const { categories, deleteCategory } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = useMemo(() => {
    return categories.filter(category =>
      (category.name && category.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (category.id && category.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [categories, searchTerm]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          />
          <ReactRouterDOM.Link
            to="/admin/categories/new"
            className="flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-md font-medium hover:bg-pink-700 transition-colors flex-shrink-0"
          >
            <PlusIcon className="w-5 h-5" />
            Add Category
          </ReactRouterDOM.Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCategories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center gap-4">
                     <ReactRouterDOM.Link to={`/admin/categories/edit/${category.id}`} className="text-indigo-600 hover:text-indigo-900">
                        <PencilIcon className="h-5 w-5"/>
                     </ReactRouterDOM.Link>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="text-red-600 hover:text-red-900"
                      aria-label={`Delete ${category.name}`}
                    >
                      <TrashIcon className="h-5 w-5"/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCategories.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No categories match your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryListPage;
