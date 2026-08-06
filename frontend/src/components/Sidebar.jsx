import React from 'react';
import { useDental } from '../context/DentalContext';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user } = useDental();
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'patients', label: 'Patients', icon: '👥' },
    { id: 'appointments', label: 'Appointments', icon: '📅' },
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon">🦷</div>
        <h2>Dental<span className="text-accent">Pro</span></h2>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button 
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">DR</div>
          <div className="user-info">
            <p className="user-name">{user ? user.name : 'Dr. Farah Zreik'}</p>
            <p className="user-role">Lead Dentist</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
