import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const statusClass = (s) => {
  const m = { 'Available': 'available', 'On Trip': 'on-trip', 'In Shop': 'in-shop', 'Retired': 'retired' };
  return `status-badge status-badge-${m[s] || 'draft'}`;
};

const emptyForm = {
  registrationNumber: '', name: '', type: 'Van',
  maxCapacity: '', odometer: '', acquisitionCost: '', status: 'Available', region: 'North'
};

const VehicleRegistry = () => {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle, activeUserRole, getPermission } = useApp();
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchReg, setSearchReg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const canEdit = getPermission('vehicles') === 'Full';

  const filtered = vehicles.filter(v => {
    if (filterType !== 'All' && v.type !== filterType) return false;
    if (filterStatus !== 'All' && v.status !== filterStatus) return false;
    if (searchReg && !v.registrationNumber.toLowerCase().includes(searchReg.toLowerCase())) return false;
    return true;
  });

  const openAdd = () => {
    setForm(emptyForm);
    setEditMode(false);
    setShowModal(true);
  };

  const openEdit = (v) => {
    setForm({ ...v });
    setEditMode(true);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editMode) {
      updateVehicle(form.registrationNumber, form);
    } else {
      const ok = addVehicle(form);
      if (!ok) return;
    }
    setShowModal(false);
  };

  return (
    <div>
      {/* Filters + Add */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div className="filter-bar" style={{ marginBottom: 0 }}>
          <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="All">Type: All</option>
            {['Van', 'Truck', 'Sedan', 'Semi'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">Status: All</option>
            {['Available', 'On Trip', 'In Shop', 'Retired'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input
            className="filter-input"
            placeholder="Search reg. no..."
            value={searchReg}
            onChange={e => setSearchReg(e.target.value)}
          />
        </div>
        {canEdit && (
          <button className="btn-action btn-action-primary" onClick={openAdd}>
            <Plus size={16} /> Add Vehicle
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Reg. No. (Unique)</th>
              <th>Name/Model</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Odometer</th>
              <th>Acq. Cost</th>
              <th>Status</th>
              {canEdit && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => (
              <tr key={v.registrationNumber}>
                <td style={{ fontWeight: 600 }}>{v.registrationNumber}</td>
                <td>{v.name}</td>
                <td>{v.type}</td>
                <td>{v.maxCapacity.toLocaleString()} kg</td>
                <td>{v.odometer.toLocaleString()}</td>
                <td>{v.acquisitionCost.toLocaleString()}</td>
                <td><span className={statusClass(v.status)}>{v.status}</span></td>
                {canEdit && (
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-action btn-action-secondary" style={{ padding: '4px 10px' }} onClick={() => openEdit(v)}><Pencil size={14} /></button>
                      <button className="btn-action btn-action-danger" style={{ padding: '4px 10px' }} onClick={() => deleteVehicle(v.registrationNumber)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={canEdit ? 8 : 7} style={{ textAlign: 'center', color: 'var(--slate-gray)', padding: 32 }}>No vehicles match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Business Rule Note */}
      <div className="rule-info">
        <strong>Rule:</strong> Registration No. must be unique · Retired/In Shop vehicles are hidden from Trip Dispatcher
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{editMode ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Registration Number</label>
                <input className="form-input" required disabled={editMode} value={form.registrationNumber} onChange={e => setForm({ ...form, registrationNumber: e.target.value })} placeholder="e.g. VAN-05" />
              </div>
              <div className="form-group">
                <label>Name/Model</label>
                <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ford Transit Van" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Type</label>
                  <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    {['Van', 'Truck', 'Sedan', 'Semi'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Max Capacity (kg)</label>
                  <input className="form-input" type="number" required value={form.maxCapacity} onChange={e => setForm({ ...form, maxCapacity: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Odometer (km)</label>
                  <input className="form-input" type="number" value={form.odometer} onChange={e => setForm({ ...form, odometer: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Acquisition Cost</label>
                  <input className="form-input" type="number" value={form.acquisitionCost} onChange={e => setForm({ ...form, acquisitionCost: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    {['Available', 'On Trip', 'In Shop', 'Retired'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Region</label>
                  <select className="form-select" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })}>
                    {['North', 'East', 'South', 'West'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn-action btn-action-primary" style={{ flex: 1 }}>{editMode ? 'Save Changes' : 'Register Vehicle'}</button>
                <button type="button" className="btn-action btn-action-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleRegistry;
