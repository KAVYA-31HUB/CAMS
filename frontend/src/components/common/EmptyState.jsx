import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no items to display at this time.',
  action = null
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '3rem 1.5rem',
      backgroundColor: 'var(--color-bg-surface)',
      border: '1px dashed var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      margin: '1rem 0'
    }}>
      <div style={{
        width: '54px',
        height: '54px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-bg-subtle)',
        color: 'var(--color-text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1rem'
      }}>
        <Icon size={28} />
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.4rem' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', maxWidth: '400px', marginBottom: action ? '1.25rem' : 0 }}>
        {description}
      </p>
      {action && action}
    </div>
  );
};

export default EmptyState;
