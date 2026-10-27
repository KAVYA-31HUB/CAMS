import React, { useState, useEffect } from 'react';
import { programmeApi } from '../../api/programmeApi';
import { applicationApi } from '../../api/applicationApi';
import { allocationApi } from '../../api/allocationApi';
import apiClient from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { 
  Users, 
  Layers, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Sliders, 
  ArrowUpRight, 
  Award
} from 'lucide-react';

export default function CoordinatorDashboard() {
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [programmes, setProgrammes] = useState([]);
  const [selectedProgId, setSelectedProgId] = useState('');
  const [selectedQuota, setSelectedQuota] = useState('OPEN');
  
  // Data tabs
  const [activeTab, setActiveTab] = useState('merit'); // 'merit', 'matrix', 'waitlist'
  
  // Merit list state
  const [meritList, setMeritList] = useState([]);
  const [loadingMerit, setLoadingMerit] = useState(false);

  // Seat Matrix state
  const [seatMatrix, setSeatMatrix] = useState([]);

  // Allocation runner state
  const [runningAllocation, setRunningAllocation] = useState(false);
  const [selectedRound, setSelectedRound] = useState(1);

  // Waitlist state
  const [waitlistData, setWaitlistData] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [progRes, smRes] = await Promise.all([
        programmeApi.getActiveProgrammes(),
        apiClient.get('/seat-matrix')
      ]);
      setProgrammes(progRes.data || []);
      setSeatMatrix(smRes.data || []);

      if (progRes.data?.length > 0) {
        const firstProgId = progRes.data[0].id;
        setSelectedProgId(firstProgId);
        await fetchMeritList(firstProgId, 'OPEN');
      }
    } catch (err) {
      showError('Failed to load coordinator data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMeritList = async (progId, quota) => {
    if (!progId) return;
    setLoadingMerit(true);
    try {
      const res = await applicationApi.getDetailedMeritList(progId, quota === 'ALL' ? '' : quota);
      setMeritList(res.data || []);
    } catch (err) {
      console.error('Failed to load merit list:', err);
    } finally {
      setLoadingMerit(false);
    }
  };

  const handleProgrammeChange = (progId) => {
    setSelectedProgId(progId);
    if (activeTab === 'merit') {
      fetchMeritList(progId, selectedQuota);
    } else if (activeTab === 'waitlist') {
      fetchWaitlist(progId, selectedQuota);
    }
  };

  const handleQuotaChange = (quota) => {
    setSelectedQuota(quota);
    if (activeTab === 'merit') {
      fetchMeritList(selectedProgId, quota);
    } else if (activeTab === 'waitlist') {
      fetchWaitlist(selectedProgId, quota);
    }
  };

  const fetchWaitlist = async (progId, quota) => {
    if (!progId) return;
    try {
      const res = await allocationApi.getWaitlist(progId, quota === 'ALL' ? '' : quota);
      setWaitlistData(res.data || []);
    } catch (err) {
      console.error('Error loading waitlist:', err);
    }
  };

  const handleRunRoundAllocation = async () => {
    setRunningAllocation(true);
    try {
      await allocationApi.runRoundAllocation(selectedRound, '2026-27');
      showSuccess(`Round ${selectedRound} seat allocation completed with pessimistic locking!`);
      
      // Refresh matrix & merit
      const smRes = await apiClient.get('/seat-matrix');
      setSeatMatrix(smRes.data || []);
      if (selectedProgId) {
        fetchMeritList(selectedProgId, selectedQuota);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Seat allocation execution failed');
    } finally {
      setRunningAllocation(false);
    }
  };

  const selectedProg = programmes.find((p) => p.id === Number(selectedProgId));

  if (loading) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <LoadingSpinner text="Loading Coordinator Console & Seat Matrices..." />
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
            <Sliders size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Admission Coordinator Console
            </h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Merit score ranking, transactional seat matrix allocation with pessimistic locks, and waitlist upgrade supervision.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={loadInitialData}
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <select
              className="input"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.825rem', minWidth: '100px' }}
              value={selectedRound}
              onChange={(e) => setSelectedRound(Number(e.target.value))}
            >
              <option value={1}>Round 1</option>
              <option value={2}>Round 2</option>
              <option value={3}>Round 3 (Mop-up)</option>
            </select>
            <button
              onClick={handleRunRoundAllocation}
              disabled={runningAllocation}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}
            >
              {runningAllocation ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Allocating Seats...
                </>
              ) : (
                <>
                  <Play size={14} style={{ fill: 'currentColor' }} />
                  Run Round {selectedRound} Allocation
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Real Database KPI Metrics Row (Part 15) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem'
      }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Programmes
          </span>
          <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', display: 'block', margin: '0.35rem 0 0.15rem 0' }}>
            {programmes.length}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Approved Technical Degrees</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Intake Seats
          </span>
          <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', display: 'block', margin: '0.35rem 0 0.15rem 0' }}>
            {seatMatrix.reduce((acc, sm) => acc + (sm.totalSeats || 0), 0) || programmes.reduce((acc, p) => acc + (p.intakeCapacity || 0), 0)}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sanctioned Quotas (2026-27)</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--warning)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--warning-dark)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Allocated Seats
          </span>
          <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--warning-dark)', display: 'block', margin: '0.35rem 0 0.15rem 0' }}>
            {seatMatrix.reduce((acc, sm) => acc + (sm.allotted || 0), 0)}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Round {selectedRound} Allocation</span>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--success)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Available / Remaining
          </span>
          <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)', display: 'block', margin: '0.35rem 0 0.15rem 0' }}>
            {Math.max(0, (seatMatrix.reduce((acc, sm) => acc + (sm.totalSeats || 0), 0) || programmes.reduce((acc, p) => acc + (p.intakeCapacity || 0), 0)) - seatMatrix.reduce((acc, sm) => acc + (sm.allotted || 0), 0))}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vacant For Allotment</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '0.5rem', overflowX: 'auto' }}>
        {[
          { id: 'merit', label: 'Merit Ranking Lists', icon: Award },
          { id: 'matrix', label: 'Seat Matrix & Quotas', icon: Layers },
          { id: 'waitlist', label: 'Waitlist & Upgrades', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'merit') fetchMeritList(selectedProgId, selectedQuota);
                if (tab.id === 'waitlist') fetchWaitlist(selectedProgId, selectedQuota);
              }}
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

      {/* TAB 1: Merit Ranking Lists */}
      {activeTab === 'merit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Controls bar */}
          <div className="card" style={{
            padding: '1rem 1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.75rem' }}>
                  Select Programme
                </label>
                <select
                  className="input"
                  style={{ minWidth: '260px', fontSize: '0.85rem' }}
                  value={selectedProgId}
                  onChange={(e) => handleProgrammeChange(e.target.value)}
                >
                  {programmes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.75rem' }}>
                  Category / Quota
                </label>
                <select
                  className="input"
                  style={{ minWidth: '160px', fontSize: '0.85rem' }}
                  value={selectedQuota}
                  onChange={(e) => handleQuotaChange(e.target.value)}
                >
                  <option value="OPEN">OPEN / General</option>
                  <option value="OBC">OBC-NCL</option>
                  <option value="SC">Scheduled Caste (SC)</option>
                  <option value="ST">Scheduled Tribe (ST)</option>
                  <option value="EWS">Economically Weaker Section (EWS)</option>
                  <option value="ALL">All Categories</option>
                </select>
              </div>
            </div>

            {selectedProg && (
              <div style={{
                padding: '0.6rem 1rem',
                background: 'var(--surface-muted)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '0.75rem'
              }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                  Configured Merit Evaluation Formula:
                </span>
                <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: 600 }}>
                  {selectedProg.meritFormula || '{"boardWeight": 0.4, "entranceWeight": 0.6}'}
                </code>
              </div>
            )}
          </div>

          {/* Merit List Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {loadingMerit ? (
              <div style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
                <LoadingSpinner text="Computing merit scores from JSON formula..." />
              </div>
            ) : meritList.length === 0 ? (
              <div style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Award size={44} style={{ margin: '0 auto 0.75rem', opacity: 0.35 }} />
                <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>
                  No applicants found for this category
                </p>
                <p style={{ fontSize: '0.8rem', margin: 0 }}>
                  Applicants with counsellor-verified documents will appear ranked by calculated merit.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table-custom">
                  <thead>
                    <tr>
                      <th style={{ width: '60px', textAlign: 'center' }}>Rank</th>
                      <th>Applicant Name</th>
                      <th>Application #</th>
                      <th>Category</th>
                      <th>Board %</th>
                      <th>Entrance Score</th>
                      <th style={{ color: 'var(--primary)' }}>Calculated Merit Score</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meritList.map((app, idx) => (
                      <tr key={app.id}>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>
                          {idx === 0 && (
                            <span style={{ display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '9999px', background: 'var(--warning-light)', color: 'var(--warning-dark)', fontSize: '0.75rem' }}>
                              #1
                            </span>
                          )}
                          {idx === 1 && (
                            <span style={{ display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '9999px', background: 'var(--surface-muted)', color: 'var(--text-main)', border: '1px solid var(--border)', fontSize: '0.75rem' }}>
                              #2
                            </span>
                          )}
                          {idx === 2 && (
                            <span style={{ display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '9999px', background: '#fed7aa', color: '#9a3412', fontSize: '0.75rem' }}>
                              #3
                            </span>
                          )}
                          {idx > 2 && (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                              #{idx + 1}
                            </span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.875rem' }}>
                            {app.applicant?.fullName || `Applicant #${app.applicant?.id}`}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {app.applicationNumber}
                        </td>
                        <td>
                          <span style={{ padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'var(--surface-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                            {app.applicant?.category || 'GENERAL'}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                          {app.applicant?.boardPercentage ? `${app.applicant.boardPercentage}%` : 'N/A'}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                          {app.applicant?.entranceScore ?? 'N/A'}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>
                          {app.meritScore ? app.meritScore.toFixed(2) : 'N/A'}
                        </td>
                        <td>
                          <StatusBadge status={app.status} />
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

      {/* TAB 2: Seat Matrix & Quotas */}
      {activeTab === 'matrix' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.25rem'
          }}>
            {seatMatrix.map((sm) => {
              const filled = sm.filledSeats || 0;
              const total = sm.totalSeats || 0;
              const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
              return (
                <div key={sm.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background: 'var(--primary-subtle)',
                        color: 'var(--primary)'
                      }}>
                        {sm.quota} Quota
                      </span>
                      <h4 style={{ margin: '0.5rem 0 0.2rem 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {sm.programme?.name || `Programme #${sm.programme?.id}`}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Round {sm.roundNo} • {sm.academicYear}
                      </p>
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      background: 'var(--surface-muted)',
                      color: 'var(--text-main)'
                    }}>
                      {filled}/{total} Filled
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div style={{ width: '100%', background: 'var(--border)', height: '8px', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          borderRadius: '9999px',
                          background: pct >= 100 ? 'var(--danger)' : pct >= 80 ? 'var(--warning)' : 'var(--primary)',
                          width: `${Math.min(100, pct)}%`,
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                      <span>Vacant: {Math.max(0, total - filled)} seats</span>
                      <span>{pct}% Occupancy</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Waitlist & Upgrades */}
      {activeTab === 'waitlist' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label className="form-label" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Programme Filter:</label>
            <select
              className="input"
              style={{ minWidth: '260px', fontSize: '0.85rem' }}
              value={selectedProgId}
              onChange={(e) => {
                setSelectedProgId(e.target.value);
                fetchWaitlist(e.target.value, selectedQuota);
              }}
            >
              {programmes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {waitlistData.length === 0 ? (
              <div style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <TrendingUp size={44} style={{ margin: '0 auto 0.75rem', opacity: 0.35 }} />
                <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>
                  No active waitlist entries for this programme
                </p>
                <p style={{ fontSize: '0.8rem', margin: 0 }}>
                  Candidates not offered first-preference seats are queued here for auto-upgrades in subsequent rounds.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table-custom">
                  <thead>
                    <tr>
                      <th style={{ width: '80px', textAlign: 'center' }}>Position</th>
                      <th>Applicant Name</th>
                      <th>Quota</th>
                      <th>Merit Score</th>
                      <th>Upgrade Requested</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitlistData.map((w) => (
                      <tr key={w.id}>
                        <td style={{ textAlign: 'center', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                          #{w.waitlistPosition}
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.875rem' }}>
                            {w.application?.applicant?.fullName || 'Applicant'}
                          </span>
                        </td>
                        <td>
                          <span style={{ padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'var(--surface-muted)', fontSize: '0.75rem' }}>
                            {w.quota}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                          {w.meritScore ? w.meritScore.toFixed(2) : '—'}
                        </td>
                        <td>
                          {w.application?.upgradeRequested ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--warning-dark)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <ArrowUpRight size={13} /> Yes (Requested)
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No</span>
                          )}
                        </td>
                        <td>
                          <StatusBadge status={w.status} />
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
    </div>
  );
}
