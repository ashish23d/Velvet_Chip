
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import PencilIcon from '../icons/PencilIcon';

interface EditableWrapperProps {
  children: ReactNode;
  editUrl: string;
  className?: string;
}

const EditableWrapper: React.FC<EditableWrapperProps> = ({ children, editUrl, className }) => {
  const { currentUser } = useAppContext();

  if (currentUser?.role !== 'admin') {
    return <>{children}</>;
  }

  return (
    <div className={`relative group/editable ${className || ''}`}>
      {children}
      <Link
        to={editUrl}
        className="absolute top-2 right-2 z-20 p-2 bg-white/80 backdrop-blur-sm text-primary rounded-full shadow-md transition-all duration-300 opacity-0 group-hover/editable:opacity-100 scale-90 group-hover/editable:scale-100 hover:bg-white"
        aria-label="Edit item"
      >
        <PencilIcon className="w-5 h-5" />
      </Link>
    </div>
  );
};

export default EditableWrapper;
