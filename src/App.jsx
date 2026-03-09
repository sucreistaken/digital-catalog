import React from 'react';
import { Routes, Route, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useBrand } from './context/BrandContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import BrandSelection from './pages/BrandSelection';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Contact from './pages/Contact';
import Certificates from './pages/Certificates';
import Showroom from './pages/Showroom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/admin/Products';
import Categories from './pages/admin/Categories';
import Customers from './pages/admin/Customers';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';
import SiteContent from './pages/admin/SiteContent';
import ShowroomTour from './pages/admin/ShowroomTour';
import Brands from './pages/admin/Brands';

// BrandGuard: redirects to brand selection if no brand is chosen
const BrandGuard = ({ children }) => {
  const { brandId } = useBrand();
  if (!brandId) return <Navigate to="/" replace />;
  return children;
};

// DomainRedirect: if domain maps to a brand, skip brand selection and go to /home
// Unless user explicitly navigated here via ?switch=true
const DomainRedirect = () => {
  const { domainBrand } = useBrand();
  const [searchParams] = useSearchParams();
  const forceShow = searchParams.get('switch') === 'true';
  if (domainBrand && !forceShow) return <Navigate to="/home" replace />;
  return <BrandSelection />;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Brand Selection (auto-redirects to /home if domain is mapped) */}
        <Route path="/" element={<DomainRedirect />} />

        {/* Public Routes (require brand) */}
        <Route path="/home" element={<BrandGuard><Layout><Home /></Layout></BrandGuard>} />
        <Route path="/catalog" element={<BrandGuard><Layout><Catalog /></Layout></BrandGuard>} />
        <Route path="/contact" element={<BrandGuard><Layout><Contact /></Layout></BrandGuard>} />
        <Route path="/certificates" element={<BrandGuard><Layout><Certificates /></Layout></BrandGuard>} />

        {/* Showroom - shared, no brand guard */}
        <Route path="/showroom" element={<Showroom />} />

        {/* Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <Layout type="admin"><Dashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/products" element={
          <ProtectedRoute>
            <Layout type="admin"><Products /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/categories" element={
          <ProtectedRoute>
            <Layout type="admin"><Categories /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/customers" element={
          <ProtectedRoute>
            <Layout type="admin"><Customers /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute>
            <Layout type="admin"><Analytics /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute>
            <Layout type="admin"><Settings /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/showroom-tour" element={
          <ProtectedRoute>
            <Layout type="admin"><ShowroomTour /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/brands" element={
          <ProtectedRoute>
            <Layout type="admin"><Brands /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/content" element={
          <ProtectedRoute>
            <Layout type="admin"><SiteContent /></Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;
