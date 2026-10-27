import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/public/LoginPage';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <LoginPage />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('LoginPage Component', () => {
  it('renders login form with email, password fields and sign in button', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/name@cams.edu/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('renders demo credentials quick-fill buttons for all 6 roles', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /Applicant/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Counsellor/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Coordinator/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Registrar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Finance/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Administrator/i })).toBeInTheDocument();
  });

  it('populates fields when an Administrator demo role button is clicked', () => {
    renderLogin();
    const adminBtn = screen.getByRole('button', { name: /Administrator/i });
    fireEvent.click(adminBtn);

    const emailInput = screen.getByPlaceholderText(/name@cams.edu/i);
    expect(emailInput.value).toBe('admin@cams.edu');
  });
});
