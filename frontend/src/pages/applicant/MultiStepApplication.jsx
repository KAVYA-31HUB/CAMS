import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { applicantApi } from '../../api/applicantApi';
import { programmeApi } from '../../api/programmeApi';
import { applicationApi } from '../../api/applicationApi';
import { documentApi } from '../../api/documentApi';
import { scholarshipApi } from '../../api/scholarshipApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import {
  User,
  GraduationCap,
  ListOrdered,
  FileUp,
  Award,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
  AlertCircle,
  Clock,
  Printer,
  FileText
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Personal Details', icon: User },
  { id: 2, title: 'Academic Scores', icon: GraduationCap },
  { id: 3, title: 'Programme Choices', icon: ListOrdered },
  { id: 4, title: 'Document Uploads', icon: FileUp },
  { id: 5, title: 'Fee Concession', icon: Award },
  { id: 6, title: 'Review & Submit', icon: CheckCircle2 },
];

const REQUIRED_DOCS = [
  { type: 'MARKSHEET_10', title: '10th Marksheet / Age Proof', required: true },
  { type: 'MARKSHEET_12', title: '12th / Intermediate Marksheet', required: true },
  { type: 'IDENTITY_PROOF', title: 'Aadhaar / Government Photo ID', required: true },
  { type: 'ENTRANCE_SCORECARD', title: 'Entrance Examination Scorecard', required: true },
  { type: 'CATEGORY_CERTIFICATE', title: 'Category Reservation Certificate', required: false },
  { type: 'INCOME_CERTIFICATE', title: 'Income Certificate (for scholarships)', required: false },
];

