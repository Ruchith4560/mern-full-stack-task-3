// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Navbar from './components/Navbar/Navbar';

import LoginPage          from './pages/LoginPage';
import SignupPage         from './pages/SignupPage';
import DashboardPage      from './pages/DashboardPage';
import CreateProductPage  from './pages/CreateProductPage';
import EditProductPage    from './pages/EditProductPage';
import ProductDetailPage  from './pages/ProductDetailPage';

function App() {
  return (
    // AuthProvider wraps everything so every component can call useAuth()
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>

          {/* ── Public routes (no login needed) ───────────────── */}
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* ── Protected routes (must be logged in) ──────────── */}
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />
          <Route path="/products/new" element={
            <ProtectedRoute><CreateProductPage /></ProtectedRoute>
          } />
          <Route path="/products/:id" element={
            <ProtectedRoute><ProductDetailPage /></ProtectedRoute>
          } />
          <Route path="/products/:id/edit" element={
            <ProtectedRoute><EditProductPage /></ProtectedRoute>
          } />

          {/* ── Redirects ──────────────────────────────────────── */}
          <Route path="/"  element={<Navigate to="/dashboard" replace />} />
          <Route path="*"  element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
