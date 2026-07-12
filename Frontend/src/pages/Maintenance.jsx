import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const statusClass = (s) => {
  const m = { 'Active': 'in-shop', 'Completed': 'completed' };
  return `status-badge status-badge-${m[s] || 'draft'}`;
};

const Maintenance = () => {
  const { vehicles, maintenanceLogs, addMaintenanceLog, completeMaintenanceLog, activeUserRole, getPermission } = useApp();

  const [form, setForm] = useState({
    vehicleId: '', type: '', cost: '', date: '2026-07-12', description: '', status: 'Active'
  });

  const canEdit = getPermission('maintenance') === 'Full';

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = addMaintenanceLog(form);
    if (ok) {
      setForm({ vehicleId: '', type: '', cost: '', date: '2026-07-12', description: '', status: 'Active' });
    }
  };

  const nonRetiredVehicles = vehicles.filter(v => v.status !== 'Retired');

  return (
    <div>
      <div className="split-layout">
        {/* Left: Log Service Record Form */}
        {canEdit && (
          <div className="form-panel">
            <h3>Log Service Record</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Vehicle</label>
                <select className="form-select" required value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })}>
                  <option value="">Select vehicle...</option>
                  {nonRetiredVehicles.map(v => (
                    <option key={v.registrationNumber} value={v.registrationNumber}>{v.registrationNumber}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Service Type</label>
                <input className="form-input" required value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} placeholder="Oil Change" />
              </div>
              <div className="form-group">
                <label>Cost</label>
                <input className="form-input" type="number" required value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} placeholder="2500" />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input className="form-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <button type="submit" className="btn-action btn-action-primary" style={{ width: '100%', marginTop: 4 }}>
                Save
              </button>
            </form>

            {/* Status Flow Diagram */}
            <div className="status-flow" style={{ marginTop: 20 }}>
              <span style={{ color: '#4CAF50', fontWeight: 600 }}>Available</span>
              <span className="arrow">—— logging active record ——→</span>
              <span style={{ color: '#FF9800', fontWeight: 600 }}>In Shop</span>
            </div>
            <div className="status-flow">
              <span style={{ color: '#FF9800', fontWeight: 600 }}>In Shop</span>
              <span className="arrow">—— closing active record ——→</span>
              <span style={{ color: '#4CAF50', fontWeight: 600 }}>Available</span>
            </div>

            <div className="rule-info" style={{ marginTop: 12 }}>
              <strong>Auto:</strong> In Shop vehicles are removed from the dispatch pool.
            </div>
          </div>
        )}

        {/* Right: Service Log Table */}
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14, color: 'var(--charcoal)' }}>Service Log</h4>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Service</th>
                  <th>Cost</th>
                  <th>Status</th>
                  {canEdit && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {maintenanceLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 600 }}>{log.vehicleId}</td>
                    <td>{log.type}</td>
                    <td>{log.cost.toLocaleString()}</td>
                    <td><span className={statusClass(log.status)}>{log.status === 'Active' ? 'In Shop' : 'Completed'}</span></td>
                    {canEdit && (
                      <td>
                        {log.status === 'Active' && (
                          <button
                            className="btn-action btn-action-success"
                            style={{ padding: '4px 14px', fontSize: '0.78rem' }}
                            onClick={() => completeMaintenanceLog(log.id)}
                          >
                            Resolve
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {maintenanceLogs.length === 0 && (
                  <tr><td colSpan={canEdit ? 5 : 4} style={{ textAlign: 'center', color: 'var(--slate-gray)', padding: 32 }}>No maintenance records.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
