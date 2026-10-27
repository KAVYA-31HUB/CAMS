import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileEdit,
  FolderCheck,
  Award,
  CreditCard,
  GraduationCap,
  Users,
  Layers,
  FileSpreadsheet,
  CheckCircle,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Shield,
  BarChart3,
  Server,
  Bell,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const coordinatorNav = [
  { label: 'Coordinator Console', path: '/coordinator', icon: Layers },
];
const financeNav = [
  { label: 'Finance Operations', path: '/finance', icon: CreditCard },
];
const adminNav = [
  { label: 'Admin Command Center', path: '/admin', icon: Shield },
  { label: 'Users & Staff', path: '/admin/users', icon: Users },
];

const ROLE_NAV = {
  APPLICANT: [
    { label: 'My Dashboard', path: '/applicant', icon: LayoutDashboard },
    { label: 'Submit Application', path: '/applicant/apply', icon: FileEdit },
    { label: 'Uploaded Documents', path: '/applicant/documents', icon: FolderCheck },
    { label: 'Allotment & Upgrades', path: '/applicant/allotment', icon: Award },
    { label: 'Fee Payments', path: '/applicant/fees', icon: CreditCard },
  ],
  COUNSELLOR: [
    { label: 'Verification Queue', path: '/counsellor', icon: FolderCheck },
  ],
  COORDINATOR: coordinatorNav,
  PROGRAMME_COORDINATOR: coordinatorNav,
  REGISTRAR: [
    { label: 'Admissions Overview', path: '/registrar', icon: BarChart3 },
  ],
  FINANCE: financeNav,
  FINANCE_OFFICER: financeNav,
  ADMIN: adminNav,
  ADMINISTRATOR: adminNav,
};

const DashboardLayout = ({ title, subtitle, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = user && ROLE_NAV[user.role] ? ROLE_NAV[user.role] : [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', backgroundColor: 'var(--color-bg-canvas)', position: 'relative' }}>
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(2px)',
            zIndex: 90
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.25rem 1rem',
          position: 'sticky',
          top: '70px',
          height: 'calc(100vh - 70px)',
          overflowY: 'auto',
          zIndex: 95,
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          ...(window.innerWidth <= 768 && !sidebarOpen ? { display: 'none' } : {})
        }}
        className={`dashboard-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}
      >
        {/* User Card */}
        <div style={{
          padding: '1rem',
          backgroundColor: 'var(--color-primary-light)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1.25rem',
          border: '1px solid #dbeafe'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.05rem',
              flexShrink: 0
            }}>
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.fullName || 'Portal User'}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                <span style={{
                  fontSize: '0.675rem',
                  fontWeight: 700,
                  color: '#1d4ed8',
                  backgroundColor: '#ffffff',
                  padding: '0.1rem 0.45rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #bfdbfe',
                  display: 'inline-block'
                }}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div style={{ flex: 1 }}>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: 'var(--color-text-muted)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '0.5rem',
            paddingLeft: '0.5rem'
          }}>
            Navigation Menu
          </span>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/applicant' || item.path === '/admin'}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    backgroundColor: isActive ? 'var(--color-accent-light)' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all var(--transition-fast)'
                  })}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight size={14} style={{ opacity: 0.5 }} />
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sign Out */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: 'auto' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'none',
              color: 'var(--color-danger)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <header style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--color-border)',
          padding: '1.25rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn btn-outline btn-sm mobile-sidebar-toggle"
              style={{ padding: '0.4rem', display: 'none' }}
              aria-label="Toggle sidebar menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
                {title}
              </h1>
              {subtitle && (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.15rem', margin: 0 }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              backgroundColor: 'var(--color-bg-subtle)',
              border: '1px solid var(--color-border)',
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.775rem',
              color: 'var(--color-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <Sparkles size={14} color="var(--color-accent)" />
              <span>Session: <strong>2026-27</strong> | Round: <strong>1</strong></span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: '2rem', overflowX: 'auto' }} className="dashboard-content">
          {children}
        </main>

        {/* Compact Administrative Footer */}
        <footer style={{
          padding: '1rem 2rem',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: '#ffffff',
          fontSize: '0.775rem',
          color: 'var(--color-text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div>
            &copy; 2026 College Admission Management System (CAMS). Quota & Regulatory Compliant.
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>AISHE Code: C-42918</span>
            <span>UGC Reference Norms</span>
          </div>
        </footer>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-sidebar-toggle {
            display: inline-flex !important;
          }
          .dashboard-sidebar {
            position: fixed !important;
            top: 70px !important;
            bottom: 0 !important;
            left: 0 !important;
            height: calc(100vh - 70px) !important;
            box-shadow: var(--shadow-xl);
          }
          .dashboard-content {
            padding: 1.25rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
