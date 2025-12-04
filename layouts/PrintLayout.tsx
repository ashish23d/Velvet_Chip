import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';

const PrintLayout: React.FC = () => (
  <div className="bg-gray-100">
    <ReactRouterDOM.Outlet />
  </div>
);

export default PrintLayout;
