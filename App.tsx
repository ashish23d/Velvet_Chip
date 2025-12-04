
import React, { useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import HomePage from './pages/HomePage.tsx';
import CategoryPage from './pages/CategoryPage.tsx';
import ProductDetailPage from './pages/ProductDetailPage.tsx';
import CartPage from './pages/CartPage.tsx';
import { AppProvider, useAppContext } from './context/AppContext.tsx';
import Breadcrumb from './components/Breadcrumb.tsx';
import CartHeader from './components/CartHeader.tsx';
import LoginPage from './pages/LoginPage.tsx';
import TermsPage from './pages/TermsPage.tsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import WishlistPage from './pages/WishlistPage.tsx';
import NotificationsPage from './pages/NotificationsPage.tsx';
import AddressPage from './pages/AddressPage.tsx';
import PaymentPage from './pages/PaymentPage.tsx';
import AdminLayout from './layouts/AdminLayout.tsx';
import DashboardPage from './pages/admin/DashboardPage.tsx';
import ProductListPage from './pages/admin/ProductListPage.tsx';
import ProductFormPage from './pages/admin/ProductFormPage.tsx';
import CategoryListPage from './pages/admin/CategoryListPage.tsx';
import OrderListPage from './pages/admin/OrderListPage.tsx';
import OrderDetailsPage from './pages/admin/OrderDetailsPage.tsx';
import UserListPage from './pages/admin/UserListPage.tsx';
import UserDetailsPage from './pages/admin/UserDetailsPage.tsx';
import ReviewListPage from './pages/admin/ReviewListPage.tsx';
import FlyToCartAnimation from './components/FlyToCartAnimation.tsx';
import OrderConfirmationPage from './pages/OrderConfirmationPage.tsx';
import AboutPage from './pages/AboutPage.tsx';
import ContactPage from './pages/ContactPage.tsx';
import CategoryFormPage from './pages/admin/CategoryFormPage.tsx';
import AppearancePage from './pages/admin/AppearancePage.tsx';
import SiteContentPage from './pages/admin/SiteContentPage.tsx';
import UserFormPage from './pages/admin/UserFormPage.tsx';
import SearchPage from './pages/SearchPage.tsx';
import ApprovalsPage from './pages/admin/ApprovalsPage.tsx';
import TrackOrderPage from './pages/TrackOrderPage.tsx';
import SubscribersPage from './pages/admin/SubscribersPage.tsx';
import ReviewProductPage from './pages/ReviewProductPage.tsx';
import SettingsPage from './pages/admin/SettingsPage.tsx';
import MarketingPage from './pages/admin/MarketingPage.tsx';
import PromotionFormPage from './pages/admin/CouponFormPage.tsx';
import AnnouncementBar from './components/AnnouncementBar.tsx';
import ReturnRequestPage from './pages/ReturnRequestPage.tsx';
import CouponsPage from './pages/CouponsPage.tsx';
import UserOrderDetailsPage from './pages/UserOrderDetailsPage.tsx';
import InvoicePage from './pages/InvoicePage.tsx';
import PrintLayout from './layouts/PrintLayout.tsx';
import InboxPage from './pages/admin/InboxPage.tsx';
import ScrollToTop from './components/ScrollToTop.tsx';
import SearchBar from './components/SearchBar.tsx';
import OfferModal from './components/OfferModal.tsx';
import MailsPage from './pages/admin/MailsPage.tsx';
import MailTemplateFormPage from './pages/admin/MailTemplateFormPage.tsx';
import InvoicesPage from './pages/admin/InvoicesPage.tsx';
import LabelPrintPage from './pages/LabelPrintPage.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.tsx';
import ResetPasswordPage from './pages/ResetPasswordPage.tsx';
import SignUpPopup from './components/SignUpPopup.tsx';
import ReturnsListPage from './pages/admin/ReturnsListPage.tsx';
import ConfirmationModal from './components/ConfirmationModal.tsx';
import BulkInvoicePrintPage from './pages/admin/BulkInvoicePrintPage.tsx';
import AnalyticsPage from './pages/admin/AnalyticsPage.tsx';


const GlobalComponents = () => {
  const {
    reviewModalState, closeReviewModal,
    isOfferModalOpen, closeOfferModal,
    confirmationState, closeConfirmationModal
  } = useAppContext();

  return (
    <>
      <FlyToCartAnimation />
      {reviewModalState.product && (
        <ReviewProductPage
          isOpen={reviewModalState.isOpen}
          onClose={closeReviewModal}
          product={reviewModalState.product}
        />
      )}
      <OfferModal isOpen={isOfferModalOpen} onClose={closeOfferModal} />
      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={confirmationState.onConfirm}
        title={confirmationState.title}
        confirmText={confirmationState.confirmText}
        isDestructive={confirmationState.isDestructive}
        isConfirming={confirmationState.isConfirming}
      >
        {confirmationState.message}
      </ConfirmationModal>
    </>
  );
};

const MainLayout: React.FC = () => {
  const location = ReactRouterDOM.useLocation();
  const showMobileSearch = location.pathname !== '/';

  return (
    <div className="flex flex-col min-h-screen font-sans bg-white dark:bg-gray-900 transition-colors duration-200">
      <AnnouncementBar />
      <Header />
      {showMobileSearch && (
        <div className="md:hidden sticky top-20 z-30 bg-white dark:bg-gray-900 shadow-sm -mt-px border-b dark:border-gray-800">
          <div className="container mx-auto px-4 py-2">
            <SearchBar />
          </div>
        </div>
      )}
      <Breadcrumb />
      <main className="flex-grow">
        <ReactRouterDOM.Outlet />
      </main>
      <Footer />
    </div>
  );
};

const CheckoutLayout: React.FC = () => (
  <div className="flex flex-col min-h-screen font-sans bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <CartHeader />
    <main className="flex-grow py-8 sm:py-12">
      <ReactRouterDOM.Outlet />
    </main>
  </div>
);


const AppRoutes: React.FC = () => (
  <ReactRouterDOM.Routes>
    <ReactRouterDOM.Route element={<MainLayout />}>
      {/* Public Routes */}
      <ReactRouterDOM.Route path="/" element={<HomePage />} />
      <ReactRouterDOM.Route path="/search" element={<SearchPage />} />
      <ReactRouterDOM.Route path="/category/:id" element={<CategoryPage />} />
      <ReactRouterDOM.Route path="/product/:id" element={<ProductDetailPage />} />
      <ReactRouterDOM.Route path="/about" element={<AboutPage />} />
      <ReactRouterDOM.Route path="/contact" element={<ContactPage />} />
      <ReactRouterDOM.Route path="/login" element={<LoginPage />} />
      <ReactRouterDOM.Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <ReactRouterDOM.Route path="/reset-password" element={<ResetPasswordPage />} />
      <ReactRouterDOM.Route path="/terms-and-conditions" element={<TermsPage />} />
      <ReactRouterDOM.Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <ReactRouterDOM.Route path="/coupons" element={<CouponsPage />} />

      {/* Protected Routes */}
      <ReactRouterDOM.Route element={<ProtectedRoute />}>
        <ReactRouterDOM.Route path="/wishlist" element={<WishlistPage />} />
        <ReactRouterDOM.Route path="/notifications" element={<NotificationsPage />} />
        <ReactRouterDOM.Route path="/profile" element={<ProfilePage />} />
        <ReactRouterDOM.Route path="/help-and-returns" element={<ReturnRequestPage />} />
        <ReactRouterDOM.Route path="/help-and-returns/:orderId" element={<ReturnRequestPage />} />
        <ReactRouterDOM.Route path="/help-and-returns/:orderId/:itemId" element={<ReturnRequestPage />} />
      </ReactRouterDOM.Route>
    </ReactRouterDOM.Route>

    {/* Fully Protected Checkout & Order Layout */}
    <ReactRouterDOM.Route element={<ProtectedRoute />}>
      <ReactRouterDOM.Route element={<CheckoutLayout />}>
        <ReactRouterDOM.Route path="/cart" element={<CartPage />} />
        <ReactRouterDOM.Route path="/address" element={<AddressPage />} />
        <ReactRouterDOM.Route path="/payment" element={<PaymentPage />} />
        <ReactRouterDOM.Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
        <ReactRouterDOM.Route path="/track-order/:id" element={<TrackOrderPage />} />
        <ReactRouterDOM.Route path="/order/:id" element={<UserOrderDetailsPage />} />
      </ReactRouterDOM.Route>
    </ReactRouterDOM.Route>

    {/* Admin Layout (already has its own protection) */}
    <ReactRouterDOM.Route path="/admin" element={<AdminLayout />}>
      <ReactRouterDOM.Route index element={<DashboardPage />} />
      <ReactRouterDOM.Route path="products" element={<ProductListPage />} />
      <ReactRouterDOM.Route path="products/new" element={<ProductFormPage />} />
      <ReactRouterDOM.Route path="products/edit/:id" element={<ProductFormPage />} />
      <ReactRouterDOM.Route path="categories" element={<CategoryListPage />} />
      <ReactRouterDOM.Route path="categories/new" element={<CategoryFormPage />} />
      <ReactRouterDOM.Route path="categories/edit/:id" element={<CategoryFormPage />} />
      <ReactRouterDOM.Route path="orders" element={<OrderListPage />} />
      <ReactRouterDOM.Route path="orders/:id" element={<OrderDetailsPage />} />
      <ReactRouterDOM.Route path="invoices" element={<InvoicesPage />} />
      <ReactRouterDOM.Route path="users" element={<UserListPage />} />
      <ReactRouterDOM.Route path="users/new" element={<UserFormPage />} />
      <ReactRouterDOM.Route path="users/edit/:id" element={<UserFormPage />} />
      <ReactRouterDOM.Route path="users/:id" element={<UserDetailsPage />} />
      <ReactRouterDOM.Route path="reviews" element={<ReviewListPage />} />
      <ReactRouterDOM.Route path="returns" element={<ReturnsListPage />} />
      <ReactRouterDOM.Route path="approvals" element={<ApprovalsPage />} />
      <ReactRouterDOM.Route path="appearance" element={<AppearancePage />} />
      <ReactRouterDOM.Route path="content" element={<SiteContentPage />} />
      <ReactRouterDOM.Route path="subscribers" element={<SubscribersPage />} />
      <ReactRouterDOM.Route path="marketing" element={<MarketingPage />} />
      <ReactRouterDOM.Route path="marketing/promotions/new" element={<PromotionFormPage />} />
      <ReactRouterDOM.Route path="marketing/promotions/edit/:id" element={<PromotionFormPage />} />
      <ReactRouterDOM.Route path="settings" element={<SettingsPage />} />
      <ReactRouterDOM.Route path="analytics" element={<AnalyticsPage />} />
      <ReactRouterDOM.Route path="inbox" element={<InboxPage />} />
      <ReactRouterDOM.Route path="mails" element={<MailsPage />} />
      <ReactRouterDOM.Route path="mails/new" element={<MailTemplateFormPage />} />
      <ReactRouterDOM.Route path="mails/edit/:id" element={<MailTemplateFormPage />} />
    </ReactRouterDOM.Route>

    {/* Print Layout */}
    <ReactRouterDOM.Route element={<PrintLayout />}>
      <ReactRouterDOM.Route path="/invoice/:id" element={<InvoicePage />} />
      <ReactRouterDOM.Route path="/print/label/:orderId" element={<LabelPrintPage />} />
      <ReactRouterDOM.Route path="/print/bulk-documents" element={<BulkInvoicePrintPage />} />
    </ReactRouterDOM.Route>
  </ReactRouterDOM.Routes>
);

const StyleInjector = () => {
  const { siteSettings } = useAppContext();
  useEffect(() => {
    if (siteSettings?.primaryColor) {
      document.documentElement.style.setProperty('--color-primary', siteSettings.primaryColor);
    }
  }, [siteSettings]);
  return null; // This component does not render anything
}

const AppContent: React.FC = () => {
  const { isLoading } = useAppContext();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <>
      <StyleInjector />
      <ScrollToTop />
      <AppRoutes />
      <GlobalComponents />
      <SignUpPopup />
    </>
  );
}

const App: React.FC = () => {
  return (
    <ReactRouterDOM.HashRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ReactRouterDOM.HashRouter>
  );
};

export default App;
