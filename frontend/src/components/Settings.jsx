import React, { useState } from 'react';
import { useDental } from '../context/DentalContext';
import './Settings.css';

const Settings = () => {
  const { user, logout } = useDental();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const toggleTheme = (e) => {
    const newTheme = e.target.value;
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="settings-page">
      <header className="page-header">
        <h1 className="page-title">Settings</h1>
      </header>

      <div className="settings-grid">
        <div className="settings-card glass-panel">
          <h2>Profile Details</h2>
          <div className="form-group" style={{marginTop: '1rem'}}>
            <label>Name</label>
            <input type="text" className="glass-panel" value={user?.name || ''} readOnly />
          </div>
          <div className="form-group" style={{marginTop: '1rem'}}>
            <label>Email</label>
            <input type="email" className="glass-panel" value={user?.email || ''} readOnly />
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
            To change your password, please contact system administration.
          </p>
        </div>

        <div className="settings-card glass-panel">
          <h2>Application Settings</h2>
          <div className="form-group" style={{marginTop: '1rem'}}>
            <label>Theme</label>
            <select className="glass-panel" value={theme} onChange={toggleTheme}>
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
            </select>
          </div>
          <button className="primary-btn danger-btn" onClick={logout} style={{ marginTop: '2rem' }}>
            Logout / End Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
