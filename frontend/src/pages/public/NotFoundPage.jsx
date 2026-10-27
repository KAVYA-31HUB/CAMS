import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'var(--canvas)'
    }}>
      <div className="card" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '3rem 2rem',
        textAlign: 'center',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'var(--primary-subtle)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}>
          <Compass size={32} />
        </div>

        <span style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          color: 'var(--primary)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em'
        }}>
          404 Error
        </span>

        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: 'var(--text-main)',
          margin: '0.5rem 0 0.75rem 0',
          letterSpacing: '-0.02em'
        }}>
          Page Not Found
        </h1>

        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
          lineHeight: '1.6',
          margin: '0 0 2rem 0'
        }}>
          The page or admission portal resource you requested does not exist or may have been relocated.
        </p>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link
            to="/"
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              padding: '0.6rem 1.25rem'
            }}
          >
            <Home size={16} />
            Return to Homepage
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn btn-outline"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              padding: '0.6rem 1.25rem'
            }}
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
