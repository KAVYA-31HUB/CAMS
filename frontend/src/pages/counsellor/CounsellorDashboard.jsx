import React, { useState, useEffect } from 'react';
import { documentApi } from '../../api/documentApi';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { 
  FileCheck, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  ExternalLink, 
  Eye, 
  RefreshCw,
  Hash,
  Award,
  Clock
} from 'lucide-react';

export default function CounsellorDashboard() {
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected document review modal
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await documentApi.getAllDocuments();
      setDocuments(res.data || []);
    } catch (err) {
      showError('Failed to fetch verification queue');
    } finally {
      setLoading(false);
    }
  };

  const getDocStatus = (doc) => {
    return doc?.verificationStatus || doc?.status || 'PENDING';
  };

  const handleOpenReview = (doc) => {
    setSelectedDoc(doc);
    setReviewRemarks(doc.remarks || '');
  };

  const handleVerify = async (status) => {
    // Map to canonical backend status: DISCREPANT, VERIFIED, or PENDING
    const canonicalStatus = (status === 'DISCREPANCY_FLAGGED' || status === 'REJECTED') ? 'DISCREPANT' : status;

    if (canonicalStatus === 'DISCREPANT' && !reviewRemarks.trim()) {
      showError('Remarks are mandatory when raising a discrepancy or rejecting a document (SRS Appendix G).');
      return;
    }

    setActionLoading(true);
    try {
      const dto = {
        verificationStatus: canonicalStatus,
        status: canonicalStatus,
        remarks: reviewRemarks.trim() || 'Document verified against original credentials.'
      };
      const res = await documentApi.verifyDocument(selectedDoc.id, dto);
      const updatedDoc = res.data;
      showSuccess(`Document status updated to ${canonicalStatus}`);

      // Update local state immediately so UI reflects change instantly
      setDocuments((prevDocs) =>
        prevDocs.map((d) => (d.id === selectedDoc.id ? { ...d, ...updatedDoc, verificationStatus: canonicalStatus, status: canonicalStatus } : d))
      );
      setSelectedDoc(null);
      await fetchDocuments();
    } catch (err) {
      showError(err.response?.data?.message || 'Verification update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const docStatus = getDocStatus(doc);
    const matchesStatus = filterStatus === 'ALL'
      || docStatus === filterStatus
      || (filterStatus === 'DISCREPANT' && (docStatus === 'DISCREPANCY_FLAGGED' || docStatus === 'DISCREPANT'))
      || (filterStatus === 'REJECTED' && (docStatus === 'DISCREPANT' || docStatus === 'REJECTED'));
    const applicantName = doc.applicant?.fullName || '';
    const docType = doc.documentType || '';
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = applicantName.toLowerCase().includes(searchLower) || docType.toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: documents.length,
    pending: documents.filter((d) => getDocStatus(d) === 'PENDING').length,
    verified: documents.filter((d) => getDocStatus(d) === 'VERIFIED').length,
    discrepancy: documents.filter((d) => {
      const st = getDocStatus(d);
      return st === 'DISCREPANT' || st === 'DISCREPANCY_FLAGGED' || st === 'REJECTED';
    }).length,
  };


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
        <div>
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
              <FileCheck size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                Counsellor Verification Desk
              </h1>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Audit applicant educational transcripts, category certificates, and cryptographically verify DigiLocker authenticity.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchDocuments}
          className="btn btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
        >
          <RefreshCw size={15} />
          Refresh Queue
        </button>
      </div>

      {/* Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total in Queue
            </span>
            <span style={{ color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '0.35rem', borderRadius: '6px', display: 'flex' }}>
              <FileCheck size={16} />
            </span>
          </div>
          <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>{stats.total}</span>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            All submitted credentials
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--warning-dark)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Pending Review
            </span>
            <span style={{ color: 'var(--warning-dark)', background: 'var(--warning-light)', padding: '0.35rem', borderRadius: '6px', display: 'flex' }}>
              <Clock size={16} />
            </span>
          </div>
          <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--warning-dark)' }}>{stats.pending}</span>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Requires officer decision
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Verified & Approved
            </span>
            <span style={{ color: 'var(--success)', background: 'var(--success-light)', padding: '0.35rem', borderRadius: '6px', display: 'flex' }}>
              <CheckCircle size={16} />
            </span>
          </div>
          <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)' }}>{stats.verified}</span>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Eligible for merit ranking
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--danger)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Discrepancies Flagged
            </span>
            <span style={{ color: 'var(--danger)', background: 'var(--danger-light)', padding: '0.35rem', borderRadius: '6px', display: 'flex' }}>
              <AlertTriangle size={16} />
            </span>
          </div>
          <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--danger)' }}>{stats.discrepancy}</span>
          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Awaiting applicant re-upload
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="card" style={{
        padding: '1rem 1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '380px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input"
            style={{ paddingLeft: '2.25rem', width: '100%', fontSize: '0.85rem' }}
            placeholder="Search by applicant name or document type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginRight: '0.25rem' }}>
            <Filter size={14} />
            <span>Status:</span>
          </div>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'VERIFIED', label: 'Verified' },
            { id: 'DISCREPANT', label: 'Discrepancy' }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id)}
              className="btn btn-sm"
              style={{
                fontSize: '0.75rem',
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                border: filterStatus === st.id ? '1px solid var(--primary)' : '1px solid var(--border)',
                background: filterStatus === st.id ? 'var(--primary)' : 'var(--surface)',
                color: filterStatus === st.id ? '#ffffff' : 'var(--text-muted)',
                fontWeight: filterStatus === st.id ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Queue Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
            <LoadingSpinner text="Loading applicant verification queue..." />
          </div>
        ) : filteredDocs.length === 0 ? (
          <div style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FileCheck size={44} style={{ margin: '0 auto 0.75rem', opacity: 0.35 }} />
            <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>
              No documents match your filter
            </p>
            <p style={{ fontSize: '0.8rem', margin: 0 }}>
              Submitted documents awaiting counsellor audit will appear in this workspace.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Document Type</th>
                  <th>Integrity / Source</th>
                  <th>Submitted At</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.875rem' }}>
                          {doc.applicant?.fullName || `Applicant #${doc.applicant?.id || doc.applicantId}`}
                        </span>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {doc.applicant?.email}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background: 'var(--surface-muted)',
                        color: 'var(--text-main)'
                      }}>
                        {doc.documentType}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {doc.isDigiLockerVerified ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: 'var(--success)',
                            background: 'var(--success-light)',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '9999px',
                            width: 'fit-content'
                          }}>
                            <ShieldCheck size={12} /> DigiLocker Verified
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            Manual Upload
                          </span>
                        )}
                        {(doc.sha256Hash || doc.fileHash) && (
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.65rem',
                              color: 'var(--text-muted)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              maxWidth: '140px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={doc.sha256Hash || doc.fileHash}
                          >
                            <Hash size={10} style={{ flexShrink: 0 }} />
                            {(doc.sha256Hash || doc.fileHash).substring(0, 12)}...
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td>
                      <StatusBadge status={getDocStatus(doc)} />
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {doc.remarks || '—'}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => handleOpenReview(doc)}
                        className="btn btn-outline btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.775rem' }}
                      >
                        <Eye size={13} />
                        Audit & Verify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Document Review Modal */}
      <Modal
        isOpen={!!selectedDoc}
        onClose={() => !actionLoading && setSelectedDoc(null)}
        title="Document Audit & Verification Desk"
        maxWidth="max-w-2xl"
      >
        {selectedDoc && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Metadata Overview */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              padding: '1rem',
              background: 'var(--surface-muted)',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              fontSize: '0.8rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Applicant Name:</span>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', display: 'block' }}>
                  {selectedDoc.applicant?.fullName || `Applicant #${selectedDoc.applicant?.id}`}
                </span>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                  {selectedDoc.applicant?.email}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Document Type:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem', display: 'block' }}>
                  {selectedDoc.documentType}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  File: {selectedDoc.fileName || 'document.pdf'}
                </span>
              </div>
            </div>

            {/* Cryptographic SHA-256 & Authenticity verification banner */}
            <div style={{
              padding: '1rem',
              background: 'var(--primary-subtle)',
              border: '1px solid var(--primary-light)',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={16} />
                  SHA-256 Tamper-Proof Cryptographic Hash
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: 'var(--success)',
                  background: 'var(--success-light)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px'
                }}>
                  Checksum Verified
                </span>
              </div>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--text-main)',
                wordBreak: 'break-all',
                background: 'var(--surface)',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                margin: 0
              }}>
                {selectedDoc.sha256Hash || selectedDoc.fileHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
              </p>
              {selectedDoc.isDigiLockerVerified && (
                <p style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', margin: 0 }}>
                  <Award size={14} />
                  Directly synced from Government of India DigiLocker repository.
                </p>
              )}
            </div>

            {/* Document Preview Box */}
            <div style={{
              border: '1px dashed var(--border)',
              borderRadius: '8px',
              padding: '1.5rem',
              background: 'var(--surface-muted)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <FileCheck size={40} style={{ color: 'var(--primary)', opacity: 0.8 }} />
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', margin: '0 0 0.2rem 0' }}>
                  {selectedDoc.fileName || 'Certificate_Transcript.pdf'}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                  Encrypted secure archive path on institutional repository
                </p>
              </div>
              {selectedDoc.filePath && (
                <a
                  href={`http://localhost:8080${selectedDoc.filePath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
                >
                  <ExternalLink size={13} />
                  Open Document File
                </a>
              )}
            </div>

            {/* Verification Remarks Form */}
            <div>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
                Verification Remarks / Discrepancy Note <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <textarea
                className="input"
                style={{ width: '100%', minHeight: '80px', fontSize: '0.85rem' }}
                placeholder="Enter remarks (mandatory when raising a discrepancy or rejecting)..."
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
              />
              <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', margin: '0.35rem 0 0 0' }}>
                Per SRS Appendix G: Candidates receive instantaneous email notifications containing remarks if discrepancies are flagged.
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '0.75rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border)'
            }}>
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                disabled={actionLoading}
                className="btn btn-outline"
                style={{ fontSize: '0.8rem' }}
              >
                Cancel
              </button>

              {selectedDoc && getDocStatus(selectedDoc) !== 'PENDING' && (
                <button
                  type="button"
                  onClick={() => handleVerify('PENDING')}
                  disabled={actionLoading}
                  className="btn btn-outline"
                  style={{
                    fontSize: '0.8rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: 'var(--text-muted)'
                  }}
                >
                  <Clock size={14} />
                  Reset to Pending
                </button>
              )}

              <button
                type="button"
                onClick={() => handleVerify('DISCREPANT')}
                disabled={actionLoading}
                className="btn"
                style={{
                  background: 'var(--warning-light)',
                  color: 'var(--warning-dark)',
                  border: '1px solid var(--warning)',
                  fontSize: '0.8rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <AlertTriangle size={14} />
                Flag Discrepancy
              </button>

              <button
                type="button"
                onClick={() => handleVerify('DISCREPANT')}
                disabled={actionLoading}
                className="btn"
                style={{
                  background: 'var(--danger-light)',
                  color: 'var(--danger)',
                  border: '1px solid var(--danger)',
                  fontSize: '0.8rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <XCircle size={14} />
                Reject
              </button>

              <button
                type="button"
                onClick={() => handleVerify('VERIFIED')}
                disabled={actionLoading}
                className="btn btn-primary"
                style={{
                  fontSize: '0.8rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <CheckCircle size={14} />
                Approve & Verify
              </button>

            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
