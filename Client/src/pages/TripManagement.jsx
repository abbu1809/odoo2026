import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const statusClass = (s) => {
  const m = { 'Draft': 'draft', 'Dispatched': 'dispatched', 'Completed': 'completed', 'Cancelled': 'cancelled' };
  return `status-badge status-badge-${m[s] || 'draft'}`;
};

const TripManagement = () => {
  const {
    vehicles, drivers, trips,
    createTrip, dispatchTrip, completeTrip, cancelTrip,
    checkIsLicenseExpired, activeUserRole, getPermission
  } = useApp();

  const [form, setForm] = useState({
    source: '', destination: '', vehicleId: '', driverName: '',
    cargoWeight: '', distance: '', revenue: '', date: '2026-07-12'
  });

  const [completeForm, setCompleteForm] = useState({
    tripId: '', finalOdometer: '', fuelConsumed: '', fuelCost: '', revenueValue: ''
  });
  const [showComplete, setShowComplete] = useState(false);

  // Available vehicles/drivers for dispatch
  const availableVehicles = vehicles.filter(v => v.status === 'Available');
  const availableDrivers = drivers.filter(d =>
    d.status === 'Available' && !checkIsLicenseExpired(d.licenseExpiryDate)
  );

  const selectedVehicle = vehicles.find(v => v.registrationNumber === form.vehicleId);

  // Capacity validation
  const cargoNum = Number(form.cargoWeight) || 0;
  const capacityExceeded = selectedVehicle && cargoNum > selectedVehicle.maxCapacity;

  const handleCreate = (e) => {
    e.preventDefault();
    const ok = createTrip(form);
    if (ok) {
      setForm({ source: '', destination: '', vehicleId: '', driverName: '', cargoWeight: '', distance: '', revenue: '', date: '2026-07-12' });
    }
  };

  const handleDispatch = (tripId) => {
    dispatchTrip(tripId);
  };

  const openComplete = (trip) => {
    setCompleteForm({
      tripId: trip.id,
      finalOdometer: '',
      fuelConsumed: '',
      fuelCost: '',
      revenueValue: trip.revenue || ''
    });
    setShowComplete(true);
  };

  const handleComplete = (e) => {
    e.preventDefault();
    completeTrip(completeForm.tripId, completeForm);
    setShowComplete(false);
  };

  // Trip lifecycle stages
  const stages = ['Draft', 'Dispatched', 'Completed'];

  // Live board — all trips sorted by newest
  const sortedTrips = [...trips].sort((a, b) => b.id.localeCompare(a.id));

  const canCreate = getPermission('trips') === 'Full';

  return (
    <div>
      {/* Trip Lifecycle Stepper */}
      <div className="trip-lifecycle">
        {stages.map((stage, i) => (
          <React.Fragment key={stage}>
            <div className={`lifecycle-step${i < 2 ? ' completed' : ''}`}>
              <div className={`lifecycle-dot${i < 2 ? ' completed' : ''}`}>
                {i < 2 && <span style={{ color: '#fff', fontSize: '0.65rem', fontWeight: 700 }}>✓</span>}
              </div>
              {stage}
            </div>
            {i < stages.length - 1 && <div className={`lifecycle-line${i < 1 ? ' completed' : ''}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="split-layout">
        {/* Left: Create Trip Form */}
        {canCreate && (
          <div className="form-panel">
            <h3>Create Trip</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Source</label>
                <input className="form-input" required value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} placeholder="Gandhinagar Depot" />
              </div>
              <div className="form-group">
                <label>Destination</label>
                <input className="form-input" required value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} placeholder="Ahmedabad Hub" />
              </div>
              <div className="form-group">
                <label>Vehicle (Available Only)</label>
                <select className="form-select" required value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })}>
                  <option value="">Select vehicle...</option>
                  {availableVehicles.map(v => (
                    <option key={v.registrationNumber} value={v.registrationNumber}>
                      {v.registrationNumber} – {v.maxCapacity} kg capacity
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Driver (Available Only)</label>
                <select className="form-select" required value={form.driverName} onChange={e => setForm({ ...form, driverName: e.target.value })}>
                  <option value="">Select driver...</option>
                  {availableDrivers.map(d => (
                    <option key={d.name} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Cargo Weight (kg)</label>
                <input className="form-input" type="number" required value={form.cargoWeight} onChange={e => setForm({ ...form, cargoWeight: e.target.value })} placeholder="900" />
              </div>
              <div className="form-group">
                <label>Planned Distance (km)</label>
                <input className="form-input" type="number" value={form.distance} onChange={e => setForm({ ...form, distance: e.target.value })} placeholder="50" />
              </div>

              {/* Capacity Validation */}
              {selectedVehicle && form.cargoWeight && (
                <div className={`validation-box ${capacityExceeded ? 'error' : 'success'}`}>
                  <span>Vehicle Capacity: <strong>{selectedVehicle.maxCapacity} kg</strong></span>
                  <span>Cargo Weight: <strong>{form.cargoWeight} kg</strong></span>
                  {capacityExceeded && (
                    <span style={{ fontWeight: 700 }}>✕ Capacity exceeded by {cargoNum - selectedVehicle.maxCapacity} kg — dispatch blocked</span>
                  )}
                  {!capacityExceeded && (
                    <span style={{ fontWeight: 700 }}>✓ Within capacity</span>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn-action btn-action-dark" disabled={capacityExceeded} style={{ flex: 1, opacity: capacityExceeded ? 0.5 : 1 }}>
                  Dispatch (Create Draft)
                </button>
                <button type="button" className="btn-action btn-action-cancel" onClick={() => setForm({ source: '', destination: '', vehicleId: '', driverName: '', cargoWeight: '', distance: '', revenue: '', date: '2026-07-12' })}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Right: Live Board */}
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14, color: 'var(--charcoal)' }}>Live Board</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sortedTrips.map(trip => (
              <div key={trip.id} style={{
                background: 'var(--white)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-card)',
                padding: '16px 20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>
                      {trip.id.replace('trip-', 'TR').substring(0, 7).toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--charcoal)' }}>
                      {trip.source} → {trip.destination}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--slate-gray)' }}>
                    {trip.vehicleId} / {trip.driverName || 'Unassigned'}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={statusClass(trip.status)}>{trip.status}</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {canCreate && trip.status === 'Draft' && (
                      <>
                        <button className="btn-action btn-action-success" style={{ padding: '4px 14px', fontSize: '0.78rem' }} onClick={() => handleDispatch(trip.id)}>Dispatch</button>
                        <button className="btn-action btn-action-cancel" style={{ padding: '4px 14px', fontSize: '0.78rem' }} onClick={() => cancelTrip(trip.id)}>Cancel</button>
                      </>
                    )}
                    {canCreate && trip.status === 'Dispatched' && (
                      <>
                        <button className="btn-action btn-action-success" style={{ padding: '4px 14px', fontSize: '0.78rem' }} onClick={() => openComplete(trip)}>Complete</button>
                        <button className="btn-action btn-action-cancel" style={{ padding: '4px 14px', fontSize: '0.78rem' }} onClick={() => cancelTrip(trip.id)}>Cancel</button>
                      </>
                    )}
                    {trip.status === 'Dispatched' && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-gray)', alignSelf: 'center' }}>~45 min</span>
                    )}
                    {trip.status === 'Draft' && !trip.vehicleId && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-gray)', alignSelf: 'center' }}>Awaiting vehicle</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {sortedTrips.length === 0 && (
              <div style={{ color: 'var(--slate-gray)', textAlign: 'center', padding: 32 }}>No trips created yet.</div>
            )}
          </div>

          <div style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--slate-gray)' }}>
            On Complete: odometer → Fuel log → Expenses → Vehicle & Driver Available
          </div>
        </div>
      </div>

      {/* Complete Trip Modal */}
      {showComplete && (
        <div className="modal-overlay" onClick={() => setShowComplete(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Complete Trip {completeForm.tripId}</h3>
            <form onSubmit={handleComplete}>
              <div className="form-group">
                <label>Final Odometer (km)</label>
                <input className="form-input" type="number" required value={completeForm.finalOdometer} onChange={e => setCompleteForm({ ...completeForm, finalOdometer: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Fuel Consumed (L)</label>
                  <input className="form-input" type="number" value={completeForm.fuelConsumed} onChange={e => setCompleteForm({ ...completeForm, fuelConsumed: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Fuel Cost ($)</label>
                  <input className="form-input" type="number" value={completeForm.fuelCost} onChange={e => setCompleteForm({ ...completeForm, fuelCost: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Revenue ($)</label>
                <input className="form-input" type="number" value={completeForm.revenueValue} onChange={e => setCompleteForm({ ...completeForm, revenueValue: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn-action btn-action-success" style={{ flex: 1 }}>Mark Complete</button>
                <button type="button" className="btn-action btn-action-secondary" onClick={() => setShowComplete(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripManagement;
