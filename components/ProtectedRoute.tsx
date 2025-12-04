import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext.tsx';

const ProtectedRoute: React.FC = () => {
  const { session } = useAppContext();
  const location = ReactRouterDOM.useLocation();

  if (!session) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them back after they log in.
    return <ReactRouterDOM.Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  return <ReactRouterDOM.Outlet />;
};

export default ProtectedRoute;
