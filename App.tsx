import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { JobProvider } from './context/JobContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { JobBoard } from './components/JobBoard';
import { ResumeBuilder } from './components/ResumeBuilder';
import { AvatarBuilder } from './components/AvatarBuilder';

const App: React.FC = () => {
  return (
    <JobProvider>
      <HashRouter>
        <Layout>
          <Routes>
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
            {/* Settings placeholder for now */}
            <Route path="/settings" element={<div className="text-slate-500">Settings module coming in Phase 2.</div>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </JobProvider>
  );
};

export default App;