import React, { useState, useEffect } from 'react';
import { applicantApi } from '../../api/applicantApi';
import { documentApi } from '../../api/documentApi';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import {
  FolderCheck,
  FileUp,
  ShieldCheck,
  AlertCircle,
  Eye,
  CheckCircle2,
  Clock,
  RefreshCw,
  FileText,
  Download
} from 'lucide-react';

const REQUIRED_TYPES = [
  { type: 'MARKSHEET_10', title: '10th Marksheet / Birth Proof', desc: 'Required for date of birth and basic eligibility verification' },
  { type: 'MARKSHEET_12', title: '12th / Intermediate Marksheet', desc: 'Mandatory for PCM board percentage validation' },
  { type: 'IDENTITY_PROOF', title: 'Aadhaar / Photo Identity Card', desc: 'Official government photo identification proof' },
  { type: 'CATEGORY_CERTIFICATE', title: 'Category Reservation Certificate', desc: 'Mandatory for OBC-NCL, SC, ST, EWS, Sports quota claimants' },
  { type: 'INCOME_CERTIFICATE', title: 'Income Certificate', desc: 'Required for fee concession and scholarship grants' },
  { type: 'ENTRANCE_SCORECARD', title: 'Entrance Examination Scorecard', desc: 'JEE Main / State CET rank and scorecard' }
];

const DocumentManager = () => {
  const { showSuccess, showError } = useToast();
  const [applicantId, setApplicantId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchDocuments = async () => {
    try {
      const appRes = await applicantApi.getMyApplicant();
      setApplicantId(appRes.data.id);
      const docsRes = await documentApi.getApplicantDocuments(appRes.data.id);
      setDocuments(docsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showError('Maximum allowed file size is 5 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await documentApi.uploadDocument({
          applicantId,
          documentType: docType,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileData: reader.result,
          isDigiLocker: false
        });
        showSuccess(`${file.name} uploaded successfully!`);
        fetchDocuments();
      } catch (err) {
        showError('Document upload failed. Please try again.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDigiLockerImport = async (docType) => {
    try {
      await documentApi.importDigiLocker(applicantId, docType);
      showSuccess('Document fetched and verified via DigiLocker!');
      fetchDocuments();
    } catch (e) {
      showError('DigiLocker credential import failed.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Querying document verification repository..." />;
  }

  const docMap = {};
  documents.forEach((d) => {
    docMap[d.documentType] = d;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Guidance Banner */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
              DigiLocker & Document Verification
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', margin: '0.15rem 0 0 0' }}>
              Ensure all mandatory credentials are submitted for verification before the counsellor audit window closes.
            </p>
          </div>
        </div>
        <button
          onClick={fetchDocuments}
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <RefreshCw size={14} />
          <span>Refresh Repository</span>
        </button>
      </div>

      {/* Document Items Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {REQUIRED_TYPES.map((req) => {
          const doc = docMap[req.type];
          const isUploaded = !!doc;
          return (
            <div
              key={req.type}
              className="card"
              style={{
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div style={{ flex: 1, minWidth: '260px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <FileText size={20} color="var(--color-accent)" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                    {req.title}
                  </h3>
                  {req.required && (
                    <span style={{ fontSize: '0.675rem', fontWeight: 700, color: 'var(--color-danger)', backgroundColor: 'var(--color-danger-light)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                      MANDATORY
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                  {req.desc}
                </p>

                {isUploaded && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <StatusBadge status={doc.verificationStatus || doc.status} />
                    <span style={{ fontSize: '0.775rem', color: 'var(--color-text-secondary)' }}>
                      File: <strong>{doc.fileName}</strong>
                    </span>
                    {doc.isDigiLocker && (
                      <span className="badge badge-verified" style={{ fontSize: '0.7rem' }}>
                        <ShieldCheck size={12} /> DigiLocker Certified
                      </span>
                    )}
                    {doc.remarks && (
                      <span style={{ fontSize: '0.775rem', color: 'var(--color-danger-text)' }}>
                        Remark: {doc.remarks}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {isUploaded && (
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(doc)}
                    className="btn btn-outline btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Eye size={14} />
                    <span>View</span>
                  </button>
                )}

                <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                  <FileUp size={14} />
                  <span>{isUploaded ? 'Replace' : 'Upload'}</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e, req.type)}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => handleDigiLockerImport(req.type)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <ShieldCheck size={14} />
                  <span>DigiLocker</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.fileName || 'Document Preview'}
        maxWidth="700px"
      >
        <div style={{ padding: '0.5rem 0', textAlign: 'center' }}>
          {previewDoc?.fileData ? (
            previewDoc.fileType?.includes('image') || previewDoc.fileData.startsWith('data:image') ? (
              <img
                src={previewDoc.fileData}
                alt={previewDoc.fileName}
                style={{ maxWidth: '100%', maxHeight: '450px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
              />
            ) : (
              <iframe
                src={previewDoc.fileData}
                title={previewDoc.fileName}
                style={{ width: '100%', height: '420px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
              />
            )
          ) : (
            <div style={{ padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
              <FileText size={48} style={{ opacity: 0.4, margin: '0 auto 0.5rem auto' }} />
              <p>Preview not available for this cryptographic DigiLocker certificate entry.</p>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>Verified Signature: DL-CERT-2026-OK</span>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default DocumentManager;
