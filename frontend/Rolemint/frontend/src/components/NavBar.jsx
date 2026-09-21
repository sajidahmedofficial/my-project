import { Link, useNavigate } from 'react-router-dom';
import { setToken, setStoredUser, getStoredUser } from '../api.js';

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
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/scenarios/new">New scenario</Link>
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
