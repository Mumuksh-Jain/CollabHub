import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setMenuOpen(false);
      navigate('/login');
    } catch {
      // ignore
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
        <img 
  src="/logo.jpg" 
  alt="CollabHub logo" 
  width="70" 
  height="50" 
  style={{ objectFit: 'contain' }}
/>
          <span className="brand-text" style={{fontSize: '30px'}}>
            {'CollabHub'}
          </span>
        </Link>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>Explore</Link>
          {isLoggedIn ? (
            <>
              <Link to="/create-project" className="nav-link" onClick={closeMenu}>Create</Link>
              <Link to="/my-projects" className="nav-link" onClick={closeMenu}>My Projects</Link>


              <Link to="/profile" className="nav-link" onClick={closeMenu}>Profile</Link>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm" onClick={closeMenu}>Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMenu}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
