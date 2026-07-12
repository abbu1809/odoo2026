import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { DRIVER_STATUSES, humanize, slug, formatDate } from '../utils/enums';
import { downloadBlob } from '../utils/download';
import * as driversApi from '../api/drivers';

const emptyForm = {
  name: '', licenseNumber: '', licenseCategory: '',
  licenseExpiryDate: '', contactNumber: '',
};

const SORTABLE_COLUMNS = [
  { key: 'name', label: 'Driver' },
  { key: 'licenseNumber', label: 'License No' },
  { key: 'licenseCategory', label: 'Category' },
  { key: 'licenseExpiryDate', label: 'Expiry' },
  { key: 'contactNumber', label: 'Contact' },
  { key: 'safetyScore', label: 'Safety' },
  { key: 'status', label: 'Status' },
];

// Columns the server list endpoint can actually sort by (see driver.validation.ts) —
// others (licenseNumber, licenseCategory, contactNumber, status) are sorted client-side only.
const SERVER_SORT_KEYS = ['name', 'licenseExpiryDate', 'safetyScore'];

const DriverManagement = () => {
  const {
    drivers, addDriver, updateDriver, deleteDriver,
    checkIsLicenseExpired, checkIsLicenseExpiringSoon, canWrite, canDelete, showToast,
  } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [exportingCsv, setExportingCsv] = useState(false);

  const canEdit = canWrite('drivers');
  const canRemove = canDelete('drivers');

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedDrivers = [...drivers].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    const cmp = typeof av === 'number' ? av - bv : String(av ?? '').localeCompare(String(bv ?? ''));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const handleExportCsv = async () => {
    setExportingCsv(true);
    try {
      const blob = await driversApi.downloadDriversCsv(
        SERVER_SORT_KEYS.includes(sortKey) ? { sortBy: sortKey, sortOrder: sortDir } : {},
      );
      downloadBlob(blob, 'drivers.csv');
    } catch (err) {
      showToast(err.message || 'Failed to export CSV', 'error');
    } finally {
      setExportingCsv(false);
    }
  };

  const openAdd = () => { setForm(emptyForm); setEditMode(false); setEditId(null); setShowModal(true); };
  const openEdit = (d) => {
    setForm({
      name: d.name,
      licenseNumber: d.licenseNumber,
      licenseCategory: d.licenseCategory,
      licenseExpiryDate: d.licenseExpiryDate ? d.licenseExpiryDate.substring(0, 10) : '',
      contactNumber: d.contactNumber,
      safetyScore: d.safetyScore,
      status: d.status,
    });
    setEditMode(true);
    setEditId(d.id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    let ok;
    if (editMode) {
      ok = await updateDriver(editId, {
        name: form.name,
        licenseNumber: form.licenseNumber,
        licenseCategory: form.licenseCategory,
        licenseExpiryDate: form.licenseExpiryDate,
        contactNumber: form.contactNumber,
        safetyScore: Number(form.safetyScore),
        status: form.status,
      });
    } else {
      ok = await addDriver(form);
    }
    setSubmitting(false);
    if (ok) setShowModal(false);
  };

  return (
    <div>
      {/* Header + Add */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 16 }}>
        <button className="btn-action btn-action-secondary" onClick={handleExportCsv} disabled={exportingCsv}>
          {exportingCsv ? 'Exporting…' : 'Export CSV'}
        </button>
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
              {SORTABLE_COLUMNS.map((col) => (
                <th key={col.key} style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort(col.key)}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {col.label}
                    {sortKey === col.key && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </span>
                </th>
              ))}
              {(canEdit || canRemove) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {sortedDrivers.map((d) => {
              const expired = checkIsLicenseExpired(d.licenseExpiryDate);
              const expiringSoon = checkIsLicenseExpiringSoon(d.licenseExpiryDate);
              return (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600 }}>{d.name}</td>
                  <td>{d.licenseNumber}</td>
                  <td>{d.licenseCategory}</td>
                  <td style={{ color: expired ? '#DC2626' : expiringSoon ? '#D97706' : 'inherit', fontWeight: expired ? 700 : 400 }}>
                    {formatDate(d.licenseExpiryDate)}
                    {expired && <span style={{ fontSize: '0.72rem', marginLeft: 4, color: '#DC2626' }}>EXPIRED</span>}
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>{d.contactNumber}</td>
                  <td>{d.safetyScore}%</td>
                  <td><span className={`status-badge status-badge-${slug(d.status)}`}>{humanize(d.status)}</span></td>
                  {(canEdit || canRemove) && (
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {canEdit && (
                          <button className="btn-action btn-action-secondary" style={{ padding: '4px 10px' }} onClick={() => openEdit(d)}><Pencil size={14} /></button>
                        )}
                        {canRemove && (
                          <button className="btn-action btn-action-danger" style={{ padding: '4px 10px' }} onClick={() => deleteDriver(d.id)}><Trash2 size={14} /></button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
            {drivers.length === 0 && (
              <tr><td colSpan={(canEdit || canRemove) ? 8 : 7} style={{ textAlign: 'center', color: 'var(--slate-gray)', padding: 32 }}>No drivers registered.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Business Rule */}
      <div className="rule-info">
        <strong>Rule:</strong> Expired license or Suspended status → blocked from trip assignment
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editMode ? 'Edit Driver' : 'Add New Driver'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Driver Name</label>
                <input className="form-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>License Number</label>
                  <input className="form-input" required value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} placeholder="DL-XXXXX" />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input className="form-input" required value={form.licenseCategory} onChange={(e) => setForm({ ...form, licenseCategory: e.target.value })} placeholder="LMV" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>License Expiry Date</label>
                  <input className="form-input" type="date" required value={form.licenseExpiryDate} onChange={(e) => setForm({ ...form, licenseExpiryDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input className="form-input" required value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} placeholder="+1-555-0000" />
                </div>
              </div>
              {editMode && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label>Safety Score</label>
                    <input className="form-input" type="number" min="0" max="100" value={form.safetyScore} onChange={(e) => setForm({ ...form, safetyScore: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      {DRIVER_STATUSES.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
                    </select>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn-action btn-action-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'Saving…' : editMode ? 'Save Changes' : 'Add Driver'}
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

export default DriverManagement;
