import { Navigate, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ScenarioBuilder from './pages/ScenarioBuilder.jsx';
import Roleplay from './pages/Roleplay.jsx';
import Feedback from './pages/Feedback.jsx';
import { getStoredUser } from './api.js';

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
        <Route
          path="/dashboard"
          element={<RequireAuth><Dashboard /></RequireAuth>}
        />
        <Route
          path="/scenarios/new"
          element={<RequireAuth><ScenarioBuilder /></RequireAuth>}
        />
        <Route
          path="/sessions/:id"
          element={<RequireAuth><Roleplay /></RequireAuth>}
        />
        <Route
          path="/sessions/:id/feedback"
          element={<RequireAuth><Feedback /></RequireAuth>}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
