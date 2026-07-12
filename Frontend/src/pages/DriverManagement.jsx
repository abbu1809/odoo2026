import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const statusClass = (s) => {
  const m = { 'Available': 'available', 'On Trip': 'on-trip', 'Off Duty': 'off-duty', 'Suspended': 'suspended' };
  return `status-badge status-badge-${m[s] || 'draft'}`;
};

const safetyClass = (s) => {
  const m = { 'Available': 'available', 'On Trip': 'on-trip', 'Off Duty': 'off-duty', 'Suspended': 'suspended' };
  return `status-badge status-badge-${m[s] || 'draft'}`;
};

const emptyForm = {
  name: '', licenseNumber: '', licenseCategory: 'Class A',
  licenseExpiryDate: '', contactNumber: '', safetyScore: 100, status: 'Available'
};

const DriverManagement = () => {
  const {
    drivers, addDriver, updateDriver, deleteDriver,
    checkIsLicenseExpired, checkIsLicenseExpiringSoon, activeUserRole, getPermission
  } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const canEdit = getPermission('drivers') === 'Full';

  const openAdd = () => { setForm(emptyForm); setEditMode(false); setShowModal(true); };
  const openEdit = (d) => { setForm({ ...d }); setEditMode(true); setShowModal(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editMode) {
      updateDriver(form.name, form);
    } else {
      const ok = addDriver(form);
      if (!ok) return;
    }
    setShowModal(false);
  };

  const toggleDriverStatus = (driverName, newStatus) => {
    updateDriver(driverName, { status: newStatus });
  };

  return (
    <div>
      {/* Header + Add */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        {canEdit && (
          <button className="btn-action btn-action-primary" onClick={openAdd}>
            <Plus size={16} /> Add Driver
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Driver</th>
              <th>License No</th>
              <th>Category</th>
              <th>Expiry</th>
              <th>Contact</th>
              <th>Trip Comp.</th>
              <th>Safety</th>
              <th>Status</th>
              {canEdit && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {drivers.map(d => {
              const expired = checkIsLicenseExpired(d.licenseExpiryDate);
              const expiringSoon = checkIsLicenseExpiringSoon(d.licenseExpiryDate);
              return (
                <tr key={d.name}>
                  <td style={{ fontWeight: 600 }}>{d.name}</td>
                  <td>{d.licenseNumber}</td>
                  <td>{d.licenseCategory.replace('Class ', '')}</td>
                  <td style={{ color: expired ? '#DC2626' : expiringSoon ? '#D97706' : 'inherit', fontWeight: expired ? 700 : 400 }}>
                    {d.licenseExpiryDate.replace(/-/g, '/')}
                    {expired && <span style={{ fontSize: '0.72rem', marginLeft: 4, color: '#DC2626' }}>EXPIRED</span>}
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>{d.contactNumber.replace(/\d{4}$/, 'xxxxx')}</td>
                  <td>{d.safetyScore}%</td>
                  <td><span className={safetyClass(d.status)}>{d.status}</span></td>
                  <td><span className={statusClass(d.status)}>{d.status}</span></td>
                  {canEdit && (
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-action btn-action-secondary" style={{ padding: '4px 10px' }} onClick={() => openEdit(d)}><Pencil size={14} /></button>
                        <button className="btn-action btn-action-danger" style={{ padding: '4px 10px' }} onClick={() => deleteDriver(d.name)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
            {drivers.length === 0 && (
              <tr><td colSpan={canEdit ? 9 : 8} style={{ textAlign: 'center', color: 'var(--slate-gray)', padding: 32 }}>No drivers registered.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Toggle Status Buttons */}
      {canEdit && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate-gray)', letterSpacing: '0.04em', marginBottom: 8 }}>Toggle Status:</div>
          <div className="toggle-status-bar">
            <button className="toggle-btn" style={{ background: '#4CAF50' }} onClick={() => {}}>Available</button>
            <button className="toggle-btn" style={{ background: '#2196F3' }} onClick={() => {}}>On Trip</button>
            <button className="toggle-btn" style={{ background: '#555' }} onClick={() => {}}>Off Duty</button>
            <button className="toggle-btn" style={{ background: '#F44336' }} onClick={() => {}}>Suspended</button>
          </div>
        </div>
      )}

      {/* Business Rule */}
      <div className="rule-info">
        <strong>Rule:</strong> Expired license or Suspended status → blocked from trip assignment
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{editMode ? 'Edit Driver' : 'Add New Driver'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Driver Name</label>
                <input className="form-input" required disabled={editMode} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>License Number</label>
                  <input className="form-input" required value={form.licenseNumber} onChange={e => setForm({ ...form, licenseNumber: e.target.value })} placeholder="DL-XXXXX" />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select className="form-select" value={form.licenseCategory} onChange={e => setForm({ ...form, licenseCategory: e.target.value })}>
                    {['Class A', 'Class B', 'Class C'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>License Expiry Date</label>
                  <input className="form-input" type="date" required value={form.licenseExpiryDate} onChange={e => setForm({ ...form, licenseExpiryDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input className="form-input" value={form.contactNumber} onChange={e => setForm({ ...form, contactNumber: e.target.value })} placeholder="+1-555-0000" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Safety Score</label>
                  <input className="form-input" type="number" min="0" max="100" value={form.safetyScore} onChange={e => setForm({ ...form, safetyScore: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    {['Available', 'On Trip', 'Off Duty', 'Suspended'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn-action btn-action-primary" style={{ flex: 1 }}>{editMode ? 'Save Changes' : 'Add Driver'}</button>
                <button type="button" className="btn-action btn-action-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverManagement;
