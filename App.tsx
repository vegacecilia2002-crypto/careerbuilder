import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { JobProvider } from './context/JobContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { JobBoard } from './components/JobBoard';
import { ResumeBuilder } from './components/ResumeBuilder';
import { AvatarBuilder } from './components/AvatarBuilder';
import { AuthPage } from './components/AuthPage';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-emerald-600">
        <Loader2 size={40} className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <JobProvider>
        <HashRouter>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<AuthPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route 
                path="/applications" 
                element={<JobBoard origin="application" title="My Applications" />} 
              />
              <Route 
                path="/offers" 
                element={<JobBoard origin="offer" title="Offers Received" />} 
              />
              <Route path="/resume" element={<ResumeBuilder />} />
              <Route path="/avatar" element={<AvatarBuilder />} />
              <Route path="/settings" element={<div className="text-slate-500">Settings module coming in Phase 2.</div>} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </JobProvider>
    </AuthProvider>
  );
};

export default App;