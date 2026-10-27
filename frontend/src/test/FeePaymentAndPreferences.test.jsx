import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import FeePaymentPage from '../pages/applicant/FeePaymentPage';
import HomePage from '../pages/public/HomePage';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { feeApi } from '../api/feeApi';
import { applicantApi } from '../api/applicantApi';
import { programmeApi } from '../api/programmeApi';
import { applicationApi } from '../api/applicationApi';

vi.mock('../api/feeApi', () => ({
  feeApi: {
    getOutstanding: vi.fn(),
    getApplicantPayments: vi.fn(),
    payFee: vi.fn(),
    getReceipt: vi.fn()
  }
}));

vi.mock('../api/applicantApi', () => ({
  applicantApi: {
    getCurrentProfile: vi.fn(),
    getById: vi.fn(),
    getMyApplicant: vi.fn()
  }
}));

vi.mock('../api/programmeApi', () => ({
  programmeApi: {
    getActiveProgrammes: vi.fn()
  }
}));

vi.mock('../api/applicationApi', () => ({
  applicationApi: {
    getAdmissionSchedule: vi.fn(),
    getByApplicant: vi.fn(),
    submitMultiStep: vi.fn()
  }
}));

describe('FeePaymentPage Fixes', () => {
  it('renders FeePaymentPage cleanly without crashing when paymentHistory is empty', async () => {
    applicantApi.getCurrentProfile.mockResolvedValue({
      data: { id: 5, name: 'Arjun Kumar', email: 'applicant@cams.edu' }
    });

    feeApi.getOutstanding.mockResolvedValue({
      data: {
        applicationId: 4,
        applicationNumber: 'CAMS-2026-000501',
        programmeName: 'B.Tech Computer Science and Engineering',
        totalFee: 100000,
        paidAmount: 0,
        outstandingAmount: 100000,
        status: 'PENDING'
      }
    });

    // Empty payment history - this previously crashed with "ReferenceError: EmptyState is not defined"
    feeApi.getApplicantPayments.mockResolvedValue({ data: [] });

    render(
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <FeePaymentPage />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/Admission Fee & Payment Ledger/i)).toBeInTheDocument();
    });

    // Verify EmptyState is rendered properly without ErrorBoundary crash
    expect(screen.getByText(/No payment records found/i)).toBeInTheDocument();
    expect(screen.getByText(/B.Tech Computer Science and Engineering/i)).toBeInTheDocument();
    expect(screen.getByText(/Pay Outstanding Balance/i)).toBeInTheDocument();
  });
});

describe('HomePage Admission Dates (September 2026 Cycle)', () => {
  it('displays the admission schedule starting from September 01, 2026 without June dates', async () => {
    programmeApi.getActiveProgrammes.mockResolvedValue({ data: [] });
    applicationApi.getAdmissionSchedule.mockResolvedValue({
      data: [
        { event: 'Online Application Portal Opens', date: 'September 01, 2026', status: 'COMPLETED' },
        { event: 'Last Date for Online Registration & Document Upload', date: 'September 30, 2026', status: 'ACTIVE' },
        { event: 'Round 1 Seat Allotment & 72h Acceptance Window', date: 'October 14 - October 18, 2026', status: 'UPCOMING' },
        { event: 'Round 1 Fee Payment Deadline', date: 'October 21, 2026', status: 'UPCOMING' }
      ]
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <HomePage />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Key Admission Dates \(2026-27\)/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/September 01, 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/September 30, 2026/i)).toBeInTheDocument();
    expect(screen.queryByText(/June 01, 2026/i)).not.toBeInTheDocument();
  });
});

describe('MultiStepApplication 5 Programme Preferences', () => {
  it('pre-populates exactly 5 distinct programme preferences and labels priorities', async () => {
    const mockProgs = [
      { id: 1, name: 'B.Tech Computer Science and Engineering', department: 'CSE', intakeCapacity: 60, tuitionFee: 85000, otherFee: 15000 },
      { id: 2, name: 'B.Tech Information Technology', department: 'IT', intakeCapacity: 60, tuitionFee: 80000, otherFee: 15000 },
      { id: 3, name: 'B.Tech Artificial Intelligence and Data Science', department: 'AIDS', intakeCapacity: 60, tuitionFee: 85000, otherFee: 15000 },
      { id: 4, name: 'B.Tech Electronics and Communication Engineering', department: 'ECE', intakeCapacity: 60, tuitionFee: 75000, otherFee: 15000 },
      { id: 5, name: 'B.Tech Mechanical Engineering', department: 'MECH', intakeCapacity: 60, tuitionFee: 70000, otherFee: 15000 },
      { id: 6, name: 'B.Tech Civil Engineering', department: 'CIVIL', intakeCapacity: 60, tuitionFee: 65000, otherFee: 15000 }
    ];

    applicantApi.getMyApplicant.mockResolvedValue({
      data: {
        id: 5,
        name: 'Arjun Kumar',
        email: 'applicant@cams.edu',
        phone: '9876543210',
        category: 'GEN',
        boardPercentage: 92.5,
        entranceScore: 88.0
      }
    });

    programmeApi.getActiveProgrammes.mockResolvedValue({ data: mockProgs });
    applicationApi.getByApplicant.mockResolvedValue({ data: [] });

    // Import MultiStepApplication dynamically or render it
    const MultiStepApplication = (await import('../pages/applicant/MultiStepApplication')).default;

    render(
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <MultiStepApplication />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Step 1 of 6/i)).toBeInTheDocument();
    });

    // Step 1: Click Continue
    const continueBtn = screen.getByRole('button', { name: /Continue/i });
    continueBtn.click();

    // Step 2: Click Continue
    await waitFor(() => {
      expect(screen.getByText(/Step 2 of 6/i)).toBeInTheDocument();
    });
    continueBtn.click();

    // Step 3: Programme Preferences
    await waitFor(() => {
      expect(screen.getByText(/Step 3: Programme Preferences/i)).toBeInTheDocument();
    });

    // Verify 5/5 Preferences Selected badge
    expect(screen.getByText(/5\/5 Preferences Selected/i)).toBeInTheDocument();

    // Verify priority labels
    expect(screen.getByText(/Preference 1 — Highest Priority/i)).toBeInTheDocument();
    expect(screen.getByText(/Preference 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Preference 3/i)).toBeInTheDocument();
    expect(screen.getByText(/Preference 4/i)).toBeInTheDocument();
    expect(screen.getByText(/Preference 5 — Lowest Priority/i)).toBeInTheDocument();
  });
});
