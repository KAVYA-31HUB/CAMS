import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Shield,
  GraduationCap,
  FileCheck,
  Layers,
  BarChart3,
  CreditCard,
  UserCheck,
  UserX,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Calendar,
  Phone,
  Mail,
  Award,
  FileText,
  Clock,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';

const ROLE_DISPLAY = {
  APPLICANT: { label: 'Applicant', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', icon: GraduationCap },
  COUNSELLOR: { label: 'Counsellor', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', icon: FileCheck },
  PROGRAMME_COORDINATOR: { label: 'Programme Coordinator', bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff', icon: Layers },
  COORDINATOR: { label: 'Programme Coordinator', bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff', icon: Layers },
  REGISTRAR: { label: 'Registrar', bg: '#fff7ed', color: '#c2410c', border: '#fed7aa', icon: BarChart3 },
  FINANCE_OFFICER: { label: 'Finance Officer', bg: '#ecfeff', color: '#0e7490', border: '#a5f3fc', icon: CreditCard },
  FINANCE: { label: 'Finance Officer', bg: '#ecfeff', color: '#0e7490', border: '#a5f3fc', icon: CreditCard },
  ADMINISTRATOR: { label: 'Administrator', bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', icon: Shield },
  ADMIN: { label: 'Administrator', bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', icon: Shield },
};

export default function UserManagementPage() {
  const { showSuccess, showError } = useToast();
  const location = useLocation();

  // Data states
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [staffTab, setStaffTab] = useState('ALL'); // 'ALL', 'STAFF', 'APPLICANTS'

  // Pagination & Sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');

  // Modals
  const [viewingUser, setViewingUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'COUNSELLOR',
    password: '',
    confirmPassword: '',
    isActive: true
  });
  const [addLoading, setAddLoading] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'COUNSELLOR',
    isActive: true
  });
  const [editLoading, setEditLoading] = useState(false);

  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Sync role query param from URL if present (e.g. from staff card clicks)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam) {
      setRoleFilter(roleParam.toUpperCase());
    }
  }, [location.search]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setRefreshing(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getUserStats().catch(() => ({ data: null }))
      ]);

      setUsers(usersRes.data || []);
      if (statsRes?.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to fetch user directory');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // View User Details
  const handleOpenViewModal = async (user) => {
    setViewingUser(user);
    setUserDetails(null);
    setLoadingDetails(true);
    try {
      const res = await adminApi.getUserDetails(user.id);
      setUserDetails(res.data);
    } catch (err) {
      showError('Failed to load comprehensive user details');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Toggle user active status
  const handleToggleStatus = async (user) => {
    const nextStatus = !user.isActive;
    try {
      await adminApi.toggleUserStatus(user.id, nextStatus);
      showSuccess(`User ${user.email} is now ${nextStatus ? 'ACTIVE' : 'INACTIVE'}`);
      // Optimistic local update
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: nextStatus } : u));
      // Refresh stats
      adminApi.getUserStats().then(res => setStats(res.data)).catch(() => {});
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to change user account status');
    }
  };

  // Create User / Staff
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (addForm.password && addForm.password !== addForm.confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    setAddLoading(true);
    try {
      const payload = {
        name: addForm.name.trim(),
        email: addForm.email.trim(),
        phone: addForm.phone ? addForm.phone.trim() : null,
        role: addForm.role,
        password: addForm.password ? addForm.password.trim() : 'ADMIN@1234',
        isActive: addForm.isActive
      };
      await adminApi.createUser(payload);
      showSuccess(`Account for ${payload.email} created successfully`);
      setShowAddModal(false);
      setAddForm({
        name: '',
        email: '',
        phone: '',
        role: 'COUNSELLOR',
        password: '',
        confirmPassword: '',
        isActive: true
      });
      loadData(true);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create user account');
    } finally {
      setAddLoading(false);
    }
  };

  // Edit User
  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.fullName || user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role,
      isActive: user.isActive ?? true
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setEditLoading(true);
    try {
      const payload = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone ? editForm.phone.trim() : null,
        role: editForm.role,
        isActive: editForm.isActive
      };
      await adminApi.updateUser(editingUser.id, payload);
      showSuccess(`User ${payload.email} updated successfully`);
      setEditingUser(null);
      loadData(true);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update user profile');
    } finally {
      setEditLoading(false);
    }
  };

  // Delete User
  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    setDeleteLoading(true);
    try {
      await adminApi.deleteUser(deletingUser.id);
      showSuccess(`User ${deletingUser.email} has been permanently deleted`);
      setDeletingUser(null);
      loadData(true);
    } catch (err) {
      showError(err.response?.data?.message || 'Could not delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtered and Sorted Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // 1. Staff Tab Filter
      if (staffTab === 'STAFF') {
        if (u.role === 'APPLICANT') return false;
      } else if (staffTab === 'APPLICANTS') {
        if (u.role !== 'APPLICANT') return false;
      }

      // 2. Role Dropdown Filter
      if (roleFilter !== 'ALL') {
        const r = u.role ? u.role.toUpperCase() : '';
        const target = roleFilter.toUpperCase();
        if (target === 'PROGRAMME_COORDINATOR' && (r === 'PROGRAMME_COORDINATOR' || r === 'COORDINATOR')) {
          // match
        } else if (target === 'FINANCE_OFFICER' && (r === 'FINANCE_OFFICER' || r === 'FINANCE')) {
          // match
        } else if (target === 'ADMINISTRATOR' && (r === 'ADMINISTRATOR' || r === 'ADMIN')) {
          // match
        } else if (r !== target) {
          return false;
        }
      }

      // 3. Status Filter
      if (statusFilter === 'ACTIVE' && !u.isActive) return false;
      if (statusFilter === 'INACTIVE' && u.isActive) return false;

      // 4. Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const idStr = u.id ? String(u.id) : '';
        const nameStr = (u.fullName || u.name || '').toLowerCase();
        const emailStr = (u.email || '').toLowerCase();
        const phoneStr = u.phone || '';
        const roleStr = (u.role || '').toLowerCase();
        const matches = idStr.includes(q) || nameStr.includes(q) || emailStr.includes(q) || phoneStr.includes(q) || roleStr.includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [users, staffTab, roleFilter, statusFilter, searchQuery]);

  // Sort
  const sortedUsers = useMemo(() => {
    const list = [...filteredUsers];
    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'name') {
        valA = (a.fullName || a.name || '').toLowerCase();
        valB = (b.fullName || b.name || '').toLowerCase();
      } else if (sortField === 'email') {
        valA = (a.email || '').toLowerCase();
        valB = (b.email || '').toLowerCase();
      } else if (sortField === 'role') {
        valA = (a.role || '').toLowerCase();
        valB = (b.role || '').toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredUsers, sortField, sortDirection]);

  // Paginated Users
  const totalPages = Math.ceil(sortedUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedUsers.slice(start, start + pageSize);
  }, [sortedUsers, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const roleCardCounts = [
    { key: 'ALL', label: 'Total Users', count: stats?.totalUsers ?? users.length, color: 'var(--color-primary)', bg: '#f0f4f9', icon: Users },
    { key: 'APPLICANT', label: 'Applicants', count: stats?.applicants ?? users.filter(u => u.role === 'APPLICANT').length, color: '#1d4ed8', bg: '#eff6ff', icon: GraduationCap },
    { key: 'COUNSELLOR', label: 'Counsellors', count: stats?.counsellors ?? users.filter(u => u.role === 'COUNSELLOR').length, color: '#15803d', bg: '#f0fdf4', icon: FileCheck },
    { key: 'PROGRAMME_COORDINATOR', label: 'Coordinators', count: stats?.programmeCoordinators ?? users.filter(u => u.role === 'PROGRAMME_COORDINATOR' || u.role === 'COORDINATOR').length, color: '#7e22ce', bg: '#faf5ff', icon: Layers },
    { key: 'REGISTRAR', label: 'Registrars', count: stats?.registrars ?? users.filter(u => u.role === 'REGISTRAR').length, color: '#c2410c', bg: '#fff7ed', icon: BarChart3 },
    { key: 'FINANCE_OFFICER', label: 'Finance Officers', count: stats?.financeOfficers ?? users.filter(u => u.role === 'FINANCE_OFFICER' || u.role === 'FINANCE').length, color: '#0e7490', bg: '#ecfeff', icon: CreditCard },
    { key: 'ADMINISTRATOR', label: 'Administrators', count: stats?.administrators ?? users.filter(u => u.role === 'ADMINISTRATOR' || u.role === 'ADMIN').length, color: '#b91c1c', bg: '#fef2f2', icon: Shield },
  ];

  if (loading) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <LoadingSpinner text="Retrieving Institutional User Directory & Role Registry..." />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      {/* Top Header Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)'
            }}>
              <Users size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                User & Staff Management
              </h1>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Manage applicants, admission staff and system administrators.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => loadData(true)}
            className="btn btn-outline"
            disabled={refreshing}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} className={refreshing ? 'spin-icon' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 700 }}
          >
            <UserPlus size={16} />
            <span>Add User / Staff</span>
          </button>
        </div>
      </div>

      {/* Real-time Summary Cards (Clickable to Filter) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '0.85rem'
      }}>
        {roleCardCounts.map((item) => {
          const Icon = item.icon;
          const isSelected = roleFilter === item.key;
          return (
            <div
              key={item.key}
              onClick={() => {
                setRoleFilter(item.key);
                setCurrentPage(1);
              }}
              className="card"
              style={{
                padding: '1rem',
                cursor: 'pointer',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: isSelected ? item.bg : '#ffffff',
                border: isSelected ? `2px solid ${item.color}` : '1px solid var(--color-border)',
                boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                transition: 'all var(--transition-fast)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {item.label}
                </span>
                <Icon size={16} color={item.color} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                <span style={{ fontSize: '1.65rem', fontWeight: 800, color: item.color, lineHeight: 1 }}>
                  {item.count}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>registered</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Staff vs Applicants Tabs + Search & Filters Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Quick View Segmented Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {[
              { id: 'ALL', label: 'All Stakeholders', count: users.length },
              { id: 'STAFF', label: 'Admission Staff', count: users.filter(u => u.role !== 'APPLICANT').length },
              { id: 'APPLICANTS', label: 'Applicants', count: users.filter(u => u.role === 'APPLICANT').length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setStaffTab(tab.id);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: staffTab === tab.id ? 700 : 500,
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: staffTab === tab.id ? 'var(--color-primary)' : 'var(--color-bg-subtle)',
                  color: staffTab === tab.id ? '#ffffff' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  padding: '0.1rem 0.35rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.675rem',
                  backgroundColor: staffTab === tab.id ? 'rgba(255,255,255,0.25)' : 'var(--color-bg-muted)',
                  color: staffTab === tab.id ? '#ffffff' : 'var(--color-text-muted)'
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Showing <strong>{sortedUsers.length}</strong> matching user{sortedUsers.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* Filter Controls Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search users by name, email, role, or ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="input-field"
              style={{ paddingLeft: '2.25rem', width: '100%', fontSize: '0.85rem' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Role Filter Dropdown */}
          <div style={{ minWidth: '180px' }}>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="input-field"
              style={{ width: '100%', fontSize: '0.85rem' }}
            >
              <option value="ALL">All Roles</option>
              <option value="APPLICANT">Applicant</option>
              <option value="COUNSELLOR">Counsellor</option>
              <option value="PROGRAMME_COORDINATOR">Programme Coordinator</option>
              <option value="REGISTRAR">Registrar</option>
              <option value="FINANCE_OFFICER">Finance Officer</option>
              <option value="ADMINISTRATOR">Administrator</option>
            </select>
          </div>

          {/* Status Filter Dropdown */}
          <div style={{ minWidth: '130px' }}>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="input-field"
              style={{ width: '100%', fontSize: '0.85rem' }}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {/* Page Size Dropdown */}
          <div style={{ minWidth: '110px' }}>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="input-field"
              style={{ width: '100%', fontSize: '0.85rem' }}
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="table-custom" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-bg-subtle)', borderBottom: '1px solid var(--color-border)' }}>
                <th
                  onClick={() => handleSort('id')}
                  style={{ cursor: 'pointer', userSelect: 'none', padding: '0.85rem 1rem' }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>User ID</span>
                    <ArrowUpDown size={12} style={{ opacity: sortField === 'id' ? 1 : 0.4 }} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  style={{ cursor: 'pointer', userSelect: 'none', padding: '0.85rem 1rem' }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>Full Name</span>
                    <ArrowUpDown size={12} style={{ opacity: sortField === 'name' ? 1 : 0.4 }} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('email')}
                  style={{ cursor: 'pointer', userSelect: 'none', padding: '0.85rem 1rem' }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>Email / Username</span>
                    <ArrowUpDown size={12} style={{ opacity: sortField === 'email' ? 1 : 0.4 }} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('role')}
                  style={{ cursor: 'pointer', userSelect: 'none', padding: '0.85rem 1rem' }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>Role</span>
                    <ArrowUpDown size={12} style={{ opacity: sortField === 'role' ? 1 : 0.4 }} />
                  </div>
                </th>
                <th style={{ padding: '0.85rem 1rem' }}>Phone</th>
                <th
                  onClick={() => handleSort('isActive')}
                  style={{ cursor: 'pointer', userSelect: 'none', padding: '0.85rem 1rem' }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>Status</span>
                    <ArrowUpDown size={12} style={{ opacity: sortField === 'isActive' ? 1 : 0.4 }} />
                  </div>
                </th>
                <th style={{ padding: '0.85rem 1rem' }}>Created Date</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--color-text-muted)' }}>
                    <Users size={36} style={{ margin: '0 auto 0.5rem auto', opacity: 0.35, display: 'block' }} />
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>
                      {roleFilter !== 'ALL' ? `No ${roleFilter.toLowerCase()} accounts found.` : 'No users found matching your criteria.'}
                    </p>
                    <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem' }}>
                      Try adjusting your search query or role filter.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const roleMeta = ROLE_DISPLAY[u.role] || {
                    label: u.role,
                    bg: 'var(--color-bg-subtle)',
                    color: 'var(--color-text-secondary)',
                    border: 'var(--color-border)',
                    icon: Users
                  };
                  const RoleIcon = roleMeta.icon;
                  const name = u.fullName || u.name || 'Anonymous User';
                  const initial = name.charAt(0).toUpperCase();
                  const isPrimaryAdmin = u.email === 'admin@cams.edu';

                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      {/* User ID */}
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                        #{u.id}
                      </td>

                      {/* Name with initial avatar */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: roleMeta.bg,
                            color: roleMeta.color,
                            border: `1px solid ${roleMeta.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            flexShrink: 0
                          }}>
                            {initial}
                          </div>
                          <div>
                            <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '0.875rem', display: 'block' }}>
                              {name}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
                        {u.email}
                      </td>

                      {/* Role Badge */}
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: roleMeta.bg,
                          color: roleMeta.color,
                          border: `1px solid ${roleMeta.border}`,
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          whiteSpace: 'nowrap'
                        }}>
                          <RoleIcon size={12} />
                          <span>{roleMeta.label}</span>
                        </span>
                      </td>

                      {/* Phone */}
                      <td style={{ fontSize: '0.8rem', color: u.phone ? 'var(--color-text-secondary)' : 'var(--color-text-muted)', fontFamily: u.phone ? 'var(--font-mono)' : 'inherit' }}>
                        {u.phone || 'Not available'}
                      </td>

                      {/* Account Status */}
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: u.isActive ? 'var(--color-success-light)' : 'var(--color-danger-light)',
                          color: u.isActive ? 'var(--color-success)' : 'var(--color-danger)',
                          border: `1px solid ${u.isActive ? 'var(--color-success-border)' : 'var(--color-danger-border)'}`
                        }}>
                          {u.isActive ? <CheckCircle size={10} /> : <XCircle size={10} />}
                          <span>{u.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                        </span>
                      </td>

                      {/* Created Date */}
                      <td style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          {/* View Details */}
                          <button
                            onClick={() => handleOpenViewModal(u)}
                            className="btn btn-outline btn-sm"
                            title="View comprehensive user records"
                            style={{ padding: '0.35rem 0.5rem' }}
                          >
                            <Eye size={13} />
                          </button>

                          {/* Edit User */}
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="btn btn-outline btn-sm"
                            title="Edit user profile"
                            style={{ padding: '0.35rem 0.5rem' }}
                          >
                            <Edit2 size={13} />
                          </button>

                          {/* Activate / Deactivate Toggle */}
                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={isPrimaryAdmin}
                            className="btn btn-sm"
                            title={isPrimaryAdmin ? 'Primary admin cannot be deactivated' : (u.isActive ? 'Deactivate user' : 'Activate user')}
                            style={{
                              padding: '0.35rem 0.5rem',
                              border: '1px solid var(--color-border)',
                              backgroundColor: u.isActive ? '#fff1f2' : '#f0fdf4',
                              color: u.isActive ? 'var(--color-danger)' : 'var(--color-success)',
                              cursor: isPrimaryAdmin ? 'not-allowed' : 'pointer',
                              opacity: isPrimaryAdmin ? 0.5 : 1
                            }}
                          >
                            {u.isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                          </button>

                          {/* Safe Delete */}
                          <button
                            onClick={() => setDeletingUser(u)}
                            disabled={isPrimaryAdmin}
                            className="btn btn-outline btn-sm"
                            title={isPrimaryAdmin ? 'Primary admin cannot be deleted' : 'Delete user account'}
                            style={{
                              padding: '0.35rem 0.5rem',
                              color: 'var(--color-danger)',
                              cursor: isPrimaryAdmin ? 'not-allowed' : 'pointer',
                              opacity: isPrimaryAdmin ? 0.4 : 1
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {sortedUsers.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.85rem 1.25rem',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: '#ffffff',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Showing <strong>{((currentPage - 1) * pageSize) + 1}</strong> to <strong>{Math.min(currentPage * pageSize, sortedUsers.length)}</strong> of <strong>{sortedUsers.length}</strong> accounts
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn btn-outline btn-sm"
                style={{ padding: '0.35rem 0.6rem' }}
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => {
                  const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                  return (
                    <React.Fragment key={p}>
                      {showEllipsis && <span style={{ padding: '0 0.35rem', color: 'var(--color-text-muted)' }}>...</span>}
                      <button
                        onClick={() => setCurrentPage(p)}
                        className={`btn btn-sm ${currentPage === p ? 'btn-primary' : 'btn-outline'}`}
                        style={{ minWidth: '32px', padding: '0.35rem 0.6rem', fontWeight: currentPage === p ? 700 : 500 }}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  );
                })}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-outline btn-sm"
                style={{ padding: '0.35rem 0.6rem' }}
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: VIEW USER DETAILS (WITH ROLE-SPECIFIC INFORMATION) */}
      {/* ========================================================================= */}
      {viewingUser && (
        <Modal
          isOpen={true}
          onClose={() => setViewingUser(null)}
          title={`User Dossier: ${viewingUser.fullName || viewingUser.name}`}
          maxWidth="760px"
        >
          {loadingDetails ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
              <LoadingSpinner text="Retrieving institutional records and admission links..." />
            </div>
          ) : userDetails ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '72vh', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {/* Profile Card Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                backgroundColor: 'var(--color-primary-light)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #dbeafe',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 700
                  }}>
                    {(userDetails.fullName || userDetails.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                      {userDetails.fullName || userDetails.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem', fontSize: '0.775rem' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>ID #{userDetails.id}</span>
                      <span>&bull;</span>
                      <span style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>{userDetails.email}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: ROLE_DISPLAY[userDetails.role]?.bg || '#f1f5f9',
                    color: ROLE_DISPLAY[userDetails.role]?.color || '#0f172a',
                    border: `1px solid ${ROLE_DISPLAY[userDetails.role]?.border || '#e2e8f0'}`
                  }}>
                    {ROLE_DISPLAY[userDetails.role]?.label || userDetails.role}
                  </span>

                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    backgroundColor: userDetails.isActive ? 'var(--color-success-light)' : 'var(--color-danger-light)',
                    color: userDetails.isActive ? 'var(--color-success)' : 'var(--color-danger)',
                    border: `1px solid ${userDetails.isActive ? 'var(--color-success-border)' : 'var(--color-danger-border)'}`
                  }}>
                    {userDetails.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>

              {/* Basic Contact & Audit Data Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.75rem',
                backgroundColor: 'var(--color-bg-subtle)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem'
              }}>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.2rem' }}>Registered Phone</span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>{userDetails.phone || 'Not available'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.2rem' }}>Registration Date</span>
                  <strong>{userDetails.createdAt ? new Date(userDetails.createdAt).toLocaleString('en-IN') : 'Not available'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.2rem' }}>Last Active Session</span>
                  <strong>{userDetails.lastLoginAt ? new Date(userDetails.lastLoginAt).toLocaleString('en-IN') : 'No recorded login'}</strong>
                </div>
              </div>

              {/* ROLE-SPECIFIC RECORDS SECTION */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={16} color="var(--color-accent)" />
                  Role-Specific Admission & Audit Records
                </h4>

                {/* 1. APPLICANT DETAILS */}
                {userDetails.role === 'APPLICANT' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {userDetails.roleDetails?.applicantProfile && typeof userDetails.roleDetails.applicantProfile === 'object' ? (
                      <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                          Academic Qualifications & Identity
                        </span>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.65rem', fontSize: '0.8rem' }}>
                          <div>Reservation Quota: <strong>{userDetails.roleDetails.applicantProfile.category}</strong></div>
                          <div>12th Board Score: <strong>{userDetails.roleDetails.applicantProfile.boardPercentage}%</strong></div>
                          <div>Entrance Score: <strong>{userDetails.roleDetails.applicantProfile.entranceScore}</strong></div>
                          <div>Date of Birth: <strong>{userDetails.roleDetails.applicantProfile.dateOfBirth}</strong></div>
                          <div>Gender: <strong>{userDetails.roleDetails.applicantProfile.gender}</strong></div>
                          <div>School Board: <strong>{userDetails.roleDetails.applicantProfile.schoolBoard}</strong></div>
                          <div>Exam Name: <strong>{userDetails.roleDetails.applicantProfile.entranceExamName}</strong></div>
                          <div>Roll Number: <strong style={{ fontFamily: 'var(--font-mono)' }}>{userDetails.roleDetails.applicantProfile.entranceRollNo}</strong></div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        Applicant profile: Not available
                      </div>
                    )}

                    {/* Applications List */}
                    <div>
                      <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                        Programme Preferences & Allocation Status ({userDetails.roleDetails?.applications?.length || 0})
                      </span>
                      {userDetails.roleDetails?.applications?.length > 0 ? (
                        <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                          <table style={{ width: '100%', fontSize: '0.775rem', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                              <tr>
                                <th style={{ padding: '0.45rem 0.65rem', textAlign: 'left' }}>App #</th>
                                <th style={{ padding: '0.45rem 0.65rem', textAlign: 'left' }}>Programme</th>
                                <th style={{ padding: '0.45rem 0.65rem', textAlign: 'left' }}>Preference</th>
                                <th style={{ padding: '0.45rem 0.65rem', textAlign: 'left' }}>Merit Score</th>
                                <th style={{ padding: '0.45rem 0.65rem', textAlign: 'left' }}>Status</th>
                                <th style={{ padding: '0.45rem 0.65rem', textAlign: 'left' }}>Allotted Quota</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userDetails.roleDetails.applications.map((app) => (
                                <tr key={app.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                                  <td style={{ padding: '0.45rem 0.65rem', fontFamily: 'var(--font-mono)' }}>{app.applicationNumber}</td>
                                  <td style={{ padding: '0.45rem 0.65rem', fontWeight: 600 }}>{app.programmeName}</td>
                                  <td style={{ padding: '0.45rem 0.65rem' }}>Rank #{app.preferenceRank}</td>
                                  <td style={{ padding: '0.45rem 0.65rem', fontWeight: 700 }}>{app.meritScore || 'N/A'}</td>
                                  <td style={{ padding: '0.45rem 0.65rem' }}><StatusBadge status={app.status} /></td>
                                  <td style={{ padding: '0.45rem 0.65rem' }}>{app.allottedQuota}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p style={{ margin: 0, fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>No admission applications submitted yet.</p>
                      )}
                    </div>

                    {/* Documents List */}
                    <div>
                      <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                        Uploaded Verification Documents ({userDetails.roleDetails?.documents?.length || 0})
                      </span>
                      {userDetails.roleDetails?.documents?.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
                          {userDetails.roleDetails.documents.map((doc) => (
                            <div key={doc.id} style={{ padding: '0.65rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', backgroundColor: '#ffffff' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong style={{ color: 'var(--color-text-primary)' }}>{doc.documentType}</strong>
                                <StatusBadge status={doc.status} />
                              </div>
                              <div style={{ marginTop: '0.3rem', color: 'var(--color-text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                File: {doc.fileName}
                              </div>
                              <div style={{ marginTop: '0.2rem', color: 'var(--color-text-muted)' }}>
                                Verified By: {doc.verifiedBy}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ margin: 0, fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>No documents uploaded yet.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. COUNSELLOR DETAILS */}
                {userDetails.role === 'COUNSELLOR' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius-sm)', border: '1px solid #bbf7d0', fontSize: '0.8rem', color: '#15803d' }}>
                      <strong>Responsibility:</strong> {userDetails.roleDetails?.assignedResponsibilities}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                      <div className="card" style={{ padding: '0.85rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Verified Certificates</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-success)', marginTop: '0.25rem' }}>
                          {userDetails.roleDetails?.documentsVerifiedCount ?? 0}
                        </div>
                      </div>
                      <div className="card" style={{ padding: '0.85rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Flagged Discrepancies</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-danger)', marginTop: '0.25rem' }}>
                          {userDetails.roleDetails?.discrepanciesFlaggedCount ?? 0}
                        </div>
                      </div>
                      <div className="card" style={{ padding: '0.85rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>System Queue Pending</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-warning)', marginTop: '0.25rem' }}>
                          {userDetails.roleDetails?.pendingVerificationQueue ?? 0}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. COORDINATOR DETAILS */}
                {(userDetails.role === 'PROGRAMME_COORDINATOR' || userDetails.role === 'COORDINATOR') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: '#faf5ff', borderRadius: 'var(--radius-sm)', border: '1px solid #e9d5ff', fontSize: '0.8rem', color: '#7e22ce' }}>
                      <strong>Responsibility:</strong> {userDetails.roleDetails?.assignedResponsibilities}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                      <div className="card" style={{ padding: '0.85rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Academic Programmes</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7e22ce', marginTop: '0.25rem' }}>
                          {userDetails.roleDetails?.totalProgrammes ?? 0}
                        </div>
                      </div>
                      <div className="card" style={{ padding: '0.85rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Sanctioned Seats</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '0.25rem' }}>
                          {userDetails.roleDetails?.totalSanctionedSeats ?? 0}
                        </div>
                      </div>
                      <div className="card" style={{ padding: '0.85rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Applications Evaluated</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-accent)', marginTop: '0.25rem' }}>
                          {userDetails.roleDetails?.totalApplicationsEvaluated ?? 0}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. REGISTRAR DETAILS */}
                {userDetails.role === 'REGISTRAR' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: '#fff7ed', borderRadius: 'var(--radius-sm)', border: '1px solid #fed7aa', fontSize: '0.8rem', color: '#c2410c' }}>
                      <strong>Responsibility:</strong> {userDetails.roleDetails?.assignedResponsibilities}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                      <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.675rem', color: 'var(--color-text-muted)' }}>TOTAL APPS</span>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{userDetails.roleDetails?.totalRegisteredApplications ?? 0}</div>
                      </div>
                      <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.675rem', color: 'var(--color-text-muted)' }}>VERIFIED</span>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-success)' }}>{userDetails.roleDetails?.verifiedApplications ?? 0}</div>
                      </div>
                      <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.675rem', color: 'var(--color-text-muted)' }}>ALLOTTED</span>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-accent)' }}>{userDetails.roleDetails?.allottedOffers ?? 0}</div>
                      </div>
                      <div className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.675rem', color: 'var(--color-text-muted)' }}>ADMITTED</span>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#15803d' }}>{userDetails.roleDetails?.admittedStudents ?? 0}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. FINANCE DETAILS */}
                {(userDetails.role === 'FINANCE_OFFICER' || userDetails.role === 'FINANCE') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: '#ecfeff', borderRadius: 'var(--radius-sm)', border: '1px solid #a5f3fc', fontSize: '0.8rem', color: '#0e7490' }}>
                      <strong>Responsibility:</strong> {userDetails.roleDetails?.assignedResponsibilities}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                      <div className="card" style={{ padding: '0.85rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Gross Collections</span>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-success)', marginTop: '0.2rem' }}>
                          ₹{Number(userDetails.roleDetails?.totalFeesCollected || 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="card" style={{ padding: '0.85rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Completed Transactions</span>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '0.2rem' }}>
                          {userDetails.roleDetails?.successfulPaymentsCount ?? 0}
                        </div>
                      </div>
                      <div className="card" style={{ padding: '0.85rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Pending Remittances</span>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-warning)', marginTop: '0.2rem' }}>
                          {userDetails.roleDetails?.pendingPaymentsCount ?? 0}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. ADMINISTRATOR DETAILS */}
                {(userDetails.role === 'ADMINISTRATOR' || userDetails.role === 'ADMIN') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', borderRadius: 'var(--radius-sm)', border: '1px solid #fecaca', fontSize: '0.8rem', color: '#b91c1c' }}>
                      <strong>Responsibility:</strong> {userDetails.roleDetails?.assignedResponsibilities}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                      <div className="card" style={{ padding: '0.85rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>SYSTEM HEALTH</span>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-success)', marginTop: '0.2rem' }}>
                          {userDetails.roleDetails?.systemHealth}
                        </div>
                      </div>
                      <div className="card" style={{ padding: '0.85rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>DATABASE ENGINE</span>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '0.2rem' }}>
                          {userDetails.roleDetails?.databaseStatus}
                        </div>
                      </div>
                      <div className="card" style={{ padding: '0.85rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>AUDIT TRAIL LOGS</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-accent)', marginTop: '0.2rem' }}>
                          {userDetails.roleDetails?.recentAuditEventsCount ?? 0} events
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <button
                  onClick={() => setViewingUser(null)}
                  className="btn btn-outline"
                  style={{ fontSize: '0.85rem' }}
                >
                  Close Dossier
                </button>
              </div>
            </div>
          ) : null}
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD USER / STAFF */}
      {/* ========================================================================= */}
      {showAddModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddModal(false)}
          title="Onboard New Staff / User Account"
          maxWidth="560px"
        >
          <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
              Create an institutional staff or applicant credential. Passwords are encrypted using BCrypt.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Rajesh Verma"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                className="input-field"
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Institutional Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@cams.edu"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Phone Number (10 Digits)
                </label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  pattern="[0-9]{10}"
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Assigned System Role *
                </label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                >
                  <option value="COUNSELLOR">Counsellor</option>
                  <option value="PROGRAMME_COORDINATOR">Programme Coordinator</option>
                  <option value="REGISTRAR">Registrar</option>
                  <option value="FINANCE_OFFICER">Finance Officer</option>
                  <option value="ADMINISTRATOR">Administrator</option>
                  <option value="APPLICANT">Applicant</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Account Status
                </label>
                <select
                  value={addForm.isActive ? 'ACTIVE' : 'INACTIVE'}
                  onChange={(e) => setAddForm({ ...addForm, isActive: e.target.value === 'ACTIVE' })}
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Password (Optional)
                </label>
                <input
                  type="password"
                  placeholder="Defaults to ADMIN@1234"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={addForm.confirmPassword}
                  onChange={(e) => setAddForm({ ...addForm, confirmPassword: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ padding: '0.65rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Default password if left blank: <code style={{ fontWeight: 700, color: 'var(--color-accent)' }}>ADMIN@1234</code>. Users can update their password via their portal.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="btn btn-outline"
                disabled={addLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={addLoading}
                style={{ fontWeight: 700 }}
              >
                {addLoading ? 'Onboarding...' : 'Create Account'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT USER */}
      {/* ========================================================================= */}
      {editingUser && (
        <Modal
          isOpen={true}
          onClose={() => setEditingUser(null)}
          title={`Edit User Account: ${editingUser.email}`}
          maxWidth="520px"
        >
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Full Name *
              </label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="input-field"
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Assigned Role *
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                >
                  <option value="APPLICANT">Applicant</option>
                  <option value="COUNSELLOR">Counsellor</option>
                  <option value="PROGRAMME_COORDINATOR">Programme Coordinator</option>
                  <option value="REGISTRAR">Registrar</option>
                  <option value="FINANCE_OFFICER">Finance Officer</option>
                  <option value="ADMINISTRATOR">Administrator</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Account Status
                </label>
                <select
                  value={editForm.isActive ? 'ACTIVE' : 'INACTIVE'}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'ACTIVE' })}
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                  disabled={editingUser.email === 'admin@cams.edu'}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <div style={{ padding: '0.65rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Note: Changing a user's role will update their RBAC authorities and permissions on their next login session.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="btn btn-outline"
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={editLoading}
                style={{ fontWeight: 700 }}
              >
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {deletingUser && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingUser(null)}
          title="Confirm Account Deletion"
          maxWidth="480px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-danger-light)',
                color: 'var(--color-danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--color-text-primary)', fontSize: '0.95rem', fontWeight: 800 }}>
                  Are you sure you want to delete this user?
                </h4>
                <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                  User: <strong>{deletingUser.fullName || deletingUser.name}</strong> ({deletingUser.email})
                </p>
              </div>
            </div>

            <div style={{
              padding: '0.75rem',
              backgroundColor: 'var(--color-danger-light)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-danger-border)',
              fontSize: '0.775rem',
              color: 'var(--color-danger-text)'
            }}>
              <strong>Regulatory Notice:</strong> Accounts tied to active admission applications, uploaded certificates, fee receipts, or verification audits cannot be permanently deleted. If this candidate has active records, please use <strong>Deactivate</strong> instead.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="btn btn-outline"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="btn btn-danger"
                disabled={deleteLoading}
                style={{ fontWeight: 700 }}
              >
                {deleteLoading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <style>{`
        .spin-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
