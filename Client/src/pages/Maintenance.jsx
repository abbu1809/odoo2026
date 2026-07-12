import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatMoney } from '../utils/enums';

const Maintenance = () => {
  const { vehicles, maintenanceLogs, addMaintenanceLog, completeMaintenanceLog, canWrite } = useApp();

  const [form, setForm] = useState({ vehicleId: '', type: '', cost: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const canEdit = canWrite('maintenance');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await addMaintenanceLog(form);
    setSubmitting(false);
    if (ok) {
      setForm({ vehicleId: '', type: '', cost: '', description: '' });
    }
  };

  const handleResolve = async (id) => {
    setBusyId(id);
    await completeMaintenanceLog(id);
    setBusyId(null);
  };

  const vehicleById = (id) => vehicles.find((v) => v.id === id);
  const nonRetiredVehicles = vehicles.filter((v) => v.status !== 'RETIRED');

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
                <select className="form-select" required value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
                  <option value="">Select vehicle...</option>
                  {nonRetiredVehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.registrationNumber}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Service Type</label>
                <input className="form-input" required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Oil Change" />
              </div>
              <div className="form-group">
                <label>Cost</label>
                <input className="form-input" type="number" required value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="2500" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional notes" />
              </div>
              <button type="submit" className="btn-action btn-action-primary" style={{ width: '100%', marginTop: 4 }} disabled={submitting}>
                {submitting ? 'Saving…' : 'Save'}
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
                {maintenanceLogs.map((log) => {
                  const vehicle = vehicleById(log.vehicleId);
                  return (
                    <tr key={log.id}>
                      <td style={{ fontWeight: 600 }}>{vehicle?.registrationNumber || log.vehicleId}</td>
                      <td>{log.type}</td>
                      <td>{formatMoney(log.cost)}</td>
                      <td><span className={`status-badge status-badge-${log.status === 'OPEN' ? 'in-shop' : 'completed'}`}>{log.status === 'OPEN' ? 'In Shop' : 'Closed'}</span></td>
                      {canEdit && (
                        <td>
                          {log.status === 'OPEN' && (
                            <button
                              className="btn-action btn-action-success"
                              style={{ padding: '4px 14px', fontSize: '0.78rem' }}
                              disabled={busyId === log.id}
                              onClick={() => handleResolve(log.id)}
                            >
                              Resolve
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
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
