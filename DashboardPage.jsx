// src/pages/DashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/api';
import ProductCard from '../components/ProductCard/ProductCard';
import './DashboardPage.css';

const CATEGORIES = ['', 'electronics', 'clothing', 'food', 'books', 'other'];

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts]     = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('');

  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true); setError(null);
    try {
      const { data } = await productService.getAll(params);
      setProducts(data.data);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id) => {
    try {
      await productService.remove(id);
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    fetchProducts(cat ? { category: cat } : {});
  };

  const visible = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="dashboard">
      <div className="container">

        {/* Welcome banner */}
        <div className="dashboard__hero fade-up">
          <div className="dashboard__hero-text">
            <h1 className="dashboard__title">
              Welcome back, <span className="dashboard__name">{user?.name}</span> 👋
            </h1>
            <p className="dashboard__sub">
              <span className={`badge badge-${user?.role}`}>{user?.role}</span>
              &nbsp;· {user?.email}
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/products/new')}>
            + Add Product
          </button>
        </div>

        {/* Stats row */}
        <div className="dashboard__stats">
          <div className="stat-tile">
            <span className="stat-tile__label">Total Products</span>
            <span className="stat-tile__value">{pagination.total}</span>
          </div>
          <div className="stat-tile">
            <span className="stat-tile__label">This Page</span>
            <span className="stat-tile__value">{visible.length}</span>
          </div>
          <div className="stat-tile">
            <span className="stat-tile__label">Your Role</span>
            <span className="stat-tile__value" style={{ color: 'var(--accent)' }}>{user?.role}</span>
          </div>
          {isAdmin && (
            <div className="stat-tile stat-tile--admin">
              <span className="stat-tile__label">Admin Access</span>
              <span className="stat-tile__value">✅ Full</span>
            </div>
          )}
        </div>

        {/* Role notice for regular users */}
        {!isAdmin && (
          <div className="alert alert-info" style={{ marginBottom: 24 }}>
            🔒 You can create and edit products. Only <strong>admins</strong> can delete products.
          </div>
        )}

        {/* Controls */}
        <div className="dashboard__controls">
          <input
            type="text" className="form-input dashboard__search"
            placeholder="Search products…" value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="dashboard__cats">
            {CATEGORIES.map(cat => (
              <button key={cat || 'all'}
                className={`cat-pill ${category === cat ? 'cat-pill--active' : ''}`}
                onClick={() => handleCategoryChange(cat)}>
                {cat || 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
            <div className="spinner" /> Loading products…
          </div>
        )}

        {/* Empty state */}
        {!loading && visible.length === 0 && (
          <div className="dashboard__empty">
            <span style={{ fontSize: 52 }}>📭</span>
            <h3>No products found</h3>
            <p>Add your first product to get started.</p>
            <button className="btn btn-primary" onClick={() => navigate('/products/new')}>+ Add Product</button>
          </div>
        )}

        {/* Grid */}
        {!loading && visible.length > 0 && (
          <div className="product-grid">
            {visible.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                onDelete={isAdmin ? handleDelete : null}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="dashboard__pagination">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(pg => (
              <button key={pg}
                className={`page-btn ${pagination.page === pg ? 'page-btn--active' : ''}`}
                onClick={() => fetchProducts({ page: pg, ...(category ? { category } : {}) })}>
                {pg}
              </button>
            ))}
          </div>
        )}

      </div>
    </main>
  );
};

export default DashboardPage;
