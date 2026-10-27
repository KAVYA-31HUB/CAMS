import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationApi } from '../../api/applicationApi';
import { applicantApi } from '../../api/applicantApi';
import { feeApi } from '../../api/feeApi';
import StatusBadge from '../../components/common/StatusBadge';
import Timeline from '../../components/common/Timeline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  FileText,
  Award,
  CreditCard,
  FolderCheck,
  GraduationCap,
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

const ApplicantDashboard = () => {
  const { user } = useAuth();
  const [applicant, setApplicant] = useState(null);
  const [applications, setApplications] = useState([]);
  const [outstanding, setOutstanding] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const appRes = await applicantApi.getMyApplicant();
      setApplicant(appRes.data);

      if (appRes.data?.id) {
        const [appsRes, feeRes] = await Promise.allSettled([
          applicationApi.getByApplicant(appRes.data.id),
          feeApi.getOutstanding(appRes.data.id)
        ]);

        if (appsRes.status === 'fulfilled') {
          setApplications(appsRes.value.data || []);
        }
        if (feeRes.status === 'fulfilled') {
          setOutstanding(feeRes.value.data);
        }
      }
    } catch (err) {
      console.error('Failed to load applicant data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your admissions profile..." />;
  }

  const primaryApp = applications.length > 0 ? applications[0] : null;
  const allottedApp = applications.find((a) => a.status === 'ALLOTTED' || a.status === 'JOINED');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner Alert if Seat Allotted */}
      {allottedApp && allottedApp.status === 'ALLOTTED' && (
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Award size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-primary)', margin: 0 }}>
                Provisional Seat Allotted — Round {allottedApp.allottedRound || 1}
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: '0.2rem 0 0 0' }}>
                Course: <strong>{allottedApp.programme?.name}</strong> under <strong>{allottedApp.allottedQuota || 'GEN'}</strong> quota. Please accept or request upgrade within 72 hours.
              </p>
            </div>
          </div>
          <Link to="/applicant/allotment" className="btn btn-accent btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>Review & Accept Seat</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Card 1: Application Ref */}
        <div className="card">
          <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Application Number
          </span>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '0.35rem' }}>
            {primaryApp?.applicationNumber || 'DRAFT_PROFILE'}
          </h3>
          <span style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '0.25rem' }}>
            Academic Session: 2026-27
          </span>
        </div>

        {/* Card 2: Current Stage */}
        <div className="card">
          <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Admission Status
          </span>
          <div style={{ marginTop: '0.45rem' }}>
            <StatusBadge status={primaryApp ? primaryApp.status : 'DRAFT'} />
          </div>
          <span style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '0.35rem' }}>
            Category Quota: <strong>{applicant?.category || 'GEN'}</strong>
          </span>
        </div>

        {/* Card 3: Merit Score */}
        <div className="card">
          <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Merit Score / Rank
          </span>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: '0.35rem' }}>
            {primaryApp?.meritScore ? `${primaryApp.meritScore} pts` : `${applicant?.boardPercentage || 0}%`}
          </h3>
          <span style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '0.25rem' }}>
            Board: {applicant?.boardPercentage}% | Entrance: {applicant?.entranceScore}
          </span>
        </div>

        {/* Card 4: Fee Status */}
        <div className="card">
          <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Tuition Fee Balance
          </span>
          <div style={{ marginTop: '0.45rem' }}>
            <StatusBadge status={primaryApp?.status === 'JOINED' ? 'COMPLETED' : 'PENDING'} />
          </div>
          <span style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '0.35rem' }}>
            {outstanding?.outstandingAmount > 0 ? `₹${outstanding.outstandingAmount.toLocaleString()} Outstanding` : 'No Dues Pending'}
          </span>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1rem'
      }}>
        <Link to="/applicant/apply" className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '1rem', height: 'auto' }}>
          <FileText size={20} color="var(--color-accent)" style={{ flexShrink: 0 }} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>Application Form</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Preferences & Scores</span>
          </div>
        </Link>

        <Link to="/applicant/documents" className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '1rem', height: 'auto' }}>
          <FolderCheck size={20} color="var(--color-secondary)" style={{ flexShrink: 0 }} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>Document Repository</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>DigiLocker & Uploads</span>
          </div>
        </Link>

        <Link to="/applicant/allotment" className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '1rem', height: 'auto' }}>
          <Award size={20} color="#d97706" style={{ flexShrink: 0 }} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>Seat Allotment</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Accept & Upgrade</span>
          </div>
        </Link>

        <Link to="/applicant/fees" className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '1rem', height: 'auto' }}>
          <CreditCard size={20} color="var(--color-success)" style={{ flexShrink: 0 }} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>Fee & GST Receipts</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Pay Online & Download</span>
          </div>
        </Link>
      </div>

      {/* Main Row: Progress Timeline + Preferences List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
        {/* Left: Progression Timeline */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Application Status Lifecycle</h3>
          </div>
          <Timeline currentStatus={primaryApp?.status || 'SUBMITTED'} />
        </div>

        {/* Right: Preferences List */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>My Programme Preferences</h3>
              <p style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Up to 5 ranked academic choices
              </p>
            </div>
            <Link to="/applicant/apply" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-accent)' }}>
              Edit Choices
            </Link>
          </div>

          {applications.length === 0 ? (
            <EmptyState
              title="No choices submitted yet"
              description="Complete the online application wizard to submit up to 5 ranked programme preferences."
              action={
                <Link to="/applicant/apply" className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>
                  Start Application
                </Link>
              }
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {applications.map((app) => (
                <div
                  key={app.id}
                  style={{
                    padding: '0.875rem 1rem',
                    backgroundColor: app.status === 'ALLOTTED' || app.status === 'JOINED' ? '#eff6ff' : '#ffffff',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: app.status === 'ALLOTTED' ? 'var(--color-accent)' : 'var(--color-primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      {app.preferenceRank}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                        {app.programme?.name}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        Department: {app.programme?.department}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantDashboard;
