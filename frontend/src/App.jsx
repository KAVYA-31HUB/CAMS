import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleGuard from './components/common/RoleGuard';
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import ProgrammesPage from './pages/public/ProgrammesPage';
import ProspectusPage from './pages/public/ProspectusPage';
import ApplicationStatusPage from './pages/public/ApplicationStatusPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import NotFoundPage from './pages/public/NotFoundPage';

// Applicant Pages
import ApplicantDashboard from './pages/applicant/ApplicantDashboard';
import MultiStepApplication from './pages/applicant/MultiStepApplication';
import DocumentManager from './pages/applicant/DocumentManager';
import AllotmentStatus from './pages/applicant/AllotmentStatus';
import FeePaymentPage from './pages/applicant/FeePaymentPage';

// Staff & Admin Pages
import CounsellorDashboard from './pages/counsellor/CounsellorDashboard';
import CoordinatorDashboard from './pages/coordinator/CoordinatorDashboard';
import RegistrarDashboard from './pages/registrar/RegistrarDashboard';
import FinanceDashboard from './pages/finance/FinanceDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';

function ConditionalFooter() {
  const location = useLocation();
  const isDashboard = /^\/(applicant|counsellor|coordinator|registrar|finance|admin)/.test(location.pathname);
  if (isDashboard) return null;
  return <Footer />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--canvas)', color: 'var(--text-main)' }}>
              <Navbar />

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Routes>
                  {/* Public Pages */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/programmes" element={<ProgrammesPage />} />
                  <Route path="/prospectus" element={<ProspectusPage />} />
                  <Route path="/status" element={<ApplicationStatusPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Applicant Routes */}
                  <Route
                    path="/applicant"
                    element={
                      <ProtectedRoute>
                        <RoleGuard allowedRoles={['APPLICANT']}>
                          <DashboardLayout title="Applicant Portal" subtitle="Central Admission Management & Progress">
                            <ApplicantDashboard />
                          </DashboardLayout>
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/applicant/apply"
                    element={
                      <ProtectedRoute>
                        <RoleGuard allowedRoles={['APPLICANT']}>
                          <DashboardLayout title="Admission Application" subtitle="Multi-Step Application & Programme Preferences">
                            <MultiStepApplication />
                          </DashboardLayout>
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/applicant/documents"
                    element={
                      <ProtectedRoute>
                        <RoleGuard allowedRoles={['APPLICANT']}>
                          <DashboardLayout title="Document Repository" subtitle="DigiLocker Integration & Academic Certificates">
                            <DocumentManager />
                          </DashboardLayout>
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/applicant/allotment"
                    element={
                      <ProtectedRoute>
                        <RoleGuard allowedRoles={['APPLICANT']}>
                          <DashboardLayout title="Seat Allotment & Upgrades" subtitle="Merit Rankings, Provisional Offers & Upward Movement">
                            <AllotmentStatus />
                          </DashboardLayout>
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/applicant/fees"
                    element={
                      <ProtectedRoute>
                        <RoleGuard allowedRoles={['APPLICANT']}>
                          <DashboardLayout title="Fee Payment & Ledger" subtitle="Provisional Admission Fee Remittance & GST Receipts">
                            <FeePaymentPage />
                          </DashboardLayout>
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />

                  {/* Staff Routes */}
                  <Route
                    path="/counsellor"
                    element={
                      <ProtectedRoute>
                        <RoleGuard allowedRoles={['COUNSELLOR', 'ADMIN', 'ADMINISTRATOR']}>
                          <DashboardLayout title="Counsellor Desk" subtitle="Candidate Document Verification & Audit Queue">
                            <CounsellorDashboard />
                          </DashboardLayout>
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/coordinator"
                    element={
                      <ProtectedRoute>
                        <RoleGuard allowedRoles={['COORDINATOR', 'PROGRAMME_COORDINATOR', 'ADMIN', 'ADMINISTRATOR']}>
                          <DashboardLayout title="Admission Coordinator" subtitle="Merit Lists, Seat Matrix & Round Allocation Engine">
                            <CoordinatorDashboard />
                          </DashboardLayout>
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/registrar"
                    element={
                      <ProtectedRoute>
                        <RoleGuard allowedRoles={['REGISTRAR', 'ADMIN', 'ADMINISTRATOR']}>
                          <DashboardLayout title="Registrar Office" subtitle="AISHE Regulatory Reporting, UGC Audits & Admission Lifecycle">
                            <RegistrarDashboard />
                          </DashboardLayout>
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/finance"
                    element={
                      <ProtectedRoute>
                        <RoleGuard allowedRoles={['FINANCE', 'FINANCE_OFFICER', 'ADMIN', 'ADMINISTRATOR']}>
                          <DashboardLayout title="Finance & Accounts" subtitle="Admission Ledger, GST Invoices & Scholarship Concessions">
                            <FinanceDashboard />
                          </DashboardLayout>
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <RoleGuard allowedRoles={['ADMIN', 'ADMINISTRATOR']}>
                          <DashboardLayout title="System Administration" subtitle="User Lifecycle, Dynamic Formulas & Health Status">
                            <AdminDashboard />
                          </DashboardLayout>
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute>
                        <RoleGuard allowedRoles={['ADMIN', 'ADMINISTRATOR']}>
                          <DashboardLayout title="User & Staff Management" subtitle="Manage applicants, admission staff and system administrators.">
                            <UserManagementPage />
                          </DashboardLayout>
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Fallback */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </div>

              <ConditionalFooter />
            </div>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
