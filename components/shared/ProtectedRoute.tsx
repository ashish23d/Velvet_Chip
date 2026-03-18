import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const ProtectedRoute: React.FC = () => {
  const { session, isLoading } = useAppContext();
  const location = ReactRouterDOM.useLocation();

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them back after they log in.
    return <ReactRouterDOM.Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  return <ReactRouterDOM.Outlet />;
};

export default ProtectedRoute;
