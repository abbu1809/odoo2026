import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit2, Trash2, Search, X, Check, Truck, AlertCircle } from 'lucide-react';

const VehicleRegistry = () => {
  const { 
    vehicles, 
    addVehicle, 
    updateVehicle, 
    deleteVehicle, 
    activeUserRole 
  } = useApp();

  const isManager = activeUserRole === 'Fleet Manager';

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  // Form State
  const [regNum, setRegNum] = useState('');
  const [model, setModel] = useState('');
  const [type, setType] = useState('Van');
  const [capacity, setCapacity] = useState('');
  const [odometer, setOdometer] = useState('');
  const [cost, setCost] = useState('');
  const [status, setStatus] = useState('Available');
  const [region, setRegion] = useState('North');

  // Open Modal for Add
  const handleOpenAdd = () => {
    if (!isManager) return;
    setEditingVehicle(null);
    setRegNum('');
    setModel('');
    setType('Van');
    setCapacity('');
    setOdometer('');
    setCost('');
    setStatus('Available');
    setRegion('North');
    setModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (vehicle) => {
    if (!isManager) return;
    setEditingVehicle(vehicle);
    setRegNum(vehicle.registrationNumber);
    setModel(vehicle.name);
    setType(vehicle.type);
    setCapacity(vehicle.maxCapacity);
    setOdometer(vehicle.odometer);
    setCost(vehicle.acquisitionCost);
    setStatus(vehicle.status);
    setRegion(vehicle.region);
    setModalOpen(true);
  };

  // Submit Form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!model.trim() || !regNum.trim()) return;

    const vehicleData = {
      registrationNumber: regNum.trim(),
      name: model.trim(),
      type,
      maxCapacity: Number(capacity) || 0,
      odometer: Number(odometer) || 0,
      acquisitionCost: Number(cost) || 0,
      status,
      region
    };

    if (editingVehicle) {
      const success = updateVehicle(editingVehicle.registrationNumber, vehicleData);
      if (success) setModalOpen(false);
    } else {
      const success = addVehicle(vehicleData);
      if (success) setModalOpen(false);
    }
  };

  const handleDelete = (regNumber) => {
    if (!isManager) return;
    if (window.confirm(`Are you sure you want to remove vehicle ${regNumber}?`)) {
      deleteVehicle(regNumber);
    }
  };

  // Filter logic
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch = v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || v.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Title Bar */}
      <div className="flex-between">
        <div>
          <span className="eyebrow" style={{ marginBottom: '8px' }}>• ASSET LIFECYCLE</span>
          <h2 style={{ fontWeight: 700 }}>Vehicle Registry</h2>
        </div>

        {/* Add vehicle button */}
        {isManager ? (
          <button onClick={handleOpenAdd} className="btn-primary" style={{ gap: '6px' }}>
            <Plus size={16} /> Register Vehicle
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--slate-gray)', fontSize: '0.85rem' }}>
            <AlertCircle size={16} style={{ color: 'var(--light-signal-orange)' }} />
            <span>Switch to <b>Fleet Manager</b> to register assets.</span>
          </div>
        )}
      </div>

      {/* Filter and Search Panel */}
      <div className="card-raised" style={{ padding: '20px 24px', borderRadius: '24px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', color: 'var(--slate-gray)' }} />
          <input 
            type="text" 
            placeholder="Search by registration number or name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '48px' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="form-select"
            style={{ width: '130px', padding: '10px 16px', borderRadius: '16px' }}
          >
            <option value="All">All Types</option>
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
            <option value="Sedan">Sedan</option>
            <option value="Semi">Semi</option>
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ width: '150px', padding: '10px 16px', borderRadius: '16px' }}
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
        </div>
      </div>

      {/* Database Registry Table */}
      <div className="table-container card-elevated" style={{ padding: 0 }}>
        {filteredVehicles.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--slate-gray)' }}>
            <Truck size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
            <h3 style={{ marginBottom: '8px', fontSize: '1.2rem' }}>No vehicles registered</h3>
            <p>Modify search filters or add a new vehicle record.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Reg. Number</th>
                <th>Vehicle Model / Name</th>
                <th>Type</th>
                <th>Max Capacity (kg)</th>
                <th>Odometer (km)</th>
                <th>Acquisition Cost</th>
                <th>Region</th>
                <th>Status</th>
                {isManager && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.registrationNumber}>
                  <td style={{ fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.02em' }}>
                    {vehicle.registrationNumber}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600 }}>{vehicle.name}</span>
                    </div>
                  </td>
                  <td>{vehicle.type}</td>
                  <td>{vehicle.maxCapacity.toLocaleString()} kg</td>
                  <td>{vehicle.odometer.toLocaleString()} km</td>
                  <td>${vehicle.acquisitionCost.toLocaleString()}</td>
                  <td>{vehicle.region}</td>
                  <td>
                    <span className={`badge ${
                      vehicle.status === 'Available' ? 'badge-success' : 
                      vehicle.status === 'On Trip' ? 'badge-info' : 
                      vehicle.status === 'In Shop' ? 'badge-warning' : 'badge-danger'
                    }`}>
                      {vehicle.status}
                    </span>
                  </td>
                  {isManager && (
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleOpenEdit(vehicle)}
                          title="Edit vehicle details"
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '50%', color: 'var(--ink-black)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--canvas-cream)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(vehicle.registrationNumber)}
                          title="Delete vehicle record"
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '50%', color: 'var(--signal-orange)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--canvas-cream)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CRUD Modal dialog */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex-between" style={{ marginBottom: '24px', borderBottom: '1px solid var(--canvas-cream)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {editingVehicle ? `Edit ${editingVehicle.registrationNumber}` : 'Register New Vehicle'}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-gray)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="form-group">
                <label>Registration Number (Unique ID)</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Van-05, Truck-12" 
                  value={regNum}
                  onChange={(e) => setRegNum(e.target.value.toUpperCase())}
                  disabled={!!editingVehicle} // Can't change ID on edit
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Model & Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Ford Transit, Volvo Cargo" 
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Vehicle Type</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                    className="form-select"
                  >
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Semi">Semi</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Region</label>
                  <select 
                    value={region} 
                    onChange={(e) => setRegion(e.target.value)}
                    className="form-select"
                  >
                    <option value="North">North</option>
                    <option value="East">East</option>
                    <option value="South">South</option>
                    <option value="West">West</option>
                  </select>
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label>Max Load (kg)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    placeholder="e.g. 500" 
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Odometer (km)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    placeholder="e.g. 25000" 
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Acquisition Cost ($)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    placeholder="e.g. 30000" 
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Asset Status</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  className="form-select"
                >
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="In Shop">In Shop</option>
                  <option value="Retired">Retired</option>
                </select>
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
                >
                  {editingVehicle ? 'Save Changes' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleRegistry;