const MultiStepApplication = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showToast } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applicantId, setApplicantId] = useState(null);
  const [programmes, setProgrammes] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Form State
  const [personal, setPersonal] = useState({
    name: '',
    email: '',
    phone: '',
    aadhaarNumber: '',
    category: 'GEN',
    gender: 'Male',
    dateOfBirth: '',
    address: ''
  });

  const [academic, setAcademic] = useState({
    schoolBoard: 'CBSE',
    boardPercentage: '',
    entranceExamName: 'JEE Main',
    entranceScore: '',
    entranceRollNo: ''
  });

  // Up to 5 ranked choices
  const [preferences, setPreferences] = useState([]);

  // Documents
  const [uploadedDocs, setUploadedDocs] = useState({});

  // Scholarship
  const [scholarship, setScholarship] = useState({
    apply: false,
    schemeName: 'Merit-cum-Means Grant',
    annualIncome: '',
    requestedAmount: '25000'
  });

  // Submission State
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [appRes, progRes] = await Promise.all([
          applicantApi.getMyApplicant(),
          programmeApi.getActiveProgrammes()
        ]);

        const app = appRes.data;
        setApplicantId(app.id);
        setProgrammes(progRes.data || []);

        setPersonal({
          name: app.name || '',
          email: app.email || '',
          phone: app.phone || '',
          aadhaarNumber: '',
          category: app.category || 'GEN',
          gender: app.gender || 'Male',
          dateOfBirth: app.dateOfBirth || '',
          address: app.address || ''
        });

        setAcademic({
          schoolBoard: app.schoolBoard || 'CBSE',
          boardPercentage: app.boardPercentage || '',
          entranceExamName: app.entranceExamName || 'JEE Main',
          entranceScore: app.entranceScore || '',
          entranceRollNo: app.entranceRollNo || ''
        });

        // Fetch existing applications if any
        const appsRes = await applicationApi.getByApplicant(app.id);
        const availableProgs = progRes.data || [];
        if (appsRes.data && appsRes.data.length > 0) {
          const sorted = appsRes.data.sort((a, b) => a.preferenceRank - b.preferenceRank);
          const savedIds = Array.from(new Set(sorted.map((a) => a.programme.id)));
          const filled = [...savedIds];
          for (const p of availableProgs) {
            if (filled.length >= 5) break;
            if (!filled.includes(p.id)) {
              filled.push(p.id);
            }
          }
          setPreferences(filled.slice(0, 5));
        } else if (availableProgs.length > 0) {
          setPreferences(availableProgs.slice(0, 5).map((p) => p.id));
        }

        // Fetch existing documents
        try {
          const docRes = await documentApi.getApplicantDocuments(app.id);
          const map = {};
          (docRes.data || []).forEach((d) => {
            map[d.documentType] = d;
          });
          setUploadedDocs(map);
        } catch (e) {
          // Ignore
        }
      } catch (err) {
        console.error('Failed to load application wizard data', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // Preference Controls
  const addPreference = () => {
    if (preferences.length >= 5) {
      showToast('Maximum 5 preferences allowed', 'warning');
      return;
    }
    const available = programmes.find((p) => !preferences.includes(p.id));
    if (available) {
      setPreferences([...preferences, available.id]);
    }
  };

  const removePreference = (idx) => {
    if (preferences.length <= 1) {
      showToast('At least one programme preference is required', 'warning');
      return;
    }
    setPreferences(preferences.filter((_, i) => i !== idx));
  };

  const movePreference = (idx, direction) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= preferences.length) return;
    const updated = [...preferences];
    const temp = updated[idx];
    updated[idx] = updated[newIdx];
    updated[newIdx] = temp;
    setPreferences(updated);
  };

  // Document Upload
  const handleDocUpload = (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showError('File size must be under 5 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await documentApi.uploadDocument({
          applicantId,
          documentType: docType,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileData: reader.result,
          isDigiLocker: false
        });
        setUploadedDocs((prev) => ({ ...prev, [docType]: res.data }));
        showSuccess(`${file.name} uploaded successfully!`);
      } catch (err) {
        showError('Document upload failed. Please try again.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDigiLocker = async (docType) => {
    try {
      const res = await documentApi.importDigiLocker(applicantId, docType);
      setUploadedDocs((prev) => ({ ...prev, [docType]: res.data }));
      showSuccess(`Certificate linked & verified via DigiLocker!`);
    } catch (e) {
      showError('DigiLocker credential retrieval failed.');
    }
  };

  // Save Draft
  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await applicantApi.updateApplicant(applicantId, {
        ...personal,
        boardPercentage: parseFloat(academic.boardPercentage) || 0,
        entranceScore: parseFloat(academic.entranceScore) || 0,
        ...academic
      });
      showSuccess('Draft saved! You can resume and submit anytime.');
    } catch (e) {
      showError('Failed to save application draft.');
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = () => {
    if (currentStep === 1) {
      if (!personal.name?.trim() || !personal.email?.trim() || !personal.phone?.trim()) {
        showError('Please complete all mandatory personal information.');
        return;
      }
    } else if (currentStep === 2) {
      if (!academic.boardPercentage || !academic.entranceScore) {
        showError('Please fill your 12th Board Percentage and Entrance Exam Score.');
        return;
      }
    } else if (currentStep === 3) {
      if (preferences.length < 5) {
        showError(`Please select all 5 programme preferences (currently ${preferences.length}/5 chosen).`);
        return;
      }
      const unique = new Set(preferences);
      if (unique.size !== 5) {
        showError('All 5 programme preferences must be unique. Please resolve duplicates.');
        return;
      }
    }
    setCurrentStep((prev) => prev + 1);
  };

  // Final Submit
  const handleFinalSubmit = async () => {
    if (preferences.length < 5) {
      showError('Exactly 5 programme preferences are required to submit the application.');
      return;
    }
    const unique = new Set(preferences);
    if (unique.size !== 5) {
      showError('All 5 programme preferences must be unique. Please remove duplicates.');
      return;
    }
    setShowConfirmModal(false);
    setSaving(true);
    try {
      // 1. Update applicant details
      await applicantApi.updateApplicant(applicantId, {
        ...personal,
        boardPercentage: parseFloat(academic.boardPercentage) || 0,
        entranceScore: parseFloat(academic.entranceScore) || 0,
        ...academic
      });

      // 2. Submit multi-preference application
      const res = await applicationApi.submitMultiStep({
        applicantId,
        programmeIds: preferences,
        academicYear: '2026-27',
        isDraft: false
      });

      // 3. Submit scholarship if requested
      if (scholarship.apply && scholarship.annualIncome) {
        try {
          await scholarshipApi.apply({
            applicantId,
            schemeName: scholarship.schemeName,
            annualIncome: parseFloat(scholarship.annualIncome),
            requestedAmount: parseFloat(scholarship.requestedAmount) || 25000
          });
        } catch (ignored) {}
      }

      setSubmissionResult(res.data[0]);
      setCurrentStep(7);
      showSuccess('Application successfully submitted! Application Reference assigned.');
    } catch (err) {
      showError(err.response?.data?.message || 'Application submission failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Preparing admission application wizard..." />;
  }

  // Final Success View
  if (currentStep === 7) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem', boxShadow: 'var(--shadow-md)' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-success-light)',
            color: 'var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            Application Submitted Successfully!
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            Your admission application has been registered for the 2026-27 Academic Session.
          </p>

          <div style={{
            margin: '2rem auto',
            padding: '1.25rem 1.5rem',
            backgroundColor: 'var(--color-bg-subtle)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            display: 'inline-block',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
              OFFICIAL APPLICATION NUMBER
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              {submissionResult?.applicationNumber || 'CAMS-2026-CONFIRMED'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
              Candidate: <strong>{personal.name}</strong> • Category: <strong>{personal.category}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => window.print()}
              className="btn btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Printer size={16} />
              <span>Print Acknowledgement</span>
            </button>
            <button
              onClick={() => navigate('/applicant')}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <span>Go to My Dashboard</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Stepper Navigation */}
      <div className="stepper-nav" style={{ marginBottom: '2.5rem' }}>
        {STEPS.map((s) => {
          const isCompleted = s.id < currentStep;
          const isActive = s.id === currentStep;
          return (
            <div
              key={s.id}
              className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => s.id < currentStep && setCurrentStep(s.id)}
              style={{ cursor: s.id < currentStep ? 'pointer' : 'default' }}
            >
              <div className="step-circle">
                {isCompleted ? <CheckCircle2 size={16} /> : s.id}
              </div>
              <span className="step-title">{s.title}</span>
            </div>
          );
        })}
      </div>

      {/* Main Wizard Form Card */}
      <div className="card" style={{ padding: '2.25rem', boxShadow: 'var(--shadow-sm)' }}>
        {/* Step 1: Personal Details */}
        {currentStep === 1 && (
          <div>
            <div className="card-header" style={{ paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Step 1: Personal Information</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Candidate personal records as per official government identification.
                </p>
              </div>
              <span className="badge badge-allotted">Step 1 of 6</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={personal.name}
                  onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  className="form-input"
                  value={personal.email}
                  onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number <span className="required">*</span></label>
                <input
                  type="tel"
                  className="form-input"
                  value={personal.phone}
                  onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Quota Category <span className="required">*</span></label>
                <select
                  className="form-select"
                  value={personal.category}
                  onChange={(e) => setPersonal({ ...personal, category: e.target.value })}
                >
                  <option value="GEN">General (Open Merit)</option>
                  <option value="OBC">OBC (Non-Creamy Layer)</option>
                  <option value="SC">Scheduled Caste (SC)</option>
                  <option value="ST">Scheduled Tribe (ST)</option>
                  <option value="EWS">Economically Weaker Section (EWS)</option>
                  <option value="SPORTS">Sports Quota</option>
                  <option value="DEFENCE">Defence Personnel Ward</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Gender <span className="required">*</span></label>
                <select
                  className="form-select"
                  value={personal.gender}
                  onChange={(e) => setPersonal({ ...personal, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-input"
                  value={personal.dateOfBirth}
                  onChange={(e) => setPersonal({ ...personal, dateOfBirth: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Residential Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="Street address, City, State, PIN"
                value={personal.address}
                onChange={(e) => setPersonal({ ...personal, address: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Step 2: Academic Details */}
        {currentStep === 2 && (
          <div>
            <div className="card-header" style={{ paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Step 2: Academic Qualifications</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Board percentages and entrance examination marks for merit ranking.
                </p>
              </div>
              <span className="badge badge-allotted">Step 2 of 6</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">12th Board Percentage (0–100) <span className="required">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  className="form-input"
                  value={academic.boardPercentage}
                  onChange={(e) => setAcademic({ ...academic, boardPercentage: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">School Board</label>
                <select
                  className="form-select"
                  value={academic.schoolBoard}
                  onChange={(e) => setAcademic({ ...academic, schoolBoard: e.target.value })}
                >
                  <option value="CBSE">CBSE (Central Board)</option>
                  <option value="ICSE">CISCE / ISC</option>
                  <option value="State Board">State Board</option>
                  <option value="Other">Other Recognized Board</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Entrance Exam Score <span className="required">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  value={academic.entranceScore}
                  onChange={(e) => setAcademic({ ...academic, entranceScore: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Entrance Exam Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={academic.entranceExamName}
                  onChange={(e) => setAcademic({ ...academic, entranceExamName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Entrance Roll Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={academic.entranceRollNo}
                  onChange={(e) => setAcademic({ ...academic, entranceRollNo: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Programme Choices */}
        {currentStep === 3 && (
          <div>
            <div className="card-header" style={{ paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Step 3: Programme Preferences</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Rank 5 different academic courses in priority order (Preference 1 has highest priority, Preference 5 lowest).
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className={`badge ${preferences.length === 5 ? 'badge-verified' : 'badge-neutral'}`} style={{ fontWeight: 700 }}>
                  {preferences.length}/5 Preferences Selected
                </span>
                {preferences.length < 5 && (
                  <button
                    type="button"
                    onClick={addPreference}
                    className="btn btn-outline btn-sm"
                    disabled={preferences.length >= 5 || preferences.length >= programmes.length}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Plus size={15} />
                    <span>Add Preference</span>
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem' }}>
              {preferences.map((progId, idx) => {
                const selected = programmes.find((p) => p.id === progId);
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '0.85rem 1rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1 }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: idx === 0 ? 'var(--color-primary)' : idx === 4 ? 'var(--color-text-muted)' : 'var(--color-accent)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        flexShrink: 0
                      }}>
                        {idx + 1}
                      </div>

                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: idx === 0 ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                          Preference {idx + 1} {idx === 0 ? '— Highest Priority' : idx === 4 ? '— Lowest Priority' : ''}
                        </span>
                        <select
                          className="form-select"
                          value={progId}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = [...preferences];
                            updated[idx] = val;
                            setPreferences(updated);
                          }}
                          style={{ flex: 1 }}
                        >
                          {programmes.map((p) => (
                            <option
                              key={p.id}
                              value={p.id}
                              disabled={preferences.includes(p.id) && p.id !== progId}
                            >
                              {p.name} ({p.department}) — Intake: {p.intakeCapacity} seats
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={() => movePreference(idx, -1)}
                        disabled={idx === 0}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.35rem 0.5rem' }}
                        title="Move Up in Priority"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => movePreference(idx, 1)}
                        disabled={idx === preferences.length - 1}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.35rem 0.5rem' }}
                        title="Move Down in Priority"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removePreference(idx)}
                        disabled={preferences.length <= 1}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.35rem 0.5rem', color: 'var(--color-danger)' }}
                        title="Remove Preference Slot"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Documents Uploads */}
        {currentStep === 4 && (
          <div>
            <div className="card-header" style={{ paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Step 4: Academic Certificates</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Attach clear scanned copies (PDF / JPEG under 5 MB) or fetch directly via DigiLocker.
                </p>
              </div>
              <span className="badge badge-allotted">Step 4 of 6</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1.25rem' }}>
              {REQUIRED_DOCS.map((doc) => {
                const isUploaded = !!uploadedDocs[doc.type];
                return (
                  <div
                    key={doc.type}
                    style={{
                      padding: '1rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isUploaded ? '#f0fdf4' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>
                          {doc.title}
                        </h4>
                        {doc.required && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-danger)', fontWeight: 700 }}>
                            REQUIRED
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.775rem', color: isUploaded ? 'var(--color-success-text)' : 'var(--color-text-muted)' }}>
                        {isUploaded
                          ? `Uploaded: ${uploadedDocs[doc.type]?.fileName || 'Verified record'} (${uploadedDocs[doc.type]?.status || 'PENDING'})`
                          : 'Pending upload'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                        <FileUp size={14} />
                        <span>{isUploaded ? 'Replace File' : 'Upload File'}</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          style={{ display: 'none' }}
                          onChange={(e) => handleDocUpload(e, doc.type)}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleDigiLocker(doc.type)}
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
          </div>
        )}

        {/* Step 5: Scholarship Application */}
        {currentStep === 5 && (
          <div>
            <div className="card-header" style={{ paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Step 5: Fee Concession & Scholarship</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Financial grant schemes for meritorious and economically backward candidates.
                </p>
              </div>
              <span className="badge badge-allotted">Step 5 of 6</span>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <input
                  id="apply-scholarship"
                  type="checkbox"
                  checked={scholarship.apply}
                  onChange={(e) => setScholarship({ ...scholarship, apply: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="apply-scholarship" style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                  I wish to apply for Institution Fee Concession / Merit Scholarship
                </label>
              </div>

              {scholarship.apply && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', padding: '1.25rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div className="form-group">
                    <label className="form-label">Scholarship Scheme</label>
                    <select
                      className="form-select"
                      value={scholarship.schemeName}
                      onChange={(e) => setScholarship({ ...scholarship, schemeName: e.target.value })}
                    >
                      <option value="Merit-cum-Means Grant">Merit-cum-Means Grant</option>
                      <option value="Single Girl Child Fellowship">Single Girl Child Fellowship</option>
                      <option value="SC/ST Tuition Reimbursement">SC/ST Tuition Reimbursement</option>
                      <option value="Sports Excellence Concession">Sports Excellence Concession</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Family Annual Income (INR) <span className="required">*</span></label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g. 350000"
                      value={scholarship.annualIncome}
                      onChange={(e) => setScholarship({ ...scholarship, annualIncome: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Requested Concession Amount (INR)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={scholarship.requestedAmount}
                      onChange={(e) => setScholarship({ ...scholarship, requestedAmount: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 6: Review & Final Submission */}
        {currentStep === 6 && (
          <div>
            <div className="card-header" style={{ paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Step 6: Review Application Summary</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Carefully verify all applicant records, scores, and ranked programme choices before submission.
                </p>
              </div>
              <span className="badge badge-allotted">Step 6 of 6</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.25rem' }}>
              {/* Personal Card */}
              <div style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>1. Personal Profile</h4>
                  <button type="button" onClick={() => setCurrentStep(1)} className="btn btn-outline btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Edit</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div>Name: <strong>{personal.name}</strong></div>
                  <div>Email: <strong>{personal.email}</strong></div>
                  <div>Phone: <strong>{personal.phone}</strong></div>
                  <div>Category: <span className="badge badge-allotted">{personal.category}</span></div>
                </div>
              </div>

              {/* Academic Card */}
              <div style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>2. Academic Qualifications</h4>
                  <button type="button" onClick={() => setCurrentStep(2)} className="btn btn-outline btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Edit</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div>Board Score: <strong>{academic.boardPercentage}% ({academic.schoolBoard})</strong></div>
                  <div>Entrance Score: <strong>{academic.entranceScore} ({academic.entranceExamName})</strong></div>
                  <div>Roll Number: <strong>{academic.entranceRollNo || '—'}</strong></div>
                </div>
              </div>

              {/* Preferences Card */}
              <div style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>3. Ranked Preferences</h4>
                  <button type="button" onClick={() => setCurrentStep(3)} className="btn btn-outline btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Edit</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                  {preferences.map((progId, idx) => {
                    const prog = programmes.find((p) => p.id === progId);
                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>#{idx + 1}</span>
                        <span>{prog?.name || 'Programme Choice'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '2rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--color-border)',
          gap: '0.75rem',
          flexWrap: 'wrap'
        }}>
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="btn btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <ArrowLeft size={16} />
                <span>Previous Step</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="btn btn-outline"
              disabled={saving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Draft'}</span>
            </button>

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleContinue}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="btn btn-primary"
                disabled={saving}
                style={{ padding: '0.65rem 1.75rem' }}
              >
                Submit Application
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Final Application Submission"
      >
        <div style={{ padding: '0.5rem 0' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Are you sure you want to submit your admission application? Once submitted, your choices will be officially registered for Round 1 merit evaluation and quota allocation.
          </p>

          <div style={{
            padding: '0.85rem',
            backgroundColor: 'var(--color-warning-light)',
            border: '1px solid var(--color-warning-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.825rem',
            color: 'var(--color-warning-text)',
            marginBottom: '1.5rem'
          }}>
            Please ensure that all entered percentage marks match your uploaded certificates. Inconsistent scores will result in document discrepancy flags during counsellor verification.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Submitting Application...' : 'Yes, Submit Application'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MultiStepApplication;
