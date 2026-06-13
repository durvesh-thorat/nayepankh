import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/components.css';

const Navbar = () => {
  const { isAuthenticated, role, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-top-line"></div>
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          <img 
            src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,fit=crop,q=95/YKbL494Mv8Ip3qgy/logo-AVLW2LLWZkI8v845.png" 
            alt="NayePankh Foundation" 
          />
        </Link>
        <div className="navbar-links">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/register" className="btn btn-secondary">Become a Volunteer</Link>
            </>
          ) : (
            <>
              {role === 'admin' ? (
                <Link to="/admin" className="navbar-link">Admin Dashboard</Link>
              ) : (
                <Link to="/dashboard" className="navbar-link">My Dashboard</Link>
              )}
              <button onClick={logout} className="navbar-link">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
