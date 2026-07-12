import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Plus } from 'lucide-react';

const statusClass = (s) => {
  const m = { 'Available': 'available', 'On Trip': 'on-trip', 'In Shop': 'in-shop', 'Completed': 'completed' };
  return `status-badge status-badge-${m[s] || 'draft'}`;
};

const Expenses = () => {
  const {
    vehicles, fuelLogs, expenses, trips,
    addFuelLog, addGeneralExpense, activeUserRole, getPermission
  } = useApp();

  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const [fuelForm, setFuelForm] = useState({ vehicleId: '', liters: '', cost: '', date: '2026-07-12', odometer: '' });
  const [expForm, setExpForm] = useState({ vehicleId: '', type: 'Toll', cost: '', date: '2026-07-12', description: '' });

  const canEdit = getPermission('expenses') === 'Full';

  const handleFuelSubmit = (e) => {
    e.preventDefault();
    addFuelLog(fuelForm);
    setFuelForm({ vehicleId: '', liters: '', cost: '', date: '2026-07-12', odometer: '' });
    setShowFuelModal(false);
  };

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    addGeneralExpense(expForm);
    setExpForm({ vehicleId: '', type: 'Toll', cost: '', date: '2026-07-12', description: '' });
    setShowExpenseModal(false);
  };

  // Compute total operational cost = sum of all expenses + fuel costs
  const totalOpCost = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.cost, 0);
  }, [expenses]);

  // Trip-linked expenses
  const otherExpenses = useMemo(() => {
    return expenses.filter(e => e.type !== 'Fuel');
  }, [expenses]);

  return (
    <div>
      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 20 }}>
        {canEdit && (
          <>
            <button className="btn-action btn-action-primary" onClick={() => setShowFuelModal(true)}>
              <Plus size={16} /> Log Fuel
            </button>
            <button className="btn-action btn-action-primary" onClick={() => setShowExpenseModal(true)}>
              <Plus size={16} /> Add Expense
            </button>
          </>
        )}
      </div>

      {/* Fuel Logs Table */}
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14, color: 'var(--charcoal)' }}>Fuel Logs</h4>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Date</th>
                <th>Liters</th>
                <th>Fuel Cost</th>
              </tr>
            </thead>
            <tbody>
              {fuelLogs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontWeight: 600 }}>{log.vehicleId}</td>
                  <td>{log.date.replace(/-/g, ' ').replace(/^(\d{4})/, (m) => {
                    const d = new Date(log.date);
                    return `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en', { month: 'short' })} ${d.getFullYear()}`;
                  })}</td>
                  <td>{log.liters} L</td>
                  <td>{log.cost.toLocaleString()}</td>
                </tr>
              ))}
              {fuelLogs.length === 0 && (
                <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--slate-gray)', padding: 32 }}>No fuel logs.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Other Expenses Table */}
      <div>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14, color: 'var(--charcoal)' }}>Other Expenses (Toll / Misc)</h4>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Trip</th>
                <th>Vehicle</th>
                <th>Type</th>
                <th>Cost</th>
                <th>Maint. (Linked)</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {otherExpenses.map(exp => {
                const vehicle = vehicles.find(v => v.registrationNumber === exp.vehicleId);
                return (
                  <tr key={exp.id}>
                    <td style={{ fontWeight: 600 }}>{exp.id.substring(0, 10).toUpperCase()}</td>
                    <td>{exp.vehicleId}</td>
                    <td>{exp.type}</td>
                    <td>{exp.cost.toLocaleString()}</td>
                    <td>{exp.type === 'Maintenance' ? exp.cost.toLocaleString() : '0'}</td>
                    <td style={{ fontWeight: 600 }}>{exp.cost.toLocaleString()}</td>
                  </tr>
                );
              })}
              {otherExpenses.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--slate-gray)', padding: 32 }}>No other expenses recorded.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total Cost Summary */}
      <div className="summary-row" style={{ marginTop: 20, borderRadius: 'var(--radius-card)' }}>
        <span>Total Operational Cost (Auto) = Fuel + Maint</span>
        <span className="summary-value">{totalOpCost.toLocaleString()}</span>
      </div>

      {/* Fuel Modal */}
      {showFuelModal && (
        <div className="modal-overlay" onClick={() => setShowFuelModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Log Fuel Entry</h3>
            <form onSubmit={handleFuelSubmit}>
              <div className="form-group">
                <label>Vehicle</label>
                <select className="form-select" required value={fuelForm.vehicleId} onChange={e => setFuelForm({ ...fuelForm, vehicleId: e.target.value })}>
                  <option value="">Select vehicle...</option>
                  {vehicles.map(v => (
                    <option key={v.registrationNumber} value={v.registrationNumber}>{v.registrationNumber}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Liters</label>
                  <input className="form-input" type="number" required value={fuelForm.liters} onChange={e => setFuelForm({ ...fuelForm, liters: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Cost ($)</label>
                  <input className="form-input" type="number" required value={fuelForm.cost} onChange={e => setFuelForm({ ...fuelForm, cost: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Date</label>
                  <input className="form-input" type="date" value={fuelForm.date} onChange={e => setFuelForm({ ...fuelForm, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Odometer</label>
                  <input className="form-input" type="number" value={fuelForm.odometer} onChange={e => setFuelForm({ ...fuelForm, odometer: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn-action btn-action-primary" style={{ flex: 1 }}>Save Fuel Log</button>
                <button type="button" className="btn-action btn-action-secondary" onClick={() => setShowFuelModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="modal-overlay" onClick={() => setShowExpenseModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Add Expense</h3>
            <form onSubmit={handleExpenseSubmit}>
              <div className="form-group">
                <label>Vehicle</label>
                <select className="form-select" required value={expForm.vehicleId} onChange={e => setExpForm({ ...expForm, vehicleId: e.target.value })}>
                  <option value="">Select vehicle...</option>
                  {vehicles.map(v => (
                    <option key={v.registrationNumber} value={v.registrationNumber}>{v.registrationNumber}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Type</label>
                  <select className="form-select" value={expForm.type} onChange={e => setExpForm({ ...expForm, type: e.target.value })}>
                    {['Toll', 'Permit', 'Insurance', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Cost ($)</label>
                  <input className="form-input" type="number" required value={expForm.cost} onChange={e => setExpForm({ ...expForm, cost: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input className="form-input" value={expForm.description} onChange={e => setExpForm({ ...expForm, description: e.target.value })} placeholder="Description..." />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn-action btn-action-primary" style={{ flex: 1 }}>Add Expense</button>
                <button type="button" className="btn-action btn-action-secondary" onClick={() => setShowExpenseModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
