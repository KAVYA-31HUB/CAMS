import React, { useState, useEffect } from 'react';
import { feeApi } from '../../api/feeApi';
import { scholarshipApi } from '../../api/scholarshipApi';
import { reportApi } from '../../api/reportApi';
import { dashboardApi } from '../../api/dashboardApi';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { 
  DollarSign, 
  Receipt, 
  Award, 
  Search, 
  RefreshCw, 
  Printer, 
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function FinanceDashboard() {
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions', 'scholarships'
  
  // Transactions & Stats
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [financeSummary, setFinanceSummary] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Scholarship Queue
  const [scholarships, setScholarships] = useState([]);
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [scholarshipAction, setScholarshipAction] = useState({ status: 'APPROVED', amount: 0, remarks: '' });
  const [actionLoading, setActionLoading] = useState(false);

  // Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [payRes, schRes, statsRes, finRes] = await Promise.all([
        feeApi.getAllPayments(),
        scholarshipApi.getAll(),
        reportApi.getDashboardStats(),
        dashboardApi.getFinanceSummary().catch(() => ({ data: null }))
      ]);
      setPayments(payRes.data || []);
      setScholarships(schRes.data || []);
      setStats(statsRes.data);
      if (finRes?.data) {
        setFinanceSummary(finRes.data);
      }
    } catch (err) {
      showError('Failed to load financial records');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (sch) => {
    setSelectedScholarship(sch);
    setScholarshipAction({
      status: 'APPROVED',
      amount: sch.applicationFeeDiscount || 25000,
      remarks: 'Approved based on merit and documented income eligibility.'
    });
  };

  const handleReviewSubmit = async () => {
    if (!selectedScholarship) return;
    setActionLoading(true);
    try {
      const dto = {
        status: scholarshipAction.status,
        approvedAmount: scholarshipAction.status === 'APPROVED' ? Number(scholarshipAction.amount) : 0,
        remarks: scholarshipAction.remarks
      };
      await scholarshipApi.review(selectedScholarship.id, dto);
      showSuccess(`Scholarship application ${scholarshipAction.status.toLowerCase()} successfully`);
      setSelectedScholarship(null);
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to submit scholarship review');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewReceipt = async (paymentId) => {
    try {
      const res = await feeApi.getReceipt(paymentId);
      setSelectedReceipt(res.data);
      setShowReceiptModal(true);
    } catch (err) {
      showError('Failed to generate tax invoice receipt');
    }
  };

  const filteredPayments = payments.filter((p) => {
    const term = searchTerm.toLowerCase();
    const txn = (p.transactionId || '').toLowerCase();
    const applicant = (p.applicant?.fullName || '').toLowerCase();
    const mode = (p.paymentMode || '').toLowerCase();
    return txn.includes(term) || applicant.includes(term) || mode.includes(term);
  });

  const pendingScholarships = scholarships.filter((s) => s.status === 'PENDING');

  if (loading) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <LoadingSpinner text="Compiling Institutional Fee Ledger & Accounts..." />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      {/* Header */}
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
            <DollarSign size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Institutional Finance & Accounts Desk
            </h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Reconcile admission fee collections, audit GST 999293 invoices, and disburse tuition fee concessions.
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="btn btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
        >
          <RefreshCw size={14} />
          Refresh Accounts
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem'
      }}>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--success)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Fee Collected
          </span>
          <span style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--success)', display: 'block', margin: '0.35rem 0 0.2rem 0' }}>
            ₹{(financeSummary?.totalFeesPaid != null ? financeSummary.totalFeesPaid : (stats?.totalFeeCollected || 0)).toLocaleString('en-IN')}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GST Exempted (Notif 12/2017)</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--warning)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--warning-dark)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Fees Due
          </span>
          <span style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--warning-dark)', display: 'block', margin: '0.35rem 0 0.2rem 0' }}>
            ₹{(financeSummary?.totalFeesDue || 0).toLocaleString('en-IN')}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Outstanding Balance</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Successful Payments
          </span>
          <span style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--primary)', display: 'block', margin: '0.35rem 0 0.2rem 0' }}>
            {financeSummary?.successfulPayments != null ? financeSummary.successfulPayments : payments.filter(p => p.status === 'COMPLETED').length}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reconciled Receipts</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Pending Payments
          </span>
          <span style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', display: 'block', margin: '0.35rem 0 0.2rem 0' }}>
            {financeSummary?.pendingPayments != null ? financeSummary.pendingPayments : payments.filter(p => p.status === 'PENDING').length}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Awaiting Confirmation</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--danger)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Failed / Cancelled
          </span>
          <span style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--danger)', display: 'block', margin: '0.35rem 0 0.2rem 0' }}>
            {financeSummary?.failedPayments != null ? financeSummary.failedPayments : payments.filter(p => p.status === 'FAILED').length}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gateway Dropouts</span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Approved Concessions
          </span>
          <span style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', display: 'block', margin: '0.35rem 0 0.2rem 0' }}>
            ₹{(stats?.totalScholarshipsApproved || 0).toLocaleString('en-IN')}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scholarship Endowment</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('transactions')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            fontSize: '0.85rem',
            fontWeight: activeTab === 'transactions' ? 600 : 500,
            color: activeTab === 'transactions' ? 'var(--primary)' : 'var(--text-muted)',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'transactions' ? '2px solid var(--primary)' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Receipt size={16} />
          Transaction Ledger ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab('scholarships')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            fontSize: '0.85rem',
            fontWeight: activeTab === 'scholarships' ? 600 : 500,
            color: activeTab === 'scholarships' ? 'var(--primary)' : 'var(--text-muted)',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'scholarships' ? '2px solid var(--primary)' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Award size={16} />
          Scholarship Applications ({pendingScholarships.length} Pending)
        </button>
      </div>

      {/* TAB 1: Transactions Ledger */}
      {activeTab === 'transactions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{
            padding: '1rem 1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '400px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="input"
                style={{ paddingLeft: '2.25rem', width: '100%', fontSize: '0.85rem' }}
                placeholder="Search by Transaction ID, applicant or mode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              HSN Code 999293 • GST Exemption Notif 12/2017
            </span>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {filteredPayments.length === 0 ? (
              <div style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Receipt size={44} style={{ margin: '0 auto 0.75rem', opacity: 0.35 }} />
                <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>
                  No payments recorded
                </p>
                <p style={{ fontSize: '0.8rem', margin: 0 }}>
                  Applicant payments completed via UPI, NetBanking, or Cards will automatically appear here.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table-custom">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Txn ID</th>
                      <th>Applicant</th>
                      <th>Mode</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                          {p.transactionId || `TXN-${p.id}`}
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.875rem' }}>
                            {p.applicant?.fullName || `Applicant #${p.applicant?.id || p.applicantId}`}
                          </span>
                        </td>
                        <td>
                          <span style={{ padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'var(--surface-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                            {p.paymentMode}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                          ₹{p.amount?.toLocaleString('en-IN')}
                        </td>
                        <td>
                          <StatusBadge status={p.status} />
                        </td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button
                            onClick={() => handleViewReceipt(p.id)}
                            className="btn btn-outline btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.775rem' }}
                          >
                            <FileText size={13} />
                            Tax Invoice
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Scholarships Review */}
      {activeTab === 'scholarships' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {scholarships.length === 0 ? (
            <div style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Award size={44} style={{ margin: '0 auto 0.75rem', opacity: 0.35 }} />
              <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>
                No scholarship requests
              </p>
              <p style={{ fontSize: '0.8rem', margin: 0 }}>
                Eligible candidates applying for tuition fee concessions will appear here for officer approval.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Scheme / Category</th>
                    <th>Family Income</th>
                    <th>Status</th>
                    <th>Approved Concession</th>
                    <th>Reviewed By</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {scholarships.map((sch) => (
                    <tr key={sch.id}>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.875rem' }}>
                          {sch.applicant?.fullName || `Applicant #${sch.applicant?.id}`}
                        </span>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {sch.applicant?.email}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: 'var(--primary-subtle)',
                          color: 'var(--primary)',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}>
                          {sch.scholarshipName || 'Merit-cum-Means'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {sch.familyIncome ? `₹${sch.familyIncome.toLocaleString('en-IN')}/yr` : 'Under ₹2.5 Lakh'}
                      </td>
                      <td>
                        <StatusBadge status={sch.status} />
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                        {sch.approvedAmount ? `₹${sch.approvedAmount.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {sch.reviewedBy || 'Pending'}
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {sch.status === 'PENDING' ? (
                          <button
                            onClick={() => handleOpenReview(sch)}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.775rem' }}
                          >
                            Review & Decide
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Scholarship Decision Modal */}
      <Modal
        isOpen={!!selectedScholarship}
        onClose={() => !actionLoading && setSelectedScholarship(null)}
        title="Scholarship Concession Decision"
        maxWidth="max-w-md"
      >
        {selectedScholarship && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              padding: '0.875rem',
              borderRadius: '8px',
              background: 'var(--surface-muted)',
              border: '1px solid var(--border)',
              fontSize: '0.8rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}>
              <div>Applicant: <strong style={{ color: 'var(--text-main)' }}>{selectedScholarship.applicant?.fullName}</strong></div>
              <div>Scheme: <strong style={{ color: 'var(--text-main)' }}>{selectedScholarship.scholarshipName || 'Merit-cum-Means'}</strong></div>
            </div>

            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.775rem' }}>
                Decision Status
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setScholarshipAction({ ...scholarshipAction, status: 'APPROVED' })}
                  className="btn"
                  style={{
                    padding: '0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    background: scholarshipAction.status === 'APPROVED' ? 'var(--success-light)' : 'var(--surface)',
                    color: scholarshipAction.status === 'APPROVED' ? 'var(--success)' : 'var(--text-muted)',
                    border: scholarshipAction.status === 'APPROVED' ? '1px solid var(--success)' : '1px solid var(--border)'
                  }}
                >
                  Approve Concession
                </button>
                <button
                  type="button"
                  onClick={() => setScholarshipAction({ ...scholarshipAction, status: 'REJECTED' })}
                  className="btn"
                  style={{
                    padding: '0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    background: scholarshipAction.status === 'REJECTED' ? 'var(--danger-light)' : 'var(--surface)',
                    color: scholarshipAction.status === 'REJECTED' ? 'var(--danger)' : 'var(--text-muted)',
                    border: scholarshipAction.status === 'REJECTED' ? '1px solid var(--danger)' : '1px solid var(--border)'
                  }}
                >
                  Reject Request
                </button>
              </div>
            </div>

            {scholarshipAction.status === 'APPROVED' && (
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.775rem' }}>
                  Approved Concession Amount (INR)
                </label>
                <input
                  type="number"
                  className="input"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                  value={scholarshipAction.amount}
                  onChange={(e) => setScholarshipAction({ ...scholarshipAction, amount: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.775rem' }}>
                Remarks / Justification
              </label>
              <textarea
                className="input"
                style={{ width: '100%', minHeight: '70px', fontSize: '0.85rem' }}
                value={scholarshipAction.remarks}
                onChange={(e) => setScholarshipAction({ ...scholarshipAction, remarks: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                onClick={() => setSelectedScholarship(null)}
                className="btn btn-outline"
                style={{ fontSize: '0.8rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReviewSubmit}
                disabled={actionLoading}
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 1.25rem' }}
              >
                {actionLoading ? 'Saving...' : 'Confirm Decision'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Tax Invoice Modal */}
      <Modal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        title="Official GST Tax Invoice Receipt"
        maxWidth="max-w-2xl"
      >
        {selectedReceipt && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '1.5rem',
              background: 'var(--surface)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', margin: '0 0 0.2rem 0' }}>
                    {selectedReceipt.institutionName || 'Central University'}
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Affiliated Central University • Admissions Directorate</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                    GSTIN: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-main)' }}>{selectedReceipt.gstin || '33AAAAA0000A1Z5'}</span>
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: 'var(--success-light)',
                    color: 'var(--success)',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    border: '1px solid var(--success)'
                  }}>
                    TAX INVOICE
                  </span>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', margin: '0.4rem 0 0 0' }}>
                    {selectedReceipt.invoiceNumber}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Billed To:</span>
                  <p style={{ fontWeight: 700, margin: '0.2rem 0 0.1rem 0', color: 'var(--text-main)' }}>{selectedReceipt.applicantName}</p>
                  <p style={{ color: 'var(--text-muted)', margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{selectedReceipt.applicantEmail}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Programme:</span>
                  <p style={{ fontWeight: 700, margin: '0.2rem 0 0.1rem 0', color: 'var(--text-main)' }}>{selectedReceipt.programmeName}</p>
                  <p style={{ color: 'var(--text-muted)', margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>App: {selectedReceipt.applicationNumber}</p>
                </div>
              </div>

              <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-muted)' }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Description</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>HSN</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Amount (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.6rem 0.5rem' }}>Tuition & Academic Training Fee</td>
                    <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{selectedReceipt.hsnCode || '999293'}</td>
                    <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>₹{selectedReceipt.tuitionFee?.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: '2px solid var(--border)', fontWeight: 700 }}>
                    <td colSpan={2} style={{ padding: '0.75rem 0.5rem' }}>Total Paid</td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--primary)', fontSize: '0.95rem' }}>
                      ₹{selectedReceipt.totalPaid?.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
              >
                <Printer size={14} />
                Print Invoice
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 1.25rem' }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
