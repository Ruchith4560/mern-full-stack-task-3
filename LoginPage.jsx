// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // If user tried to access a protected page, redirect there after login
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password)                      e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError(null);
    try {
      await login(form);
      navigate(from, { replace: true }); // go to intended page
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card fade-up">

        <div className="auth-card__header">
          <span className="auth-card__icon">🔐</span>
          <h1 className="auth-card__title">Welcome Back</h1>
          <p className="auth-card__sub">Log in to access your vault</p>
        </div>

        {/* Show where they'll be redirected */}
        {from !== '/dashboard' && (
          <div className="alert alert-info" style={{ marginBottom: 16 }}>
            Please log in to continue to <strong>{from}</strong>
          </div>
        )}

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit} noValidate className="auth-form">

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input id="email" name="email" type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="ada@example.com" value={form.email} onChange={handleChange}
              autoComplete="email" />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input id="password" name="password" type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Your password" value={form.password} onChange={handleChange}
              autoComplete="current-password" />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <><span className="spinner spinner-sm" /> Logging in…</> : 'Log In →'}
          </button>
        </form>

        <p className="auth-card__footer">
          Don't have an account? <Link to="/signup" className="auth-card__link">Sign up free</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
