import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const statusColor = (s) => {
  const m = {
    'Available': 'available', 'On Trip': 'on-trip', 'In Shop': 'in-shop',
    'Retired': 'retired', 'Completed': 'completed', 'Dispatched': 'dispatched',
    'Draft': 'draft', 'Cancelled': 'cancelled'
  };
  return `status-badge status-badge-${m[s] || 'draft'}`;
};

const Dashboard = () => {
  const { vehicles, drivers, trips, expenses, fuelLogs } = useApp();
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterRegion, setFilterRegion] = useState('All');

  const filtered = useMemo(() => {
    return vehicles.filter(v => {
      if (filterType !== 'All' && v.type !== filterType) return false;
      if (filterStatus !== 'All' && v.status !== filterStatus) return false;
      if (filterRegion !== 'All' && v.region !== filterRegion) return false;
      return true;
    });
  }, [vehicles, filterType, filterStatus, filterRegion]);

  // KPIs
  const activeVehicles = vehicles.filter(v => v.status !== 'Retired').length;
  const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
  const inMaintenance = vehicles.filter(v => v.status === 'In Shop').length;
  const activeTrips = trips.filter(t => t.status === 'Dispatched').length;
  const pendingTrips = trips.filter(t => t.status === 'Draft').length;
  const driversOnDuty = drivers.filter(d => d.status === 'On Trip').length;
  const fleetUtil = activeVehicles > 0
    ? Math.round(((activeVehicles - availableVehicles) / activeVehicles) * 100)
    : 0;

  // Recent trips
  const recentTrips = [...trips].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5);

  // Vehicle status distribution
  const statusCounts = {
    Available: vehicles.filter(v => v.status === 'Available').length,
    'On Trip': vehicles.filter(v => v.status === 'On Trip').length,
    'In Shop': vehicles.filter(v => v.status === 'In Shop').length,
    Retired: vehicles.filter(v => v.status === 'Retired').length,
  };

  const maxCount = Math.max(...Object.values(statusCounts), 1);
  const barColors = { Available: '#4CAF50', 'On Trip': '#2196F3', 'In Shop': '#FF9800', Retired: '#F44336' };

  return (
    <div>
      {/* Filters */}
      <div className="filter-bar">
        <label>Filters:</label>
        <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="All">Vehicle Type: All</option>
          {['Van', 'Truck', 'Sedan', 'Semi'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="All">Status: All</option>
          {['Available', 'On Trip', 'In Shop', 'Retired'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filterRegion} onChange={e => setFilterRegion(e.target.value)}>
          <option value="All">Region: All</option>
          {['North', 'East', 'South', 'West'].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Active Vehicles</div>
          <div className="kpi-value">{activeVehicles}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Available Vehicles</div>
          <div className="kpi-value">{availableVehicles}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Vehicles in Maintenance</div>
          <div className="kpi-value">{String(inMaintenance).padStart(2, '0')}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Active Trips</div>
          <div className="kpi-value">{activeTrips}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Pending Trips</div>
          <div className="kpi-value">{String(pendingTrips).padStart(2, '0')}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Drivers on Duty</div>
          <div className="kpi-value">{driversOnDuty}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Fleet Utilization</div>
          <div className="kpi-value">{fleetUtil}%</div>
        </div>
      </div>

      {/* Main Grid: Recent Trips + Vehicle Status */}
      <div className="dashboard-grid">
        {/* Recent Trips Table */}
        <div className="dash-section">
          <h4>Recent Trips</h4>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Trip</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>ETA</th>
                </tr>
              </thead>
              <tbody>
                {recentTrips.map(trip => (
                  <tr key={trip.id}>
                    <td style={{ fontWeight: 600 }}>{trip.id.replace('trip-', 'TR').substring(0, 7).toUpperCase()}</td>
                    <td>{trip.vehicleId}</td>
                    <td>{trip.driverName || '—'}</td>
                    <td><span className={statusColor(trip.status)}>{trip.status}</span></td>
                    <td style={{ color: 'var(--slate-gray)', fontSize: '0.82rem' }}>
                      {trip.status === 'Dispatched' ? '~45 min' :
                       trip.status === 'Completed' ? '—' :
                       trip.status === 'Draft' ? 'Awaiting vehicle' :
                       trip.status === 'Cancelled' ? 'Vehicle went to shop' : '—'}
                    </td>
                  </tr>
                ))}
                {recentTrips.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--slate-gray)', padding: '32px' }}>No trips recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicle Status Chart */}
        <div className="dash-section">
          <h4>Vehicle Status</h4>
          <div className="vehicle-status-bar">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div className="status-bar-row" key={status}>
                <span className="status-bar-label">{status}</span>
                <div className="status-bar-track">
                  <div
                    className="status-bar-fill"
                    style={{
                      width: `${(count / maxCount) * 100}%`,
                      background: barColors[status],
                      minWidth: count > 0 ? '16px' : '0'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
