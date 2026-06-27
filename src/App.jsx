import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import PatientWorkspace from './pages/PatientWorkspace';
import PatientProfile from './pages/PatientProfile';
import NewPatient from './pages/NewPatient';
import BreastCancer from './pages/BreastCancer';
import CervicalCancer from './pages/CervicalCancer';
import PcosDetection from './pages/PcosDetection';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Standalone Login Route - No Sidebar */}
        <Route path="/login" element={<Login />} />

        {/* Routes wrapped in Layout (with Sidebar) */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/workspace" replace />} />
          <Route path="workspace" element={<PatientWorkspace />} />
        </Route>

        {/* Full-Screen Routes (No Sidebar) */}
        <Route path="/patient/new" element={<NewPatient />} />
        <Route path="/patient/:id" element={<PatientProfile />} />
        <Route path="/breast/:id" element={<BreastCancer />} />
        <Route path="/cervical/:id" element={<CervicalCancer />} />
        <Route path="/pcos/:id" element={<PcosDetection />} />
        
        {/* Generic Redirects to Workspace */}
        <Route path="/patient" element={<Navigate to="/workspace" replace />} />
        <Route path="/breast" element={<Navigate to="/workspace" replace />} />
        <Route path="/cervical" element={<Navigate to="/workspace" replace />} />
        <Route path="/pcos" element={<Navigate to="/workspace" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/workspace" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
