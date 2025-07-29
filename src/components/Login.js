import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { FaGoogle, FaMoon, FaSun } from 'react-icons/fa';
import Switch from 'react-switch';
import './Login.css';

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { loginWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect to home page
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await loginWithGoogle();
      // No need to pass isDarkMode in state anymore since we're using context
      navigate('/');
    } catch (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="header-container">
          <h2>AWS TICALogin</h2>
          <div className="toggle-container">
            <label>
              Theme:
              <div style={{ marginLeft: '5px' }}></div>
              <Switch
                onChange={toggleTheme}
                checked={isDarkMode}
                offColor="#222"
                onColor="#000080"
                checkedIcon={
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      height: '100%',
                      paddingRight: '5px'
                    }}
                  >
                    <FaSun color="yellow" />
                  </div>
                }
                uncheckedIcon={
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      height: '100%',
                      paddingRight: '5px'
                    }}
                  >
                    <FaMoon color="white" />
                  </div>
                }
              />
            </label>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <p className="login-message">Sign in with your Google account to continue</p>
        
        <button 
          className="google-button" 
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <FaGoogle /> Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
