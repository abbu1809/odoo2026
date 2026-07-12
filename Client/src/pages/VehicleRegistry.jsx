import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Download, Upload } from 'lucide-react';
import { VEHICLE_TYPES, VEHICLE_STATUSES, REGIONS, humanize, slug, formatMoney } from '../utils/enums';
import { downloadBlob } from '../utils/download';
import * as vehiclesApi from '../api/vehicles';
import * as vehicleDocumentsApi from '../api/vehicleDocuments';

const emptyForm = {
  registrationNumber: '', name: '', type: 'VAN',
  maxLoadCapacityKg: '', acquisitionCost: '', region: '',
};

const SORTABLE_COLUMNS = [
  { key: 'registrationNumber', label: 'Reg. No. (Unique)' },
  { key: 'name', label: 'Name/Model' },
  { key: 'type', label: 'Type' },
  { key: 'maxLoadCapacityKg', label: 'Capacity' },
  { key: 'odometerKm', label: 'Odometer' },
  { key: 'acquisitionCost', label: 'Acq. Cost' },
  { key: 'status', label: 'Status' },
];

// Columns the server list endpoint can actually sort by (see vehicle.validation.ts) —
// others (type, maxLoadCapacityKg, status) are sorted client-side only.
const SERVER_SORT_KEYS = ['registrationNumber', 'name', 'odometerKm', 'acquisitionCost'];

const VehicleRegistry = () => {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle, canWrite, canDelete, showToast } = useApp();
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchReg, setSearchReg] = useState('');
  const [sortKey, setSortKey] = useState('registrationNumber');
  const [sortDir, setSortDir] = useState('asc');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);

  const [documents, setDocuments] = useState([]);
  const [docLabel, setDocLabel] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [docBusy, setDocBusy] = useState(false);

  const canEdit = canWrite('vehicles');
  const canRemove = canDelete('vehicles');

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filtered = vehicles
    .filter((v) => {
      if (filterType !== 'All' && v.type !== filterType) return false;
      if (filterStatus !== 'All' && v.status !== filterStatus) return false;
      if (searchReg && !v.registrationNumber.toLowerCase().includes(searchReg.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === 'number' ? av - bv : String(av ?? '').localeCompare(String(bv ?? ''));
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const openAdd = () => {
    setForm(emptyForm);
    setEditMode(false);
    setEditId(null);
    setDocuments([]);
    setShowModal(true);
  };

  const loadDocuments = async (vehicleId) => {
    try {
      const docs = await vehicleDocumentsApi.listVehicleDocuments(vehicleId);
      setDocuments(docs);
    } catch (err) {
      showToast(err.message || 'Failed to load documents', 'error');
    }
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
    loadDocuments(v.id);
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

  const handleExportCsv = async () => {
    setExportingCsv(true);
    try {
      const blob = await vehiclesApi.downloadVehiclesCsv({
        type: filterType !== 'All' ? filterType : undefined,
        status: filterStatus !== 'All' ? filterStatus : undefined,
        search: searchReg || undefined,
        ...(SERVER_SORT_KEYS.includes(sortKey) ? { sortBy: sortKey, sortOrder: sortDir } : {}),
      });
      downloadBlob(blob, 'vehicles.csv');
    } catch (err) {
      showToast(err.message || 'Failed to export CSV', 'error');
    } finally {
      setExportingCsv(false);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!docFile || !docLabel.trim()) return;
    setDocBusy(true);
    try {
      await vehicleDocumentsApi.uploadVehicleDocument(editId, { label: docLabel.trim(), file: docFile });
      setDocLabel('');
      setDocFile(null);
      await loadDocuments(editId);
      showToast('Document uploaded.');
    } catch (err) {
      showToast(err.message || 'Failed to upload document', 'error');
    } finally {
      setDocBusy(false);
    }
  };

  const handleDownloadDocument = async (doc) => {
    try {
      const blob = await vehicleDocumentsApi.downloadVehicleDocument(doc.id);
      downloadBlob(blob, doc.fileName);
    } catch (err) {
      showToast(err.message || 'Failed to download document', 'error');
    }
  };

  const handleDeleteDocument = async (doc) => {
    try {
      await vehicleDocumentsApi.deleteVehicleDocument(doc.id);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err) {
      showToast(err.message || 'Failed to delete document', 'error');
    }
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
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-action btn-action-secondary" onClick={handleExportCsv} disabled={exportingCsv}>
            {exportingCsv ? 'Exporting…' : 'Export CSV'}
          </button>
          {canEdit && (
            <button className="btn-action btn-action-primary" onClick={openAdd}>
              <Plus size={16} /> Add Vehicle
            </button>
          )}
        </div>
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
                  <select className="form-select" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
                    <option value="">Unassigned</option>
                    {REGIONS.map((r) => <option key={r} value={r}>{humanize(r)}</option>)}
                  </select>
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

            {editMode && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-light)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
                  Documents
                </h4>
                {documents.length > 0 && (
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {documents.map((doc) => (
                      <li key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                        <span>{doc.label} — {doc.fileName}</span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button type="button" className="btn-action btn-action-secondary" style={{ padding: '4px 8px' }} onClick={() => handleDownloadDocument(doc)}><Download size={13} /></button>
                          {canEdit && (
                            <button type="button" className="btn-action btn-action-danger" style={{ padding: '4px 8px' }} onClick={() => handleDeleteDocument(doc)}><Trash2 size={13} /></button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {documents.length === 0 && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--slate-gray)', marginBottom: 12 }}>No documents uploaded yet.</div>
                )}
                {canEdit && (
                  <form onSubmit={handleUploadDocument} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      className="form-input"
                      placeholder="Label (e.g. RC, Insurance)"
                      value={docLabel}
                      onChange={(e) => setDocLabel(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <input type="file" onChange={(e) => setDocFile(e.target.files?.[0] || null)} />
                    <button type="submit" className="btn-action btn-action-secondary" disabled={docBusy || !docFile || !docLabel.trim()}>
                      <Upload size={14} /> {docBusy ? 'Uploading…' : 'Upload'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleRegistry;
