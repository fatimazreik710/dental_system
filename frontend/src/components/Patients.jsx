import React, { useState, useMemo } from 'react';
import { useDental } from '../context/DentalContext';
import FDIChart from './FDIChart';
import './Patients.css';

const Patients = () => {
  const { patients, updatePatientFDI, addPayment, deletePayment } = useDental();
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const [search, setSearch] = useState('');
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ invoice_id: null, amount_paid: '' });

  const handleOpenPayment = (invoice) => {
    setPaymentForm({ invoice_id: invoice.id, amount_paid: invoice.balance_due });
    setShowPaymentModal(true);
  };

  const submitPayment = (e) => {
    e.preventDefault();
    addPayment({
      ...paymentForm,
      payment_date: new Date().toISOString().split('T')[0]
    });
    setShowPaymentModal(false);
  };

  const filteredPatients = patients.filter(p => (p.full_name || '').toLowerCase().includes(search.toLowerCase()));

  // Convert array of tooth_charts to object for FDIChart
  const getFDIChartData = (toothCharts = []) => {
    const fdiData = {};
    toothCharts.forEach(tc => {
      fdiData[tc.tooth_number] = { status: tc.status, notes: tc.notes };
    });
    return fdiData;
  };

  // Calculate balances
  const calculateBilling = (invoices = []) => {
    let totalInvoiced = 0;
    let balance = 0;
    invoices.forEach(inv => {
      totalInvoiced += parseFloat(inv.final_amount || 0);
      balance += parseFloat(inv.balance_due || 0);
    });
    return { totalInvoiced: totalInvoiced.toFixed(2), balance: balance.toFixed(2) };
  };

  if (selectedPatient) {
    const fdiData = getFDIChartData(selectedPatient.tooth_charts);
    const billing = calculateBilling(selectedPatient.invoices);
    
    return (
      <div className="patient-details glass-panel">
        <button className="text-btn" onClick={() => setSelectedPatientId(null)}>← Back to List</button>
        <div className="profile-header">
          <h2>{selectedPatient.full_name}</h2>
          <span className="age-badge">Age: {selectedPatient.age || 'N/A'}</span>
        </div>
        
        <div className="details-grid">
          <div className="info-section">
            <h3>Contact Info</h3>
            <p>Phone: {selectedPatient.phone_number}</p>
          </div>
          <div className="info-section">
            <h3>Medical History & Medications</h3>
            <p><strong>Chief Complaint:</strong> {selectedPatient.chief_complaint || 'None'}</p>
            <p><strong>History:</strong> {selectedPatient.medical_history || 'None'}</p>
            <p><strong>Medications:</strong> {selectedPatient.current_medications || 'None'}</p>
            <p><strong>Previous Dental:</strong> {selectedPatient.previous_dental_history || 'None'}</p>
            <p><strong>Oral Hygiene:</strong> {selectedPatient.oral_hygiene_habits || 'None'}</p>
            <p><strong>Has X-Ray:</strong> {selectedPatient.has_xray ? 'Yes' : 'No'}</p>
            {selectedPatient.has_xray && selectedPatient.xray_file_path && (
              <p><strong>X-Ray File:</strong> <a href={`http://localhost:8000/storage/${selectedPatient.xray_file_path}`} target="_blank" rel="noreferrer" style={{color: 'var(--primary-light)'}}>View File</a></p>
            )}
          </div>
        </div>

        <div className="fdi-section" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>FDI Tooth Chart (32 Adult Teeth)</h3>
          <FDIChart 
            fdiData={fdiData} 
            onUpdateTooth={(toothId, updateData) => {
              updatePatientFDI(selectedPatient.id, toothId, updateData);
            }} 
          />
          
          <div style={{ marginTop: '2rem' }}>
            {Object.entries(fdiData).map(([tooth, data]) => (
              <div key={tooth} className="tooth-note"><strong>Tooth {tooth}:</strong> {data.status.toUpperCase()} - {data.notes}</div>
            ))}
          </div>
        </div>

        <div className="billing-section">
          <h3>Billing</h3>
          <p>Total Invoiced: ${billing.totalInvoiced}</p>
          <p>Balance Due: <strong className="danger-text">${billing.balance}</strong></p>
          <h4>Invoices & Installments</h4>
          <table className="billing-table">
            <thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {(selectedPatient.invoices || []).map(inv => (
                <React.Fragment key={inv.id}>
                  <tr>
                    <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                    <td>Invoice #{inv.id}</td>
                    <td>
                      Total: ${inv.final_amount}<br/>
                      <small>Balance: ${inv.balance_due}</small>
                    </td>
                    <td>{inv.status}</td>
                    <td>
                      {parseFloat(inv.balance_due) > 0 && (
                        <button className="primary-btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleOpenPayment(inv)}>Record Installment</button>
                      )}
                    </td>
                  </tr>
                  {inv.payments && inv.payments.length > 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)' }}>
                        <div style={{ marginLeft: '2rem', fontSize: '0.9rem' }}>
                          <strong>Installments:</strong>
                          <ul style={{ listStyle: 'none', paddingLeft: 0, marginTop: '0.5rem' }}>
                            {inv.payments.map(payment => (
                              <li key={payment.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.3rem' }}>
                                <span>{new Date(payment.payment_date).toLocaleDateString()} - ${payment.amount_paid}</span>
                                <button className="text-btn" style={{ color: 'var(--danger)', padding: 0 }} onClick={() => window.confirm('Are you sure you want to delete this payment?') && deletePayment(payment.id)}>Undo</button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {showPaymentModal && (
          <div className="modal-overlay">
            <div className="modal-content glass-panel" style={{ width: '400px' }}>
              <h2>Record Installment / Payment</h2>
              <form onSubmit={submitPayment}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Amount to Pay ($)</label>
                  <input type="number" step="0.01" value={paymentForm.amount_paid} onChange={e => setPaymentForm({...paymentForm, amount_paid: e.target.value})} required className="glass-panel" style={{ width: '100%' }} />
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowPaymentModal(false)} className="text-btn">Cancel</button>
                  <button type="submit" className="primary-btn">Record</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="patients-list">
      <header className="page-header">
        <h1 className="page-title">Patients Directory</h1>
        <input type="text" placeholder="Search patients..." className="search-input glass-panel" value={search} onChange={e => setSearch(e.target.value)} />
      </header>
      <div className="patients-grid">
        {filteredPatients.map(p => {
          const billing = calculateBilling(p.invoices);
          return (
            <div key={p.id} className="patient-card glass-panel" onClick={() => setSelectedPatientId(p.id)}>
              <h3>{p.full_name}</h3>
              <p>{p.phone_number}</p>
              <p className="balance-info">Balance: ${billing.balance}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Patients;
