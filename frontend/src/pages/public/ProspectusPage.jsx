import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Download, CheckCircle, ShieldCheck, Printer, ArrowRight, Sparkles } from 'lucide-react';

const ProspectusPage = () => {
  return (
    <div className="app-container animate-fade-in" style={{ padding: '3.5rem 1rem', maxWidth: '960px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
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
            marginBottom: '0.5rem',
            border: '1px solid #dbeafe'
          }}>
            <Sparkles size={13} color="var(--color-accent)" />
            <span>Academic Session 2026-27</span>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            Official Admission Prospectus & Guidelines
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.975rem', marginTop: '0.25rem' }}>
            Statutory eligibility criteria, reservation quotas, document standards, and fee schedules.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="btn btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Printer size={16} />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Section 1: General Eligibility */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
          1. Eligibility Criteria for Undergraduate Admissions
        </h2>
        <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem', lineHeight: '1.6' }}>
          <li>
            <strong>Qualifying Examination:</strong> Candidate must have passed 10+2 / Higher Secondary Examination conducted by a recognized State Board, CBSE, ICSE, or equivalent with Physics, Chemistry, and Mathematics (PCM).
          </li>
          <li>
            <strong>Minimum Board Percentage:</strong> Minimum 50% aggregate marks in PCM (45% for candidates belonging to SC, ST, and OBC reserved categories).
          </li>
          <li>
            <strong>Entrance Examination:</strong> A valid non-zero score in JEE Main / State CET / National Entrance Examination.
          </li>
          <li>
            <strong>Age Limit:</strong> Candidates must be at least 17 years of age as on 31st December of the admission year.
          </li>
        </ul>
      </div>

      {/* Section 2: Quotas & Reservation Policy */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
          2. Quota Matrix & National Reservation Guidelines
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', lineHeight: '1.6' }}>
          Admission seat allocation is conducted strictly in accordance with national reservation norms, state government orders, and UGC accreditation standards:
        </p>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category Code</th>
                <th>Quota Description</th>
                <th>Seat Share (%)</th>
                <th>Mandatory Verification Document</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>GEN</strong></td>
                <td>Open General Merit (Unreserved)</td>
                <td>40.5%</td>
                <td>Identity Proof (Aadhaar / Passport / Voter ID)</td>
              </tr>
              <tr>
                <td><strong>OBC</strong></td>
                <td>Other Backward Classes (Non-Creamy Layer)</td>
                <td>27.0%</td>
                <td>Valid Central/State OBC-NCL Certificate</td>
              </tr>
              <tr>
                <td><strong>SC</strong></td>
                <td>Scheduled Castes</td>
                <td>15.0%</td>
                <td>Competent Authority Caste Certificate</td>
              </tr>
              <tr>
                <td><strong>ST</strong></td>
                <td>Scheduled Tribes</td>
                <td>7.5%</td>
                <td>Competent Authority Tribe Certificate</td>
              </tr>
              <tr>
                <td><strong>EWS</strong></td>
                <td>Economically Weaker Sections</td>
                <td>10.0%</td>
                <td>Income & Asset Certificate (&lt; ₹8 Lakhs p.a.)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Document Checklist */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
          3. Mandatory Verification Checklist
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {[
            'Class 10th Marksheet & Passing Certificate (Date of Birth verification)',
            'Class 12th / Intermediate Statement of Marks',
            'National / State Entrance Examination Scorecard (JEE/CET)',
            'Aadhaar Card / Government Photo ID Proof',
            'Category Certificate (OBC-NCL / SC / ST / EWS) if applicable',
            'Income Certificate (mandatory for fee concession & scholarship schemes)'
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.85rem' }}>
              <CheckCircle size={18} color="var(--color-success)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span style={{ color: 'var(--color-text-secondary)' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Refund Policy */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>
          4. Seat Acceptance & Fee Refund Policy
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '0.75rem' }}>
          Candidates allotted a seat must accept the allotment and complete fee payment within <strong>72 hours</strong>. In case of cancellation before the formal admission closure date, refunds are processed strictly in accordance with UGC Notification within 15 working days.
        </p>
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link to="/register" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>Proceed to Online Application</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};

export default ProspectusPage;
