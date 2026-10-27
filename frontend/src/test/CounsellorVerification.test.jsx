import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import CounsellorDashboard from '../pages/counsellor/CounsellorDashboard';
import { ToastProvider } from '../context/ToastContext';
import { documentApi } from '../api/documentApi';

vi.mock('../api/documentApi', () => ({
  documentApi: {
    getAllDocuments: vi.fn(),
    verifyDocument: vi.fn(),
  },
}));

const mockDocs = [
  {
    id: 1,
    documentType: 'MARKSHEET_10',
    fileName: '10th_marksheet.pdf',
    verificationStatus: 'PENDING',
    status: 'PENDING',
    remarks: '',
    uploadedAt: '2026-09-01T10:00:00',
    applicant: { id: 101, fullName: 'Kavya Sharma', email: 'kavya@example.com' },
  },
  {
    id: 2,
    documentType: 'MARKSHEET_12',
    fileName: '12th_marksheet.pdf',
    verificationStatus: 'VERIFIED',
    status: 'VERIFIED',
    remarks: 'Verified against board records',
    uploadedAt: '2026-09-01T10:05:00',
    applicant: { id: 101, fullName: 'Kavya Sharma', email: 'kavya@example.com' },
  },
  {
    id: 3,
    documentType: 'COMMUNITY_CERTIFICATE',
    fileName: 'community_cert.pdf',
    verificationStatus: 'DISCREPANT',
    status: 'DISCREPANT',
    remarks: 'Seal unclear',
    uploadedAt: '2026-09-01T10:10:00',
    applicant: { id: 101, fullName: 'Kavya Sharma', email: 'kavya@example.com' },
  },
];

const renderComponent = () =>
  render(
    <BrowserRouter>
      <ToastProvider>
        <CounsellorDashboard />
      </ToastProvider>
    </BrowserRouter>
  );

describe('CounsellorDashboard Verification Desk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    documentApi.getAllDocuments.mockResolvedValue({ data: mockDocs });
    documentApi.verifyDocument.mockResolvedValue({ data: { ...mockDocs[0], verificationStatus: 'DISCREPANT', status: 'DISCREPANT' } });
  });

  it('renders all documents with correct status badges and metrics counts', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Counsellor Verification Desk')).toBeInTheDocument();
    });

    // Check applicant name rendered
    expect(screen.getAllByText('Kavya Sharma').length).toBe(3);

    // Verify badges rendered correctly
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText('VERIFIED')).toBeInTheDocument();
    expect(screen.getByText('DISCREPANT')).toBeInTheDocument();
  });

  it('sends canonical DISCREPANT status (not DISCREPANCY_FLAGGED) when flagging a discrepancy', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('Audit & Verify').length).toBe(3);
    });

    // Click "Audit & Verify" on first doc (PENDING)
    const auditButtons = screen.getAllByText('Audit & Verify');
    fireEvent.click(auditButtons[0]);

    // Modal opens
    expect(screen.getByText('Document Audit & Verification Desk')).toBeInTheDocument();

    // Type remarks
    const textarea = screen.getByPlaceholderText(/Enter remarks/i);
    fireEvent.change(textarea, { target: { value: 'Blurred marks certificate' } });

    // Click "Flag Discrepancy"
    const flagButton = screen.getByRole('button', { name: /Flag Discrepancy/i });
    fireEvent.click(flagButton);

    await waitFor(() => {
      expect(documentApi.verifyDocument).toHaveBeenCalledWith(1, {
        verificationStatus: 'DISCREPANT',
        status: 'DISCREPANT',
        remarks: 'Blurred marks certificate',
      });
    });
  });

  it('sends canonical VERIFIED status when approving document', async () => {
    documentApi.verifyDocument.mockResolvedValueOnce({
      data: { ...mockDocs[0], verificationStatus: 'VERIFIED', status: 'VERIFIED' }
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('Audit & Verify').length).toBe(3);
    });

    const auditButtons = screen.getAllByText('Audit & Verify');
    fireEvent.click(auditButtons[0]);

    const approveButton = screen.getByRole('button', { name: /Approve & Verify/i });
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(documentApi.verifyDocument).toHaveBeenCalledWith(1, {
        verificationStatus: 'VERIFIED',
        status: 'VERIFIED',
        remarks: 'Document verified against original credentials.',
      });
    });
  });
});
