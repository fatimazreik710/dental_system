import React, { useState } from 'react';
import { useDental } from '../context/DentalContext';
import './Dashboard.css';

const Dashboard = () => {
  const { patients, appointments, addPatient, updatePatientBilling, user } = useDental();
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  
  const [newPatient, setNewPatient] = useState({ 
    full_name: '', age: '', phone_number: '', 
    medical_history: '', current_medications: '', chief_complaint: '',
    previous_dental_history: '', oral_hygiene_habits: '', has_xray: false, xray_file: null
  });
  const [newInvoice, setNewInvoice] = useState({ patientId: '', description: '', amount: '' });

  const handleAddPatient = (e) => {
    e.preventDefault();
    let payload = null;
    if (newPatient.has_xray && newPatient.xray_file) {
      payload = new FormData();
      Object.keys(newPatient).forEach(key => {
        if (newPatient[key] !== null && newPatient[key] !== '') {
          payload.append(key, newPatient[key]);
        }
      });
      if (!newPatient.age) payload.delete('age');
    } else {
      payload = { ...newPatient, age: parseInt(newPatient.age) || null };
      delete payload.xray_file;
    }

    addPatient(payload);
    setShowAddPatient(false);
    setNewPatient({ 
      full_name: '', age: '', phone_number: '', 
      medical_history: '', current_medications: '', chief_complaint: '',
      previous_dental_history: '', oral_hygiene_habits: '', has_xray: false, xray_file: null
    });
  };

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    if (!newInvoice.patientId || !newInvoice.amount) return;
    updatePatientBilling(newInvoice.patientId, parseFloat(newInvoice.amount), newInvoice.description);
    setShowInvoice(false);
    setNewInvoice({ patientId: '', description: '', amount: '' });
  };

  // Calculate real revenue month-to-date
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  let revenueMTD = 0;
  
  patients.forEach(p => {
    (p.invoices || []).forEach(inv => {
      (inv.payments || []).forEach(payment => {
        const pDate = new Date(payment.payment_date);
        if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
          revenueMTD += parseFloat(payment.amount_paid);
        }
      });
    });
  });

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayAppointments = appointments.filter(a => {
    if (!a.appointment_time) return false;
    const dt = new Date(a.appointment_time);
    const apptDate = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    return apptDate === todayStr;
  });

  const stats = [
    { label: 'Total Patients', value: patients.length, trend: 'Active', positive: true },
    { label: "Today's Appts", value: todayAppointments.length, trend: 'Scheduled', positive: true },
    { label: 'Revenue (MTD)', value: '$' + revenueMTD.toFixed(2), trend: 'This Month', positive: true },
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name || 'Doctor'}</h1>
          <p className="page-subtitle">Here is what's happening at your clinic today.</p>
        </div>
      </header>

      <section className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card glass-panel">
            <h3>{stat.label}</h3>
            <div className="stat-value-row">
              <span className="stat-value">{stat.value}</span>
              <span className={`stat-trend ${stat.positive ? 'positive' : 'negative'}`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </section>

      <div className="dashboard-content">
        <section className="appointments-section glass-panel">
          <div className="section-header">
            <h2>Today's Schedule</h2>
            <button className="text-btn">View All</button>
          </div>
          
            <div className="appointment-list">
              {todayAppointments.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No appointments scheduled for today.</p>
              ) : (
                todayAppointments.map((appt, idx) => (
                  <div key={idx} className="appointment-card">
                    <div className="appt-time">{new Date(appt.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="appt-details">
                      <h4>{appt.patient?.full_name || 'Unknown Patient'}</h4>
                      <p>{appt.notes || 'No notes'}</p>
                    </div>
                    <div className={`appt-status status-${appt.status.replace(/\s+/g, '-').toLowerCase()}`}>
                      {appt.status}
                    </div>
                  </div>
                ))
              )}
            </div>
        </section>

        <section className="quick-actions-section glass-panel">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn" onClick={() => setShowAddPatient(true)}>
              <span className="action-icon">👤</span> Add Patient
            </button>
            <button className="action-btn" onClick={() => setShowInvoice(true)}>
              <span className="action-icon">💰</span> Create Invoice
            </button>
          </div>
        </section>
      </div>

      {showAddPatient && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ width: '500px' }}>
            <h2>Add New Patient</h2>
            <form onSubmit={handleAddPatient} className="add-patient-form">
              <input type="text" placeholder="Full Name" value={newPatient.full_name} onChange={e => setNewPatient({...newPatient, full_name: e.target.value})} required className="glass-panel" style={{ width: '100%' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginTop: '1rem' }}>
                <input type="number" placeholder="Age" value={newPatient.age} onChange={e => setNewPatient({...newPatient, age: e.target.value})} required className="glass-panel" style={{ width: '100%' }} />
                <input type="tel" placeholder="Phone" value={newPatient.phone_number} onChange={e => setNewPatient({...newPatient, phone_number: e.target.value})} required className="glass-panel" style={{ width: '100%' }} />
              </div>
              <input type="text" placeholder="Medical History (e.g. Asthma)" value={newPatient.medical_history} onChange={e => setNewPatient({...newPatient, medical_history: e.target.value})} className="glass-panel" style={{marginTop: '1rem', width: '100%'}} />
              <input type="text" placeholder="Current Medications" value={newPatient.current_medications} onChange={e => setNewPatient({...newPatient, current_medications: e.target.value})} className="glass-panel" style={{marginTop: '1rem', width: '100%'}} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <input type="text" placeholder="Previous Dental History" value={newPatient.previous_dental_history} onChange={e => setNewPatient({...newPatient, previous_dental_history: e.target.value})} className="glass-panel" style={{ width: '100%' }} />
                <input type="text" placeholder="Oral Hygiene Habits" value={newPatient.oral_hygiene_habits} onChange={e => setNewPatient({...newPatient, oral_hygiene_habits: e.target.value})} className="glass-panel" style={{ width: '100%' }} />
              </div>
              <textarea placeholder="Chief Complaint / Notes" value={newPatient.chief_complaint} onChange={e => setNewPatient({...newPatient, chief_complaint: e.target.value})} rows="3" className="glass-panel" style={{ padding: '0.75rem', marginTop: '1rem', width: '100%', marginBottom: '1rem' }}></textarea>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ color: 'var(--text-primary)' }}>Has X-Ray?</label>
                <input type="checkbox" checked={newPatient.has_xray} onChange={e => setNewPatient({...newPatient, has_xray: e.target.checked})} />
              </div>
              {newPatient.has_xray && (
                <input type="file" accept="image/*,application/pdf" onChange={e => setNewPatient({...newPatient, xray_file: e.target.files[0]})} className="glass-panel" style={{ width: '100%', marginBottom: '1rem' }} />
              )}
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddPatient(false)} className="text-btn">Cancel</button>
                <button type="submit" className="primary-btn">Save Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInvoice && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ width: '500px' }}>
            <h2>Create Invoice</h2>
            <form onSubmit={handleCreateInvoice}>
              <select value={newInvoice.patientId} onChange={e => setNewInvoice({...newInvoice, patientId: e.target.value})} required className="glass-panel" style={{width: '100%'}}>
                <option value="">Select Patient</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
              <input type="text" placeholder="Description (e.g. Root Canal)" value={newInvoice.description} onChange={e => setNewInvoice({...newInvoice, description: e.target.value})} required className="glass-panel" style={{marginTop: '1rem', width: '100%'}} />
              <input type="number" step="0.01" placeholder="Amount ($)" value={newInvoice.amount} onChange={e => setNewInvoice({...newInvoice, amount: e.target.value})} required className="glass-panel" style={{marginTop: '1rem', width: '100%'}} />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowInvoice(false)} className="text-btn">Cancel</button>
                <button type="submit" className="primary-btn">Create Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
