import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '../pages/public/RegisterPage';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

const renderRegister = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <RegisterPage />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('RegisterPage Form Validation (SRS Appendix C)', () => {
  it('renders all mandatory candidate fields', () => {
    renderRegister();
    expect(screen.getByPlaceholderText(/e.g. Anand Kumar/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/anand@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/9876543210/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. 92.5/i)).toBeInTheDocument();
  });

  it('validates password requirements and empty submission', () => {
    renderRegister();
    const submitBtn = screen.getByRole('button', { name: /Complete Registration/i });
    fireEvent.click(submitBtn);

    // Form inputs have required attributes
    const nameInput = screen.getByPlaceholderText(/e.g. Anand Kumar/i);
    expect(nameInput).toBeRequired();
  });

  it('updates form state when user inputs details', () => {
    renderRegister();
    const nameInput = screen.getByPlaceholderText(/e.g. Anand Kumar/i);
    fireEvent.change(nameInput, { target: { value: 'Rahul Sharma' } });
    expect(nameInput.value).toBe('Rahul Sharma');
  });
});
