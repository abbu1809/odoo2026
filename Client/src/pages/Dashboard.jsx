import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { VEHICLE_TYPES, VEHICLE_STATUSES, humanize, slug } from '../utils/enums';

const Dashboard = () => {
  const { vehicles, drivers, trips, dashboardKpis, refreshDashboard } = useApp();
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterRegion, setFilterRegion] = useState('All');

  useEffect(() => {
    refreshDashboard({
      type: filterType !== 'All' ? filterType : undefined,
      status: filterStatus !== 'All' ? filterStatus : undefined,
      region: filterRegion !== 'All' ? filterRegion : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, filterStatus, filterRegion]);

  const regions = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.region).filter(Boolean))),
    [vehicles]
  );

  const vehicleById = (id) => vehicles.find((v) => v.id === id);
  const driverById = (id) => drivers.find((d) => d.id === id);

  // Recent trips
  const recentTrips = [...trips]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Vehicle status distribution (client-side, from the full vehicle list)
  const statusCounts = {
    AVAILABLE: vehicles.filter((v) => v.status === 'AVAILABLE').length,
    ON_TRIP: vehicles.filter((v) => v.status === 'ON_TRIP').length,
    IN_SHOP: vehicles.filter((v) => v.status === 'IN_SHOP').length,
    RETIRED: vehicles.filter((v) => v.status === 'RETIRED').length,
  };
  const maxCount = Math.max(...Object.values(statusCounts), 1);
  const barColors = { AVAILABLE: '#4CAF50', ON_TRIP: '#2196F3', IN_SHOP: '#FF9800', RETIRED: '#F44336' };

  const k = dashboardKpis || {};

  return (
    <div>
      {/* Filters */}
      <div className="filter-bar">
        <label>Filters:</label>
        <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="All">Vehicle Type: All</option>
          {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{humanize(t)}</option>)}
        </select>
        <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="All">Status: All</option>
          {VEHICLE_STATUSES.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}
        </select>
        <select className="filter-select" value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)}>
          <option value="All">Region: All</option>
          {regions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Active Vehicles</div>
          <div className="kpi-value">{k.activeVehicles ?? '—'}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Available Vehicles</div>
          <div className="kpi-value">{k.availableVehicles ?? '—'}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Vehicles in Maintenance</div>
          <div className="kpi-value">{k.vehiclesInMaintenance != null ? String(k.vehiclesInMaintenance).padStart(2, '0') : '—'}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Active Trips</div>
          <div className="kpi-value">{k.activeTrips ?? '—'}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Pending Trips</div>
          <div className="kpi-value">{k.pendingTrips != null ? String(k.pendingTrips).padStart(2, '0') : '—'}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Drivers on Duty</div>
          <div className="kpi-value">{k.driversOnDuty ?? '—'}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Fleet Utilization</div>
          <div className="kpi-value">{k.fleetUtilizationPct != null ? `${k.fleetUtilizationPct}%` : '—'}</div>
        </div>
        {filterStatus !== 'All' && k.filteredVehicleCount != null && (
          <div className="kpi-card">
            <div className="kpi-label">Matching Filter</div>
            <div className="kpi-value">{k.filteredVehicleCount}</div>
          </div>
        )}
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
                </tr>
              </thead>
              <tbody>
                {recentTrips.map((trip) => (
                  <tr key={trip.id}>
                    <td style={{ fontWeight: 600 }}>{trip.id.slice(-8).toUpperCase()}</td>
                    <td>{vehicleById(trip.vehicleId)?.registrationNumber || '—'}</td>
                    <td>{driverById(trip.driverId)?.name || '—'}</td>
                    <td><span className={`status-badge status-badge-${slug(trip.status)}`}>{humanize(trip.status)}</span></td>
                  </tr>
                ))}
                {recentTrips.length === 0 && (
                  <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--slate-gray)', padding: '32px' }}>No trips recorded yet.</td></tr>
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
                <span className="status-bar-label">{humanize(status)}</span>
                <div className="status-bar-track">
                  <div
                    className="status-bar-fill"
                    style={{
                      width: `${(count / maxCount) * 100}%`,
                      background: barColors[status],
                      minWidth: count > 0 ? '16px' : '0',
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
