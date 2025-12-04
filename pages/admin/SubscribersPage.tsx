
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext.tsx';
import TrashIcon from '../../components/icons/TrashIcon.tsx';

const SubscribersPage: React.FC = () => {
  const { getAllSubscribers, deleteSubscriber } = useAppContext();
  const subscribers = getAllSubscribers();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter(subscriber =>
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [subscribers, searchTerm]);

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Email,Subscribed At\n" 
      + filteredSubscribers.map(s => `"${s.email}","${new Date(s.subscribed_at).toLocaleString()}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "subscribers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Newsletter Subscribers</h1>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          />
          <button
            onClick={handleExportCSV}
            disabled={filteredSubscribers.length === 0}
            className="bg-primary text-white py-2 px-4 rounded-md font-medium hover:bg-pink-700 transition-colors disabled:bg-gray-400 flex-shrink-0"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSubscribers.map((subscriber) => (
              <tr key={subscriber.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subscriber.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(subscriber.subscribed_at).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => deleteSubscriber(subscriber.id)}
                    className="text-red-600 hover:text-red-900"
                    aria-label={`Delete ${subscriber.email}`}
                  >
                    <TrashIcon className="h-5 w-5"/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredSubscribers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
                {searchTerm ? 'No subscribers match your search.' : 'No one has subscribed to the newsletter yet.'}
            </div>
        )}
      </div>
    </div>
  );
};

export default SubscribersPage;