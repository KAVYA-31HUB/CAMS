import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatusBadge from '../components/common/StatusBadge';

describe('StatusBadge Component', () => {
  it('renders correctly for SUBMITTED status', () => {
    render(<StatusBadge status="SUBMITTED" />);
    expect(screen.getByText(/SUBMITTED/i)).toBeInTheDocument();
  });

  it('renders correctly for VERIFIED status', () => {
    render(<StatusBadge status="VERIFIED" />);
    expect(screen.getByText(/VERIFIED/i)).toBeInTheDocument();
  });

  it('renders correctly for ALLOTTED status', () => {
    render(<StatusBadge status="ALLOTTED" />);
    expect(screen.getByText(/ALLOTTED/i)).toBeInTheDocument();
  });

  it('renders correctly for JOINED status', () => {
    render(<StatusBadge status="JOINED" />);
    expect(screen.getByText(/ADMITTED/i)).toBeInTheDocument();
  });

  it('renders correctly for DISCREPANCY_FLAGGED status', () => {
    render(<StatusBadge status="DISCREPANCY_FLAGGED" />);
    expect(screen.getByText(/DISCREPANCY_FLAGGED/i)).toBeInTheDocument();
  });

  it('renders correctly for DISCREPANT status', () => {
    render(<StatusBadge status="DISCREPANT" />);
    expect(screen.getByText(/DISCREPANT/i)).toBeInTheDocument();
  });

  it('renders fallback for custom status', () => {
    render(<StatusBadge status="CUSTOM_STATUS" />);
    expect(screen.getByText(/CUSTOM_STATUS/i)).toBeInTheDocument();
  });

});
