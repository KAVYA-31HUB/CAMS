import React, { useState } from 'react';
import { applicationApi } from '../../api/applicationApi';
import Timeline from '../../components/common/Timeline';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Search, Clock, Award, ShieldCheck, AlertCircle, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';

const ApplicationStatusPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setLoading(true);
    setError('');
    setStatusData(null);

    try {
      const res = await applicationApi.getStatusTimeline(identifier.trim());
      setStatusData(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'No admission record found matching this Reference Number or email. Please check your Reference Number (e.g. CAMS-2026-0001) and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container animate-fade-in" style={{ padding: '3.5rem 1rem', maxWidth: '820px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          backgroundColor: 'var(--color-primary-light)',
          color: 'var(--color-primary)',
          padding: '0.25rem 0.65rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.75rem',
          fontWeight: 700,
          marginBottom: '0.75rem',
          border: '1px solid #dbeafe'
        }}>
          <Sparkles size={13} color="var(--color-accent)" />
          <span>Real-Time Admission Tracking</span>
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
          Track Application Status
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.975rem', maxWidth: '620px', margin: '0 auto' }}>
          Enter your Application Reference Number (e.g. CAMS-2026-0001) or registered email address to check your real-time admission progress.
        </p>
      </div>

      {/* Search Card */}
      <div className="card" style={{ marginBottom: '2.5rem', boxShadow: 'var(--shadow-sm)' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search
              size={18}
              color="var(--color-text-muted)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Enter Application Ref (CAMS-2026-...) or Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Track Progress'}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger-text)', border: '1px solid var(--color-danger-border)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {loading && <LoadingSpinner message="Querying admissions server..." />}

      {statusData && (
        <div className="card" style={{ boxShadow: 'var(--shadow-md)' }}>
          {/* Header Summary */}
          <div className="card-header" style={{ paddingBottom: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.06em' }}>
                APPLICATION REFERENCE
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {statusData.applicationNumber}
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                Candidate: <strong>{statusData.applicantName}</strong> ({statusData.email})
              </p>
            </div>
            <StatusBadge status={statusData.currentStatus} />
          </div>

          {/* Timeline Section */}
          <div style={{ margin: '1.75rem 0' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', fontWeight: 700 }}>
              Admission Progress Timeline
            </h3>
            <Timeline currentStatus={statusData.currentStatus} />
          </div>

          {/* Allotment Highlight Box if allotted */}
          {statusData.isAllotted && (
            <div style={{
              padding: '1.25rem 1.5rem',
              backgroundColor: 'var(--color-accent-light)',
              border: '1px solid #bfdbfe',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Award size={20} color="var(--color-accent)" />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-primary)', margin: 0 }}>
                  Seat Allotted in Round {statusData.allottedRound || 1}
                </h4>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', margin: '0 0 0.5rem 0' }}>
                Programme: <strong>{statusData.allottedProgramme}</strong> (Quota: <strong>{statusData.allottedQuota || 'GEN'}</strong>)
              </p>
              {statusData.acceptanceDeadline && (
                <p style={{ fontSize: '0.8rem', color: 'var(--color-danger-text)', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0, fontWeight: 600 }}>
                  <Clock size={14} />
                  <span>Acceptance Deadline: {new Date(statusData.acceptanceDeadline).toLocaleString()}</span>
                </p>
              )}
            </div>
          )}

          {/* Status Indicators Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--color-border)'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Document Verification</span>
              <div style={{ marginTop: '0.35rem' }}>
                <StatusBadge status={statusData.documentVerificationStatus} />
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Admission Fee</span>
              <div style={{ marginTop: '0.35rem' }}>
                <StatusBadge status={statusData.feeStatus} />
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Academic Session</span>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: '0.35rem', color: 'var(--color-text-primary)' }}>
                {statusData.academicYear || '2026-27'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationStatusPage;
