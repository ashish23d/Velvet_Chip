
import React, { useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import { AppProvider, useAppContext } from './context/AppContext.tsx';
import { supabase } from './services/supabaseClient.ts';
import Breadcrumb from './components/Breadcrumb.tsx';
import CartHeader from './components/CartHeader.tsx';
import AdminLayout from './layouts/AdminLayout.tsx';
import FlyToCartAnimation from './components/FlyToCartAnimation.tsx';
import AnnouncementBar from './components/AnnouncementBar.tsx';
import PrintLayout from './layouts/PrintLayout.tsx';
import ScrollToTop from './components/ScrollToTop.tsx';
import SearchBar from './components/SearchBar.tsx';
import OfferModal from './components/OfferModal.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import SignUpPopup from './components/SignUpPopup.tsx';
import ConfirmationModal from './components/ConfirmationModal.tsx';
import BottomNavigation from './components/BottomNavigation.tsx';

// Lazy load pages
const HomePage = React.lazy(() => import('./pages/HomePage.tsx'));
const CategoryPage = React.lazy(() => import('./pages/CategoryPage.tsx'));
const ProductDetailPage = React.lazy(() => import('./pages/ProductDetailPage.tsx'));
const CartPage = React.lazy(() => import('./pages/CartPage.tsx'));
const LoginPage = React.lazy(() => import('./pages/LoginPage.tsx'));
const TermsPage = React.lazy(() => import('./pages/TermsPage.tsx'));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage.tsx'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage.tsx'));
const WishlistPage = React.lazy(() => import('./pages/WishlistPage.tsx'));
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage.tsx'));
const AddressPage = React.lazy(() => import('./pages/AddressPage.tsx'));
const PaymentPage = React.lazy(() => import('./pages/PaymentPage.tsx'));
const DashboardPage = React.lazy(() => import('./pages/admin/DashboardPage.tsx'));
const ProductListPage = React.lazy(() => import('./pages/admin/ProductListPage.tsx'));
const ProductFormPage = React.lazy(() => import('./pages/admin/ProductFormPage.tsx'));
const CategoryListPage = React.lazy(() => import('./pages/admin/CategoryListPage.tsx'));
const OrderListPage = React.lazy(() => import('./pages/admin/OrderListPage.tsx'));
const OrderDetailsPage = React.lazy(() => import('./pages/admin/OrderDetailsPage.tsx'));
const UserListPage = React.lazy(() => import('./pages/admin/UserListPage.tsx'));
const UserDetailsPage = React.lazy(() => import('./pages/admin/UserDetailsPage.tsx'));
const ReviewListPage = React.lazy(() => import('./pages/admin/ReviewListPage.tsx'));
const OrderConfirmationPage = React.lazy(() => import('./pages/OrderConfirmationPage.tsx'));
const AboutPage = React.lazy(() => import('./pages/AboutPage.tsx'));
const ContactPage = React.lazy(() => import('./pages/ContactPage.tsx'));
const CategoryFormPage = React.lazy(() => import('./pages/admin/CategoryFormPage.tsx'));
const AppearancePage = React.lazy(() => import('./pages/admin/AppearancePage.tsx'));
const SiteContentPage = React.lazy(() => import('./pages/admin/SiteContentPage.tsx'));
const UserFormPage = React.lazy(() => import('./pages/admin/UserFormPage.tsx'));
const SearchPage = React.lazy(() => import('./pages/SearchPage.tsx'));
const ApprovalsPage = React.lazy(() => import('./pages/admin/ApprovalsPage.tsx'));
const TrackOrderPage = React.lazy(() => import('./pages/TrackOrderPage.tsx'));
const SubscribersPage = React.lazy(() => import('./pages/admin/SubscribersPage.tsx'));
const ReviewProductPage = React.lazy(() => import('./pages/ReviewProductPage.tsx'));
const SettingsPage = React.lazy(() => import('./pages/admin/SettingsPage.tsx'));
const MarketingPage = React.lazy(() => import('./pages/admin/MarketingPage.tsx'));
const PromotionFormPage = React.lazy(() => import('./pages/admin/CouponFormPage.tsx'));
const ReturnRequestPage = React.lazy(() => import('./pages/ReturnRequestPage.tsx'));
const CouponsPage = React.lazy(() => import('./pages/CouponsPage.tsx'));
const UserOrderDetailsPage = React.lazy(() => import('./pages/UserOrderDetailsPage.tsx'));
const InvoicePage = React.lazy(() => import('./pages/InvoicePage.tsx'));
const InboxPage = React.lazy(() => import('./pages/admin/InboxPage.tsx'));
const MailsPage = React.lazy(() => import('./pages/admin/MailsPage.tsx'));
const MailTemplateFormPage = React.lazy(() => import('./pages/admin/MailTemplateFormPage.tsx'));
const InvoicesPage = React.lazy(() => import('./pages/admin/InvoicesPage.tsx'));
const LabelPrintPage = React.lazy(() => import('./pages/LabelPrintPage.tsx'));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage.tsx'));
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage.tsx'));
const ReturnsListPage = React.lazy(() => import('./pages/admin/ReturnsListPage.tsx'));
const BulkInvoicePrintPage = React.lazy(() => import('./pages/admin/BulkInvoicePrintPage.tsx'));
const AnalyticsPage = React.lazy(() => import('./pages/admin/AnalyticsPage.tsx'));
const CardAddonsPage = React.lazy(() => import('./pages/admin/CardAddonsPage.tsx'));
const CardAddonFormPage = React.lazy(() => import('./pages/admin/CardAddonFormPage.tsx'));
const BroadcastsPage = React.lazy(() => import('./pages/admin/BroadcastsPage.tsx'));
const ShippingSettingsPage = React.lazy(() => import('./pages/admin/ShippingSettingsPage.tsx'));
const DeliverySettingsPage = React.lazy(() => import('./pages/admin/DeliverySettingsPage.tsx'));

