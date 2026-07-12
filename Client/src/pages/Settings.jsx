import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ROLES, humanize } from '../utils/enums';

const rbacMatrix = [
  { role: 'ADMIN', fleet: '✓', drivers: '✓', trips: '✓', fuelExp: '✓', analytics: '✓' },
  { role: 'FLEET_MANAGER', fleet: '✓', drivers: '✓', trips: '—', fuelExp: '—', analytics: '✓' },
  { role: 'DRIVER', fleet: 'View', drivers: '—', trips: '✓', fuelExp: '—', analytics: '—' },
  { role: 'SAFETY_OFFICER', fleet: '—', drivers: '✓', trips: 'View', fuelExp: '—', analytics: '—' },
  { role: 'FINANCIAL_ANALYST', fleet: 'View', drivers: '—', trips: '—', fuelExp: '✓', analytics: '✓' },
];

const Cell = ({ value }) => {
  if (value === '✓') return <span className="rbac-check">✓</span>;
  if (value === '—') return <span className="rbac-dash">—</span>;
  return <span className="rbac-view">{value}</span>;
};

const Settings = () => {
  const { user, isAdmin, users, updateUserRecord, showToast } = useApp();

  const [depotName, setDepotName] = useState('Gandhinagar Depot, GJ4');
  const [currency, setCurrency] = useState('INR (Rs)');
  const [distanceUnit, setDistanceUnit] = useState('Kilometers');

  const handleSave = () => {
    showToast('Settings saved locally (no backend endpoint for these yet).', 'info');
  };

  return (
    <div>
      <div className="settings-grid">
        {/* Left: General Settings */}
        <div className="settings-form">
          <h3>General</h3>
          <div className="form-group">
            <label>Depot Name</label>
            <input className="form-input" value={depotName} onChange={(e) => setDepotName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Currency</label>
            <input className="form-input" value={currency} onChange={(e) => setCurrency(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Distance Unit</label>
            <input className="form-input" value={distanceUnit} onChange={(e) => setDistanceUnit(e.target.value)} />
          </div>
          <button className="btn-action btn-action-primary" style={{ marginTop: 8 }} onClick={handleSave}>
            Save Changes
          </button>

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-light)', fontSize: '0.85rem' }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Signed in as</div>
            <div>{user?.name} · {user?.email}</div>
            <div style={{ color: 'var(--slate-gray)' }}>{humanize(user?.role)}</div>
          </div>
        </div>

        {/* Right: RBAC Matrix */}
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14, color: 'var(--charcoal)' }}>
            Role-Based Access (RBAC)
          </h4>
          <div className="table-wrapper">
            <table className="rbac-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Fleet</th>
                  <th>Drivers</th>
                  <th>Trips</th>
                  <th>Fuel/Exp.</th>
                  <th>Analytics</th>
                </tr>
              </thead>
              <tbody>
                {rbacMatrix.map((row) => (
                  <tr key={row.role}>
                    <td style={{ fontWeight: 600 }}>{humanize(row.role)}</td>
                    <td><Cell value={row.fleet} /></td>
                    <td><Cell value={row.drivers} /></td>
                    <td><Cell value={row.trips} /></td>
                    <td><Cell value={row.fuelExp} /></td>
                    <td><Cell value={row.analytics} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Admin: User Management */}
      {isAdmin && (
        <div style={{ marginTop: 32 }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14, color: 'var(--charcoal)' }}>
            User Management (Admin)
          </h4>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        className="form-select"
                        value={u.role}
                        onChange={(e) => updateUserRecord(u.id, { role: e.target.value })}
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{humanize(r)}</option>)}
                      </select>
                    </td>
                    <td>
                      <button
                        className={`btn-action ${u.isActive ? 'btn-action-secondary' : 'btn-action-danger'}`}
                        style={{ padding: '4px 10px' }}
                        onClick={() => updateUserRecord(u.id, { isActive: !u.isActive })}
                      >
                        {u.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--slate-gray)', padding: 32 }}>No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
