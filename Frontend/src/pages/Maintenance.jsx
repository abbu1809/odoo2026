import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Wrench, X, Check, Calendar, AlertTriangle } from 'lucide-react';

const Maintenance = () => {
  const {
    maintenanceLogs,
    vehicles,
    addMaintenanceLog,
    completeMaintenanceLog,
    activeUserRole
  } = useApp();

  const isManager = activeUserRole === 'Fleet Manager';

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [vehicleId, setVehicleId] = useState('');
  const [type, setType] = useState('Oil Change');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState('2026-07-12');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Active');

  // Filter vehicles that can go into maintenance (i.e. not retired)
  const activeFleet = vehicles.filter(v => v.status !== 'Retired');

  // Open modal
  const handleOpenAdd = () => {
    if (!isManager) return;
    setVehicleId(activeFleet[0]?.registrationNumber || '');
    setType('Oil Change');
    setCost('');
    setDate('2026-07-12');
    setDescription('');
    setStatus('Active');
    setModalOpen(true);
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!vehicleId || !type || !cost) return;

    const success = addMaintenanceLog({
      vehicleId,
      type,
      cost: Number(cost),
      date,
      description,
      status
    });

    if (success) {
      setModalOpen(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Title Bar */}
      <div className="flex-between">
        <div>
          <span className="eyebrow" style={{ marginBottom: '8px' }}>• HEALTH & UPKEEP</span>
          <h2 style={{ fontWeight: 700 }}>Maintenance Scheduler</h2>
        </div>

        {isManager ? (
          <button onClick={handleOpenAdd} className="btn-primary" style={{ gap: '6px' }}>
            <Plus size={16} /> Schedule Maintenance
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--slate-gray)', fontSize: '0.85rem' }}>
            <AlertTriangle size={16} style={{ color: 'var(--light-signal-orange)' }} />
            <span>Switch to <b>Fleet Manager</b> to submit maintenance records.</span>
          </div>
        )}
      </div>

      {/* Board & Table Panel */}
      <div className="grid-3" style={{ alignItems: 'flex-start' }}>
        
        {/* Statistics & Overview Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card-elevated" style={{ borderLeft: '4px solid var(--signal-orange)' }}>
            <span className="eyebrow" style={{ marginBottom: '8px' }}>• OUT OF SERVICE</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 700, lineHeight: 1 }}>
              {vehicles.filter(v => v.status === 'In Shop').length}
            </h3>
            <p style={{ color: 'var(--slate-gray)', fontSize: '0.85rem', marginTop: '6px' }}>
              Vehicles currently 'In Shop' and offline from dispatches
            </p>
          </div>

          <div className="card-elevated" style={{ borderLeft: '4px solid var(--ink-black)' }}>
            <span className="eyebrow" style={{ marginBottom: '8px' }}>• BUDGET spent</span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 700, lineHeight: 1 }}>
              ${maintenanceLogs.reduce((sum, l) => sum + l.cost, 0).toLocaleString()}
            </h3>
            <p style={{ color: 'var(--slate-gray)', fontSize: '0.85rem', marginTop: '6px' }}>
              Total lifetime maintenance spending across all fleet units
            </p>
          </div>

        </div>

        {/* Master Maintenance Log Table Right Column (span 2) */}
        <div className="table-container card-elevated" style={{ gridColumn: 'span 2', padding: 0 }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--canvas-cream)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontWeight: 700 }}>Maintenance Action log</h4>
            <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
              {maintenanceLogs.length} Records
            </span>
          </div>

          {maintenanceLogs.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--slate-gray)' }}>
              <Wrench size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
              <h3 style={{ marginBottom: '8px', fontSize: '1.2rem' }}>No maintenance records</h3>
              <p>Fleet assets are running smoothly.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vehicle</th>
                  <th>Maintenance Type</th>
                  <th>Cost</th>
                  <th>Description</th>
                  <th>Status</th>
                  {isManager && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {maintenanceLogs.map((log) => (
                  <tr key={log.id} style={{ opacity: log.status === 'Completed' ? 0.75 : 1 }}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                      <Calendar size={14} style={{ color: 'var(--slate-gray)' }} /> {log.date}
                    </td>
                    <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{log.vehicleId}</td>
                    <td><b>{log.type}</b></td>
                    <td>${log.cost.toLocaleString()}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--slate-gray)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.description}
                    </td>
                    <td>
                      <span className={`badge ${log.status === 'Active' ? 'badge-warning' : 'badge-success'}`}>
                        {log.status}
                      </span>
                    </td>
                    {isManager && (
                      <td style={{ textAlign: 'right' }}>
                        {log.status === 'Active' ? (
                          <button
                            onClick={() => completeMaintenanceLog(log.id)}
                            className="btn-primary"
                            style={{ 
                              padding: '4px 10px', 
                              fontSize: '0.75rem', 
                              borderRadius: '10px', 
                              gap: '4px',
                              backgroundColor: '#4CAF50',
                              borderColor: '#4CAF50'
                            }}
                          >
                            <Check size={12} /> Resolve
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#1D6930', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Check size={12} /> Done
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* SCHEDULE MAINTENANCE DIALOG */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex-between" style={{ marginBottom: '24px', borderBottom: '1px solid var(--canvas-cream)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Record Maintenance Entry</h3>
              <button 
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-gray)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="form-group">
                <label>Select Vehicle (Active Fleet)</label>
                {activeFleet.length === 0 ? (
                  <select disabled className="form-select" style={{ borderColor: 'var(--signal-orange)' }}>
                    <option>No Active Vehicles Available</option>
                  </select>
                ) : (
                  <select
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="form-select"
                    required
                  >
                    {activeFleet.map(v => (
                      <option key={v.registrationNumber} value={v.registrationNumber}>
                        {v.registrationNumber} - {v.name} ({v.status})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Maintenance Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="form-select"
                  >
                    <option value="Oil Change">Oil Change</option>
                    <option value="Tire Rotation">Tire Rotation</option>
                    <option value="Brake Replacement">Brake Replacement</option>
                    <option value="Engine Tuning">Engine Tuning</option>
                    <option value="Suspension Repair">Suspension Repair</option>
                    <option value="Electrical Repair">Electrical Repair</option>
                    <option value="Other Upkeep">Other Upkeep</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Maintenance Date</label>
                  <input 
                    type="date" 
                    required 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Job Cost ($)</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    placeholder="e.g. 150" 
                    value={cost} 
                    onChange={(e) => setCost(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Current Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="form-select"
                  >
                    <option value="Active">Active (Flips status to 'In Shop')</option>
                    <option value="Completed">Completed (Adds direct cost expense)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Job Details / Description</label>
                <textarea 
                  placeholder="Describe the diagnostics, parts, or repairs done..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                  rows="3"
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={activeFleet.length === 0}
                >
                  Register Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Maintenance;
