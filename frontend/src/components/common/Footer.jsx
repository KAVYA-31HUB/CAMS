import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Award, FileCheck, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#0f172a',
      color: '#cbd5e1',
      borderTop: '1px solid #1e293b',
      marginTop: 'auto',
      padding: '3rem 0 1.5rem 0'
    }}>
      <div className="app-container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}>
          {/* Col 1: Brand & Compliance */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>
              College Admission Management System
            </h4>
            <p style={{ fontSize: '0.825rem', lineHeight: '1.6', color: '#94a3b8', marginBottom: '1rem' }}>
              Centralized, transparent, and quota-compliant higher-education admissions portal. Built in accordance with UGC guidelines, AISHE reporting norms, and national reservation matrix policies.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#38bdf8', backgroundColor: '#082f49', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                <Award size={14} /> NAAC & NBA Aligned
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#4ade80', backgroundColor: '#052e16', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                <ShieldCheck size={14} /> DigiLocker Integrated
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
              Quick Navigation
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><Link to="/" style={{ color: '#94a3b8' }}>Home</Link></li>
              <li><Link to="/programmes" style={{ color: '#94a3b8' }}>Academic Programmes & Intake</Link></li>
              <li><Link to="/prospectus" style={{ color: '#94a3b8' }}>Admission Prospectus 2026-27</Link></li>
              <li><Link to="/status" style={{ color: '#94a3b8' }}>Track Application Status</Link></li>
              <li><Link to="/register" style={{ color: '#94a3b8' }}>New Applicant Registration</Link></li>
              <li><Link to="/login" style={{ color: '#94a3b8' }}>Staff & Student Login</Link></li>
            </ul>
          </div>

          {/* Col 3: Quotas & Guidelines */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
              Reservation & Quotas
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.825rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>• General Open Merit Quota (GEN)</li>
              <li>• Other Backward Classes (OBC-NCL)</li>
              <li>• Scheduled Castes & Scheduled Tribes (SC/ST)</li>
              <li>• Economically Weaker Sections (EWS)</li>
              <li>• Sports & Defence Personnel Wards</li>
            </ul>
          </div>

          {/* Col 4: Admissions Helpdesk */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
              Admissions Helpdesk
            </h4>
            <div style={{ fontSize: '0.825rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Phone size={15} color="#38bdf8" /> +91 (044) 2745-9000
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Mail size={15} color="#38bdf8" /> admissions@cams.edu.in
              </p>
              <p style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', margin: 0 }}>
                <MapPin size={15} color="#38bdf8" style={{ marginTop: '3px' }} /> Central Admissions Directorate, Academic Block A
              </p>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                Office Hours: Mon–Fri, 9:00 AM – 5:00 PM IST
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar per SRS Appendix I */}
        <div style={{
          borderTop: '1px solid #1e293b',
          paddingTop: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: '#64748b'
        }}>
          <div>
            &copy; 2026 College Admission Management System. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{ cursor: 'pointer', color: '#94a3b8' }}>Privacy Policy</span>
            <span style={{ cursor: 'pointer', color: '#94a3b8' }}>Terms of Service</span>
            <span style={{ cursor: 'pointer', color: '#94a3b8' }}>Support & Grievances</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
