import React, { useState, useEffect } from 'react';
import { reportApi } from '../../api/reportApi';
import { dashboardApi } from '../../api/dashboardApi';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { 
  Building, 
  Download, 
  RefreshCw, 
  BarChart3, 
  FileSpreadsheet, 
  ShieldCheck, 
  Lock, 
  Unlock,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck
} from 'lucide-react';

export default function RegistrarDashboard() {
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [funnelData, setFunnelData] = useState(null);
  const [aisheReport, setAisheReport] = useState([]);
  const [ugcReport, setUgcReport] = useState([]);
  const [cycleData, setCycleData] = useState(null);
  const [activeTab, setActiveTab] = useState('funnel'); // 'funnel', 'aishe', 'ugc'
  const [admissionCycleLocked, setAdmissionCycleLocked] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [funnelRes, aisheRes, ugcRes, cycleRes] = await Promise.all([
        reportApi.getFunnelReport(),
        reportApi.getAisheReport(),
        reportApi.getUgcReport(),
        dashboardApi.getRegistrarSummary().catch(() => ({ data: null }))
      ]);
      setFunnelData(funnelRes.data);
      setAisheReport(aisheRes.data || []);
      setUgcReport(ugcRes.data || []);
      if (cycleRes?.data) {
        setCycleData(cycleRes.data);
      }
    } catch (err) {
      showError('Failed to fetch statutory compliance reports');
    } finally {
      setLoading(false);
    }
  };

  const handleExportAisheCsv = () => {
    if (!aisheReport || aisheReport.length === 0) {
      showError('No AISHE data available to export');
      return;
    }

    const headers = [
      'Programme Code',
      'Programme Name',
      'Department',
      'Duration (Years)',
      'Approved Intake',
      'Total Enrolled',
      'General',
      'OBC',
      'SC',
      'ST',
      'EWS',
      'Male',
      'Female'
    ];

    const rows = aisheReport.map((row) => [
      row.programmeCode,
      `"${row.programmeName}"`,
      `"${row.department}"`,
      row.durationYears,
      row.approvedIntake,
      row.totalEnrolled,
      row.general,
      row.obc,
      row.sc,
      row.st,
      row.ews,
      row.male,
      row.female
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AISHE_Statutory_Report_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('AISHE data exported to CSV');
  };

  const handleToggleAdmissionCycle = () => {
    setAdmissionCycleLocked(!admissionCycleLocked);
    showSuccess(
      !admissionCycleLocked
        ? 'Admission cycle locked. New candidate submissions are paused.'
        : 'Admission cycle unlocked. Submissions are active.'
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <LoadingSpinner text="Compiling AISHE & UGC Statutory Audits..." />
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
            <Building size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Registrar Statutory & Compliance Suite
            </h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Official AISHE survey submissions, UGC intake quota adherence, and admission lifecycle administration.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={loadReports}
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            onClick={handleToggleAdmissionCycle}
            className="btn"
            style={{
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 600,
              background: admissionCycleLocked ? 'var(--danger-light)' : 'var(--surface)',
              color: admissionCycleLocked ? 'var(--danger)' : 'var(--text-main)',
              border: admissionCycleLocked ? '1px solid var(--danger)' : '1px solid var(--border)'
            }}
          >
            {admissionCycleLocked ? <Lock size={14} /> : <Unlock size={14} />}
            {admissionCycleLocked ? 'Admissions: FROZEN' : 'Freeze Cycle'}
          </button>
        </div>
      </div>

      {/* Admission Cycle 2026-27 Workflow Status Banner */}
      <div className="card" style={{
        padding: '1.25rem 1.5rem',
        background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.04) 0%, rgba(59, 130, 246, 0.08) 100%)',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Calendar size={18} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--primary)' }}>
                Academic Year {cycleData?.admissionCycle || '2026-27'}
              </span>
              <span style={{
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                background: 'var(--primary-subtle)',
                color: 'var(--primary)',
                fontSize: '0.7rem',
                fontWeight: 700
              }}>
                September 2026 Cycle
              </span>
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Current Stage: <span style={{ color: 'var(--primary)' }}>{cycleData?.currentAdmissionStage || 'Document Verification'}</span>
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: admissionCycleLocked ? 'var(--danger-light)' : 'var(--success-light)',
              color: admissionCycleLocked ? 'var(--danger)' : 'var(--success)',
              border: admissionCycleLocked ? '1px solid var(--danger)' : '1px solid var(--success)'
            }}>
              ● Cycle Status: {admissionCycleLocked ? 'FROZEN / PAUSED' : 'ACTIVE'}
            </span>
          </div>
        </div>

        {/* Admission Cycle Stages Timeline */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '0.75rem'
        }}>
          <div style={{
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            background: 'var(--surface)',
            border: '1px solid var(--success)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>STAGE 1</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'var(--success-light)', color: 'var(--success)' }}>
                COMPLETED
              </span>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Application Window</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cycleData?.totalApplications || funnelData?.applied || 0} Submissions</span>
          </div>

          <div style={{
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            background: 'var(--surface)',
            border: '2px solid var(--primary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)' }}>STAGE 2</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'var(--primary)', color: '#ffffff' }}>
                ACTIVE NOW
              </span>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Doc Verification</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
              {cycleData?.verified || funnelData?.verified || 0} Verified • {cycleData?.pendingVerification || 0} Pending
            </span>
          </div>

          <div style={{
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            opacity: 0.85,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>STAGE 3</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'var(--surface-muted)', color: 'var(--text-muted)' }}>
                {cycleData?.meritListStatus || 'UPCOMING'}
              </span>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Merit Ranking</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Formula Weighting</span>
          </div>

          <div style={{
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            opacity: 0.85,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>STAGE 4</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'var(--surface-muted)', color: 'var(--text-muted)' }}>
                {cycleData?.seatAllocationStatus || 'NOT STARTED'}
              </span>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Seat Allotment R1</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quota Reservation</span>
          </div>

          <div style={{
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            opacity: 0.85,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>STAGE 5</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'var(--surface-muted)', color: 'var(--text-muted)' }}>
                {cycleData?.feeCollectionStatus || 'NOT STARTED'}
              </span>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Fee Remittance</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tuition & Enrollment</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '0.5rem', overflowX: 'auto' }}>
        {[
          { id: 'funnel', label: 'Admissions Funnel', icon: BarChart3 },
          { id: 'aishe', label: 'AISHE Survey Export', icon: FileSpreadsheet },
          { id: 'ugc', label: 'UGC Compliance Audit', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Admissions Funnel */}
      {activeTab === 'funnel' && funnelData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem'
          }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Applications Submitted
              </span>
              <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', display: 'block', margin: '0.35rem 0 0.2rem 0' }}>
                {funnelData.applied || 0}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stage 1: Candidates</span>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Counsellor Verified
              </span>
              <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary)', display: 'block', margin: '0.35rem 0 0.2rem 0' }}>
                {funnelData.verified || 0}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stage 2: Cleared Audits</span>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--warning)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--warning-dark)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Seats Allotted
              </span>
              <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--warning-dark)', display: 'block', margin: '0.35rem 0 0.2rem 0' }}>
                {funnelData.allotted || 0}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stage 3: Offered Admission</span>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--success)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Formally Admitted
              </span>
              <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--success)', display: 'block', margin: '0.35rem 0 0.2rem 0' }}>
                {funnelData.admitted || 0}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stage 4: Fee Paid / Enrolled</span>
            </div>

            <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--danger)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Cancelled / Forfeited
              </span>
              <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--danger)', display: 'block', margin: '0.35rem 0 0.2rem 0' }}>
                {funnelData.cancelled || 0}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dropouts / Unpaid</span>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.35rem 0', color: 'var(--text-main)' }}>
              Overall Admission Conversion Efficiency
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
              Ratio of verified submissions that completed fee remittance and enrolled:
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1, background: 'var(--border)', height: '14px', borderRadius: '9999px', overflow: 'hidden' }}>
                <div
                  style={{
                    background: 'var(--success)',
                    height: '100%',
                    borderRadius: '9999px',
                    width: `${Math.min(100, funnelData.conversionRate || 0)}%`,
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                {funnelData.conversionRate || 0}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AISHE Survey Export */}
      {activeTab === 'aishe' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{
            padding: '1rem 1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.2rem 0', color: 'var(--text-main)' }}>
                Ministry of Education - AISHE Regulatory Matrix
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Statutory format conforming to national reservation quotas (SC/ST/OBC/EWS) and gender parity metrics.
              </p>
            </div>
            <button
              onClick={handleExportAisheCsv}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <Download size={14} />
              Export AISHE CSV
            </button>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Programme</th>
                    <th>Dept</th>
                    <th>Duration</th>
                    <th>Sanctioned</th>
                    <th style={{ color: 'var(--primary)' }}>Enrolled</th>
                    <th>GEN</th>
                    <th>OBC</th>
                    <th>SC</th>
                    <th>ST</th>
                    <th>EWS</th>
                    <th>Male</th>
                    <th>Female</th>
                  </tr>
                </thead>
                <tbody>
                  {aisheReport.map((row, idx) => (
                    <tr key={idx}>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                          {row.programmeName}
                        </span>
                        <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {row.programmeCode}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{row.department}</td>
                      <td style={{ fontSize: '0.8rem' }}>{row.durationYears} Yrs</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{row.approvedIntake}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>
                        {row.totalEnrolled}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{row.general}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{row.obc}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{row.sc}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{row.st}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{row.ews}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#2563eb' }}>{row.male}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#db2777' }}>{row.female}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: UGC Compliance Audit */}
      {activeTab === 'ugc' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.25rem'
          }}>
            {ugcReport.map((item, idx) => (
              <div key={idx} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {item.programmeName}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.department}</p>
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '9999px',
                      background: item.complianceStatus === 'COMPLIANT' ? 'var(--success-light)' : 'var(--danger-light)',
                      color: item.complianceStatus === 'COMPLIANT' ? 'var(--success)' : 'var(--danger)',
                      border: item.complianceStatus === 'COMPLIANT' ? '1px solid var(--success)' : '1px solid var(--danger)'
                    }}
                  >
                    {item.complianceStatus}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
                  <div style={{ padding: '0.5rem', background: 'var(--surface-muted)', borderRadius: '6px' }}>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sanctioned</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      {item.sanctionedIntake}
                    </span>
                  </div>
                  <div style={{ padding: '0.5rem', background: 'var(--primary-subtle)', borderRadius: '6px' }}>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--primary)' }}>Admitted</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>
                      {item.admittedSeats}
                    </span>
                  </div>
                  <div style={{ padding: '0.5rem', background: 'var(--warning-light)', borderRadius: '6px' }}>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--warning-dark)' }}>Vacancies</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--warning-dark)' }}>
                      {item.vacancies}
                    </span>
                  </div>
                </div>

                <div style={{
                  paddingTop: '0.5rem',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)'
                }}>
                  <span>Intake Limit Adherence:</span>
                  <span style={{ fontWeight: 600, color: 'var(--success)' }}>Within Norms</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
