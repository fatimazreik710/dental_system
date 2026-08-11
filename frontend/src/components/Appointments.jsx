import React, { useState } from 'react';
import { useDental } from '../context/DentalContext';
import './Appointments.css';

const Appointments = () => {
  const { appointments, patients, addAppointment, updateAppointment, deleteAppointment, sendWhatsAppReminder } = useDental();
  const [showModal, setShowModal] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null); // null = create mode, object = edit mode
  const [formData, setFormData] = useState({ date: '', time: '', patient_id: '', notes: '', status: 'Scheduled' });
  const [view, setView] = useState('day');
  const [confirmDelete, setConfirmDelete] = useState(null); // appointment id to confirm delete

  const openCreateModal = (date = '', time = '') => {
    setEditingAppt(null);
    setFormData({ date, time, patient_id: '', notes: '', status: 'Scheduled' });
    setShowModal(true);
  };

  const openEditModal = (appt) => {
    const dt = new Date(appt.appointment_time);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    const h = String(dt.getHours()).padStart(2, '0');
    const min = String(dt.getMinutes()).padStart(2, '0');

    setEditingAppt(appt);
    setFormData({
      date: `${y}-${m}-${d}`,
      time: `${h}:${min}`,
      patient_id: appt.patient_id || '',
      notes: appt.notes || '',
      status: appt.status || 'Scheduled',
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.patient_id || !formData.date || !formData.time) return;

    const appointment_time = `${formData.date} ${formData.time}:00`;

    if (editingAppt) {
      updateAppointment(editingAppt.id, {
        patient_id: formData.patient_id,
        appointment_time,
        status: formData.status,
        notes: formData.notes,
      });
    } else {
      addAppointment({
        patient_id: formData.patient_id,
        appointment_time,
        status: 'Scheduled',
        notes: formData.notes,
      });
    }

    setShowModal(false);
    setEditingAppt(null);
    setFormData({ date: '', time: '', patient_id: '', notes: '', status: 'Scheduled' });
  };

  const handleDelete = (id) => {
    deleteAppointment(id);
    setConfirmDelete(null);
  };

  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
  const today = new Date();

  // Helper to format date as YYYY-MM-DD using LOCAL time (not UTC)
  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  const todayStr = formatDate(today);

  // Compute tomorrow's date string for reminder logic
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatDate(tomorrow);

  const [sendingReminder, setSendingReminder] = useState(null); // id of appt being sent

  // Generate week dates (next 7 days including today)
  const weekDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });

  // Generate month dates (30 days starting from today for simplicity)
  const monthDates = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });

  // Process appointments to have separate date and time for easy filtering
  const processedAppointments = appointments.map(appt => {
    const dt = new Date(appt.appointment_time);
    const dateStr = formatDate(dt);
    const timeStr = String(dt.getHours()).padStart(2, '0') + ':' + String(dt.getMinutes()).padStart(2, '0');
    return { ...appt, date: dateStr, time: timeStr, patientName: appt.patient ? appt.patient.full_name : 'Unknown' };
  });

  // Appointments tomorrow that haven't been reminded yet
  const remindersDue = processedAppointments.filter(
    a => a.date === tomorrowStr && !a.whatsapp_reminder_sent && a.status === 'Scheduled'
  );

  const handleSendReminder = async (apptId, e) => {
    e.stopPropagation();
    setSendingReminder(apptId);
    await sendWhatsAppReminder(apptId);
    setSendingReminder(null);
  };

  // Shared appointment card renderer
  const renderApptCard = (appt, compact = false) => (
    <div key={appt.id} className={`calendar-appt-card ${compact ? 'compact' : ''}`}>
      <div className="appt-card-content" onClick={() => openEditModal(appt)}>
        {compact && <div className="appt-time-sm">{appt.time}</div>}
        <strong>{appt.patientName}</strong>
        {!compact && <span className="appt-card-notes"> — {appt.notes || 'No notes'}</span>}
        {appt.whatsapp_reminder_sent && (
          <span className="reminder-sent-badge">✅ Reminder Sent</span>
        )}
      </div>
      <div className="appt-card-actions">
        {/* Show reminder button only for tomorrow's scheduled appointments not yet reminded */}
        {appt.date === tomorrowStr && !appt.whatsapp_reminder_sent && appt.status === 'Scheduled' && (
          <button
            className="appt-action-btn reminder-btn"
            onClick={(e) => handleSendReminder(appt.id, e)}
            title="Send WhatsApp Reminder"
            disabled={sendingReminder === appt.id}
          >
            {sendingReminder === appt.id ? '⏳' : '📲'}
          </button>
        )}
        <button className="appt-action-btn edit-btn" onClick={(e) => { e.stopPropagation(); openEditModal(appt); }} title="Edit">✏️</button>
        <button className="appt-action-btn delete-btn" onClick={(e) => { e.stopPropagation(); setConfirmDelete(appt.id); }} title="Delete">🗑️</button>
      </div>
    </div>
  );

  return (
    <div className="appointments-view">
      <header className="page-header">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-subtitle">Manage your clinic schedule.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="view-toggle glass-panel">
            <button className={`toggle-btn ${view === 'day' ? 'active' : ''}`} onClick={() => setView('day')}>Day</button>
            <button className={`toggle-btn ${view === 'week' ? 'active' : ''}`} onClick={() => setView('week')}>Week</button>
            <button className={`toggle-btn ${view === 'month' ? 'active' : ''}`} onClick={() => setView('month')}>Month</button>
          </div>
          <button className="primary-btn glass-panel" onClick={() => openCreateModal(todayStr)}>+ Book Appointment</button>
        </div>
      </header>

      {/* Reminders Due Banner */}
      {remindersDue.length > 0 && (
        <div className="reminders-banner glass-panel">
          <span className="reminders-banner-icon">📲</span>
          <div>
            <strong>{remindersDue.length} patient{remindersDue.length > 1 ? 's' : ''} need{remindersDue.length === 1 ? 's' : ''} a WhatsApp reminder for tomorrow!</strong>
            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>Click the 📲 button on each appointment card below to send.</p>
          </div>
        </div>
      )}

      <div className="calendar-container glass-panel">

        {view === 'day' && (
          <div className="view-day">
            <div className="calendar-header">
              <h2>Today: {todayStr}</h2>
            </div>
            <div className="time-slots">
              {timeSlots.map(time => {
                const apptsAtTime = processedAppointments.filter(a => a.time.startsWith(time.split(':')[0]) && a.date === todayStr);
                return (
                  <div key={time} className="time-row">
                    <div className="time-label">{time}</div>
                    <div className="time-content">
                      {apptsAtTime.length > 0 ? (
                        apptsAtTime.map(appt => renderApptCard(appt))
                      ) : (
                        <div className="empty-slot" onClick={() => openCreateModal(todayStr, time)}>
                          Click to book
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === 'week' && (
          <div className="view-week">
            <div className="week-grid">
              {weekDates.map((dateObj, i) => {
                const dateStr = formatDate(dateObj);
                const dayAppts = processedAppointments.filter(a => a.date === dateStr);
                return (
                  <div key={dateStr} className="week-day-col">
                    <div className="week-day-header">{dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                    <div className="week-day-content" onClick={() => { if (dayAppts.length === 0) openCreateModal(dateStr, '09:00'); }}>
                      {dayAppts.map(appt => renderApptCard(appt, true))}
                      {dayAppts.length === 0 && <div className="empty-slot-indicator">+ Book</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === 'month' && (
          <div className="view-month">
            <div className="month-grid">
              {monthDates.map((dateObj, i) => {
                const dateStr = formatDate(dateObj);
                const dayAppts = processedAppointments.filter(a => a.date === dateStr);
                return (
                  <div key={dateStr} className="month-day-cell" onClick={() => openCreateModal(dateStr, '09:00')}>
                    <div className="month-day-number">{dateObj.getDate()}</div>
                    <div className="month-day-appts">
                      {dayAppts.length > 0 ? (
                        <span className="appt-count-badge">{dayAppts.length} Appt{dayAppts.length > 1 ? 's' : ''}</span>
                      ) : (
                        <span className="empty-day-hover">+ Book</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ width: '500px' }}>
            <h2>{editingAppt ? 'Edit Appointment' : 'Book Appointment'}</h2>
            <form onSubmit={handleSubmit}>
              <select value={formData.patient_id} onChange={e => setFormData({ ...formData, patient_id: e.target.value })} required className="glass-panel" style={{ background: 'var(--bg-primary)' }}>
                <option value="">Select Patient</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required className="glass-panel" style={{ flex: 1, background: 'var(--bg-primary)' }} />
                <input type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} required className="glass-panel" style={{ flex: 1, background: 'var(--bg-primary)' }} />
              </div>
              <input type="text" placeholder="Treatment Type / Notes" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} required className="glass-panel" style={{ background: 'var(--bg-primary)' }} />
              {editingAppt && (
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="glass-panel" style={{ background: 'var(--bg-primary)' }}>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="No-Show">No-Show</option>
                </select>
              )}
              <div className="modal-actions">
                <button type="button" onClick={() => { setShowModal(false); setEditingAppt(null); }} className="text-btn">Cancel</button>
                <button type="submit" className="primary-btn">{editingAppt ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ width: '400px', textAlign: 'center' }}>
            <div className="delete-confirm-icon">🗑️</div>
            <h2>Delete Appointment?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>This action cannot be undone. The appointment will be permanently removed.</p>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button type="button" onClick={() => setConfirmDelete(null)} className="text-btn">Cancel</button>
              <button type="button" onClick={() => handleDelete(confirmDelete)} className="danger-btn">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
