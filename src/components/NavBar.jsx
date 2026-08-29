// agent-notes: { ctx: "Top navigation bar in Rolemint screenplay format with auth state and direct route links", deps: ["react-router-dom", "../services/roleplayApi"], state: "active", last: "anti@2026-08-29" }

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setToken, setStoredUser, getStoredUser } from '../services/roleplayApi.js';

export default function NavBar() {
  const navigate = useNavigate();
  const user = getStoredUser();

  function handleLogout() {
    setToken(null);
    setStoredUser(null);
    navigate('/');
  }

  return (
    <nav className="navbar">
      <Link to={user ? '/dashboard' : '/'} className="brand">
        Rolemint <span className="cue">(V.O.)</span>
      </Link>
      <div className="nav-links">
        <Link to="/resume">Resume Analyzer</Link>
        {user ? (
          <>
            <Link to="/dashboard">Rehearsal Room</Link>
            <Link to="/scenarios/new">+ New scene</Link>
            <button onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/signup" className="btn btn-primary">Start rehearsing</Link>
          </>
        )}
      </div>
    </nav>
  );
}
