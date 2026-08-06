import { useState, useEffect } from 'react'
import { useDental } from './context/DentalContext'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Appointments from './components/Appointments'
import Patients from './components/Patients'
import Inventory from './components/Inventory'
import Settings from './components/Settings'
import Login from './components/Login'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { isAuthenticated, user } = useDental();

  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'patients' && <Patients />}
        {activeTab === 'appointments' && <Appointments />}
        {activeTab === 'inventory' && <Inventory />}
        {activeTab === 'settings' && <Settings />}
      </main>
    </div>
  )
}

export default App
