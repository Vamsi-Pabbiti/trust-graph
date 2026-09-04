import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionExplorerPage } from './pages/TransactionExplorerPage';
import { LiveScoringPage } from './pages/LiveScoringPage';
import { TrustNetworkPage } from './pages/TrustNetworkPage';
import { CaseQueuePage } from './pages/CaseQueuePage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { AppealsCenterPage } from './pages/AppealsCenterPage';
import { FairnessPage } from './pages/FairnessPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { SettingsPage } from './pages/SettingsPage';
import { ArchitecturePage } from './pages/ArchitecturePage';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-slate-500">Authenticating...</div>;
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

export function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Dashboard Workbench Routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionExplorerPage />} />
          <Route path="/score-live" element={<LiveScoringPage />} />
          <Route path="/graph" element={<TrustNetworkPage />} />
          <Route path="/cases" element={<CaseQueuePage />} />
          <Route path="/cases/:id" element={<CaseDetailPage />} />
          <Route path="/appeals" element={<AppealsCenterPage />} />
          <Route path="/fairness" element={<FairnessPage />} />
          <Route path="/audit" element={<AuditTrailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/architecture" element={<ArchitecturePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
