import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { humanize, slug } from '../utils/enums';

const TripManagement = () => {
  const {
    vehicles, drivers, trips,
    createTrip, dispatchTrip, completeTrip, cancelTrip,
    checkIsLicenseExpired, canWrite,
  } = useApp();

  const [form, setForm] = useState({
    source: '', destination: '', vehicleId: '', driverId: '',
    cargoWeightKg: '', plannedDistanceKm: '',
  });

  const [completeForm, setCompleteForm] = useState({
    tripId: '', finalOdometerKm: '', fuelConsumedLtr: '', revenue: '',
  });
  const [showComplete, setShowComplete] = useState(false);
  const [busyTripId, setBusyTripId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const vehicleById = (id) => vehicles.find((v) => v.id === id);
  const driverById = (id) => drivers.find((d) => d.id === id);

  // Available vehicles/drivers for dispatch
  const availableVehicles = vehicles.filter((v) => v.status === 'AVAILABLE');
  const availableDrivers = drivers.filter((d) =>
    d.status === 'AVAILABLE' && !checkIsLicenseExpired(d.licenseExpiryDate)
  );

  const selectedVehicle = vehicleById(form.vehicleId);

  // Capacity validation
  const cargoNum = Number(form.cargoWeightKg) || 0;
  const capacityExceeded = selectedVehicle && cargoNum > Number(selectedVehicle.maxLoadCapacityKg);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await createTrip(form);
    setSubmitting(false);
    if (ok) {
      setForm({ source: '', destination: '', vehicleId: '', driverId: '', cargoWeightKg: '', plannedDistanceKm: '' });
    }
  };

  const handleDispatch = async (tripId) => {
    setBusyTripId(tripId);
    await dispatchTrip(tripId);
    setBusyTripId(null);
  };

  const handleCancel = async (tripId) => {
    setBusyTripId(tripId);
    await cancelTrip(tripId);
    setBusyTripId(null);
  };

  const openComplete = (trip) => {
    setCompleteForm({
      tripId: trip.id,
      finalOdometerKm: '',
      fuelConsumedLtr: '',
      revenue: trip.revenue || '',
    });
    setShowComplete(true);
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await completeTrip(completeForm.tripId, completeForm);
    setSubmitting(false);
    if (ok) setShowComplete(false);
  };

  // Trip lifecycle stages
  const stages = ['DRAFT', 'DISPATCHED', 'COMPLETED'];

  // Live board — all trips sorted by newest
  const sortedTrips = [...trips].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const canCreate = canWrite('trips');

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
              {humanize(stage)}
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
                <input className="form-input" required value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Gandhinagar Depot" />
              </div>
              <div className="form-group">
                <label>Destination</label>
                <input className="form-input" required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="Ahmedabad Hub" />
              </div>
              <div className="form-group">
                <label>Vehicle (Available Only)</label>
                <select className="form-select" required value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
                  <option value="">Select vehicle...</option>
                  {availableVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} – {Number(v.maxLoadCapacityKg).toLocaleString()} kg capacity
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Driver (Available Only)</label>
                <select className="form-select" required value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })}>
                  <option value="">Select driver...</option>
                  {availableDrivers.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Cargo Weight (kg)</label>
                <input className="form-input" type="number" required value={form.cargoWeightKg} onChange={(e) => setForm({ ...form, cargoWeightKg: e.target.value })} placeholder="900" />
              </div>
              <div className="form-group">
                <label>Planned Distance (km)</label>
                <input className="form-input" type="number" value={form.plannedDistanceKm} onChange={(e) => setForm({ ...form, plannedDistanceKm: e.target.value })} placeholder="50" />
              </div>

              {/* Capacity Validation */}
              {selectedVehicle && form.cargoWeightKg && (
                <div className={`validation-box ${capacityExceeded ? 'error' : 'success'}`}>
                  <span>Vehicle Capacity: <strong>{Number(selectedVehicle.maxLoadCapacityKg).toLocaleString()} kg</strong></span>
                  <span>Cargo Weight: <strong>{form.cargoWeightKg} kg</strong></span>
                  {capacityExceeded && (
                    <span style={{ fontWeight: 700 }}>✕ Capacity exceeded by {cargoNum - Number(selectedVehicle.maxLoadCapacityKg)} kg — dispatch blocked</span>
                  )}
                  {!capacityExceeded && (
                    <span style={{ fontWeight: 700 }}>✓ Within capacity</span>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn-action btn-action-dark" disabled={capacityExceeded || submitting} style={{ flex: 1, opacity: capacityExceeded ? 0.5 : 1 }}>
                  {submitting ? 'Creating…' : 'Create Draft'}
                </button>
                <button type="button" className="btn-action btn-action-cancel" onClick={() => setForm({ source: '', destination: '', vehicleId: '', driverId: '', cargoWeightKg: '', plannedDistanceKm: '' })}>
                  Reset
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Right: Live Board */}
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14, color: 'var(--charcoal)' }}>Live Board</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sortedTrips.map((trip) => {
              const vehicle = vehicleById(trip.vehicleId);
              const driver = driverById(trip.driverId);
              const busy = busyTripId === trip.id;
              return (
                <div key={trip.id} style={{
                  background: 'var(--white)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-card)',
                  padding: '16px 20px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>
                        {trip.id.slice(-8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--charcoal)' }}>
                        {trip.source} → {trip.destination}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--slate-gray)' }}>
                      {vehicle?.registrationNumber || '—'} / {driver?.name || 'Unassigned'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`status-badge status-badge-${slug(trip.status)}`}>{humanize(trip.status)}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {canCreate && trip.status === 'DRAFT' && (
                        <>
                          <button className="btn-action btn-action-success" style={{ padding: '4px 14px', fontSize: '0.78rem' }} disabled={busy} onClick={() => handleDispatch(trip.id)}>Dispatch</button>
                          <button className="btn-action btn-action-cancel" style={{ padding: '4px 14px', fontSize: '0.78rem' }} disabled={busy} onClick={() => handleCancel(trip.id)}>Cancel</button>
                        </>
                      )}
                      {canCreate && trip.status === 'DISPATCHED' && (
                        <>
                          <button className="btn-action btn-action-success" style={{ padding: '4px 14px', fontSize: '0.78rem' }} disabled={busy} onClick={() => openComplete(trip)}>Complete</button>
                          <button className="btn-action btn-action-cancel" style={{ padding: '4px 14px', fontSize: '0.78rem' }} disabled={busy} onClick={() => handleCancel(trip.id)}>Cancel</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Complete Trip</h3>
            <form onSubmit={handleComplete}>
              <div className="form-group">
                <label>Final Odometer (km)</label>
                <input className="form-input" type="number" required value={completeForm.finalOdometerKm} onChange={(e) => setCompleteForm({ ...completeForm, finalOdometerKm: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Fuel Consumed (L)</label>
                  <input className="form-input" type="number" value={completeForm.fuelConsumedLtr} onChange={(e) => setCompleteForm({ ...completeForm, fuelConsumedLtr: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Revenue ($)</label>
                  <input className="form-input" type="number" value={completeForm.revenue} onChange={(e) => setCompleteForm({ ...completeForm, revenue: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn-action btn-action-success" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'Saving…' : 'Mark Complete'}
                </button>
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
