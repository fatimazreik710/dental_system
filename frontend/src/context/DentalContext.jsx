import React, { createContext, useState, useContext, useEffect } from 'react';

const DentalContext = createContext();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const useDental = () => useContext(DentalContext);

export const DentalProvider = ({ children }) => {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [inventory, setInventory] = useState([]);
  
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  
  const isAuthenticated = !!token;

  const authFetch = async (url, options = {}) => {
    const isFormData = options.body instanceof FormData;
    const headers = options.headers || {};
    
    headers['Accept'] = 'application/json';
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, { ...options, headers });
  };

  const login = async (username, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await authFetch(`${API_BASE_URL}/logout`, { method: 'POST' });
      } catch (e) {
        console.error(e);
      }
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        const pRes = await authFetch(`${API_BASE_URL}/patients?all=1`);
        if (pRes.ok) {
          const pData = await pRes.json();
          setPatients(Array.isArray(pData) ? pData : (pData.data || []));
        }

        const aRes = await authFetch(`${API_BASE_URL}/appointments`);
        if (aRes.ok) {
          const aData = await aRes.json();
          setAppointments(Array.isArray(aData) ? aData : []);
        }

        const iRes = await authFetch(`${API_BASE_URL}/inventory`);
        if (iRes.ok) {
          const iData = await iRes.json();
          setInventory(Array.isArray(iData) ? iData : []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  const addAppointment = async (newAppt) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        body: JSON.stringify(newAppt)
      });
      if (res.ok) {
        const aRes = await authFetch(`${API_BASE_URL}/appointments`);
        setAppointments(await aRes.json());
      }
    } catch (e) { console.error(e); }
  };

  const updateAppointment = async (id, data) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const aRes = await authFetch(`${API_BASE_URL}/appointments`);
        setAppointments(await aRes.json());
      }
    } catch (e) { console.error(e); }
  };

  const deleteAppointment = async (id) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/appointments/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const aRes = await authFetch(`${API_BASE_URL}/appointments`);
        setAppointments(await aRes.json());
      }
    } catch (e) { console.error(e); }
  };

  const sendWhatsAppReminder = async (appointmentId) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/appointments/${appointmentId}/send-reminder`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        // Open WhatsApp with pre-filled message
        window.open(data.whatsapp_url, '_blank');
        // Refresh appointments so UI shows reminder sent
        const aRes = await authFetch(`${API_BASE_URL}/appointments`);
        setAppointments(await aRes.json());
        return true;
      }
      return false;
    } catch (e) { console.error(e); return false; }
  };

  const addPatient = async (newPatient) => {
    try {
      const isFormData = newPatient instanceof FormData;
      const res = await authFetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        body: isFormData ? newPatient : JSON.stringify(newPatient)
      });
      if (res.ok) {
        const pRes = await authFetch(`${API_BASE_URL}/patients?all=1`);
        const pData = await pRes.json();
        setPatients(Array.isArray(pData) ? pData : (pData.data || []));
      }
    } catch (e) { console.error(e); }
  };

  const updatePatientBilling = async (patientId, amount, description = 'New Invoice') => {
    try {
      const res = await authFetch(`${API_BASE_URL}/invoices`, {
        method: 'POST',
        body: JSON.stringify({ patient_id: patientId, amount, description })
      });
      if (res.ok) {
        const pRes = await authFetch(`${API_BASE_URL}/patients?all=1`);
        const pData = await pRes.json();
        setPatients(Array.isArray(pData) ? pData : (pData.data || []));
      }
    } catch (e) { console.error(e); }
  };

  const updatePatientFDI = async (patientId, toothNumber, fdiData) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/tooth-charts`, {
        method: 'POST',
        body: JSON.stringify({
          patient_id: patientId,
          tooth_number: toothNumber,
          status: fdiData.status,
          notes: fdiData.notes
        })
      });
      if (res.ok) {
        const pRes = await authFetch(`${API_BASE_URL}/patients?all=1`);
        const pData = await pRes.json();
        setPatients(Array.isArray(pData) ? pData : (pData.data || []));
      }
    } catch (e) { console.error(e); }
  };

  const updateStock = async (itemId, change) => {
    try {
      const item = inventory.find(i => i.id === itemId);
      if (!item) return;
      const newQty = Math.max(0, item.quantity_in_stock + change);
      
      const res = await authFetch(`${API_BASE_URL}/inventory/${itemId}/stock`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity_in_stock: newQty })
      });
      if (res.ok) {
        const iRes = await authFetch(`${API_BASE_URL}/inventory`);
        setInventory(await iRes.json());
      }
    } catch (e) { console.error(e); }
  };

  const addInventoryItem = async (newItem) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        body: JSON.stringify(newItem)
      });
      if (res.ok) {
        const iRes = await authFetch(`${API_BASE_URL}/inventory`);
        if (iRes.ok) {
          const iData = await iRes.json();
          setInventory(Array.isArray(iData) ? iData : []);
        }
      }
    } catch (e) { console.error(e); }
  };

  const addPayment = async (paymentData) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/payments`, {
        method: 'POST',
        body: JSON.stringify(paymentData)
      });
      if (res.ok) {
        const pRes = await authFetch(`${API_BASE_URL}/patients?all=1`);
        if (pRes.ok) {
          const pData = await pRes.json();
          setPatients(Array.isArray(pData) ? pData : (pData.data || []));
        }
      } else {
        const errorData = await res.json();
        alert(`Payment failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (e) { console.error(e); }
  };

  const deletePayment = async (paymentId) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/payments/${paymentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const pRes = await authFetch(`${API_BASE_URL}/patients?all=1`);
        if (pRes.ok) {
          const pData = await pRes.json();
          setPatients(Array.isArray(pData) ? pData : (pData.data || []));
        }
      }
    } catch (e) { console.error(e); }
  };

  return (
    <DentalContext.Provider value={{ 
      patients, appointments, inventory, 
      isAuthenticated, user, token, login, logout,
      addAppointment, updateAppointment, deleteAppointment, sendWhatsAppReminder,
      addPatient, updatePatientBilling, updatePatientFDI, 
      updateStock, addInventoryItem, addPayment, deletePayment 
    }}>
      {children}
    </DentalContext.Provider>
  );
};
