import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Eye, EyeOff, Lock, Mail, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { role: 'APPLICANT', email: 'applicant@cams.edu', label: 'Applicant' },
  { role: 'COUNSELLOR', email: 'counsellor@cams.edu', label: 'Counsellor' },
  { role: 'COORDINATOR', email: 'coordinator@cams.edu', label: 'Coordinator' },
  { role: 'REGISTRAR', email: 'registrar@cams.edu', label: 'Registrar' },
  { role: 'FINANCE', email: 'finance@cams.edu', label: 'Finance' },
  { role: 'ADMIN', email: 'admin@cams.edu', label: 'Administrator' },
];

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get('expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both your registered email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login(email.trim(), password);
      navigate(getDashboardPath(user.role));
    } catch (err) {
      console.error('Login error:', err);
      if (!err.response) {
        setError('Network Error: Unable to connect to CAMS backend service. Please check if backend is running on port 8080.');
      } else if (err.response.status === 401) {
        setError(err.response.data?.message || 'Invalid credentials. Please verify your registered email and password.');
      } else if (err.response.status === 403) {
        setError('Access denied: Account lacks authorization or is deactivated.');
      } else if (err.response.status === 404) {
        setError('Account not found for this registered email.');
      } else if (err.response.status >= 500) {
        setError('Server Error: The admission server encountered an error. Please try again.');
      } else {
        setError(err.response.data?.message || 'Authentication failed. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('ADMIN@1234');
    setError('');
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 140px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1rem',
      backgroundColor: 'var(--color-bg-canvas)'
    }}>
      <div style={{ maxWidth: '440px', width: '100%' }}>
        <div className="card" style={{ padding: '2.5rem 2rem', boxShadow: 'var(--shadow-md)' }}>
          {/* Header & Crest */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <GraduationCap size={28} />
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              Sign In to Portal
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Central Admission Management System (CAMS)
            </p>
          </div>

          {isExpired && (
            <div style={{
              marginBottom: '1.25rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--color-warning-light)',
              color: 'var(--color-warning-text)',
              border: '1px solid var(--color-warning-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} />
              <span>Your session has expired. Please sign in again.</span>
            </div>
          )}

          {error && (
            <div style={{
              marginBottom: '1.25rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--color-danger-light)',
              color: 'var(--color-danger-text)',
              border: '1px solid var(--color-danger-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email-input">
                Registered Email Address <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="email-input"
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="name@cams.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" htmlFor="password-input" style={{ margin: 0 }}>
                  Password <span className="required">*</span>
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)', cursor: 'pointer', fontWeight: 600 }}>
                  Forgot password?
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 2
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label htmlFor="remember-me" style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
                Remember my login credentials on this device
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', fontSize: '0.925rem' }}
              disabled={loading}
            >
              {loading ? 'Authenticating Credentials...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Switcher for Evaluation */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
              <Sparkles size={14} color="var(--color-accent)" />
              <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Quick Evaluation Roles (Password: ADMIN@1234)
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleQuickLogin(acc.email)}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.725rem', padding: '0.35rem 0.25rem' }}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '1.5rem' }}>
            New applicant for 2026-27? <Link to="/register" style={{ fontWeight: 700, color: 'var(--color-accent)' }}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
