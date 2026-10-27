import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { programmeApi } from '../../api/programmeApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  Users,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Layers,
  IndianRupee
} from 'lucide-react';

const ProgrammesPage = () => {
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  useEffect(() => {
    const fetchProgrammes = async () => {
      try {
        const res = await programmeApi.getProgrammes();
        setProgrammes(res.data || []);
      } catch (err) {
        console.error('Failed to load programmes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgrammes();
  }, []);

  const departments = ['ALL', ...new Set(programmes.map((p) => p.department).filter(Boolean))];

  const filtered = programmes.filter((p) => {
    const matchesSearch =
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.code || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || p.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="app-container animate-fade-in" style={{ padding: '3.5rem 1rem' }}>
      {/* Page Header */}
      <div style={{ maxWidth: '780px', marginBottom: '2.5rem' }}>
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
          marginBottom: '0.75rem',
          border: '1px solid #dbeafe'
        }}>
          <Sparkles size={13} color="var(--color-accent)" />
          <span>Sanctioned Quota Seats • Session 2026-27</span>
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
          Academic Programmes & Sanctioned Intake
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.975rem', lineHeight: 1.6 }}>
          Explore AICTE-accredited undergraduate engineering disciplines. Review sanctioned seat intakes, annual tuition schedules, and entrance criteria.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        padding: '1rem 1.25rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-xs)'
      }}>
        {/* Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="var(--color-text-muted)" />
          <input
            type="text"
            className="form-input"
            placeholder="Search by programme title or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', boxShadow: 'none', padding: '0.4rem 0' }}
          />
        </div>

        {/* Department Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setDeptFilter(dept)}
              className={`btn btn-sm ${deptFilter === dept ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.775rem' }}
            >
              {dept === 'ALL' ? 'All Departments' : dept}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Querying academic course catalog..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No matching programmes found"
          description="Try broadening your search query or reset the department filter to view all available courses."
          action={
            <button
              onClick={() => { setSearchTerm(''); setDeptFilter('ALL'); }}
              className="btn btn-outline btn-sm"
              style={{ marginTop: '0.5rem' }}
            >
              Reset Filters
            </button>
          }
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {filtered.map((prog) => (
            <div key={prog.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                <span className="badge badge-allotted">
                  {prog.department || 'Engineering'}
                </span>
                <span className={`badge ${prog.isActive !== false ? 'badge-verified' : 'badge-discrepant'}`}>
                  {prog.isActive !== false ? 'Intake Open' : 'Closed'}
                </span>
              </div>

              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem', lineHeight: 1.3, color: 'var(--color-text-primary)' }}>
                {prog.name}
              </h2>

              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} color="var(--color-text-muted)" />
                  <span>Duration: <strong>{prog.durationYears || 4} Years (8 Semesters)</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} color="var(--color-text-muted)" />
                  <span>Sanctioned Capacity: <strong>{prog.intakeCapacity} Seats</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <IndianRupee size={16} color="var(--color-text-muted)" />
                  <span>Annual Tuition Fee: <strong>₹{prog.tuitionFee ? prog.tuitionFee.toLocaleString() : '75,000'}</strong></span>
                </div>
              </div>

              <Link
                to="/register"
                className="btn btn-primary btn-sm"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                <span>Apply for this Course</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgrammesPage;
