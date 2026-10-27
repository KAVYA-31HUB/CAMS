import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { feeApi } from '../../api/feeApi';
import { applicantApi } from '../../api/applicantApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Download,
  Printer,
  FileText,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  QrCode,
  Building2,
  Receipt,
  IndianRupee,
  Clock
} from 'lucide-react';

export default function FeePaymentPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [applicantProfile, setApplicantProfile] = useState(null);
  const [outstandingData, setOutstandingData] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);

  // Payment Modal state
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState('select'); // 'select', 'processing', 'complete'
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('SBI');

  // Receipt Modal state
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      let currentApp = null;
      if (user?.applicantId) {
        const appRes = await applicantApi.getById(user.applicantId);
        currentApp = appRes.data;
      } else {
        const meRes = await applicantApi.getCurrentProfile();
        currentApp = meRes.data;
      }
      setApplicantProfile(currentApp);

      if (currentApp?.id) {
        await fetchFeeDetails(currentApp.id);
      }
    } catch (err) {
      showError('Failed to load fee information');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeDetails = async (applicantId) => {
    try {
      const [outRes, histRes] = await Promise.allSettled([
        feeApi.getOutstanding(applicantId),
        feeApi.getApplicantPayments(applicantId)
      ]);
      if (outRes.status === 'fulfilled') {
        setOutstandingData(outRes.value.data);
      }
      if (histRes.status === 'fulfilled') {
        setPaymentHistory(histRes.value.data || []);
      }
    } catch (err) {
      console.error('Error fetching fee details:', err);
    }
  };

  const handleOpenPayment = () => {
    setPaymentStep('select');
    setShowPayModal(true);
  };

  const handleProcessPayment = async () => {
    if (!outstandingData?.applicationId && !outstandingData?.totalFee) {
      showError('No active admission application found for fee payment');
      return;
    }

    setProcessingPayment(true);
    setPaymentStep('processing');

    try {
      // Simulate realistic payment gateway round-trip delay
      await new Promise((r) => setTimeout(r, 1200));

      const payload = {
        applicantId: applicantProfile.id,
        applicationId: outstandingData.applicationId,
        amount: outstandingData.outstandingAmount || outstandingData.totalFee,
        paymentMode: paymentMode,
        remarks: `Admission Fee via ${paymentMode} - Web Portal`
      };

      const res = await feeApi.payFee(payload);
      showSuccess('Payment processed successfully! Admission status confirmed.');
      setPaymentStep('complete');

      // Refresh fee data
      await fetchFeeDetails(applicantProfile.id);

      // Automatically fetch receipt
      if (res.data?.id) {
        handleViewReceipt(res.data.id);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Payment processing failed. Please try again.');
      setPaymentStep('select');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleViewReceipt = async (paymentId) => {
    setLoadingReceipt(true);
    setShowReceiptModal(true);
    try {
      const res = await feeApi.getReceipt(paymentId);
      setSelectedReceipt(res.data);
    } catch (err) {
      showError('Failed to retrieve tax receipt');
      setShowReceiptModal(false);
    } finally {
      setLoadingReceipt(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving fee ledger and outstanding dues..." />;
  }

  const hasOutstanding = outstandingData && outstandingData.outstandingAmount > 0;
  const isPaid = outstandingData && outstandingData.status === 'PAID';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header Card */}
      <div className="card" style={{ padding: '1.5rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary)', margin: 0 }}>
            Admission Fee & Payment Ledger
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.2rem', margin: 0 }}>
            Review sanctioned programme fees, complete remittance, and generate GST-compliant tax invoices.
          </p>
        </div>
        <button
          onClick={loadData}
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <RefreshCw size={14} />
          <span>Refresh Dues</span>
        </button>
      </div>

      {/* Main Fee Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Outstanding Dues Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.75rem' }}>
          <div>
            <div className="card-header" style={{ paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Current Allotment Dues</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  {outstandingData?.programmeName || 'No active programme allotment'}
                </p>
              </div>
              <StatusBadge status={outstandingData?.status || 'PENDING'} />
            </div>

            {outstandingData && outstandingData.status !== 'NO_ACTIVE_ALLOTMENT' ? (
              <div style={{ margin: '1.25rem 0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
                  <div style={{ padding: '0.85rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', display: 'block', fontWeight: 600 }}>Total Fee</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>
                      ₹{outstandingData?.totalFee != null ? outstandingData.totalFee.toLocaleString('en-IN') : '0'}
                    </strong>
                  </div>
                  <div style={{ padding: '0.85rem', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.725rem', color: '#166534', display: 'block', fontWeight: 600 }}>Paid</span>
                    <strong style={{ fontSize: '1.1rem', color: '#15803d' }}>
                      ₹{outstandingData?.paidAmount != null ? outstandingData.paidAmount.toLocaleString('en-IN') : '0'}
                    </strong>
                  </div>
                  <div style={{ padding: '0.85rem', backgroundColor: hasOutstanding ? '#fef2f2' : 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.725rem', color: hasOutstanding ? '#991b1b' : 'var(--color-text-muted)', display: 'block', fontWeight: 600 }}>Balance Due</span>
                    <strong style={{ fontSize: '1.1rem', color: hasOutstanding ? '#dc2626' : 'var(--color-text-primary)' }}>
                      ₹{outstandingData?.outstandingAmount != null ? outstandingData.outstandingAmount.toLocaleString('en-IN') : '0'}
                    </strong>
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem', fontSize: '0.825rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div>Application Number: <strong>{outstandingData?.applicationNumber || '—'}</strong></div>
                  <div>Status: <strong>{outstandingData?.status === 'PAID' ? 'Fully Remitted (Seat Confirmed)' : 'Payment Pending'}</strong></div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <p style={{ fontSize: '0.875rem' }}>
                  No active seat allotment found requiring fee remittance. Fee payment will become available after seat allotment is released.
                </p>
              </div>
            )}
          </div>

          <div>
            {hasOutstanding ? (
              <button
                type="button"
                onClick={handleOpenPayment}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <CreditCard size={16} />
                <span>Pay Outstanding Balance (₹{(outstandingData?.outstandingAmount ?? 0).toLocaleString('en-IN')})</span>
              </button>
            ) : isPaid ? (
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#f0fdf4',
                color: '#166534',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}>
                <CheckCircle2 size={16} />
                <span>Admission Fee Fully Settled</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Banking & Gateway Security Information */}
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-primary)' }}>
              Secure Payment Information
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
              All transactions are processed through 256-bit SSL encrypted central payment gateways in accordance with RBI cyber-security norms.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.825rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={14} color="var(--color-success)" />
                <span>Instant GST tax invoice receipt generation</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={14} color="var(--color-success)" />
                <span>Supports BHIM UPI, NetBanking & Credit/Debit Cards</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={14} color="var(--color-success)" />
                <span>Zero gateway convenience charges for UPI transactions</span>
              </li>
            </ul>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '0.75rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>
            <ShieldCheck size={16} color="var(--color-primary)" />
            <span>Compliant with UGC Higher Education Fee Regulations</span>
          </div>
        </div>
      </div>

      {/* Payment History & Receipts Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Payment Transactions Ledger</h3>
            <p style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', margin: '0.15rem 0 0 0' }}>
              Official receipt vouchers and transaction history
            </p>
          </div>
        </div>

        {paymentHistory.length === 0 ? (
          <EmptyState
            title="No payment records found"
            description="Transactions will appear here once you remit admission or provisional seat fees."
          />
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Transaction Ref</th>
                  <th>Date & Time</th>
                  <th>Amount</th>
                  <th>Payment Mode</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Tax Invoice</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {p.transactionId || `TXN-${p.id}`}
                      </span>
                    </td>
                    <td>{p.paidAt ? new Date(p.paidAt).toLocaleString() : '—'}</td>
                    <td><strong>₹{p.amount?.toLocaleString('en-IN')}</strong></td>
                    <td>
                      <span className="badge badge-neutral">{p.paymentMode || 'UPI'}</span>
                    </td>
                    <td><StatusBadge status={p.status} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleViewReceipt(p.id)}
                        className="btn btn-outline btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Receipt size={14} />
                        <span>View Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Checkout Modal */}
      <Modal
        isOpen={showPayModal}
        onClose={() => !processingPayment && setShowPayModal(false)}
        title="Secured Admission Fee Checkout"
        maxWidth="540px"
      >
        <div style={{ padding: '0.5rem 0' }}>
          {paymentStep === 'select' && (
            <div>
              {/* Payment Summary */}
              <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Programme:</span>
                  <strong>{outstandingData?.programmeName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800 }}>
                  <span>Total Amount Payable:</span>
                  <span style={{ color: 'var(--color-primary)' }}>₹{(outstandingData?.outstandingAmount ?? 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Mode Selection */}
              <div className="form-group">
                <label className="form-label">Select Payment Method</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {['UPI', 'CARD', 'NETBANKING'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      className={`btn btn-sm ${paymentMode === mode ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '0.65rem', fontWeight: 700 }}
                    >
                      {mode === 'UPI' ? 'UPI / QR' : mode === 'CARD' ? 'Debit/Credit' : 'NetBanking'}
                    </button>
                  ))}
                </div>
              </div>

              {/* UPI Tab */}
              {paymentMode === 'UPI' && (
                <div style={{ padding: '1rem', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', textAlign: 'center' }}>
                  <QrCode size={96} style={{ margin: '0 auto 0.5rem auto', color: 'var(--color-primary)' }} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0 0 0.75rem 0' }}>
                    Scan QR using Google Pay, PhonePe, or BHIM UPI
                  </p>
                  <div className="form-group" style={{ margin: 0, textAlign: 'left' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Or Enter UPI ID / VPA</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="student@okaxis"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Card Tab */}
              {paymentMode === 'CARD' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Card Number</label>
                    <input
                      type="text"
                      maxLength="16"
                      className="form-input"
                      placeholder="4532 •••• •••• 8921"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Expiry (MM/YY)</label>
                      <input
                        type="text"
                        maxLength="5"
                        className="form-input"
                        placeholder="08/29"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>CVV</label>
                      <input
                        type="password"
                        maxLength="4"
                        className="form-input"
                        placeholder="•••"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* NetBanking Tab */}
              {paymentMode === 'NETBANKING' && (
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Select Bank</label>
                  <select
                    className="form-select"
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                  >
                    <option value="SBI">State Bank of India</option>
                    <option value="HDFC">HDFC Bank</option>
                    <option value="ICICI">ICICI Bank</option>
                    <option value="AXIS">Axis Bank</option>
                    <option value="PNB">Punjab National Bank</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProcessPayment}
                  className="btn btn-primary"
                  style={{ padding: '0.65rem 1.5rem' }}
                >
                  Pay ₹{(outstandingData?.outstandingAmount ?? 0).toLocaleString('en-IN')}
                </button>
              </div>
            </div>
          )}

          {paymentStep === 'processing' && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <LoadingSpinner message="Connecting to secure bank gateway and authenticating transaction..." />
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                Please do not refresh or close this tab while your payment is being verified.
              </p>
            </div>
          )}

          {paymentStep === 'complete' && (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <CheckCircle2 size={48} color="var(--color-success)" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                Payment Successfully Received!
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                Your seat allotment has been confirmed. The official tax invoice has been generated.
              </p>
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="btn btn-primary"
                style={{ marginTop: '1.5rem', padding: '0.65rem 2rem' }}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Official GST Tax Invoice Receipt Modal */}
      <Modal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        title="Official GST Tax Invoice Receipt"
        maxWidth="680px"
      >
        {loadingReceipt ? (
          <div style={{ padding: '3rem 1rem' }}>
            <LoadingSpinner message="Generating official GST tax invoice..." />
          </div>
        ) : selectedReceipt ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Printable Receipt Box */}
            <div style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              backgroundColor: '#ffffff'
            }}>
              {/* Receipt Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '-0.01em', margin: 0 }}>
                    {selectedReceipt.institutionName || 'Central Admissions Directorate'}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0.15rem 0 0 0' }}>
                    Affiliated Higher Education Admissions Directorate
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0 0' }}>
                    GSTIN: <strong>{selectedReceipt.gstin || '33AAAAA0000A1Z5'}</strong>
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-verified" style={{ fontSize: '0.725rem' }}>
                    TAX INVOICE
                  </span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8rem', marginTop: '0.35rem' }}>
                    {selectedReceipt.invoiceNumber || 'INV-2026-0001'}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Date: {selectedReceipt.paidAt ? new Date(selectedReceipt.paidAt).toLocaleDateString() : new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Billed To */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block', fontWeight: 600 }}>Billed To Candidate:</span>
                  <strong style={{ fontSize: '0.875rem' }}>{selectedReceipt.applicantName}</strong>
                  <div style={{ color: 'var(--color-text-secondary)' }}>{selectedReceipt.applicantEmail}</div>
                  <div style={{ color: 'var(--color-text-secondary)' }}>{selectedReceipt.applicantPhone}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block', fontWeight: 600 }}>Admitted Programme:</span>
                  <strong style={{ fontSize: '0.875rem' }}>{selectedReceipt.programmeName}</strong>
                  <div style={{ color: 'var(--color-text-secondary)' }}>App No: {selectedReceipt.applicationNumber}</div>
                  <div style={{ color: 'var(--color-text-secondary)' }}>Session: {selectedReceipt.academicYear || '2026-27'}</div>
                </div>
              </div>

              {/* Fee Line Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-bg-subtle)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Description</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>HSN Code</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Amount (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.6rem 0.5rem' }}>Tuition & Academic Training Fee</td>
                    <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{selectedReceipt.hsnCode || '999293'}</td>
                    <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>₹{selectedReceipt.tuitionFee?.toLocaleString('en-IN') || '75,000'}</td>
                  </tr>
                  {selectedReceipt.examFee > 0 && (
                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.6rem 0.5rem' }}>Library & Examination Facilities</td>
                      <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>999293</td>
                      <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>₹{selectedReceipt.examFee?.toLocaleString('en-IN')}</td>
                    </tr>
                  )}
                  {selectedReceipt.scholarshipDeduction > 0 && (
                    <tr style={{ borderBottom: '1px solid var(--color-border)', color: '#166534' }}>
                      <td style={{ padding: '0.6rem 0.5rem' }}>Merit Scholarship / Concession Grant</td>
                      <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>—</td>
                      <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>-₹{selectedReceipt.scholarshipDeduction?.toLocaleString('en-IN')}</td>
                    </tr>
                  )}
                  <tr style={{ color: 'var(--color-text-muted)' }}>
                    <td style={{ padding: '0.35rem 0.5rem' }}>Central GST (CGST - 0% Higher Ed Exempt)</td>
                    <td style={{ padding: '0.35rem 0.5rem', textAlign: 'center' }}>—</td>
                    <td style={{ padding: '0.35rem 0.5rem', textAlign: 'right' }}>₹0.00</td>
                  </tr>
                  <tr style={{ color: 'var(--color-text-muted)' }}>
                    <td style={{ padding: '0.35rem 0.5rem' }}>State GST (SGST - 0% Higher Ed Exempt)</td>
                    <td style={{ padding: '0.35rem 0.5rem', textAlign: 'center' }}>—</td>
                    <td style={{ padding: '0.35rem 0.5rem', textAlign: 'right' }}>₹0.00</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: '2px solid var(--color-primary)', fontWeight: 800, fontSize: '0.95rem' }}>
                    <td colSpan={2} style={{ padding: '0.75rem 0.5rem' }}>Total Remittance Paid</td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--color-primary)' }}>
                      ₹{selectedReceipt.totalPaid?.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Transaction Metadata Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.725rem', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                <div>
                  <div>Txn Ref: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{selectedReceipt.transactionId}</span></div>
                  <div>Payment Mode: {selectedReceipt.paymentMode || 'UPI'} • Status: {selectedReceipt.paymentStatus || 'COMPLETED'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div>Computer-generated tax receipt.</div>
                  <div>Valid without physical signature under IT Act 2000.</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Printer size={15} />
                <span>Print Tax Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="btn btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