const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-gray-900">
    <div className="text-center">
      <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  </div>
);


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
    <div className="flex flex-col min-h-screen font-sans bg-white dark:bg-gray-900 transition-colors duration-200 pb-16 md:pb-0">
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
      <BottomNavigation />
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
  <React.Suspense fallback={<LoadingFallback />}>
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
        <ReactRouterDOM.Route path="card-addons" element={<CardAddonsPage />} />
        <ReactRouterDOM.Route path="card-addons/new" element={<CardAddonFormPage />} />
        <ReactRouterDOM.Route path="card-addons/edit/:id" element={<CardAddonFormPage />} />
        <ReactRouterDOM.Route path="settings" element={<SettingsPage />} />
        <ReactRouterDOM.Route path="analytics" element={<AnalyticsPage />} />
        <ReactRouterDOM.Route path="inbox" element={<InboxPage />} />
        <ReactRouterDOM.Route path="mails" element={<MailsPage />} />
        <ReactRouterDOM.Route path="mails/new" element={<MailTemplateFormPage />} />
        <ReactRouterDOM.Route path="mails/edit/:id" element={<MailTemplateFormPage />} />
        <ReactRouterDOM.Route path="broadcasts" element={<BroadcastsPage />} />
        <ReactRouterDOM.Route path="shipping" element={<ShippingSettingsPage />} />
        <ReactRouterDOM.Route path="delivery" element={<DeliverySettingsPage />} />
      </ReactRouterDOM.Route>

      {/* Print Layout */}
      <ReactRouterDOM.Route element={<PrintLayout />}>
        <ReactRouterDOM.Route path="/invoice/:id" element={<InvoicePage />} />
        <ReactRouterDOM.Route path="/print/label/:orderId" element={<LabelPrintPage />} />
        <ReactRouterDOM.Route path="/print/bulk-documents" element={<BulkInvoicePrintPage />} />
      </ReactRouterDOM.Route>
    </ReactRouterDOM.Routes>
  </React.Suspense>
);

const StyleInjector = () => {
  const { siteSettings } = useAppContext();
  useEffect(() => {
    if (siteSettings?.primaryColor) {
      document.documentElement.style.setProperty('--color-primary', siteSettings.primaryColor);
    }
    if (siteSettings?.hoverColor) {
      document.documentElement.style.setProperty('--color-primary-hover', siteSettings.hoverColor);
    }
  }, [siteSettings]);
  return null; // This component does not render anything
}

const AppContent: React.FC = () => {
  const { isLoading, session } = useAppContext();
  const navigate = ReactRouterDOM.useNavigate();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 font-medium text-gray-600 dark:text-gray-400">Loading...</p>
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
  const [isRecoveryMode, setIsRecoveryMode] = React.useState(
    window.location.href.includes('type=recovery')
  );

  useEffect(() => {
    if (isRecoveryMode) {
      console.log("Recovery Mode: Intercepting Supabase hash...");

      // 1. If path has access_token but no hash, fix it for Supabase
      if (!window.location.hash && window.location.href.includes('access_token')) {
        console.log("Fixing malformed URL for Supabase...");
        const newUrl = window.location.href.replace('access_token', '#access_token');
        window.location.replace(newUrl);
        return;
      }

      // 2. Listen for the session to be ready
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (session || event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
          console.log("Supabase Auth Success! Redirecting to Reset Password.");
          // Force the router hash
          window.location.hash = '/reset-password';
          setIsRecoveryMode(false);
        }
      });

      // 3. Fallback: Check if session is already there (race condition)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          console.log("Session found immediately. Proceeding.");
          window.location.hash = '/reset-password';
          setIsRecoveryMode(false);
        }
      });

      // 4. Safety Timeout (10s)
      const timer = setTimeout(() => {
        console.warn("Recovery timeout. Mounting app anyway.");
        // If we still have a token hash, clear it to prevent Router crash
        if (window.location.hash.includes('access_token')) {
          window.location.hash = '/'; // Fallback to home
        }
        setIsRecoveryMode(false);
      }, 10000);

      return () => {
        authListener.subscription.unsubscribe();
        clearTimeout(timer);
      };
    }
  }, [isRecoveryMode]);

  if (isRecoveryMode) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 font-medium text-gray-600 dark:text-gray-400">
            Verifying secure link...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ReactRouterDOM.HashRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ReactRouterDOM.HashRouter>
  );
};

export default App;
