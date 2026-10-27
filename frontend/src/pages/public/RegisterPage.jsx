import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
  FileText,
  ShieldCheck
} from 'lucide-react';

const STEPS = [
  { number: 1, title: 'Personal Info' },
  { number: 2, title: 'Account Security' },
  { number: 3, title: 'Academic Scores' },
  { number: 4, title: 'Review & Confirm' },
];

const RegisterPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    category: 'GEN',
    boardPercentage: '',
    entranceScore: '',
    dateOfBirth: '',
    gender: 'Male',
    address: '',
    schoolBoard: 'CBSE',
    entranceExamName: 'JEE Main',
    entranceRollNo: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const validateStep = (step) => {
    const errs = {};

    if (step === 1 || step === 0) {
      if (!formData.name.trim()) {
        errs.name = 'Name is required';
      } else if (!/^[a-zA-Z ]{2,100}$/.test(formData.name.trim())) {
        errs.name = 'Name must not contain numbers or special characters';
      }
    }

    if (step === 2 || step === 0) {
      if (!formData.email.trim()) {
        errs.email = 'Please enter a valid email address';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        errs.email = 'Please enter a valid email address';
      }

      if (!formData.phone.trim()) {
        errs.phone = 'Phone Number is required';
      } else if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
        errs.phone = 'Phone Number must be exactly 10 digits long';
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!formData.password) {
        errs.password = 'Password must meet security requirements';
      } else if (!passwordRegex.test(formData.password)) {
        errs.password = 'Password must meet security requirements (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character)';
      }
    }

    if (step === 3 || step === 0) {
      const board = parseFloat(formData.boardPercentage);
      if (isNaN(board) || board < 0 || board > 100) {
        errs.boardPercentage = 'Board percentage must be between 0 and 100';
      }

      const entrance = parseFloat(formData.entranceScore);
      if (isNaN(entrance) || entrance < 0) {
        errs.entranceScore = 'Entrance score must be a non-negative number';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(0)) return;

    setLoading(true);
    setServerError('');

    try {
      await register({
        ...formData,
        boardPercentage: parseFloat(formData.boardPercentage),
        entranceScore: parseFloat(formData.entranceScore),
        role: 'APPLICANT'
      });
      showSuccess('Registration successful! Welcome to CAMS Portal.');
      navigate('/applicant');
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
        'Registration failed. Please review your submission and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 140px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1rem',
      backgroundColor: 'var(--color-bg-canvas)'
    }}>
      <div style={{ maxWidth: '680px', width: '100%' }}>
        <div className="card" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-md)' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
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
              Candidate Online Registration
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Academic Session 2026-27 • Centralized Admissions Portal
            </p>
          </div>

          {/* Stepper Progress Bar */}
          <div className="stepper-nav" style={{ marginBottom: '2.25rem' }}>
            {STEPS.map((s) => {
              const isCompleted = s.number < currentStep;
              const isActive = s.number === currentStep;
              return (
                <div
                  key={s.number}
                  className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  onClick={() => {
                    if (s.number < currentStep || validateStep(currentStep)) {
                      setCurrentStep(s.number);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="step-circle">
                    {isCompleted ? <Check size={16} /> : s.number}
                  </div>
                  <span className="step-title">{s.title}</span>
                </div>
              );
            })}
          </div>

          {serverError && (
            <div style={{
              marginBottom: '1.5rem',
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
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Details */}
            <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Step 1: Personal Information
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Provide candidate legal name, gender, category, and address.
                </p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  Full Legal Name <span className="required">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Anand Kumar"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                {errors.name && <span className="form-error"><AlertCircle size={13} />{errors.name}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="category">
                    Reservation Category <span className="required">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleChange}
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
                  <label className="form-label" htmlFor="gender">
                    Gender <span className="required">*</span>
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    className="form-select"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="dateOfBirth">
                    Date of Birth
                  </label>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    className="form-input"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="address">
                    Residential Address
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    className="form-input"
                    placeholder="City, State, PIN"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Account Security */}
            <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Step 2: Account & Security
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Enter contact coordinates and set a secure login password.
                </p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address <span className="required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="anand@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                {errors.email && <span className="form-error"><AlertCircle size={13} />{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">
                  Mobile Number (10 Digits) <span className="required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    maxLength="10"
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                {errors.phone && <span className="form-error"><AlertCircle size={13} />{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Account Password <span className="required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    placeholder="Min 8 chars (A-Z, a-z, 0-9, @$!)"
                    value={formData.password}
                    onChange={handleChange}
                    required
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
                {errors.password && <span className="form-error"><AlertCircle size={13} />{errors.password}</span>}
                <span className="form-hint">
                  Password must contain at least 8 characters with 1 uppercase, 1 lowercase, 1 digit, and 1 special symbol.
                </span>
              </div>
            </div>

            {/* Step 3: Academic Scores */}
            <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Step 3: Academic Qualifications
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Provide class 12th board percentage and entrance exam results for dynamic merit ranking.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="boardPercentage">
                    12th / Board Percentage (0–100) <span className="required">*</span>
                  </label>
                  <input
                    id="boardPercentage"
                    name="boardPercentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className="form-input"
                    placeholder="e.g. 92.5"
                    value={formData.boardPercentage}
                    onChange={handleChange}
                    required
                  />
                  {errors.boardPercentage && <span className="form-error"><AlertCircle size={13} />{errors.boardPercentage}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="schoolBoard">
                    School Board
                  </label>
                  <select
                    id="schoolBoard"
                    name="schoolBoard"
                    className="form-select"
                    value={formData.schoolBoard}
                    onChange={handleChange}
                  >
                    <option value="CBSE">CBSE (Central Board)</option>
                    <option value="ICSE">CISCE / ISC</option>
                    <option value="State Board">State Higher Secondary Board</option>
                    <option value="Other">Other Recognized Board</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="entranceScore">
                    Entrance Exam Score <span className="required">*</span>
                  </label>
                  <input
                    id="entranceScore"
                    name="entranceScore"
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    placeholder="e.g. 88.0"
                    value={formData.entranceScore}
                    onChange={handleChange}
                    required
                  />
                  {errors.entranceScore && <span className="form-error"><AlertCircle size={13} />{errors.entranceScore}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="entranceExamName">
                    Entrance Examination Name
                  </label>
                  <input
                    id="entranceExamName"
                    name="entranceExamName"
                    type="text"
                    className="form-input"
                    placeholder="e.g. JEE Main, State CET"
                    value={formData.entranceExamName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="entranceRollNo">
                  Entrance Examination Roll Number
                </label>
                <input
                  id="entranceRollNo"
                  name="entranceRollNo"
                  type="text"
                  className="form-input"
                  placeholder="e.g. 2603104928"
                  value={formData.entranceRollNo}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Step 4: Review & Confirm */}
            <div style={{ display: currentStep === 4 ? 'block' : 'none' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Step 4: Review Details & Confirm
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Carefully verify your candidate profile data before creating your admission account.
                </p>
              </div>

              <div style={{
                backgroundColor: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Full Name:</span>
                  <strong>{formData.name || '—'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Email Address:</span>
                  <strong>{formData.email || '—'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Phone Number:</span>
                  <strong>{formData.phone || '—'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Quota Category:</span>
                  <span className="badge badge-allotted">{formData.category}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Class 12th Board Score:</span>
                  <strong>{formData.boardPercentage}% ({formData.schoolBoard})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Entrance Score:</span>
                  <strong>{formData.entranceScore} ({formData.entranceExamName})</strong>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', padding: '0.85rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="var(--color-success)" />
                <span style={{ fontSize: '0.8rem', color: '#166534' }}>
                  By completing registration, you confirm that all academic and identity records entered are accurate and verifiable.
                </span>
              </div>
            </div>

            {/* Stepper Navigation Buttons */}
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
                    onClick={prevStep}
                    className="btn btn-outline"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <ArrowLeft size={16} />
                    <span>Previous</span>
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {currentStep < 4 ? (
                  <>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="btn btn-outline"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <span>Next Step ({currentStep + 1}/4)</span>
                      <ArrowRight size={16} />
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Registering...' : 'Complete Registration'}
                    </button>
                  </>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '0.65rem 1.75rem' }}
                    disabled={loading}
                  >
                    {loading ? 'Creating Candidate Profile...' : 'Complete Registration'}
                  </button>
                )}
              </div>
            </div>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '1.75rem' }}>
            Already registered? <Link to="/login" style={{ fontWeight: 700, color: 'var(--color-accent)' }}>Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
