import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2 } from 'lucide-react';
import { EXPENSE_CATEGORIES, humanize, formatMoney, formatDate } from '../utils/enums';

const Expenses = () => {
  const {
    vehicles, fuelLogs, expenses,
    addFuelLog, deleteFuelLog, addGeneralExpense, deleteExpense,
    canWrite, canDelete,
  } = useApp();

  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [fuelForm, setFuelForm] = useState({ vehicleId: '', liters: '', cost: '' });
  const [expForm, setExpForm] = useState({ vehicleId: '', category: 'TOLL', amount: '', description: '' });

  const canEdit = canWrite('expenses');
  const canRemove = canDelete('expenses');

  const vehicleById = (id) => vehicles.find((v) => v.id === id);

  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await addFuelLog(fuelForm);
    setSubmitting(false);
    if (ok) {
      setFuelForm({ vehicleId: '', liters: '', cost: '' });
      setShowFuelModal(false);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await addGeneralExpense(expForm);
    setSubmitting(false);
    if (ok) {
      setExpForm({ vehicleId: '', category: 'TOLL', amount: '', description: '' });
      setShowExpenseModal(false);
    }
  };

  // Total operational cost = sum of fuel costs + other expenses
  const totalOpCost = useMemo(() => {
    const fuelTotal = fuelLogs.reduce((sum, f) => sum + Number(f.cost), 0);
    const expTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    return fuelTotal + expTotal;
  }, [fuelLogs, expenses]);

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
                {canRemove && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {fuelLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontWeight: 600 }}>{vehicleById(log.vehicleId)?.registrationNumber || log.vehicleId}</td>
                  <td>{formatDate(log.date)}</td>
                  <td>{log.liters} L</td>
                  <td>{formatMoney(log.cost)}</td>
                  {canRemove && (
                    <td>
                      <button className="btn-action btn-action-danger" style={{ padding: '4px 10px' }} onClick={() => deleteFuelLog(log.id)}><Trash2 size={14} /></button>
                    </td>
                  )}
                </tr>
              ))}
              {fuelLogs.length === 0 && (
                <tr><td colSpan={canRemove ? 5 : 4} style={{ textAlign: 'center', color: 'var(--slate-gray)', padding: 32 }}>No fuel logs.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Other Expenses Table */}
      <div>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14, color: 'var(--charcoal)' }}>Other Expenses (Toll / Permit / Insurance / Misc)</h4>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Date</th>
                {canRemove && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id}>
                  <td style={{ fontWeight: 600 }}>{vehicleById(exp.vehicleId)?.registrationNumber || exp.vehicleId}</td>
                  <td>{humanize(exp.category)}</td>
                  <td>{formatMoney(exp.amount)}</td>
                  <td>{exp.description || '—'}</td>
                  <td>{formatDate(exp.date)}</td>
                  {canRemove && (
                    <td>
                      <button className="btn-action btn-action-danger" style={{ padding: '4px 10px' }} onClick={() => deleteExpense(exp.id)}><Trash2 size={14} /></button>
                    </td>
                  )}
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr><td colSpan={canRemove ? 6 : 5} style={{ textAlign: 'center', color: 'var(--slate-gray)', padding: 32 }}>No other expenses recorded.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total Cost Summary */}
      <div className="summary-row" style={{ marginTop: 20, borderRadius: 'var(--radius-card)' }}>
        <span>Total Operational Cost (Auto) = Fuel + Other Expenses</span>
        <span className="summary-value">{formatMoney(totalOpCost)}</span>
      </div>

      {/* Fuel Modal */}
      {showFuelModal && (
        <div className="modal-overlay" onClick={() => setShowFuelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Log Fuel Entry</h3>
            <form onSubmit={handleFuelSubmit}>
              <div className="form-group">
                <label>Vehicle</label>
                <select className="form-select" required value={fuelForm.vehicleId} onChange={(e) => setFuelForm({ ...fuelForm, vehicleId: e.target.value })}>
                  <option value="">Select vehicle...</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.registrationNumber}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Liters</label>
                  <input className="form-input" type="number" step="0.01" required value={fuelForm.liters} onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Cost ($)</label>
                  <input className="form-input" type="number" step="0.01" required value={fuelForm.cost} onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn-action btn-action-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'Saving…' : 'Save Fuel Log'}
                </button>
                <button type="button" className="btn-action btn-action-secondary" onClick={() => setShowFuelModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="modal-overlay" onClick={() => setShowExpenseModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add Expense</h3>
            <form onSubmit={handleExpenseSubmit}>
              <div className="form-group">
                <label>Vehicle</label>
                <select className="form-select" required value={expForm.vehicleId} onChange={(e) => setExpForm({ ...expForm, vehicleId: e.target.value })}>
                  <option value="">Select vehicle...</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.registrationNumber}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Category</label>
                  <select className="form-select" value={expForm.category} onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}>
                    {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{humanize(c)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Amount ($)</label>
                  <input className="form-input" type="number" step="0.01" required value={expForm.amount} onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input className="form-input" value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} placeholder="Description..." />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn-action btn-action-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'Saving…' : 'Add Expense'}
                </button>
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
