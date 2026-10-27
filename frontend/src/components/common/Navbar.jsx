import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationApi } from '../../api/notificationApi';
import {
  GraduationCap,
  Bell,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  LayoutDashboard,
  BookOpen,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadUnreadCount = async () => {
    try {
      const res = await notificationApi.getUnreadCount();
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (e) {
      // Ignore
    }
  };

  const handleNotificationClick = async () => {
    setShowNotificationsModal(true);
    try {
      const res = await notificationApi.getMyNotifications();
      setNotifications(res.data || []);
    } catch (e) {
      // Ignore
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      // Ignore
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: 'var(--shadow-xs)'
    }}>
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none' }}>
          <div style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)', display: 'block', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              CAMS Portal
            </span>
            <span style={{ fontSize: '0.675rem', color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              College Admission System
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="desktop-nav-container">
          <NavLink
            to="/"
            style={({ isActive }) => ({
              fontSize: '0.875rem',
              fontWeight: 600,
              color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              backgroundColor: isActive ? 'var(--color-accent-light)' : 'transparent',
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              transition: 'all var(--transition-fast)'
            })}
          >
            Home
          </NavLink>
          <NavLink
            to="/programmes"
            style={({ isActive }) => ({
              fontSize: '0.875rem',
              fontWeight: 600,
              color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              backgroundColor: isActive ? 'var(--color-accent-light)' : 'transparent',
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              transition: 'all var(--transition-fast)'
            })}
          >
            Programmes
          </NavLink>
          <NavLink
            to="/prospectus"
            style={({ isActive }) => ({
              fontSize: '0.875rem',
              fontWeight: 600,
              color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              backgroundColor: isActive ? 'var(--color-accent-light)' : 'transparent',
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              transition: 'all var(--transition-fast)'
            })}
          >
            Prospectus
          </NavLink>
          <NavLink
            to="/status"
            style={({ isActive }) => ({
              fontSize: '0.875rem',
              fontWeight: 600,
              color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              backgroundColor: isActive ? 'var(--color-accent-light)' : 'transparent',
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              transition: 'all var(--transition-fast)'
            })}
          >
            Track Status
          </NavLink>

          {/* Authenticated / Unauthenticated Controls */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.75rem', paddingLeft: '0.75rem', borderLeft: '1px solid var(--color-border)' }}>
              {/* Notification Button */}
              <button
                onClick={handleNotificationClick}
                style={{
                  position: 'relative',
                  background: 'none',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.45rem',
                  backgroundColor: '#ffffff'
                }}
                aria-label="View notifications"
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    backgroundColor: 'var(--color-danger)',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    borderRadius: 'var(--radius-full)',
                    minWidth: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dashboard Action Button */}
              <Link
                to={getDashboardPath(user?.role)}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <LayoutDashboard size={15} />
                <span>Dashboard ({user?.role})</span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                title="Sign out"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginLeft: '0.75rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Apply Now (2026-27)
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="btn btn-outline btn-sm mobile-menu-toggle"
          style={{ display: 'none', padding: '0.5rem' }}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--color-border)',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem'
        }} className="mobile-menu-drawer">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '0.5rem', fontWeight: 600, color: 'var(--color-text-primary)' }}
          >
            Home
          </Link>
          <Link
            to="/programmes"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '0.5rem', fontWeight: 600, color: 'var(--color-text-primary)' }}
          >
            Programmes
          </Link>
          <Link
            to="/prospectus"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '0.5rem', fontWeight: 600, color: 'var(--color-text-primary)' }}
          >
            Prospectus 2026-27
          </Link>
          <Link
            to="/status"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '0.5rem', fontWeight: 600, color: 'var(--color-text-primary)' }}
          >
            Track Application Status
          </Link>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
            {isAuthenticated ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link
                  to={getDashboardPath(user?.role)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Go to {user?.role} Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%', justifyContent: 'center', color: 'var(--color-danger)' }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Apply Now
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotificationsModal && (
        <div className="modal-backdrop" onClick={() => setShowNotificationsModal(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="card-header" style={{ marginTop: 0 }}>
              <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={18} color="var(--color-accent)" />
                <span>Admission Notifications</span>
              </h3>
              <button
                onClick={() => setShowNotificationsModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '0.25rem' }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--color-text-muted)' }}>
                  <Bell size={32} style={{ opacity: 0.3, margin: '0 auto 0.5rem auto' }} />
                  <p style={{ fontSize: '0.875rem' }}>No notifications found at this time.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: '0.85rem',
                      borderBottom: '1px solid var(--color-border)',
                      backgroundColor: n.isRead ? 'transparent' : 'var(--color-primary-light)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '0.4rem',
                      cursor: 'pointer'
                    }}
                    onClick={() => markNotificationAsRead(n.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                        {n.title}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                      {n.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav-container {
            display: none !important;
          }
          .mobile-menu-toggle {
            display: inline-flex !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
