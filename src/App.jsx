import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Quote from './pages/Quote';
import Contact from './pages/Contact';
import Certificates from './pages/Certificates';
import Showroom from './pages/Showroom';
import Dashboard from './pages/Dashboard';
import Products from './pages/admin/Products';
import Categories from './pages/admin/Categories';
import Quotes from './pages/admin/Quotes';
import Customers from './pages/admin/Customers';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/catalog" element={<Layout><Catalog /></Layout>} />
      <Route path="/quote" element={<Layout><Quote /></Layout>} />
      <Route path="/contact" element={<Layout><Contact /></Layout>} />
      <Route path="/certificates" element={<Layout><Certificates /></Layout>} />
      <Route path="/showroom" element={<Layout><Showroom /></Layout>} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<Layout type="admin"><Dashboard /></Layout>} />
      <Route path="/admin/products" element={<Layout type="admin"><Products /></Layout>} />
      <Route path="/admin/categories" element={<Layout type="admin"><Categories /></Layout>} />
      <Route path="/admin/quotes" element={<Layout type="admin"><Quotes /></Layout>} />
      <Route path="/admin/customers" element={<Layout type="admin"><Customers /></Layout>} />
      <Route path="/admin/analytics" element={<Layout type="admin"><Analytics /></Layout>} />
      <Route path="/admin/settings" element={<Layout type="admin"><Settings /></Layout>} />
    </Routes>
  );
}

export default App;
