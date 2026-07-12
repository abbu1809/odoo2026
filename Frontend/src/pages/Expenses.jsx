import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Fuel, DollarSign, Calendar, FileText, Landmark, Settings, AlertTriangle } from 'lucide-react';

const Expenses = () => {
  const {
    vehicles,
    expenses,
    fuelLogs,
    addFuelLog,
    addGeneralExpense,
    getVehicleOperationalCost,
    activeUserRole
  } = useApp();

  const isSafetyOfficer = activeUserRole === 'Safety Officer';
  const canWrite = !isSafetyOfficer; // Fleet Manager, Driver, Financial Analyst can write expenses

  // Modals
  const [fuelModalOpen, setFuelModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  // Fuel Form State
  const [fuelVehicleId, setFuelVehicleId] = useState('');
  const [liters, setLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [fuelDate, setFuelDate] = useState('2026-07-12');
  const [fuelOdo, setFuelOdo] = useState('');

  // General Expense Form State
  const [expVehicleId, setExpVehicleId] = useState('');
  const [expType, setExpType] = useState('Toll');
  const [expCost, setExpCost] = useState('');
  const [expDate, setExpDate] = useState('2026-07-12');
  const [expDesc, setExpDesc] = useState('');

  const activeVehicles = vehicles.filter(v => v.status !== 'Retired');

  // Open Fuel
  const handleOpenFuel = () => {
    if (!canWrite) return;
    setFuelVehicleId(activeVehicles[0]?.registrationNumber || '');
    setLiters('');
    setFuelCost('');
    setFuelDate('2026-07-12');
    // Pre-populate odometer from vehicle
    const firstVeh = activeVehicles[0];
    setFuelOdo(firstVeh ? firstVeh.odometer : '');
    setFuelModalOpen(true);
  };

  // Open General
  const handleOpenExpense = () => {
    if (!canWrite) return;
    setExpVehicleId(activeVehicles[0]?.registrationNumber || '');
    setExpType('Toll');
    setExpCost('');
    setExpDate('2026-07-12');
    setExpDesc('');
    setExpenseModalOpen(true);
  };

  // Handle Fuel Vehicle Select Change to auto-fill Odometer
  const handleFuelVehicleChange = (val) => {
    setFuelVehicleId(val);
    const target = vehicles.find(v => v.registrationNumber === val);
    if (target) {
      setFuelOdo(target.odometer);
    }
  };

  // Submit Fuel
  const handleFuelSubmit = (e) => {
    e.preventDefault();
    if (!fuelVehicleId || !liters || !fuelCost || !fuelOdo) return;

    // Validate odometer
    const target = vehicles.find(v => v.registrationNumber === fuelVehicleId);
    if (target && Number(fuelOdo) < target.odometer) {
      alert(`Odometer cannot be less than current odometer (${target.odometer} km)`);
      return;
    }

    const success = addFuelLog({
      vehicleId: fuelVehicleId,
      liters: Number(liters),
      cost: Number(fuelCost),
      date: fuelDate,
      odometer: Number(fuelOdo)
    });

    if (success) {
      setFuelModalOpen(false);
    }
  };

  // Submit Expense
  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    if (!expVehicleId || !expCost || !expDesc.trim()) return;

    const success = addGeneralExpense({
      vehicleId: expVehicleId,
      type: expType,
      cost: Number(expCost),
      date: expDate,
      description: expDesc.trim()
    });

    if (success) {
      setExpenseModalOpen(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Title Bar */}
      <div className="flex-between">
        <div>
          <span className="eyebrow" style={{ marginBottom: '8px' }}>• OPERATIONAL LEDGER</span>
          <h2 style={{ fontWeight: 700 }}>Fuel & Expense Management</h2>
        </div>

        {canWrite ? (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleOpenFuel} className="btn-secondary" style={{ gap: '6px', borderColor: 'var(--ink-black)' }}>
              <Fuel size={16} /> Log Fuel Refuel
            </button>
            <button onClick={handleOpenExpense} className="btn-primary" style={{ gap: '6px' }}>
              <Plus size={16} /> Log General Expense
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--slate-gray)', fontSize: '0.85rem' }}>
            <AlertTriangle size={16} />
            <span>Safety Officer mode: Read-only ledger view.</span>
          </div>
        )}
      </div>

      {/* Vehicles Totals & General Ledger Grid */}
      <div className="grid-3" style={{ alignItems: 'flex-start' }}>
        
        {/* Left Column: Cost Summary Per Vehicle (span 1) */}
        <div className="card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, borderBottom: '1px solid var(--canvas-cream)', paddingBottom: '12px' }}>
            Lifetime Cost per Asset
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {vehicles.filter(v => v.status !== 'Retired').map((veh) => {
              const totalCost = getVehicleOperationalCost(veh.registrationNumber);
              return (
                <div key={veh.registrationNumber} className="card-raised" style={{ padding: '14px' }}>
                  <div className="flex-between" style={{ marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{veh.registrationNumber}</span>
                    <span style={{ fontWeight: 700, color: 'var(--ink-black)' }}>${totalCost.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--slate-gray)' }}>
                    <span>Type: {veh.type}</span>
                    <span>Odometer: {veh.odometer.toLocaleString()} km</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Ledger Entry Logs (span 2) */}
        <div className="table-container card-elevated" style={{ gridColumn: 'span 2', padding: 0 }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--canvas-cream)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontWeight: 700 }}>Operational Ledger Logs</h4>
            <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
              {expenses.length} Records
            </span>
          </div>

          {expenses.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--slate-gray)' }}>
              <DollarSign size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
              <h3 style={{ marginBottom: '8px', fontSize: '1.2rem' }}>No expenses logged</h3>
              <p>Log fuel refuels or tolls to build the operational ledger.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vehicle</th>
                  <th>Type</th>
                  <th>Cost</th>
                  <th>Ledger Details / Description</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                      <Calendar size={14} style={{ color: 'var(--slate-gray)' }} /> {expense.date}
                    </td>
                    <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{expense.vehicleId}</td>
                    <td>
                      <span className={`badge ${
                        expense.type === 'Fuel' ? 'badge-info' : 
                        expense.type === 'Maintenance' ? 'badge-warning' : 'badge-neutral'
                      }`}>
                        {expense.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>${expense.cost.toLocaleString()}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--slate-gray)' }}>
                      {expense.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* LOG FUEL MODAL */}
      {fuelModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex-between" style={{ marginBottom: '24px', borderBottom: '1px solid var(--canvas-cream)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Log Fuel Consumption</h3>
              <button onClick={() => setFuelModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-gray)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={fuelSubmit => handleFuelSubmit(fuelSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="form-group">
                <label>Select Vehicle</label>
                {activeVehicles.length === 0 ? (
                  <select disabled className="form-select">
                    <option>No Vehicles Available</option>
                  </select>
                ) : (
                  <select 
                    value={fuelVehicleId} 
                    onChange={(e) => handleFuelVehicleChange(e.target.value)}
                    className="form-select"
                    required
                  >
                    {activeVehicles.map(v => (
                      <option key={v.registrationNumber} value={v.registrationNumber}>
                        {v.registrationNumber} - {v.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Fuel Quantity (Liters)</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    step="0.1"
                    placeholder="e.g. 35" 
                    value={liters} 
                    onChange={(e) => setLiters(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Fuel Total Cost ($)</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    placeholder="e.g. 70" 
                    value={fuelCost} 
                    onChange={(e) => setFuelCost(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Odometer at Refuel (km)</label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    placeholder="e.g. 25000" 
                    value={fuelOdo} 
                    onChange={(e) => setFuelOdo(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Date of Fueling</label>
                  <input 
                    type="date" 
                    required 
                    value={fuelDate} 
                    onChange={(e) => setFuelDate(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setFuelModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={activeVehicles.length === 0}>Record Fuel Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG EXPENSE MODAL */}
      {expenseModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex-between" style={{ marginBottom: '24px', borderBottom: '1px solid var(--canvas-cream)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Log Operational Expense</h3>
              <button onClick={() => setExpenseModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-gray)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={expenseSubmit => handleExpenseSubmit(expenseSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="form-group">
                <label>Select Vehicle</label>
                {activeVehicles.length === 0 ? (
                  <select disabled className="form-select">
                    <option>No Vehicles Available</option>
                  </select>
                ) : (
                  <select 
                    value={expVehicleId} 
                    onChange={(e) => setExpVehicleId(e.target.value)}
                    className="form-select"
                    required
                  >
                    {activeVehicles.map(v => (
                      <option key={v.registrationNumber} value={v.registrationNumber}>
                        {v.registrationNumber} - {v.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid-3">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Expense Category</label>
                  <select 
                    value={expType} 
                    onChange={(e) => setExpType(e.target.value)}
                    className="form-select"
                  >
                    <option value="Toll">Toll Fee</option>
                    <option value="Permit">Route Permit</option>
                    <option value="Insurance">Insurance Surcharge</option>
                    <option value="Other">Other Operational Cost</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Cost ($)</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    placeholder="e.g. 25" 
                    value={expCost} 
                    onChange={(e) => setExpCost(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Expense Date</label>
                <input 
                  type="date" 
                  required 
                  value={expDate} 
                  onChange={(e) => setExpDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Expense Details / Description</label>
                <textarea 
                  required
                  placeholder="Describe tolls paid, permits purchased, etc..."
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="form-textarea"
                  rows="3"
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setExpenseModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={activeVehicles.length === 0}>Record Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Expenses;
