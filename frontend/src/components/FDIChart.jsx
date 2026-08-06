import React, { useState } from 'react';
import './FDIChart.css';

const FDIChart = ({ fdiData, onUpdateTooth }) => {
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [toothStatus, setToothStatus] = useState('Healthy');
  const [toothNotes, setToothNotes] = useState('');

  // Define quadrants from viewer's perspective (looking at patient)
  const q1 = [18, 17, 16, 15, 14, 13, 12, 11]; // Upper Right (Viewer's Left)
  const q2 = [21, 22, 23, 24, 25, 26, 27, 28]; // Upper Left (Viewer's Right)
  const q4 = [48, 47, 46, 45, 44, 43, 42, 41]; // Lower Right (Viewer's Left)
  const q3 = [31, 32, 33, 34, 35, 36, 37, 38]; // Lower Left (Viewer's Right)

  const handleToothClick = (num) => {
    if (!onUpdateTooth) return;
    const data = fdiData[num];
    setSelectedTooth(num);
    setToothStatus(data ? data.status : 'Healthy');
    setToothNotes(data ? data.notes : '');
  };

  const handleSaveTooth = (e) => {
    e.preventDefault();
    onUpdateTooth(selectedTooth, { status: toothStatus, notes: toothNotes });
    setSelectedTooth(null);
  };

  const getStatusClass = (statusStr) => {
    if (!statusStr) return 'healthy';
    const s = statusStr.toLowerCase();
    if (s.includes('cavity') || s.includes('extraction')) return 'decay';
    if (s !== 'healthy' && s !== 'missing') return 'treated';
    return 'healthy';
  };

  // Simple SVG path for a tooth representation
  const renderTooth = (num) => {
    const data = fdiData[num];
    const rawStatus = data ? data.status : 'Healthy';
    const statusClass = getStatusClass(rawStatus);
    
    return (
      <div 
        key={num} 
        className={`tooth-container status-${statusClass} ${onUpdateTooth ? 'clickable' : ''}`} 
        title={`Tooth ${num}${data ? ': ' + data.notes : ''}`}
        onClick={() => handleToothClick(num)}
      >
        <span className="tooth-number">{num}</span>
        <svg viewBox="0 0 24 32" className="tooth-svg">
          {/* Crown */}
          <path d="M4 12 C4 4, 20 4, 20 12 C20 18, 18 20, 12 20 C6 20, 4 18, 4 12 Z" className="tooth-crown" />
          {/* Roots */}
          <path d="M6 18 L4 30 C4 32, 8 32, 8 30 L10 20" className="tooth-root" />
          <path d="M18 18 L20 30 C20 32, 16 32, 16 30 L14 20" className="tooth-root" />
        </svg>
      </div>
    );
  };

  return (
    <div className="fdi-chart-container">
      <div className="arch upper-arch">
        <div className="quadrant q1">
          {q1.map(num => renderTooth(num))}
        </div>
        <div className="arch-divider"></div>
        <div className="quadrant q2">
          {q2.map(num => renderTooth(num))}
        </div>
      </div>
      
      <div className="mouth-divider">
        <span>Upper (Maxillary)</span>
        <div className="divider-line"></div>
        <span>Lower (Mandibular)</span>
      </div>

      <div className="arch lower-arch">
        <div className="quadrant q4">
          {q4.map(num => renderTooth(num))}
        </div>
        <div className="arch-divider"></div>
        <div className="quadrant q3">
          {q3.map(num => renderTooth(num))}
        </div>
      </div>

      <div className="fdi-legend">
        <div className="legend-item"><span className="legend-color healthy"></span> Healthy</div>
        <div className="legend-item"><span className="legend-color treated"></span> Treated/Restored</div>
        <div className="legend-item"><span className="legend-color decay"></span> Needs Attention</div>
      </div>

      {selectedTooth && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ width: '400px' }}>
            <h2>Update Tooth {selectedTooth}</h2>
            <form onSubmit={handleSaveTooth}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Status</label>
                <select 
                  value={toothStatus} 
                  onChange={(e) => setToothStatus(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'var(--glass-bg)', color: 'white', border: '1px solid var(--glass-border)' }}
                >
                  <option value="Healthy">Healthy</option>
                  <option value="Cavity">Cavity / Needs Attention</option>
                  <option value="Endo Treated">Endo Treated / Restored</option>
                  <option value="Missing">Missing</option>
                  <option value="Crown">Crown</option>
                  <option value="Implant">Implant</option>
                  <option value="Extraction Planned">Extraction Planned</option>
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Clinical Notes</label>
                <textarea 
                  value={toothNotes} 
                  onChange={(e) => setToothNotes(e.target.value)}
                  rows="3"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', background: 'var(--glass-bg)', color: 'white', border: '1px solid var(--glass-border)' }}
                  placeholder="Enter any clinical notes here..."
                ></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setSelectedTooth(null)} className="text-btn">Cancel</button>
                <button type="submit" className="primary-btn">Save Tooth</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FDIChart;
