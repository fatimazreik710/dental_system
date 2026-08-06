import React, { useState } from 'react';
import { useDental } from '../context/DentalContext';
import './Inventory.css';

const Inventory = () => {
  const { inventory, updateStock, addInventoryItem } = useDental();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ item_name: '', category: 'Consumables', quantity_in_stock: '', unit: '', min_reorder_level: '' });

  const filteredInventory = inventory.filter(item => 
    item.item_name.toLowerCase().includes(search.toLowerCase()) || 
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.item_name || !newItem.quantity_in_stock || !newItem.unit) return;
    addInventoryItem({
      ...newItem,
      quantity_in_stock: parseInt(newItem.quantity_in_stock),
      min_reorder_level: parseInt(newItem.min_reorder_level) || 10
    });
    setShowAddModal(false);
    setNewItem({ item_name: '', category: 'Consumables', quantity_in_stock: '', unit: '', min_reorder_level: '' });
  };

  return (
    <div className="inventory-view">
      <header className="page-header">
        <div>
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-subtitle">Track and manage clinic supplies and tools.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="text" 
            placeholder="Search items or categories..." 
            className="search-input glass-panel"
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
          <button className="primary-btn glass-panel" onClick={() => setShowAddModal(true)}>+ Add Item</button>
        </div>
      </header>

      <div className="inventory-grid glass-panel">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th>Status</th>
              <th>Stock Level</th>
              <th>Quick Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map(item => {
              const isLowStock = item.quantity_in_stock <= item.min_reorder_level;
              return (
                <tr key={item.id} className={isLowStock ? 'row-warning' : ''}>
                  <td><strong>{item.item_name}</strong></td>
                  <td>{item.category}</td>
                  <td>
                    {isLowStock ? (
                      <span className="status-badge danger">Low Stock</span>
                    ) : (
                      <span className="status-badge success">In Stock</span>
                    )}
                  </td>
                  <td>
                    <span className={`stock-count ${isLowStock ? 'danger-text' : ''}`}>
                      {item.quantity_in_stock} {item.unit}
                    </span>
                  </td>
                  <td>
                    <div className="quick-stock-actions">
                      <button className="stock-btn minus" onClick={() => updateStock(item.id, -1)}>-</button>
                      <button className="stock-btn plus" onClick={() => updateStock(item.id, 1)}>+</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <h2>Add New Supply</h2>
            <form onSubmit={handleAddItem}>
              <input type="text" placeholder="Item Name (e.g. Cotton Rolls)" value={newItem.item_name} onChange={e => setNewItem({...newItem, item_name: e.target.value})} required />
              <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} required>
                <option value="Consumables">Consumables</option>
                <option value="Tools">Tools</option>
                <option value="Materials">Materials</option>
                <option value="Anesthetics">Anesthetics</option>
                <option value="Other">Other</option>
              </select>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="number" placeholder="Initial Qty" value={newItem.quantity_in_stock} onChange={e => setNewItem({...newItem, quantity_in_stock: e.target.value})} required style={{ flex: 1 }} />
                <input type="text" placeholder="Unit (e.g. packs)" value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} required style={{ flex: 1 }} />
              </div>
              <input type="number" placeholder="Low Stock Warning Threshold (e.g. 10)" value={newItem.min_reorder_level} onChange={e => setNewItem({...newItem, min_reorder_level: e.target.value})} />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="text-btn">Cancel</button>
                <button type="submit" className="primary-btn">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
