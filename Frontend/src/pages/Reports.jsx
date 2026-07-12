import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const Reports = () => {
  const {
    vehicles, trips, expenses, fuelLogs,
    getVehicleOperationalCost, getVehicleRevenue,
    getVehicleDistanceTraveled, getVehicleFuelConsumed
  } = useApp();

  // KPI calculations
  const totalFuelConsumed = useMemo(() => fuelLogs.reduce((s, f) => s + f.liters, 0), [fuelLogs]);
  const totalDistance = useMemo(() =>
    trips.filter(t => t.status === 'Completed').reduce((s, t) => s + t.distance, 0), [trips]);
  const fuelEfficiency = totalFuelConsumed > 0 ? (totalDistance / totalFuelConsumed).toFixed(1) : '0.0';

  const activeVehicles = vehicles.filter(v => v.status !== 'Retired').length;
  const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
  const fleetUtil = activeVehicles > 0 ? Math.round(((activeVehicles - availableVehicles) / activeVehicles) * 100) : 0;

  const totalOpCost = useMemo(() => expenses.reduce((s, e) => s + e.cost, 0), [expenses]);

  const totalRevenue = useMemo(() =>
    trips.filter(t => t.status === 'Completed').reduce((s, t) => s + t.revenue, 0), [trips]);
  const totalAcqCost = useMemo(() => vehicles.reduce((s, v) => s + v.acquisitionCost, 0), [vehicles]);
  const vehicleROI = totalAcqCost > 0 ? (((totalRevenue - totalOpCost) / totalAcqCost) * 100).toFixed(1) : '0.0';

  // Monthly revenue data (demo)
  const monthlyRevenue = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    return months.map((m, i) => ({
      name: m,
      revenue: Math.floor(Math.random() * 5000 + 2000 + (i * 800))
    }));
  }, []);

  // Top costliest vehicles
  const vehicleCosts = useMemo(() => {
    return vehicles
      .map(v => ({
        name: v.registrationNumber,
        cost: getVehicleOperationalCost(v.registrationNumber)
      }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5);
  }, [vehicles, expenses]);

  const maxCost = Math.max(...vehicleCosts.map(v => v.cost), 1);
  const costColors = ['#F44336', '#FF9800', '#2196F3', '#4CAF50', '#9C27B0'];

  const handlePrint = () => window.print();

  return (
    <div>
      {/* ROI Formula */}
      <div style={{ fontSize: '0.78rem', color: 'var(--slate-gray)', marginBottom: 16 }}>
        ROI = (Revenue − Maintenance + Fuel) / Acquisition Cost
      </div>

      {/* KPI Cards */}
      <div className="analytics-kpi-grid">
        <div className="analytics-kpi">
          <div className="kpi-label">Fuel Efficiency</div>
          <div className="kpi-value">{fuelEfficiency} km/l</div>
        </div>
        <div className="analytics-kpi">
          <div className="kpi-label">Fleet Utilization</div>
          <div className="kpi-value">{fleetUtil}%</div>
        </div>
        <div className="analytics-kpi">
          <div className="kpi-label">Operational Cost</div>
          <div className="kpi-value">{totalOpCost.toLocaleString()}</div>
        </div>
        <div className="analytics-kpi">
          <div className="kpi-label">Vehicle ROI</div>
          <div className="kpi-value">{vehicleROI}%</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="analytics-charts-grid">
        {/* Monthly Revenue Bar Chart */}
        <div className="dash-section">
          <h4>Monthly Revenue</h4>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#696969' }} />
                <YAxis tick={{ fontSize: 12, fill: '#696969' }} />
                <Tooltip />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                  {monthlyRevenue.map((_, i) => (
                    <Cell key={i} fill="#2196F3" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Costliest Vehicles */}
        <div className="dash-section">
          <h4>Top Costliest Vehicles</h4>
          <div className="vehicle-status-bar">
            {vehicleCosts.map((v, i) => (
              <div className="status-bar-row" key={v.name}>
                <span className="status-bar-label">{v.name}</span>
                <div className="status-bar-track">
                  <div
                    className="status-bar-fill"
                    style={{
                      width: `${(v.cost / maxCost) * 100}%`,
                      background: costColors[i % costColors.length],
                      minWidth: v.cost > 0 ? '16px' : '0'
                    }}
                  />
                </div>
              </div>
            ))}
            {vehicleCosts.length === 0 && (
              <div style={{ color: 'var(--slate-gray)', padding: 20, textAlign: 'center' }}>No cost data available.</div>
            )}
          </div>
        </div>
      </div>

      {/* Print / Export */}
      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <button className="btn-action btn-action-dark" onClick={handlePrint}>Print / Export PDF</button>
      </div>
    </div>
  );
};

export default Reports;
