import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout Components
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { AdminLayout } from '@/components/layout/AdminLayout';

// Customer Pages
import { HomePage } from '@/pages/Home/HomePage';
import { ProductsPage } from '@/pages/Products/ProductsPage';
import { ProductDetailsPage } from '@/pages/ProductDetails/ProductDetailsPage';
import { CategoriesPage } from '@/pages/Categories/CategoriesPage';
import { CartPage } from '@/pages/Cart/CartPage';
import { CheckoutPage } from '@/pages/Checkout/CheckoutPage';
import { OrderSuccessPage } from '@/pages/OrderSuccess/OrderSuccessPage';
import { LoginPage } from '@/pages/Login/LoginPage';
import { RegisterPage } from '@/pages/Register/RegisterPage';
import { ForgotPasswordPage } from '@/pages/Auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/Auth/ResetPasswordPage';
import { ProfilePage } from '@/pages/Profile/ProfilePage';

import { OrdersPage } from '@/pages/Orders/OrdersPage';
import { WishlistPage } from '@/pages/Wishlist/WishlistPage';
import { CraftsmanshipPage } from '@/pages/About/CraftsmanshipPage';
import { GalleryPage } from '@/pages/Gallery/GalleryPage';
import { ContactPage } from '@/pages/Contact/ContactPage';
import { FAQPage } from '@/pages/FAQ/FAQPage';
import {
  ShippingPolicyPage,
  RefundPolicyPage,
  PrivacyPolicyPage,
  TermsPage,
  TermsAndConditionsPage,
  TermsOfSalePage,
  CancellationPolicyPage,
  ReturnRefundPolicyPage,
  PaymentPolicyPage,
  CookiePolicyPage,
  ContactUsPage,
  GrievanceRedressalPage,
} from '@/pages/Policies/PoliciesPage';

import { CookieConsentBanner } from '@/components/legal/CookieConsentBanner';
import { ReconsentModal } from '@/components/legal/ReconsentModal';

// Admin Pages
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage';
import { AdminProductFormPage } from '@/pages/admin/AdminProductFormPage';
import { AdminCategoriesPage } from '@/pages/admin/AdminCategoriesPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';
import { AdminOrderDetailsPage } from '@/pages/admin/AdminOrderDetailsPage';
import { AdminCustomersPage } from '@/pages/admin/AdminCustomersPage';
import { AdminReviewsPage } from '@/pages/admin/AdminReviewsPage';
import { AdminCouponsPage } from '@/pages/admin/AdminCouponsPage';
import { AdminBannersPage } from '@/pages/admin/AdminBannersPage';
import { AdminCMSPage } from '@/pages/admin/AdminCMSPage';
import { AdminGalleryPage } from '@/pages/admin/AdminGalleryPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminBulkOrdersPage } from '@/pages/admin/AdminBulkOrdersPage';
import { AdminWhyVKPage } from '@/pages/admin/AdminWhyVKPage';
import { AdminLegalPage } from '@/pages/admin/AdminLegalPage';

import { useAuthStore } from '@/store/authStore';

// Customer Layout Wrapper
const CustomerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuthStore();

  // If logged in user is an Admin, restrict to Admin Portal only
  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-[#F4F4F5] flex flex-col font-sans selection:bg-[#D4AF37] selection:text-[#09090B]">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <CookieConsentBanner />
      <ReconsentModal />
    </div>
  );
};

// Customer Protected Route (Requires User Login)
const CustomerProtectedRoute: React.FC<{ children: React.ReactNode; redirect?: string }> = ({
  children,
  redirect = '/checkout',
}) => {
  const { isAuthenticated, isAdmin } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Customer Storefront Routes */}
      <Route
        path="/"
        element={
          <CustomerLayout>
            <HomePage />
          </CustomerLayout>
        }
      />
      <Route
        path="/products"
        element={
          <CustomerLayout>
            <ProductsPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/products/:slug"
        element={
          <CustomerLayout>
            <ProductDetailsPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/categories"
        element={
          <CustomerLayout>
            <CategoriesPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/cart"
        element={
          <CustomerLayout>
            <CartPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/checkout"
        element={
          <CustomerProtectedRoute redirect="/checkout">
            <CustomerLayout>
              <CheckoutPage />
            </CustomerLayout>
          </CustomerProtectedRoute>
        }
      />
      <Route
        path="/order-success/:orderNumber"
        element={
          <CustomerLayout>
            <OrderSuccessPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/order_success/:orderNumber"
        element={
          <CustomerLayout>
            <OrderSuccessPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/login"
        element={
          <CustomerLayout>
            <LoginPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/register"
        element={
          <CustomerLayout>
            <RegisterPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <CustomerLayout>
            <ForgotPasswordPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/reset-password"
        element={
          <CustomerLayout>
            <ResetPasswordPage />
          </CustomerLayout>
        }
      />

      <Route
        path="/profile"
        element={
          <CustomerLayout>
            <ProfilePage />
          </CustomerLayout>
        }
      />
      <Route
        path="/orders"
        element={
          <CustomerLayout>
            <OrdersPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/wishlist"
        element={
          <CustomerLayout>
            <WishlistPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/craftsmanship"
        element={
          <CustomerLayout>
            <CraftsmanshipPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/gallery"
        element={
          <CustomerLayout>
            <GalleryPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/contact"
        element={
          <CustomerLayout>
            <ContactPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/faq"
        element={
          <CustomerLayout>
            <FAQPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/shipping-policy"
        element={
          <CustomerLayout>
            <ShippingPolicyPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/cancellation-policy"
        element={
          <CustomerLayout>
            <CancellationPolicyPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/return-refund-policy"
        element={
          <CustomerLayout>
            <ReturnRefundPolicyPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/refund-policy"
        element={
          <CustomerLayout>
            <RefundPolicyPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/privacy-policy"
        element={
          <CustomerLayout>
            <PrivacyPolicyPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/terms-and-conditions"
        element={
          <CustomerLayout>
            <TermsAndConditionsPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/terms"
        element={
          <CustomerLayout>
            <TermsPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/terms-of-sale"
        element={
          <CustomerLayout>
            <TermsOfSalePage />
          </CustomerLayout>
        }
      />
      <Route
        path="/payment-policy"
        element={
          <CustomerLayout>
            <PaymentPolicyPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/cookie-policy"
        element={
          <CustomerLayout>
            <CookiePolicyPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/contact-us"
        element={
          <CustomerLayout>
            <ContactUsPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/grievance-redressal"
        element={
          <CustomerLayout>
            <GrievanceRedressalPage />
          </CustomerLayout>
        }
      />

      {/* Admin Login Route */}
      <Route
        path="/admin/login"
        element={
          <CustomerLayout>
            <LoginPage />
          </CustomerLayout>
        }
      />

      {/* Protected Admin Portal Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<AdminProductFormPage />} />
        <Route path="products/:id/edit" element={<AdminProductFormPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="inventory" element={<Navigate to="/admin/products" replace />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="orders/:id" element={<AdminOrderDetailsPage />} />
        <Route path="bulk-orders" element={<AdminBulkOrdersPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="coupons" element={<AdminCouponsPage />} />
        <Route path="legal-policies" element={<AdminLegalPage />} />
        <Route path="banners" element={<AdminBannersPage />} />
        <Route path="why-vk" element={<AdminWhyVKPage />} />
        <Route path="cms" element={<AdminCMSPage />} />
        <Route path="testimonials" element={<AdminCMSPage />} />
        <Route path="faqs" element={<AdminCMSPage />} />
        <Route path="gallery" element={<AdminGalleryPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="admin-users" element={<AdminUsersPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
