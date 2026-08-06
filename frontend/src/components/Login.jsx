import React, { useState } from 'react';
import { useDental } from '../context/DentalContext';
import './Login.css';

const Login = () => {
  const { login } = useDental();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(username, password);
      if (!success) {
        setError('Invalid username or password.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box glass-panel">
        <h1 className="login-title">Dental Manager</h1>
        <p className="login-subtitle">Welcome back, Dr. Farah Zreik</p>
        
        {error && <div className="login-error danger-text">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Username / Email</label>
            <input 
              type="text" 
              className="glass-panel" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="farah@clinic.com"
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="glass-panel" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>
          <button type="submit" className="primary-btn login-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
