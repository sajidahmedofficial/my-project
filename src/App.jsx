// agent-notes: { ctx: "Main App component in Rolemint screenplay format with complete route tree and auth guards", deps: ["react-router-dom", "./components/NavBar", "./pages/*", "./services/roleplayApi"], state: "active", last: "anti@2026-08-29" }

import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ScenarioBuilder from './pages/ScenarioBuilder.jsx';
import Roleplay from './pages/Roleplay.jsx';
import Feedback from './pages/Feedback.jsx';
import ResumeAnalyzer from './pages/ResumeAnalyzer.jsx';
import { getStoredUser } from './services/roleplayApi.js';

function RequireAuth({ children }) {
  const user = getStoredUser();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <div className="app-shell">
      <NavBar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/resume" element={<ResumeAnalyzer />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/scenarios/new"
          element={
            <RequireAuth>
              <ScenarioBuilder />
            </RequireAuth>
          }
        />
        <Route
          path="/sessions/:id"
          element={
            <RequireAuth>
              <Roleplay />
            </RequireAuth>
          }
        />
        <Route
          path="/sessions/:id/feedback"
          element={
            <RequireAuth>
              <Feedback />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
