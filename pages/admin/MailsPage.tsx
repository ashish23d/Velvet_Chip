import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext.tsx';
import PlusIcon from '../../components/icons/PlusIcon.tsx';
import PencilIcon from '../../components/icons/PencilIcon.tsx';
import TrashIcon from '../../components/icons/TrashIcon.tsx';
import { MailTemplate } from '../../types.ts';

const MailsPage: React.FC = () => {
  const { getAllMailTemplates, deleteMailTemplate, toggleMailTemplateStatus, showConfirmationModal } = useAppContext();
  const mailTemplates = getAllMailTemplates();

  const handleDelete = async (id: number, name: string) => {
    showConfirmationModal({
      title: 'Delete Template',
      message: `Are you sure you want to delete the "${name}" template? This action cannot be undone.`,
      confirmText: 'Delete',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await deleteMailTemplate(id);
        } catch (error) {
          console.error("Failed to delete template:", error);
          alert(`Error: ${(error as Error).message}`);
        }
      }
    });
  };

  const TypeBadge: React.FC<{ type: MailTemplate['templateType'] }> = ({ type }) => {
    const styles = {
      order_status: 'bg-blue-100 text-blue-800',
      return_process: 'bg-yellow-100 text-yellow-800',
      promotional: 'bg-purple-100 text-purple-800',
      password_reset: 'bg-indigo-100 text-indigo-800',
      custom: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[type]}`}>
        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Mail Templates</h1>
        <Link
          to="/admin/mails/new"
          className="flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-md font-medium hover:bg-pink-700"
        >
          <PlusIcon className="w-5 h-5" />
          Create Template
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mailTemplates.map((template) => (
              <tr key={template.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{template.name}</td>
                <td className="px-6 py-4 whitespace-nowrap"><TypeBadge type={template.templateType} /></td>
                <td className="px-6 py-4 text-sm text-gray-500">{template.subject}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={template.isActive}
                      onChange={() => toggleMailTemplateStatus(template.id, template.isActive)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center gap-4">
                    <Link to={`/admin/mails/edit/${template.id}`} className="text-indigo-600 hover:text-indigo-900">
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                    <button onClick={() => handleDelete(template.id, template.name)} className="text-red-600 hover:text-red-900">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {mailTemplates.length === 0 && (
          <div className="text-center py-12 text-gray-500">No mail templates found.</div>
        )}
      </div>
    </div>
  );
};

export default MailsPage;