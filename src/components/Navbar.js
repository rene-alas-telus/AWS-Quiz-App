import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          AWS Quiz App
        </Link>
        
        <div className="navbar-menu">
          {currentUser ? (
            <>
              <div className="user-info">
                {currentUser.photoURL && (
                  <img 
                    src={currentUser.photoURL} 
                    alt="Profile" 
                    className="profile-image"
                  />
                )}
                <span className="user-name">
                  {currentUser.displayName || currentUser.email}
                </span>
              </div>
              
              <button 
                onClick={handleLogout} 
                className="logout-button"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="login-link">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
