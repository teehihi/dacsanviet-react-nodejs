import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CartProvider } from './context/CartContext.jsx';
import AppLayout from './components/AppLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import ContentPage from './pages/ContentPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import NewsPage from './pages/NewsPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import AdminLogin from './admin/AdminLogin.jsx';
import AdminDashboard from './admin/AdminDashboard.jsx';
import AdminProducts from './admin/AdminProducts.jsx';
import AdminOrders from './admin/AdminOrders.jsx';
import AdminCategories from './admin/AdminCategories.jsx';
import AdminCustomers from './admin/AdminCustomers.jsx';
import AdminPromotions from './admin/AdminPromotions.jsx';
import AdminNews from './admin/AdminNews.jsx';
import AdminReports from './admin/AdminReports.jsx';
import AdminSettings from './admin/AdminSettings.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/san-pham" element={<ProductsPage />} />
            <Route path="/danh-muc/:category" element={<ProductsPage />} />
            <Route path="/san-pham/:slug" element={<ProductDetailPage />} />
            <Route path="/gio-hang" element={<CartPage />} />
            <Route path="/thanh-toan" element={<CheckoutPage />} />
            <Route path="/gioi-thieu" element={<AboutPage />} />
            <Route path="/tin-tuc" element={<NewsPage />} />
            <Route path="/lien-he" element={<ContactPage />} />
            <Route path="/:slug" element={<ContentPage />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="promotions" element={<AdminPromotions />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
