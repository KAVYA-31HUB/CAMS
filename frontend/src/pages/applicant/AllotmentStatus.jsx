import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicantApi } from '../../api/applicantApi';
import { applicationApi } from '../../api/applicationApi';
import { allocationApi } from '../../api/allocationApi';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import {
  Award,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  XCircle,
  CreditCard,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

const AllotmentStatus = () => {
  const { showSuccess, showError, showInfo } = useToast();
  const [applicant, setApplicant] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const appRes = await applicantApi.getMyApplicant();
      setApplicant(appRes.data);
      const appsRes = await applicationApi.getByApplicant(appRes.data.id);
      setApplications(appsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleConfirmSeat = async (appId) => {
    setActionLoading(true);
    try {
      await allocationApi.confirmSeat(appId);
      showSuccess('Seat acceptance confirmed! Please proceed to complete fee remittance.');
      fetchApplications();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to confirm seat acceptance');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestUpgrade = async (appId) => {
    setActionLoading(true);
    try {
      await allocationApi.requestUpgrade(appId);
      showSuccess('Upgrade request registered! You will be considered for higher preferences in Round 2.');
      fetchApplications();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to request upgrade');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSeat = async () => {
    if (!selectedAppId) return;
    setShowCancelModal(false);
    setActionLoading(true);
    try {
      await allocationApi.cancelSeat(selectedAppId);
      showInfo('Seat allotment cancelled. Waitlisted candidate has been promoted.');
      fetchApplications();
    } catch (err) {
      showError(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Checking central seat allocation matrix..." />;
  }

  const allottedApp = applications.find(
    (a) => a.status === 'ALLOTTED' || a.status === 'VERIFIED' || a.status === 'JOINED'
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Primary Status Banner */}
      {allottedApp ? (
        <div className="card" style={{ padding: '2rem', border: '1px solid #bfdbfe', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Award size={26} />
              </div>
              <div>
                <span className="badge badge-allotted" style={{ marginBottom: '0.25rem' }}>
                  Round {allottedApp.allottedRound || 1} Seat Offer
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>
                  Provisional Seat Allotment Confirmed
                </h2>
              </div>
            </div>

            <StatusBadge status={allottedApp.status} />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            padding: '1.25rem',
            backgroundColor: 'var(--color-bg-subtle)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            border: '1px solid var(--color-border)'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Allotted Programme</span>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)', margin: '0.2rem 0 0 0' }}>
                {allottedApp.programme?.name}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Allotted Quota / Category</span>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)', margin: '0.2rem 0 0 0' }}>
                {allottedApp.allottedQuota || applicant?.category || 'GEN'}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Merit Score</span>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)', margin: '0.2rem 0 0 0' }}>
                {allottedApp.meritScore ? `${allottedApp.meritScore} pts` : 'Qualified'}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Department</span>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-primary)', margin: '0.2rem 0 0 0' }}>
                {allottedApp.programme?.department}
              </p>
            </div>
          </div>

          {/* 72h Acceptance Warning */}
          {allottedApp.status === 'ALLOTTED' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.85rem 1.25rem',
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.75rem',
              color: '#92400e',
              fontSize: '0.85rem'
            }}>
              <Clock size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>72-Hour Acceptance Deadline:</strong> You must accept this seat or request an upgrade within 72 hours. Unaccepted seats are automatically forfeited and offered to waitlisted candidates.
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {allottedApp.status === 'ALLOTTED' && (
              <>
                <button
                  type="button"
                  onClick={() => handleConfirmSeat(allottedApp.id)}
                  className="btn btn-primary"
                  disabled={actionLoading}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <CheckCircle2 size={16} />
                  <span>Accept & Confirm Seat</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRequestUpgrade(allottedApp.id)}
                  className="btn btn-secondary"
                  disabled={actionLoading}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <TrendingUp size={16} />
                  <span>Request Round 2 Upgrade</span>
                </button>
              </>
            )}

            {allottedApp.status === 'JOINED' && (
              <Link to="/applicant/fees" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <CreditCard size={16} />
                <span>View Fee Receipt & Ledger</span>
              </Link>
            )}

            {allottedApp.status !== 'JOINED' && (
              <button
                type="button"
                onClick={() => {
                  setSelectedAppId(allottedApp.id);
                  setShowCancelModal(true);
                }}
                className="btn btn-outline"
                disabled={actionLoading}
                style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger-border)', marginLeft: 'auto' }}
              >
                <XCircle size={15} />
                <span>Cancel Allotment</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-bg-subtle)',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}>
            <Clock size={28} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Allocation Under Evaluation
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', maxWidth: '520px', margin: '0.5rem auto 1.5rem auto' }}>
            Your submitted preferences are currently being evaluated against candidate merit rankings and quota matrix guidelines. Official seat allocations will be published upon conclusion of the round.
          </p>
          <button
            onClick={fetchApplications}
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={14} />
            <span>Refresh Allotment Status</span>
          </button>
        </div>
      )}

      {/* Choice Allocation Details Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              Programme Choice Evaluation Matrix
            </h3>
            <p style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', margin: '0.15rem 0 0 0' }}>
              Round 1 preference breakdown
            </p>
          </div>
        </div>

        {applications.length === 0 ? (
          <EmptyState title="No preferences found" description="Submit your online application to register programme preferences." />
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Programme Title</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Allotted Round</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                        fontWeight: 700,
                        fontSize: '0.75rem'
                      }}>
                        {app.preferenceRank}
                      </span>
                    </td>
                    <td><strong>{app.programme?.name}</strong></td>
                    <td>{app.programme?.department}</td>
                    <td><StatusBadge status={app.status} /></td>
                    <td>{app.allottedRound ? `Round ${app.allottedRound}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Seat Allotment"
      >
        <div style={{ padding: '0.5rem 0' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Are you sure you want to cancel your allotted seat? This action is permanent and will immediately re-offer the vacant seat to the next eligible candidate on the waitlist.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setShowCancelModal(false)}
              className="btn btn-outline"
            >
              Keep My Seat
            </button>
            <button
              type="button"
              onClick={handleCancelSeat}
              className="btn btn-danger"
              disabled={actionLoading}
            >
              Confirm Cancellation
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AllotmentStatus;
