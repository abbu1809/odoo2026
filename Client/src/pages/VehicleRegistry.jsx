import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { VEHICLE_TYPES, VEHICLE_STATUSES, humanize, slug, formatMoney } from '../utils/enums';

const emptyForm = {
  registrationNumber: '', name: '', type: 'VAN',
  maxLoadCapacityKg: '', acquisitionCost: '', region: '',
};

const VehicleRegistry = () => {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle, canWrite, canDelete } = useApp();
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchReg, setSearchReg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const canEdit = canWrite('vehicles');
  const canRemove = canDelete('vehicles');

  const filtered = vehicles.filter((v) => {
    if (filterType !== 'All' && v.type !== filterType) return false;
    if (filterStatus !== 'All' && v.status !== filterStatus) return false;
    if (searchReg && !v.registrationNumber.toLowerCase().includes(searchReg.toLowerCase())) return false;
    return true;
  });

  const openAdd = () => {
    setForm(emptyForm);
    setEditMode(false);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (v) => {
    setForm({
      registrationNumber: v.registrationNumber,
      name: v.name,
      type: v.type,
      maxLoadCapacityKg: v.maxLoadCapacityKg,
      acquisitionCost: v.acquisitionCost,
      region: v.region || '',
      status: v.status,
    });
    setEditMode(true);
    setEditId(v.id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    let ok;
    if (editMode) {
      ok = await updateVehicle(editId, {
        name: form.name,
        type: form.type,
        maxLoadCapacityKg: Number(form.maxLoadCapacityKg),
        acquisitionCost: Number(form.acquisitionCost),
        region: form.region || undefined,
        status: form.status,
      });
    } else {
      ok = await addVehicle(form);
    }
    setSubmitting(false);
    if (ok) setShowModal(false);
  };

  return (
    <div>
      {/* Filters + Add */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div className="filter-bar" style={{ marginBottom: 0 }}>
          <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="All">Type: All</option>
            {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{humanize(t)}</option>)}
          </select>
          <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">Status: All</option>
            {VEHICLE_STATUSES.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
          </select>
          <input
            className="filter-input"
            placeholder="Search reg. no..."
            value={searchReg}
            onChange={(e) => setSearchReg(e.target.value)}
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
              {(canEdit || canRemove) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id}>
                <td style={{ fontWeight: 600 }}>{v.registrationNumber}</td>
                <td>{v.name}</td>
                <td>{humanize(v.type)}</td>
                <td>{Number(v.maxLoadCapacityKg).toLocaleString()} kg</td>
                <td>{Number(v.odometerKm).toLocaleString()} km</td>
                <td>{formatMoney(v.acquisitionCost)}</td>
                <td><span className={`status-badge status-badge-${slug(v.status)}`}>{humanize(v.status)}</span></td>
                {(canEdit || canRemove) && (
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {canEdit && (
                        <button className="btn-action btn-action-secondary" style={{ padding: '4px 10px' }} onClick={() => openEdit(v)}><Pencil size={14} /></button>
                      )}
                      {canRemove && (
                        <button className="btn-action btn-action-danger" style={{ padding: '4px 10px' }} onClick={() => deleteVehicle(v.id)}><Trash2 size={14} /></button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={(canEdit || canRemove) ? 8 : 7} style={{ textAlign: 'center', color: 'var(--slate-gray)', padding: 32 }}>No vehicles match your filters.</td></tr>
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editMode ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Registration Number</label>
                <input className="form-input" required disabled={editMode} value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} placeholder="e.g. VAN-05" />
              </div>
              <div className="form-group">
                <label>Name/Model</label>
                <input className="form-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ford Transit Van" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Type</label>
                  <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{humanize(t)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Max Capacity (kg)</label>
                  <input className="form-input" type="number" required value={form.maxLoadCapacityKg} onChange={(e) => setForm({ ...form, maxLoadCapacityKg: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Acquisition Cost</label>
                  <input className="form-input" type="number" required value={form.acquisitionCost} onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Region</label>
                  <input className="form-input" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="North" />
                </div>
              </div>
              {editMode && (
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {VEHICLE_STATUSES.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn-action btn-action-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'Saving…' : editMode ? 'Save Changes' : 'Register Vehicle'}
                </button>
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
