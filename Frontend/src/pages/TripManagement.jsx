import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Play, CheckCircle2, XCircle, Clock, MapPin, Truck, User, Scale, AlertTriangle, HelpCircle } from 'lucide-react';

const TripManagement = () => {
  const {
    trips,
    vehicles,
    drivers,
    createTrip,
    dispatchTrip,
    completeTrip,
    cancelTrip,
    activeUserRole,
    checkIsLicenseExpired
  } = useApp();

  // Roles that can manage trips (Fleet Manager and Driver/Dispatcher)
  const canManage = activeUserRole === 'Fleet Manager' || activeUserRole === 'Driver';

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);

  // Create Form State
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverName, setDriverName] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [distance, setDistance] = useState('');
  const [revenue, setRevenue] = useState('');

  // Complete Form State
  const [finalOdometer, setFinalOdometer] = useState('');
  const [fuelConsumed, setFuelConsumed] = useState('');
  const [fuelCost, setFuelCost] = useState('');

  // Filter vehicles and drivers for dropdown (only show Available assets)
  const availableVehicles = vehicles.filter(v => v.status === 'Available');
  const availableDrivers = drivers.filter(d => 
    d.status === 'Available' && 
    !checkIsLicenseExpired(d.licenseExpiryDate)
  );

  // Selected vehicle details for real-time validation in form
  const selectedVehicle = vehicles.find(v => v.registrationNumber === vehicleId);
  const selectedDriver = drivers.find(d => d.name === driverName);
  
  // Real-time capacity error
  const isOverweight = selectedVehicle && Number(cargoWeight) > selectedVehicle.maxCapacity;

  // Open Create Dialog
  const handleOpenCreate = () => {
    if (!canManage) return;
    setSource('');
    setDestination('');
    setVehicleId(availableVehicles[0]?.registrationNumber || '');
    setDriverName(availableDrivers[0]?.name || '');
    setCargoWeight('');
    setDistance('');
    setRevenue('');
    setCreateModalOpen(true);
  };

  // Open Complete Dialog
  const handleOpenComplete = (tripId) => {
    if (!canManage) return;
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    const vehicle = vehicles.find(v => v.registrationNumber === trip.vehicleId);

    setSelectedTripId(tripId);
    setFinalOdometer(vehicle ? (vehicle.odometer + trip.distance) : ''); // Mock default suggestion
    setFuelConsumed('');
    setFuelCost('');
    setCompleteModalOpen(true);
  };

  // Submit Create
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!source || !destination || !vehicleId || !driverName || !cargoWeight || !distance) return;

    const success = createTrip({
      source,
      destination,
      vehicleId,
      driverName,
      cargoWeight,
      distance,
      revenue
    });

    if (success) {
      setCreateModalOpen(false);
    }
  };

  // Submit Complete
  const handleCompleteSubmit = (e) => {
    e.preventDefault();
    if (!selectedTripId || !finalOdometer) return;

    const success = completeTrip(selectedTripId, {
      finalOdometer,
      fuelConsumed,
      fuelCost,
      revenueValue: revenue
    });

    if (success) {
      setCompleteModalOpen(false);
      setSelectedTripId(null);
    }
  };

  // Render Status Badge
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Draft': return 'badge-neutral';
      case 'Dispatched': return 'badge-info';
      case 'Completed': return 'badge-success';
      case 'Cancelled': return 'badge-danger';
      default: return 'badge-neutral';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Title Bar */}
      <div className="flex-between">
        <div>
          <span className="eyebrow" style={{ marginBottom: '8px' }}>• ROUTING & LOGISTICS</span>
          <h2 style={{ fontWeight: 700 }}>Dispatch Control Board</h2>
        </div>

        {canManage ? (
          <button onClick={handleOpenCreate} className="btn-primary" style={{ gap: '6px' }}>
            <Plus size={16} /> Create Dispatch Draft
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--slate-gray)', fontSize: '0.85rem' }}>
            <AlertTriangle size={16} style={{ color: 'var(--light-signal-orange)' }} />
            <span>Switch to <b>Fleet Manager</b> or <b>Driver</b> to coordinate trips.</span>
          </div>
        )}
      </div>

      {/* Trips board display grouped by category */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Active & Pending Board (Top Priority) */}
        <div>
          <span className="eyebrow" style={{ marginBottom: '14px' }}>• ACTIVE LOGISTICS WORKLOAD</span>
          <div className="grid-2">
            
            {/* Column A: Draft & Dispatched */}
            <div className="card-raised" style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'rgba(252,251,250,0.5)' }}>
              <div className="flex-between" style={{ borderBottom: '1px solid var(--canvas-cream)', paddingBottom: '10px' }}>
                <h4 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} style={{ color: 'var(--slate-gray)' }} /> Dispatched / Draft Trips
                </h4>
                <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                  {trips.filter(t => t.status === 'Draft' || t.status === 'Dispatched').length} Active
                </span>
              </div>

              {trips.filter(t => t.status === 'Draft' || t.status === 'Dispatched').length === 0 ? (
                <p style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--slate-gray)', fontSize: '0.85rem' }}>
                  No active or pending dispatches scheduled.
                </p>
              ) : (
                trips.filter(t => t.status === 'Draft' || t.status === 'Dispatched').map(trip => (
                  <div key={trip.id} className="card-elevated" style={{ padding: '20px', borderRadius: '20px' }}>
                    <div className="flex-between" style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'monospace' }}>{trip.id}</span>
                      <span className={`badge ${getStatusBadgeClass(trip.status)}`}>{trip.status}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={14} style={{ color: 'var(--light-signal-orange)' }} />
                        <span>From: <b>{trip.source}</b></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={14} style={{ color: 'var(--signal-orange)' }} />
                        <span>To: <b>{trip.destination}</b></span>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', marginTop: '6px', borderTop: '1px solid var(--canvas-cream)', paddingTop: '10px', fontSize: '0.8rem', color: 'var(--slate-gray)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Truck size={12} /> {trip.vehicleId}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={12} /> {trip.driverName}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Scale size={12} /> {trip.cargoWeight} kg
                        </span>
                      </div>
                    </div>

                    {canManage && (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid var(--canvas-cream)', paddingTop: '12px' }}>
                        {trip.status === 'Draft' && (
                          <button 
                            onClick={() => dispatchTrip(trip.id)}
                            className="btn-primary"
                            style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '12px', gap: '4px' }}
                          >
                            <Play size={12} fill="currentColor" /> Dispatch
                          </button>
                        )}
                        {trip.status === 'Dispatched' && (
                          <button 
                            onClick={() => handleOpenComplete(trip.id)}
                            className="btn-primary"
                            style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '12px', gap: '4px', backgroundColor: '#4CAF50', borderColor: '#4CAF50' }}
                          >
                            <CheckCircle2 size={12} /> Complete
                          </button>
                        )}
                        <button 
                          onClick={() => cancelTrip(trip.id)}
                          className="btn-secondary"
                          style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '12px', gap: '4px', borderColor: 'var(--signal-orange)', color: 'var(--signal-orange)' }}
                        >
                          <XCircle size={12} /> Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Column B: Completed & Cancelled History */}
            <div className="card-raised" style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'rgba(252,251,250,0.5)' }}>
              <div className="flex-between" style={{ borderBottom: '1px solid var(--canvas-cream)', paddingBottom: '10px' }}>
                <h4 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--slate-gray)' }} /> Historical Logs
                </h4>
                <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                  {trips.filter(t => t.status === 'Completed' || t.status === 'Cancelled').length} Logged
                </span>
              </div>

              {trips.filter(t => t.status === 'Completed' || t.status === 'Cancelled').length === 0 ? (
                <p style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--slate-gray)', fontSize: '0.85rem' }}>
                  No historical route dispatches recorded.
                </p>
              ) : (
                trips.filter(t => t.status === 'Completed' || t.status === 'Cancelled').slice(0, 4).map(trip => (
                  <div key={trip.id} className="card-elevated" style={{ padding: '16px', borderRadius: '20px', opacity: 0.8 }}>
                    <div className="flex-between" style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'monospace' }}>{trip.id}</span>
                      <span className={`badge ${getStatusBadgeClass(trip.status)}`}>{trip.status}</span>
                    </div>

                    <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                      {trip.source} → {trip.destination}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--slate-gray)' }}>
                      <span>Asset: <b>{trip.vehicleId}</b></span>
                      <span>Driver: <b>{trip.driverName}</b></span>
                      <span>Distance: <b>{trip.distance} km</b></span>
                    </div>
                  </div>
                ))
              )}
            </div>
            
          </div>
        </div>

      </div>

      {/* DISPATCH CREATE DIALOG */}
      {createModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex-between" style={{ marginBottom: '24px', borderBottom: '1px solid var(--canvas-cream)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Schedule Route Dispatch</h3>
              <button 
                onClick={() => setCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-gray)' }}
              >
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="grid-2">
                <div className="form-group">
                  <label>Route Source</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Chicago Hub A" 
                    value={source} 
                    onChange={(e) => setSource(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Route Destination</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Detroit Depot B" 
                    value={destination} 
                    onChange={(e) => setDestination(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Assign Vehicle (Available Only)</label>
                  {availableVehicles.length === 0 ? (
                    <select disabled className="form-select" style={{ borderColor: 'var(--signal-orange)' }}>
                      <option>No Vehicles Available</option>
                    </select>
                  ) : (
                    <select 
                      value={vehicleId} 
                      onChange={(e) => setVehicleId(e.target.value)}
                      className="form-select"
                      required
                    >
                      {availableVehicles.map(v => (
                        <option key={v.registrationNumber} value={v.registrationNumber}>
                          {v.registrationNumber} (Max: {v.maxCapacity} kg)
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="form-group">
                  <label>Assign Driver (Available & Licensed)</label>
                  {availableDrivers.length === 0 ? (
                    <select disabled className="form-select" style={{ borderColor: 'var(--signal-orange)' }}>
                      <option>No Drivers Available</option>
                    </select>
                  ) : (
                    <select 
                      value={driverName} 
                      onChange={(e) => setDriverName(e.target.value)}
                      className="form-select"
                      required
                    >
                      {availableDrivers.map(d => (
                        <option key={d.name} value={d.name}>
                          {d.name} (Safety: {d.safetyScore})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label>Cargo Weight (kg)</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    placeholder="e.g. 450" 
                    value={cargoWeight} 
                    onChange={(e) => setCargoWeight(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Planned Distance (km)</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    placeholder="e.g. 300" 
                    value={distance} 
                    onChange={(e) => setDistance(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Trip Revenue ($)</label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    placeholder="e.g. 1500" 
                    value={revenue} 
                    onChange={(e) => setRevenue(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Live Weight Capacity Validator Alert */}
              {selectedVehicle && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '16px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: isOverweight ? '#FCE8E6' : '#E2F4E6',
                  color: isOverweight ? '#C5221F' : '#1D6930',
                  border: `1px solid ${isOverweight ? '#FCE8E6' : '#E2F4E6'}`
                }}>
                  <Scale size={16} />
                  <span>
                    Capacity: Selected vehicle ({selectedVehicle.registrationNumber}) holds max <b>{selectedVehicle.maxCapacity} kg</b>. 
                    {isOverweight ? (
                      <span style={{ fontWeight: 700, display: 'block', marginTop: '2px' }}>
                        Error: Cargo weight exceeds limit by {Number(cargoWeight) - selectedVehicle.maxCapacity} kg!
                      </span>
                    ) : (
                      <span style={{ display: 'block', marginTop: '2px' }}>
                        Weight status: OK. Cargo is within limits.
                      </span>
                    )}
                  </span>
                </div>
              )}

              {/* General Warnings */}
              {availableVehicles.length === 0 || availableDrivers.length === 0 ? (
                <div style={{
                  padding: '10px 14px', borderRadius: '12px', backgroundColor: '#FFF2CC', color: '#7F6000', fontSize: '0.8rem', display: 'flex', gap: '8px', alignItems: 'center'
                }}>
                  <AlertTriangle size={14} />
                  <span>Cannot dispatch: Ensure both an available vehicle and an available driver are present.</span>
                </div>
              ) : null}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setCreateModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={isOverweight || availableVehicles.length === 0 || availableDrivers.length === 0}
                >
                  Create Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETE TRIP & LOG FUEL DIALOG */}
      {completeModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex-between" style={{ marginBottom: '24px', borderBottom: '1px solid var(--canvas-cream)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Record Trip Completion</h3>
              <button 
                onClick={() => setCompleteModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-gray)' }}
              >
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="form-group">
                <label>Final Vehicle Odometer (km)</label>
                <input 
                  type="number" 
                  required 
                  min="1"
                  placeholder="e.g. 25300" 
                  value={finalOdometer} 
                  onChange={(e) => setFinalOdometer(e.target.value)}
                  className="form-input"
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-gray)' }}>
                  Must be greater than starting odometer.
                </span>
              </div>

              <div className="grid-2" style={{ borderTop: '1px solid var(--canvas-cream)', paddingTop: '16px' }}>
                <div className="form-group">
                  <label>Fuel Consumed (Liters)</label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    step="0.1"
                    placeholder="e.g. 24" 
                    value={fuelConsumed} 
                    onChange={(e) => setFuelConsumed(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Fuel Expense Cost ($)</label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    placeholder="e.g. 48" 
                    value={fuelCost} 
                    onChange={(e) => setFuelCost(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setCompleteModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  style={{ backgroundColor: '#4CAF50', borderColor: '#4CAF50' }}
                >
                  Complete Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TripManagement;
