import React from 'react';
import { Link } from 'react-router-dom';
import { UserProfile } from '../../types.ts';
import { useAppContext } from '../../context/AppContext.tsx';
import Avatar from '../profile/Avatar';
import PencilIcon from '../icons/PencilIcon.tsx';
import LockClosedIcon from '../icons/LockClosedIcon.tsx';
import LockOpenIcon from '../icons/LockOpenIcon.tsx';
import ArrowUpTrayIcon from '../icons/ArrowUpTrayIcon.tsx';
import ArrowDownTrayIcon from '../icons/ArrowDownTrayIcon.tsx';

interface UserCardProps {
  user: UserProfile;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const { currentUser, updateUserStatus, adminChangeUserRole, showConfirmationModal } = useAppContext();

  const isSelf = currentUser?.id === user.id;

  const handleToggleStatus = () => {
    if (isSelf) return;
    const newStatus = (user.status || 'active') === 'blocked' ? 'active' : 'blocked';
    showConfirmationModal({
        title: `${newStatus === 'active' ? 'Unblock' : 'Block'} User`,
        message: `Are you sure you want to ${newStatus === 'active' ? 'unblock' : 'block'} ${user.name}?`,
        onConfirm: () => updateUserStatus(user.id, newStatus),
        confirmText: newStatus === 'active' ? 'Unblock' : 'Block',
        isDestructive: newStatus === 'blocked',
    });
  };

  const handleToggleRole = () => {
    const newRole = user.role === 'admin' ? 'customer' : 'admin';
    if (isSelf && newRole === 'customer') {
      alert("You cannot demote yourself.");
      return;
    }
    showConfirmationModal({
        title: 'Change User Role',
        message: `Are you sure you want to change ${user.name}'s role to ${newRole}?`,
        onConfirm: () => adminChangeUserRole(user.id, newRole),
        confirmText: 'Change Role',
        isDestructive: newRole === 'customer',
    });
  };

  const obfuscateEmail = (email: string | null | undefined): string => {
    if (!email) return 'No email';
    const parts = email.split('@');
    if (parts.length !== 2) return 'Invalid Email';
    return `xxxx@${parts[1]}`;
  };

  const displayEmail = isSelf ? user.email : obfuscateEmail(user.email);

  const statusStyles = {
    active: 'bg-green-100 text-green-800',
    blocked: 'bg-red-100 text-red-800',
  };
  const status = user.status || 'active';

  return (
    <div className={`bg-white rounded-lg shadow-md border-2 overflow-hidden transition-all ${isSelf ? 'border-primary' : 'border-gray-200'}`}>
      <div className="p-4 flex items-center gap-4 border-b">
        <Avatar user={user} className="w-12 h-12 rounded-full" />
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
                <p className="text-md font-bold text-gray-800 truncate">{user.name}</p>
                {isSelf && (
                    <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">You</span>
                )}
            </div>
          <p className="text-sm text-gray-500 truncate">{displayEmail || 'No email'}</p>
        </div>
        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}>
          {status}
        </span>
      </div>
      <div className="p-2 bg-gray-50 grid grid-cols-3 gap-1">
        <Link to={`/admin/users/edit/${user.id}`} className="flex flex-col items-center p-2 rounded-md text-gray-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors">
          <PencilIcon className="h-5 w-5" />
          <span className="text-xs mt-1">Edit</span>
        </Link>
        <button onClick={handleToggleStatus} className="flex flex-col items-center p-2 rounded-md text-gray-600 hover:bg-red-100 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSelf}>
          {status === 'blocked' ? <LockOpenIcon className="h-5 w-5 text-green-600" /> : <LockClosedIcon className="h-5 w-5" />}
          <span className="text-xs mt-1">{status === 'blocked' ? 'Unblock' : 'Block'}</span>
        </button>
         <button onClick={handleToggleRole} className="flex flex-col items-center p-2 rounded-md text-gray-600 hover:bg-yellow-100 hover:text-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSelf}>
          {user.role === 'admin' ? <ArrowDownTrayIcon className="h-5 w-5" /> : <ArrowUpTrayIcon className="h-5 w-5" />}
          <span className="text-xs mt-1">{user.role === 'admin' ? 'Demote' : 'Make Admin'}</span>
        </button>
      </div>
    </div>
  );
};

export default UserCard;