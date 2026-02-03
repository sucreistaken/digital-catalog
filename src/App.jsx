import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Quote from './pages/Quote';
import Contact from './pages/Contact';
import Certificates from './pages/Certificates';
import Showroom from './pages/Showroom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/admin/Products';
import Categories from './pages/admin/Categories';
import Quotes from './pages/admin/Quotes';
import Customers from './pages/admin/Customers';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';
import SiteContent from './pages/admin/SiteContent';
import ShowroomTour from './pages/admin/ShowroomTour';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/catalog" element={<Layout><Catalog /></Layout>} />
        <Route path="/quote" element={<Layout><Quote /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/certificates" element={<Layout><Certificates /></Layout>} />
        <Route path="/showroom" element={<Layout><Showroom /></Layout>} />

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
        <Route path="/admin/quotes" element={
          <ProtectedRoute>
            <Layout type="admin"><Quotes /></Layout>
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
