import React, { useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';

const ScrollToTop: React.FC = () => {
  const { pathname } = ReactRouterDOM.useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
