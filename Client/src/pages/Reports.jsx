import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatMoney } from '../utils/enums';
import * as reportsApi from '../api/reports';

const Reports = () => {
  const { vehicles, reportsOverview, refreshReports, showToast } = useApp();
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    refreshReports({ vehicleId: vehicleFilter !== 'All' ? vehicleFilter : undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleFilter]);

  const rows = reportsOverview?.vehicles || [];
  const fleetUtilizationPct = reportsOverview?.fleetUtilizationPct ?? 0;

  const totals = useMemo(() => {
    const totalRevenue = rows.reduce((s, v) => s + Number(v.totalRevenue || 0), 0);
    const totalOpCost = rows.reduce((s, v) => s + Number(v.operationalCost || 0), 0);
    const totalAcqCost = rows.reduce((s, v) => s + Number(v.acquisitionCost || 0), 0);
    const totalFuelLiters = rows.reduce((s, v) => s + Number(v.totalFuelLiters || 0), 0);
    const totalDistance = rows.reduce((s, v) => s + Number(v.totalDistanceKm || 0), 0);
    const fuelEfficiency = totalFuelLiters > 0 ? (totalDistance / totalFuelLiters).toFixed(2) : '—';
    const roiPct = totalAcqCost > 0 ? (((totalRevenue - totalOpCost) / totalAcqCost) * 100).toFixed(1) : '—';
    return { totalRevenue, totalOpCost, totalAcqCost, fuelEfficiency, roiPct };
  }, [rows]);

  const vehicleCosts = useMemo(() => {
    return [...rows]
      .sort((a, b) => Number(b.operationalCost || 0) - Number(a.operationalCost || 0))
      .slice(0, 5);
  }, [rows]);

  const maxCost = Math.max(...vehicleCosts.map((v) => Number(v.operationalCost || 0)), 1);
  const costColors = ['#F44336', '#FF9800', '#2196F3', '#4CAF50', '#9C27B0'];

  const handlePrint = () => window.print();

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const blob = await reportsApi.downloadReportsCsv({
        vehicleId: vehicleFilter !== 'All' ? vehicleFilter : undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transitops-report.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      showToast(err.message || 'Failed to export CSV', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      {/* ROI Formula */}
      <div style={{ fontSize: '0.78rem', color: 'var(--slate-gray)', marginBottom: 16 }}>
        ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost
      </div>

      {/* Vehicle Filter */}
      <div className="filter-bar">
        <label>Scope:</label>
        <select className="filter-select" value={vehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)}>
          <option value="All">Whole Fleet</option>
          {vehicles.map((v) => <option key={v.id} value={v.id}>{v.registrationNumber}</option>)}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="analytics-kpi-grid">
        <div className="analytics-kpi">
          <div className="kpi-label">Fuel Efficiency</div>
          <div className="kpi-value">{totals.fuelEfficiency} km/l</div>
        </div>
        <div className="analytics-kpi">
          <div className="kpi-label">Fleet Utilization</div>
          <div className="kpi-value">{fleetUtilizationPct}%</div>
        </div>
        <div className="analytics-kpi">
          <div className="kpi-label">Operational Cost</div>
          <div className="kpi-value">{formatMoney(totals.totalOpCost)}</div>
        </div>
        <div className="analytics-kpi">
          <div className="kpi-label">ROI</div>
          <div className="kpi-value">{totals.roiPct}{totals.roiPct !== '—' ? '%' : ''}</div>
        </div>
      </div>

      {/* Top Costliest Vehicles */}
      <div className="analytics-charts-grid">
        <div className="dash-section">
          <h4>Top Costliest Vehicles</h4>
          <div className="vehicle-status-bar">
            {vehicleCosts.map((v, i) => (
              <div className="status-bar-row" key={v.vehicleId}>
                <span className="status-bar-label">{v.registrationNumber}</span>
                <div className="status-bar-track">
                  <div
                    className="status-bar-fill"
                    style={{
                      width: `${(Number(v.operationalCost || 0) / maxCost) * 100}%`,
                      background: costColors[i % costColors.length],
                      minWidth: Number(v.operationalCost || 0) > 0 ? '16px' : '0',
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

        {/* Per-vehicle Table */}
        <div className="dash-section">
          <h4>Per-Vehicle Breakdown</h4>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Distance</th>
                  <th>Fuel</th>
                  <th>Op. Cost</th>
                  <th>Revenue</th>
                  <th>ROI</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((v) => (
                  <tr key={v.vehicleId}>
                    <td style={{ fontWeight: 600 }}>{v.registrationNumber}</td>
                    <td>{Number(v.totalDistanceKm || 0).toLocaleString()} km</td>
                    <td>{v.fuelEfficiencyKmPerLtr != null ? `${v.fuelEfficiencyKmPerLtr} km/l` : '—'}</td>
                    <td>{formatMoney(v.operationalCost)}</td>
                    <td>{formatMoney(v.totalRevenue)}</td>
                    <td>{v.roi != null ? `${(v.roi * 100).toFixed(1)}%` : '—'}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--slate-gray)', padding: 32 }}>No report data available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Print / Export */}
      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <button className="btn-action btn-action-dark" onClick={handlePrint}>Print / Export PDF</button>
        <button className="btn-action btn-action-secondary" onClick={handleExportCsv} disabled={exporting}>
          {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>
    </div>
  );
};

export default Reports;
