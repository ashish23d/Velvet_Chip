import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { ReturnRequest, ReturnRequestStatus } from '../../types';
import SupabaseImage from '../shared/SupabaseImage';
import { BUCKETS } from '../../constants';
import ArrowUturnLeftIcon from '../icons/ArrowUturnLeftIcon';
import { useUserReturns } from '../../services/api/user.api';

const ReturnCard: React.FC<{ request: ReturnRequest }> = ({ request }) => {
  const StatusBadge: React.FC<{ status: ReturnRequestStatus }> = ({ status }) => {
    const styles: Record<ReturnRequestStatus, string> = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-blue-100 text-blue-800',
      'Pickup Scheduled': 'bg-cyan-100 text-cyan-800',
      'In Transit': 'bg-indigo-100 text-indigo-800',
      'Item Inspected': 'bg-purple-100 text-purple-800',
      Processing: 'bg-orange-100 text-orange-800',
      Completed: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
    };
    const style = styles[status] || 'bg-gray-100 text-gray-800';
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${style}`}>{status}</span>;
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to={`/product/${request.item?.product.id}`} className="sm:w-28 flex-shrink-0">
          <SupabaseImage bucket={BUCKETS.PRODUCTS} imagePath={request.item?.product.images[0]} alt={request.item?.product.name || ''} className="w-full h-40 sm:h-36 object-cover rounded-md" />
        </Link>
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500">Return ID: {request.id}</p>
              <h3 className="font-semibold text-gray-800 mt-1">{request.item?.product.name}</h3>
              <p className="text-xs text-gray-500 mt-1">Order #{request.order_id}</p>
            </div>
            <StatusBadge status={request.status} />
          </div>
          <div className="mt-2 pt-2 border-t border-dashed">
            <p className="text-sm text-gray-600"><span className="font-semibold">Reason:</span> {request.reason}</p>
            {request.comments && <p className="text-sm text-gray-600 mt-1"><span className="font-semibold">Comments:</span> {request.comments}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const MyReturns: React.FC = () => {
  const { currentUser } = useAppContext();
  const { data: userReturns = [] } = useUserReturns(currentUser?.id);

  const sortedReturns = userReturns.sort(
    (a, b) => new Date(b.return_requested_at).getTime() - new Date(a.return_requested_at).getTime()
  );

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-semibold text-gray-800">My Returns</h2>
        <p className="mt-1 text-sm text-gray-500">Track the status of your return requests.</p>
      </div>

      {sortedReturns.length === 0 ? (
        <div className="p-6 text-center py-16">
          <ArrowUturnLeftIcon className="w-16 h-16 mx-auto text-gray-300" />
          <h3 className="mt-4 text-xl font-semibold text-gray-700">You have no return requests</h3>
          <p className="mt-2 text-gray-500">Items you request to return will appear here.</p>
        </div>
      ) : (
        <div className="p-4 sm:p-6 space-y-4">
          {sortedReturns.map(request => <ReturnCard key={request.id} request={request} />)}
        </div>
      )}
    </div>
  );
};

export default MyReturns;