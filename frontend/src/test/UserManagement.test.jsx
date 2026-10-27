import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import UserManagementPage from '../pages/admin/UserManagementPage';
import { ToastProvider } from '../context/ToastContext';
import { adminApi } from '../api/adminApi';

vi.mock('../api/adminApi', () => ({
  adminApi: {
    getUsers: vi.fn(),
    getUserStats: vi.fn(),
    getUserDetails: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    toggleUserStatus: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

const mockUsers = [
  {
    id: 1,
    fullName: 'System Administrator',
    email: 'admin@cams.edu',
    phone: '9876543210',
    role: 'ADMINISTRATOR',
    isActive: true,
    createdAt: '2026-09-09T22:29:24'
  },
  {
    id: 4,
    fullName: 'Ms. Ananya Roy (Counsellor)',
    email: 'counsellor@cams.edu',
    phone: '9876543213',
    role: 'COUNSELLOR',
    isActive: true,
    createdAt: '2026-09-09T22:29:25'
  },
  {
    id: 6,
    fullName: 'Arjun Kumar',
    email: 'applicant@cams.edu',
    phone: '9876543215',
    role: 'APPLICANT',
    isActive: true,
    createdAt: '2026-09-09T22:29:25'
  }
];

const mockStats = {
  totalUsers: 3,
  applicants: 1,
  counsellors: 1,
  programmeCoordinators: 0,
  registrars: 0,
  financeOfficers: 0,
  administrators: 1
};

const renderUserManagement = () => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <UserManagementPage />
      </ToastProvider>
    </BrowserRouter>
  );
};

describe('UserManagementPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminApi.getUsers.mockResolvedValue({ data: mockUsers });
    adminApi.getUserStats.mockResolvedValue({ data: mockStats });
  });

  it('renders header, title, and subtitle properly', async () => {
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByText('User & Staff Management')).toBeInTheDocument();
    });

    expect(screen.getByText('Manage applicants, admission staff and system administrators.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add User \/ Staff/i })).toBeInTheDocument();
  });

  it('displays real backend summary card counts', async () => {
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Applicants').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Counsellors')).toBeInTheDocument();
    expect(screen.getByText('Administrators')).toBeInTheDocument();
  });

  it('renders user rows in the table with role badges and action buttons', async () => {
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByText('admin@cams.edu')).toBeInTheDocument();
      expect(screen.getByText('counsellor@cams.edu')).toBeInTheDocument();
      expect(screen.getByText('applicant@cams.edu')).toBeInTheDocument();
    });

    expect(screen.getByText('System Administrator')).toBeInTheDocument();
    expect(screen.getByText('Ms. Ananya Roy (Counsellor)')).toBeInTheDocument();
    expect(screen.getByText('Arjun Kumar')).toBeInTheDocument();
  });

  it('filters users correctly when searching by name', async () => {
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByText('Arjun Kumar')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search users by name, email, role, or ID.../i);
    fireEvent.change(searchInput, { target: { value: 'Arjun' } });

    expect(screen.getByText('Arjun Kumar')).toBeInTheDocument();
    expect(screen.queryByText('System Administrator')).not.toBeInTheDocument();
    expect(screen.queryByText('Ms. Ananya Roy (Counsellor)')).not.toBeInTheDocument();
  });
});
