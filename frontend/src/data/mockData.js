export const initialPatients = [
  {
    id: 'p1',
    name: 'Sarah Jenkins',
    age: 34,
    phone: '(555) 123-4567',
    email: 'sarah.j@example.com',
    medications: ['Ibuprofen as needed', 'Penicillin (Allergic)'],
    medicalHistory: ['Asthma'],
    notes: 'Patient experiences anxiety during drills. Needs extra numbing.',
    fdiChart: {
      11: { status: 'healthy', notes: '' },
      14: { status: 'treated', notes: 'Crown fitted 2024' },
      46: { status: 'decay', notes: 'Needs filling' },
    },
    billing: {
      totalInvoiced: 1250,
      paid: 800,
      balance: 450,
      history: [
        { id: 'b1', date: '2025-10-12', description: 'Root Canal (Tooth 46)', amount: 800, status: 'Paid' },
        { id: 'b2', date: '2026-02-15', description: 'Crown Fitting', amount: 450, status: 'Pending' }
      ]
    }
  },
  {
    id: 'p2',
    name: 'Michael Chang',
    age: 45,
    phone: '(555) 987-6543',
    email: 'm.chang@example.com',
    medications: ['Lisinopril 10mg'],
    medicalHistory: ['Hypertension'],
    notes: 'Regular checkups every 6 months. Good oral hygiene.',
    fdiChart: {},
    billing: {
      totalInvoiced: 300,
      paid: 300,
      balance: 0,
      history: [
        { id: 'b3', date: '2026-08-01', description: 'Routine Cleaning & Exam', amount: 150, status: 'Paid' },
        { id: 'b4', date: '2026-02-01', description: 'Routine Cleaning & Exam', amount: 150, status: 'Paid' }
      ]
    }
  }
];

export const initialAppointments = [
  { id: 'a1', patientId: 'p1', patientName: 'Sarah Jenkins', date: new Date().toISOString().split('T')[0], time: '09:00', duration: 60, type: 'Root Canal', status: 'Scheduled' },
  { id: 'a2', patientId: 'p2', patientName: 'Michael Chang', date: new Date().toISOString().split('T')[0], time: '10:30', duration: 30, type: 'Checkup & Cleaning', status: 'Scheduled' }
];

export const initialInventory = [
  { id: 'i1', name: 'Dental Mirrors', category: 'Tools', quantity: 45, unit: 'pcs', lowStockThreshold: 10 },
  { id: 'i2', name: 'Latex Gloves (M)', category: 'Consumables', quantity: 8, unit: 'boxes', lowStockThreshold: 10 },
  { id: 'i3', name: 'Composite Resin', category: 'Materials', quantity: 24, unit: 'syringes', lowStockThreshold: 15 },
  { id: 'i4', name: 'Lidocaine 2%', category: 'Anesthetics', quantity: 50, unit: 'cartridges', lowStockThreshold: 20 },
  { id: 'i5', name: 'Cotton Rolls', category: 'Consumables', quantity: 120, unit: 'packs', lowStockThreshold: 30 },
];
