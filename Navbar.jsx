// src/components/Navbar/Navbar.jsx
import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar__inner">

        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">⬡</span>
          Product<strong>Vault</strong>
        </Link>

        <div className="navbar__right">
          {isAuthenticated ? (
            <>
              {/* Nav links — only shown when logged in */}
              <ul className="navbar__links">
                <li>
                  <NavLink to="/dashboard" className={({ isActive }) =>
                    `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
                    Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/products/new" className={({ isActive }) =>
                    `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
                    + Add Product
                  </NavLink>
                </li>
              </ul>

              {/* User info + logout */}
              <div className="navbar__user">
                <span className="navbar__user-name">
                  {user?.name}
                  {isAdmin && <span className="badge badge-admin" style={{ marginLeft: 6 }}>admin</span>}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  {loggingOut ? 'Logging out…' : 'Logout'}
                </button>
              </div>
            </>
          ) : (
            /* Public links */
            <ul className="navbar__links">
              <li>
                <NavLink to="/login" className={({ isActive }) =>
                  `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
                  Login
                </NavLink>
              </li>
              <li>
                <NavLink to="/signup" className={({ isActive }) =>
                  `navbar__link navbar__link--cta ${isActive ? 'navbar__link--active' : ''}`}>
                  Sign Up
                </NavLink>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
