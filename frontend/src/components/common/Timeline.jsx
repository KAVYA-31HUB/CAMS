import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

const STAGES = [
  { key: 'SUBMITTED', label: 'Application Submitted', desc: 'Online application submitted' },
  { key: 'VERIFICATION', label: 'Document Verification', desc: 'Counsellor document scrutiny' },
  { key: 'MERIT', label: 'Merit List', desc: 'Merit formula ranking calculation' },
  { key: 'COUNSELLING', label: 'Counselling Round 1', desc: 'Choice validation & vacancy review' },
  { key: 'ALLOTMENT', label: 'Seat Allotment', desc: 'Provisional quota seat allotment' },
  { key: 'FEE', label: 'Fee Payment', desc: 'Tuition remittance & tax invoice' },
  { key: 'JOINED', label: 'Admission Confirmation', desc: 'Final registration & enrollment' }
];

const Timeline = ({ currentStatus = 'SUBMITTED' }) => {
  const getStageState = (stageKey, status) => {
    const isJoined = status === 'JOINED' || status === 'ADMITTED';
    const isAllotted = status === 'ALLOTTED';
    const isVerified = status === 'VERIFIED';
    const isSubmitted = status === 'SUBMITTED' || status === 'PENDING' || status === 'DRAFT';

    if (isJoined) {
      return { status: 'COMPLETED', label: 'Completed', color: 'var(--color-success)' };
    }

    if (isAllotted) {
      if (['SUBMITTED', 'VERIFICATION', 'MERIT', 'COUNSELLING', 'ALLOTMENT'].includes(stageKey)) {
        return { status: 'COMPLETED', label: 'Completed', color: 'var(--color-success)' };
      }
      if (stageKey === 'FEE') {
        return { status: 'CURRENT', label: 'In Progress', color: 'var(--color-primary)' };
      }
      return { status: 'NOT_STARTED', label: 'Not Started', color: 'var(--color-text-muted)' };
    }

    if (isVerified) {
      if (['SUBMITTED', 'VERIFICATION'].includes(stageKey)) {
        return { status: 'COMPLETED', label: 'Completed', color: 'var(--color-success)' };
      }
      if (stageKey === 'MERIT') {
        return { status: 'CURRENT', label: 'Upcoming', color: 'var(--color-accent)' };
      }
      if (stageKey === 'COUNSELLING') {
        return { status: 'UPCOMING', label: 'Upcoming', color: 'var(--color-accent)' };
      }
      return { status: 'NOT_STARTED', label: 'Not Started', color: 'var(--color-text-muted)' };
    }

    // Default: isSubmitted
    if (stageKey === 'SUBMITTED') {
      return { status: 'COMPLETED', label: 'Completed', color: 'var(--color-success)' };
    }
    if (stageKey === 'VERIFICATION') {
      return { status: 'CURRENT', label: 'In Progress', color: 'var(--color-primary)' };
    }
    if (stageKey === 'MERIT' || stageKey === 'COUNSELLING') {
      return { status: 'UPCOMING', label: 'Upcoming', color: '#8b5cf6' };
    }
    return { status: 'NOT_STARTED', label: 'Not Started', color: 'var(--color-text-muted)' };
  };

  return (
    <div style={{ margin: '1rem 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {STAGES.map((stage, idx) => {
          const state = getStageState(stage.key, currentStatus);
          const isCompleted = state.status === 'COMPLETED';
          const isCurrent = state.status === 'CURRENT';

          return (
            <div
              key={stage.key}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                position: 'relative'
              }}
            >
              {/* Timeline Connector Line */}
              {idx < STAGES.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '24px',
                    left: '14px',
                    bottom: '-12px',
                    width: '2px',
                    backgroundColor: isCompleted ? 'var(--color-success)' : 'var(--color-border)',
                    zIndex: 1
                  }}
                />
              )}

              {/* Indicator Circle */}
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isCompleted
                    ? 'var(--color-success)'
                    : isCurrent
                    ? 'var(--color-primary)'
                    : 'var(--color-bg-surface)',
                  border: `2px solid ${isCompleted ? 'var(--color-success)' : isCurrent ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  color: isCompleted || isCurrent ? 'white' : 'var(--color-text-muted)',
                  zIndex: 2,
                  boxShadow: isCurrent ? '0 0 0 4px rgba(59, 73, 223, 0.15)' : 'none'
                }}
              >
                {isCompleted ? <CheckCircle2 size={16} /> : isCurrent ? <Clock size={16} /> : <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{idx + 1}</span>}
              </div>

              {/* Stage Details */}
              <div style={{ flex: 1, paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h4 style={{
                    fontSize: '0.9rem',
                    fontWeight: isCurrent || isCompleted ? 700 : 500,
                    color: isCompleted ? 'var(--color-text-primary)' : isCurrent ? 'var(--color-primary)' : 'var(--color-text-muted)'
                  }}>
                    {stage.label}
                  </h4>
                  <span style={{
                    fontSize: '0.725rem',
                    fontWeight: 600,
                    color: state.color,
                    backgroundColor: isCompleted ? '#f0fdf4' : isCurrent ? 'var(--color-primary-light)' : 'var(--color-bg-subtle)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    border: `1px solid ${isCompleted ? '#bbf7d0' : isCurrent ? '#bfdbfe' : 'var(--color-border)'}`
                  }}>
                    {state.label}
                  </span>
                </div>
                <p style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', margin: '0.15rem 0 0 0' }}>
                  {stage.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
