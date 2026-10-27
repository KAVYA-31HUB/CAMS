import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { programmeApi } from '../../api/programmeApi';
import { applicationApi } from '../../api/applicationApi';
import {
  GraduationCap,
  Award,
  ShieldCheck,
  Calendar,
  ArrowRight,
  Sparkles,
  BookOpen,
  ChevronRight,
  Clock,
  CheckCircle2,
  FileText,
  Search
} from 'lucide-react';

const DEFAULT_SCHEDULE = [
  { event: 'Online Application Portal Opens', date: 'September 01, 2026', status: 'COMPLETED' },
  { event: 'Last Date for Online Registration & Document Upload', date: 'September 30, 2026', status: 'ACTIVE' },
  { event: 'Counsellor Document Verification Window', date: 'October 01 – October 08, 2026', status: 'UPCOMING' },
  { event: 'Publication of Official Round 1 Merit List', date: 'October 12, 2026', status: 'UPCOMING' },
  { event: 'Round 1 Seat Allotment & 72h Acceptance Window', date: 'October 14 – October 18, 2026', status: 'UPCOMING' },
  { event: 'Round 1 Fee Payment Deadline', date: 'October 21, 2026', status: 'UPCOMING' },
  { event: 'Round 2 Upgrade Allotment & Waitlist Promotion', date: 'October 25, 2026', status: 'UPCOMING' },
  { event: 'Final Admission Confirmation & Campus Reporting', date: 'October 30, 2026', status: 'UPCOMING' },
];

const HomePage = () => {
  const [programmes, setProgrammes] = useState([]);
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progRes, schedRes] = await Promise.allSettled([
          programmeApi.getActiveProgrammes(),
          applicationApi.getAdmissionSchedule()
        ]);
        if (progRes.status === 'fulfilled' && progRes.value.data) {
          setProgrammes((progRes.value.data || []).slice(0, 4));
        }
        if (schedRes.status === 'fulfilled' && schedRes.value.data && schedRes.value.data.length > 0) {
          setSchedule(schedRes.value.data);
        }
      } catch (e) {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0a1b2c 0%, #0f2942 50%, #163859 100%)',
        color: '#ffffff',
        padding: '5rem 0 4.5rem 0',
        position: 'relative',
        borderBottom: '1px solid #1e3a5f'
      }}>
        <div className="app-container">
          <div style={{ maxWidth: '820px' }}>
            {/* Tagline Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
              letterSpacing: '0.02em'
            }}>
              <Sparkles size={15} color="#38bdf8" />
              <span>Central Admissions Directorate • Academic Year 2026-27</span>
            </div>

            <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.15, marginBottom: '1.25rem' }}>
              Your Pathway to Academic Excellence Starts Here
            </h1>

            <p style={{ fontSize: '1.15rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '2.25rem', maxWidth: '720px' }}>
              Welcome to the official College Admission Management System (CAMS). Complete your multi-step application, rank your programme choices, track merit rankings, and accept quota-allotted seats through our centralized, transparent portal.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-accent btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Apply for Admission</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/programmes" className="btn btn-outline btn-lg" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.25)' }}>
                <BookOpen size={18} />
                <span>Explore Programmes</span>
              </Link>
              <Link to="/status" className="btn btn-outline btn-lg" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.25)' }}>
                <Clock size={18} />
                <span>Track Application</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights & Credibility Bar */}
      <section style={{ backgroundColor: '#ffffff', borderBottom: '1px solid var(--color-border)', padding: '1.75rem 0' }}>
        <div className="app-container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            textAlign: 'center'
          }}>
            <div>
              <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-primary)', display: 'block' }}>100%</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Merit & Quota Transparency</p>
            </div>
            <div>
              <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-primary)', display: 'block' }}>6 Categories</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>GEN, OBC, SC, ST, EWS, Sports</p>
            </div>
            <div>
              <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-primary)', display: 'block' }}>DigiLocker</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Instant Verified Credentials</p>
            </div>
            <div>
              <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-primary)', display: 'block' }}>72 Hours</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Seat Acceptance Guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Admission Flow (Steps 1 to 6) */}
      <section style={{ padding: '4.5rem 0', backgroundColor: 'var(--color-bg-canvas)' }}>
        <div className="app-container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem auto' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Structured Process
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.35rem', marginBottom: '0.75rem' }}>
              How Admissions Work
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
              Follow our six-step transparent process from online registration through final enrollment.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {[
              { num: '01', title: 'Register & Complete Profile', desc: 'Provide verified academic scores, board percentages, and personal credentials.' },
              { num: '02', title: 'Multi-Preference Choices', desc: 'Rank up to 5 academic programme choices based on your career interests.' },
              { num: '03', title: 'Upload or DigiLocker', desc: 'Upload 10th/12th certificates or fetch verified records directly via DigiLocker.' },
              { num: '04', title: 'Dynamic Merit Ranking', desc: 'Transparent scores calculated dynamically using the programme weighting formula.' },
              { num: '05', title: 'Quota Seat Allotment', desc: 'Concurrency-protected allocation matching candidate ranks to category quotas.' },
              { num: '06', title: 'Accept Seat & Pay Fees', desc: 'Confirm your seat, request round upgrades, and obtain official GST admission receipts.' },
            ].map((step) => (
              <div key={step.num} className="card" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-accent)', opacity: 0.9, display: 'block', marginBottom: '0.5rem' }}>
                  {step.num}
                </span>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 700 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Programmes Section */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#ffffff', borderTop: '1px solid var(--color-border)' }}>
        <div className="app-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Academic Offerings
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.35rem' }}>
                Featured Engineering Programmes
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                Accredited undergraduate and postgraduate courses available for 2026-27 admission.
              </p>
            </div>
            <Link to="/programmes" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>View All Programmes</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {programmes.map((prog) => (
              <div key={prog.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <span className="badge badge-allotted" style={{ marginBottom: '0.5rem' }}>
                    {prog.department}
                  </span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                    {prog.name}
                  </h3>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1.5rem', flex: 1 }}>
                  <p><strong>Duration:</strong> {prog.durationYears || 4} Years (Full-time)</p>
                  <p><strong>Sanctioned Intake:</strong> {prog.intakeCapacity} Seats</p>
                  <p><strong>Tuition Fee:</strong> ₹{prog.tuitionFee ? prog.tuitionFee.toLocaleString() : '75,000'} / year</p>
                </div>

                <Link to="/register" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  Apply For This Programme
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Dates Timeline */}
      <section style={{ padding: '4.5rem 0', backgroundColor: 'var(--color-bg-canvas)', borderTop: '1px solid var(--color-border)' }}>
        <div className="app-container" style={{ maxWidth: '850px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Important Deadlines
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.35rem' }}>
              Key Admission Dates (2026-27)
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Ensure all application preferences, documents, and acceptance fees are submitted within the designated windows.
            </p>
          </div>

          <div className="card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {schedule.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: i < schedule.length - 1 ? '1px solid var(--color-border)' : 'none',
                    paddingBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-primary-light)',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Calendar size={18} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.925rem', fontWeight: 700, margin: 0 }}>{item.event}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{item.date}</span>
                    </div>
                  </div>
                  <span className={`badge ${item.status === 'COMPLETED' ? 'badge-verified' : item.status === 'ACTIVE' ? 'badge-allotted' : 'badge-pending'}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
