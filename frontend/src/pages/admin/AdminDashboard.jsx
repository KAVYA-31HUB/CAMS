import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { programmeApi } from '../../api/programmeApi';
import { dashboardApi } from '../../api/dashboardApi';
import apiClient from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { Link } from 'react-router-dom';
import { 
  Settings, 
  Server, 
  Users, 
  BookOpen, 
  Layers, 
  ShieldAlert, 
  RefreshCw, 
  Plus, 
  AlertCircle, 
  Code, 
  UserCheck, 
  UserX,
  GraduationCap,
  Calendar,
  FileText,
  ArrowRight,
  BarChart3,
  CreditCard,
  ExternalLink
} from 'lucide-react';

export default function AdminDashboard() {
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('programmes'); // 'programmes', 'matrix', 'users', 'audit'
  
  // Health & System Summary
  const [healthData, setHealthData] = useState(null);
  const [adminStats, setAdminStats] = useState(null);

  // Programmes & Merit Formula
  const [programmes, setProgrammes] = useState([]);
  const [selectedProgFormula, setSelectedProgFormula] = useState(null);
  const [formulaJsonText, setFormulaJsonText] = useState('');
  const [formulaError, setFormulaError] = useState('');
  const [savingFormula, setSavingFormula] = useState(false);

  // New Programme Modal
  const [showNewProgModal, setShowNewProgModal] = useState(false);
  const [newProg, setNewProg] = useState({
    name: '',
    code: '',
    department: '',
    durationYears: 4,
    intakeCapacity: 60,
    tuitionFee: 85000,
    otherFee: 15000,
    meritFormula: '{"boardWeight": 0.4, "entranceWeight": 0.6}'
  });

  // Seat Matrix Config
  const [seatMatrix, setSeatMatrix] = useState([]);
  const [showNewMatrixModal, setShowNewMatrixModal] = useState(false);
  const [newMatrix, setNewMatrix] = useState({
    programmeId: '',
    quota: 'OPEN',
    totalSeats: 30,
    roundNo: 1,
    academicYear: '2026-27'
  });

  // Users
  const [users, setUsers] = useState([]);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'COUNSELLOR'
  });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [healthRes, progRes, smRes, usersRes, logsRes, adminSumRes] = await Promise.all([
        adminApi.getSystemHealth(),
        programmeApi.getProgrammes(),
        apiClient.get('/seat-matrix'),
        adminApi.getUsers(),
        adminApi.getAuditLogs(),
        dashboardApi.getAdminSummary().catch(() => ({ data: null }))
      ]);
      setHealthData(healthRes.data);
      setProgrammes(progRes.data || []);
      setSeatMatrix(smRes.data || []);
      setUsers(usersRes.data || []);
      setAuditLogs(logsRes.data || []);
      if (adminSumRes?.data) {
        setAdminStats(adminSumRes.data);
      }

      if (progRes.data?.length > 0 && !newMatrix.programmeId) {
        setNewMatrix((prev) => ({ ...prev, programmeId: progRes.data[0].id }));
      }
    } catch (err) {
      showError('Failed to load administration controls');
    } finally {
      setLoading(false);
    }
  };

  // Formula Editor Handlers
  const handleOpenFormulaModal = (prog) => {
    setSelectedProgFormula(prog);
    setFormulaJsonText(prog.meritFormula || '{\n  "boardWeight": 0.4,\n  "entranceWeight": 0.6\n}');
    setFormulaError('');
  };

  const handleSaveFormula = async () => {
    try {
      // Validate JSON syntax
      const parsed = JSON.parse(formulaJsonText);
      setSavingFormula(true);
      await programmeApi.updateMeritFormula(selectedProgFormula.id, JSON.stringify(parsed));
      showSuccess(`Merit formula updated for ${selectedProgFormula.name}`);
      setSelectedProgFormula(null);
      // Refresh programmes
      const res = await programmeApi.getProgrammes();
      setProgrammes(res.data || []);
    } catch (err) {
      if (err instanceof SyntaxError) {
        setFormulaError('Invalid JSON format. Please check quotation marks and commas.');
      } else {
        showError(err.response?.data?.message || 'Failed to update merit formula');
      }
    } finally {
      setSavingFormula(false);
    }
  };

  // Programme Handlers
  const handleCreateProgramme = async (e) => {
    e.preventDefault();
    try {
      await programmeApi.createProgramme(newProg);
      showSuccess('Programme added successfully');
      setShowNewProgModal(false);
      loadAllData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create programme');
    }
  };

  // Seat Matrix Handlers
  const handleCreateMatrix = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/seat-matrix', newMatrix);
      showSuccess('Seat matrix capacity configured');
      setShowNewMatrixModal(false);
      const smRes = await apiClient.get('/seat-matrix');
      setSeatMatrix(smRes.data || []);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to configure seat matrix');
    }
  };

  // User Lifecycle Handlers
  const handleToggleUser = async (userId, currentStatus) => {
    try {
      await adminApi.toggleUserStatus(userId, !currentStatus);
      showSuccess(`User status updated`);
      const res = await adminApi.getUsers();
      setUsers(res.data || []);
    } catch (err) {
      showError('Failed to change user status');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createUser(newUser);
      showSuccess('Staff account created successfully');
      setShowNewUserModal(false);
      const res = await adminApi.getUsers();
      setUsers(res.data || []);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create staff account');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <LoadingSpinner text="Connecting to System Kernel & Service Boundaries..." />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'var(--primary-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <Settings size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              System Administration & Architecture
            </h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Dynamic merit evaluation formulas, reservation quota capacities, staff lifecycle, and security audit trails.
            </p>
          </div>
        </div>

        <button
          onClick={loadAllData}
          className="btn btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
        >
          <RefreshCw size={14} />
          Refresh Systems
        </button>
      </div>

      {/* Real-time System Integration Health Bar */}
      {healthData && (
        <div className="card" style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', fontWeight: 600 }}>
            <Server size={18} style={{ color: 'var(--success)' }} />
            <span style={{ color: 'var(--text-main)' }}>System Status:</span>
            <span style={{
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              background: 'var(--success-light)',
              color: 'var(--success)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              {healthData.status} (Uptime {healthData.uptime})
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
              MySQL Engine: <strong style={{ color: 'var(--text-main)' }}>Connected</strong>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
              DigiLocker Integration: <strong style={{ color: 'var(--text-main)' }}>Active Gateway</strong>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
              Payment Gateway: <strong style={{ color: 'var(--text-main)' }}>Ready</strong>
            </span>
          </div>
        </div>
      )}

      {/* Institutional Metrics Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Offered Programmes
            </span>
            <BookOpen size={16} style={{ color: 'var(--primary)', opacity: 0.8 }} />
          </div>
          <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', display: 'block', margin: '0.2rem 0' }}>
            {adminStats?.totalProgrammes != null ? adminStats.totalProgrammes : programmes.length}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Undergraduate & Postgraduate</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Sanctioned Intake
            </span>
            <GraduationCap size={16} style={{ color: 'var(--success)', opacity: 0.8 }} />
          </div>
          <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)', display: 'block', margin: '0.2rem 0' }}>
            {adminStats?.totalSeats != null ? adminStats.totalSeats : seatMatrix.reduce((acc, m) => acc + (m.totalSeats || 0), 0)}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Approved Institutional Seats</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--warning)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Applications
            </span>
            <FileText size={16} style={{ color: 'var(--warning-dark)', opacity: 0.8 }} />
          </div>
          <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--warning-dark)', display: 'block', margin: '0.2rem 0' }}>
            {adminStats?.totalApplications || 0}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Academic Cycle 2026-27</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              User Management
            </span>
            <Users size={16} style={{ color: 'var(--color-primary)', opacity: 0.8 }} />
          </div>
          <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', display: 'block', margin: '0.2rem 0' }}>
            {adminStats?.totalUsers != null ? adminStats.totalUsers : users.length}
          </span>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <span>Applicants: <strong>{adminStats?.applicants ?? users.filter(u => u.role === 'APPLICANT').length}</strong></span>
            <span>Staff: <strong>{(adminStats?.totalUsers ?? users.length) - (adminStats?.applicants ?? users.filter(u => u.role === 'APPLICANT').length)}</strong></span>
            <span>Admins: <strong>{adminStats?.administrators ?? users.filter(u => u.role === 'ADMINISTRATOR' || u.role === 'ADMIN').length}</strong></span>
          </div>
          <Link
            to="/admin/users"
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.775rem', fontWeight: 700, padding: '0.3rem 0.6rem' }}
          >
            <span>Manage Users & Staff</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Admission Staff Quick Access Cards (SRS Part 16) */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 0.15rem 0', color: 'var(--text-main)' }}>
              Admission Staff Operations
            </h3>
            <p style={{ margin: 0, fontSize: '0.775rem', color: 'var(--text-muted)' }}>
              Active personnel assigned to statutory verification, allocation, statutory reporting, and finances.
            </p>
          </div>
          <Link
            to="/admin/users"
            style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-accent)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <span>View All Staff</span>
            <ExternalLink size={13} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
          <Link
            to="/admin/users?role=COUNSELLOR"
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#f0fdf4',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #bbf7d0',
              transition: 'transform 0.15s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>Counsellors</span>
                <Users size={14} color="#15803d" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d', margin: '0.25rem 0 0.1rem 0' }}>
                {adminStats?.counsellors ?? users.filter(u => u.role === 'COUNSELLOR').length}
              </div>
              <span style={{ fontSize: '0.725rem', color: '#166534' }}>Active staff &rarr;</span>
            </div>
          </Link>

          <Link
            to="/admin/users?role=PROGRAMME_COORDINATOR"
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#faf5ff',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #e9d5ff',
              transition: 'transform 0.15s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7e22ce', textTransform: 'uppercase' }}>Programme Coordinators</span>
                <Layers size={14} color="#7e22ce" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7e22ce', margin: '0.25rem 0 0.1rem 0' }}>
                {adminStats?.programmeCoordinators ?? users.filter(u => u.role === 'PROGRAMME_COORDINATOR' || u.role === 'COORDINATOR').length}
              </div>
              <span style={{ fontSize: '0.725rem', color: '#6b21a8' }}>Active staff &rarr;</span>
            </div>
          </Link>

          <Link
            to="/admin/users?role=REGISTRAR"
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#fff7ed',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #fed7aa',
              transition: 'transform 0.15s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase' }}>Registrars</span>
                <BarChart3 size={14} color="#c2410c" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#c2410c', margin: '0.25rem 0 0.1rem 0' }}>
                {adminStats?.registrars ?? users.filter(u => u.role === 'REGISTRAR').length}
              </div>
              <span style={{ fontSize: '0.725rem', color: '#9a3412' }}>Active staff &rarr;</span>
            </div>
          </Link>

          <Link
            to="/admin/users?role=FINANCE_OFFICER"
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#ecfeff',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #a5f3fc',
              transition: 'transform 0.15s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0e7490', textTransform: 'uppercase' }}>Finance Officers</span>
                <CreditCard size={14} color="#0e7490" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0e7490', margin: '0.25rem 0 0.1rem 0' }}>
                {adminStats?.financeOfficers ?? users.filter(u => u.role === 'FINANCE_OFFICER' || u.role === 'FINANCE').length}
              </div>
              <span style={{ fontSize: '0.725rem', color: '#155e75' }}>Active staff &rarr;</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '0.5rem', overflowX: 'auto' }}>
        {[
          { id: 'programmes', label: 'Programmes & Merit Formulas', icon: BookOpen },
          { id: 'matrix', label: 'Seat Matrix Capacities', icon: Layers },
          { id: 'users', label: 'User Lifecycle', icon: Users },
          { id: 'audit', label: 'Security Audit Logs', icon: ShieldAlert },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Programmes & Merit Formulas */}
      {activeTab === 'programmes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{
            padding: '1rem 1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.2rem 0', color: 'var(--text-main)' }}>
                Offered Academic Programmes
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Configure intake capacity, tuition fees, and dynamic JSON merit formulas (SRS Section 4.2).
              </p>
            </div>
            <button
              onClick={() => setShowNewProgModal(true)}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <Plus size={14} />
              Add Programme
            </button>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Sanctioned Intake</th>
                    <th>Tuition Fee</th>
                    <th>Merit Evaluation Formula</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {programmes.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)', fontSize: '0.8rem' }}>
                        {p.code}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.875rem' }}>{p.name}</span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.department}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{p.intakeCapacity} Seats</td>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.85rem' }}>₹{p.tuitionFee?.toLocaleString('en-IN')}</td>
                      <td>
                        <code style={{
                          background: 'var(--surface-muted)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          color: 'var(--text-main)',
                          display: 'block',
                          maxWidth: '280px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {p.meritFormula || '{"boardWeight": 0.4, "entranceWeight": 0.6}'}
                        </code>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => handleOpenFormulaModal(p)}
                          className="btn btn-outline btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.775rem' }}
                        >
                          <Code size={13} />
                          Edit Formula
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Seat Matrix Capacities */}
      {activeTab === 'matrix' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{
            padding: '1rem 1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.2rem 0', color: 'var(--text-main)' }}>
                Quota Matrix Allocation Rows
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Statutory reservation categories enforced by pessimistic database lock during allocation rounds.
              </p>
            </div>
            <button
              onClick={() => setShowNewMatrixModal(true)}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <Plus size={14} />
              Configure Quota Row
            </button>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Programme</th>
                    <th>Quota Category</th>
                    <th>Round</th>
                    <th>Academic Year</th>
                    <th>Total Seats</th>
                    <th>Filled</th>
                    <th>Vacancies</th>
                  </tr>
                </thead>
                <tbody>
                  {seatMatrix.map((sm) => (
                    <tr key={sm.id}>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.875rem' }}>
                          {sm.programme?.name || `Prog #${sm.programme?.id}`}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          background: 'var(--primary-subtle)',
                          color: 'var(--primary)',
                          fontWeight: 700,
                          fontSize: '0.75rem'
                        }}>
                          {sm.quota}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>Round {sm.roundNo}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sm.academicYear}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem' }}>{sm.totalSeats}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--success)', fontSize: '0.85rem' }}>{sm.filledSeats || 0}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--warning-dark)', fontSize: '0.85rem' }}>
                        {Math.max(0, sm.totalSeats - (sm.filledSeats || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: User Lifecycle */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{
            padding: '1rem 1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.2rem 0', color: 'var(--text-main)' }}>
                System Users & Stakeholders
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Manage access for Counsellors, Coordinators, Registrars, and Finance officers.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link
                to="/admin/users"
                className="btn btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}
              >
                <span>Open Full User Directory</span>
                <ExternalLink size={14} />
              </Link>
              <button
                onClick={() => setShowNewUserModal(true)}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}
              >
                <Plus size={14} />
                New Staff Account
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email / Username</th>
                    <th>Assigned Role</th>
                    <th>Account Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>#{u.id}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.875rem' }}>{u.fullName || u.name}</span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</td>
                      <td>
                        <span style={{ padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'var(--surface-muted)', fontWeight: 600, fontSize: '0.75rem' }}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '0.15rem 0.5rem',
                            borderRadius: '9999px',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            background: u.isActive ? 'var(--success-light)' : 'var(--danger-light)',
                            color: u.isActive ? 'var(--success)' : 'var(--danger)'
                          }}
                        >
                          {u.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => handleToggleUser(u.id, u.isActive)}
                          className="btn btn-sm"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.775rem',
                            border: '1px solid var(--border)',
                            background: u.isActive ? 'var(--surface)' : 'var(--primary)',
                            color: u.isActive ? 'var(--danger)' : '#ffffff'
                          }}
                        >
                          {u.isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Security Audit Logs */}
      {activeTab === 'audit' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              Immutable System Audit Trails
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Last 50 Events
            </span>
          </div>
          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor Email</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Details</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{log.actorEmail}</td>
                    <td>
                      <span style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'var(--surface-muted)', fontFamily: 'var(--font-sans)', fontSize: '0.7rem' }}>
                        {log.actorRole}
                      </span>
                    </td>
                    <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{log.action}</td>
                    <td style={{ color: 'var(--text-main)' }}>{log.entityName} #{log.entityId}</td>
                    <td style={{ color: 'var(--text-muted)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-sans)' }}>
                      {log.details}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{log.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* JSON Formula Editor Modal */}
      <Modal
        isOpen={!!selectedProgFormula}
        onClose={() => !savingFormula && setSelectedProgFormula(null)}
        title={`Merit Formula: ${selectedProgFormula?.name}`}
        maxWidth="max-w-lg"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
            Configure dynamic evaluation weights parsed by the backend merit ranking algorithm (SRS Section 4.2).
          </p>

          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.775rem' }}>
              JSON Specification
            </label>
            <textarea
              className="input"
              style={{
                width: '100%',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                minHeight: '160px',
                background: '#0f172a',
                color: '#34d399',
                padding: '0.75rem',
                borderRadius: '8px'
              }}
              value={formulaJsonText}
              onChange={(e) => {
                setFormulaJsonText(e.target.value);
                setFormulaError('');
              }}
            />
          </div>

          {formulaError && (
            <div style={{
              padding: '0.75rem',
              background: 'var(--danger-light)',
              border: '1px solid var(--danger)',
              borderRadius: '8px',
              color: 'var(--danger)',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{formulaError}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => setSelectedProgFormula(null)}
              className="btn btn-outline"
              style={{ fontSize: '0.8rem' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveFormula}
              disabled={savingFormula}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.4rem 1.25rem', fontWeight: 600 }}
            >
              {savingFormula ? 'Validating & Saving...' : 'Save Formula'}
            </button>
          </div>
        </div>
      </Modal>

      {/* New Programme Modal */}
      <Modal
        isOpen={showNewProgModal}
        onClose={() => setShowNewProgModal(false)}
        title="Add Academic Programme"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateProgramme} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.775rem' }}>Programme Name</label>
            <input
              type="text"
              required
              className="input"
              style={{ width: '100%', fontSize: '0.85rem' }}
              placeholder="e.g. B.Tech Computer Science & Engineering"
              value={newProg.name}
              onChange={(e) => setNewProg({ ...newProg, name: e.target.value })}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.775rem' }}>Code</label>
              <input
                type="text"
                required
                className="input"
                style={{ width: '100%', fontSize: '0.85rem' }}
                placeholder="CSE-UG"
                value={newProg.code}
                onChange={(e) => setNewProg({ ...newProg, code: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.775rem' }}>Department</label>
              <input
                type="text"
                required
                className="input"
                style={{ width: '100%', fontSize: '0.85rem' }}
                placeholder="Engineering"
                value={newProg.department}
                onChange={(e) => setNewProg({ ...newProg, department: e.target.value })}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.775rem' }}>Sanctioned Intake</label>
              <input
                type="number"
                required
                className="input"
                style={{ width: '100%', fontSize: '0.85rem' }}
                value={newProg.intakeCapacity}
                onChange={(e) => setNewProg({ ...newProg, intakeCapacity: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.775rem' }}>Tuition Fee (INR)</label>
              <input
                type="number"
                required
                className="input"
                style={{ width: '100%', fontSize: '0.85rem' }}
                value={newProg.tuitionFee}
                onChange={(e) => setNewProg({ ...newProg, tuitionFee: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => setShowNewProgModal(false)}
              className="btn btn-outline"
              style={{ fontSize: '0.8rem' }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 1.25rem' }}>
              Create Programme
            </button>
          </div>
        </form>
      </Modal>

      {/* New Matrix Row Modal */}
      <Modal
        isOpen={showNewMatrixModal}
        onClose={() => setShowNewMatrixModal(false)}
        title="Configure Quota Seat Matrix"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateMatrix} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.775rem' }}>Select Programme</label>
            <select
              className="input"
              style={{ width: '100%', fontSize: '0.85rem' }}
              value={newMatrix.programmeId}
              onChange={(e) => setNewMatrix({ ...newMatrix, programmeId: e.target.value })}
            >
              {programmes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.775rem' }}>Quota</label>
              <select
                className="input"
                style={{ width: '100%', fontSize: '0.85rem' }}
                value={newMatrix.quota}
                onChange={(e) => setNewMatrix({ ...newMatrix, quota: e.target.value })}
              >
                <option value="OPEN">OPEN / General</option>
                <option value="OBC">OBC-NCL</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.775rem' }}>Total Seats</label>
              <input
                type="number"
                required
                className="input"
                style={{ width: '100%', fontSize: '0.85rem' }}
                value={newMatrix.totalSeats}
                onChange={(e) => setNewMatrix({ ...newMatrix, totalSeats: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => setShowNewMatrixModal(false)}
              className="btn btn-outline"
              style={{ fontSize: '0.8rem' }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 1.25rem' }}>
              Save Allocation
            </button>
          </div>
        </form>
      </Modal>

      {/* New Staff Account Modal */}
      <Modal
        isOpen={showNewUserModal}
        onClose={() => setShowNewUserModal(false)}
        title="Onboard Staff Account"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.775rem' }}>Staff Full Name</label>
            <input
              type="text"
              required
              className="input"
              style={{ width: '100%', fontSize: '0.85rem' }}
              placeholder="e.g. Dr. Ramesh Kumar"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.775rem' }}>Institutional Email</label>
            <input
              type="email"
              required
              className="input"
              style={{ width: '100%', fontSize: '0.85rem' }}
              placeholder="name@cams.edu"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.775rem' }}>Password</label>
            <input
              type="password"
              required
              className="input"
              style={{ width: '100%', fontSize: '0.85rem' }}
              placeholder="Minimum 8 characters"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.775rem' }}>Role Designation</label>
            <select
              className="input"
              style={{ width: '100%', fontSize: '0.85rem' }}
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="COUNSELLOR">Counsellor (Document Verification)</option>
              <option value="COORDINATOR">Coordinator (Merit & Allotment)</option>
              <option value="REGISTRAR">Registrar (Compliance & AISHE)</option>
              <option value="FINANCE">Finance (Fee & GST Accounts)</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => setShowNewUserModal(false)}
              className="btn btn-outline"
              style={{ fontSize: '0.8rem' }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 1.25rem' }}>
              Create Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
