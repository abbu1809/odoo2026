import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const Settings = () => {
  const { resetDatabase, showToast, activeUserRole, getPermission } = useApp();

  const [depotName, setDepotName] = useState('Gandhinagar Depot, GJ4');
  const [currency, setCurrency] = useState('INR (Rs)');
  const [distanceUnit, setDistanceUnit] = useState('Kilometers');

  const canEdit = getPermission('settings') === 'Full';

  const handleSave = () => {
    showToast('Settings saved successfully.', 'success');
  };

  // RBAC Matrix
  const rbacMatrix = [
    { role: 'Fleet Manager', fleet: '✓', drivers: '✓', trips: '—', fuelExp: '—', analytics: '✓' },
    { role: 'Dispatcher', fleet: 'View', drivers: '—', trips: '✓', fuelExp: '—', analytics: '—' },
    { role: 'Safety Officer', fleet: '—', drivers: '✓', trips: 'View', fuelExp: '—', analytics: '—' },
    { role: 'Financial Analyst', fleet: 'View', drivers: '—', trips: '—', fuelExp: '✓', analytics: '✓' },
  ];

  return (
    <div>
      <div className="settings-grid">
        {/* Left: General Settings */}
        <div className="settings-form">
          <h3>General</h3>
          <div className="form-group">
            <label>Depot Name</label>
            <input className="form-input" disabled={!canEdit} value={depotName} onChange={e => setDepotName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Currency</label>
            <input className="form-input" disabled={!canEdit} value={currency} onChange={e => setCurrency(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Distance Unit</label>
            <input className="form-input" disabled={!canEdit} value={distanceUnit} onChange={e => setDistanceUnit(e.target.value)} />
          </div>
          {canEdit && (
            <button className="btn-action btn-action-primary" style={{ marginTop: 8 }} onClick={handleSave}>
              Save Changes
            </button>
          )}

          {canEdit && (
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-light)' }}>
              <button className="btn-action btn-action-danger" onClick={resetDatabase}>
                Reset Database to Demo Seeds
              </button>
            </div>
          )}
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
                {rbacMatrix.map(row => (
                  <tr key={row.role}>
                    <td style={{ fontWeight: 600 }}>{row.role}</td>
                    <td>
                      {row.fleet === '✓' ? <span className="rbac-check">✓</span> :
                       row.fleet === '—' ? <span className="rbac-dash">—</span> :
                       <span className="rbac-view">{row.fleet}</span>}
                    </td>
                    <td>
                      {row.drivers === '✓' ? <span className="rbac-check">✓</span> :
                       row.drivers === '—' ? <span className="rbac-dash">—</span> :
                       <span className="rbac-view">{row.drivers}</span>}
                    </td>
                    <td>
                      {row.trips === '✓' ? <span className="rbac-check">✓</span> :
                       row.trips === '—' ? <span className="rbac-dash">—</span> :
                       <span className="rbac-view">{row.trips}</span>}
                    </td>
                    <td>
                      {row.fuelExp === '✓' ? <span className="rbac-check">✓</span> :
                       row.fuelExp === '—' ? <span className="rbac-dash">—</span> :
                       <span className="rbac-view">{row.fuelExp}</span>}
                    </td>
                    <td>
                      {row.analytics === '✓' ? <span className="rbac-check">✓</span> :
                       row.analytics === '—' ? <span className="rbac-dash">—</span> :
                       <span className="rbac-view">{row.analytics}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
