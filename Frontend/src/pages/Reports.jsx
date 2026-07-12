import React from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Download, Printer, ArrowUpRight, ArrowDownRight, Award } from 'lucide-react';

const Reports = () => {
  const {
    vehicles,
    trips,
    expenses,
    getVehicleRevenue,
    getVehicleDistanceTraveled,
    getVehicleFuelConsumed
  } = useApp();

  // Aggregate Metrics per vehicle
  const reportRows = vehicles.map(v => {
    const revenue = getVehicleRevenue(v.registrationNumber);
    
    // Strict Maintenance + Fuel from expenses
    const fuelCost = expenses
      .filter(e => e.vehicleId === v.registrationNumber && e.type === 'Fuel')
      .reduce((sum, e) => sum + e.cost, 0);
      
    const maintCost = expenses
      .filter(e => e.vehicleId === v.registrationNumber && e.type === 'Maintenance')
      .reduce((sum, e) => sum + e.cost, 0);
      
    const operationalCost = expenses
      .filter(e => e.vehicleId === v.registrationNumber)
      .reduce((sum, e) => sum + e.cost, 0);

    const distance = getVehicleDistanceTraveled(v.registrationNumber);
    const fuelLiters = getVehicleFuelConsumed(v.registrationNumber);

    // Fuel Efficiency = Distance / Fuel consumed
    const efficiency = fuelLiters > 0 ? (distance / fuelLiters).toFixed(2) : 'N/A';

    // ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
    const numerator = revenue - (maintCost + fuelCost);
    const roiRaw = v.acquisitionCost > 0 ? (numerator / v.acquisitionCost) : 0;
    const roi = (roiRaw * 100).toFixed(2);

    return {
      regNumber: v.registrationNumber,
      name: v.name,
      type: v.type,
      acquisitionCost: v.acquisitionCost,
      distance,
      fuelLiters,
      efficiency,
      revenue,
      maintCost,
      fuelCost,
      operationalCost,
      roi: Number(roi),
      status: v.status
    };
  });

  // Calculate global fleet summary
  const totalFleetRevenue = reportRows.reduce((sum, r) => sum + r.revenue, 0);
  const totalFleetMaint = reportRows.reduce((sum, r) => sum + r.maintCost, 0);
  const totalFleetFuel = reportRows.reduce((sum, r) => sum + r.fuelCost, 0);
  const totalFleetAcqCost = reportRows.reduce((sum, r) => sum + r.acquisitionCost, 0) || 1;

  // Global ROI = (Total Revenue - (Total Maint + Total Fuel)) / Total Acquisition Cost
  const globalRoi = (((totalFleetRevenue - (totalFleetMaint + totalFleetFuel)) / totalFleetAcqCost) * 100).toFixed(2);

  // Trigger print-to-PDF
  const handlePrint = () => {
    window.print();
  };

  // Trigger CSV export
  const handleCSVExport = () => {
    const headers = [
      'Registration Number',
      'Vehicle Model',
      'Type',
      'Acquisition Cost ($)',
      'Total Distance (km)',
      'Fuel Consumed (L)',
      'Fuel Efficiency (km/L)',
      'Completed Revenue ($)',
      'Maintenance Cost ($)',
      'Fuel Costs ($)',
      'Total Operating Cost ($)',
      'ROI (%)',
      'Status'
    ];

    const rows = reportRows.map(r => [
      r.regNumber,
      `"${r.name}"`,
      r.type,
      r.acquisitionCost,
      r.distance,
      r.fuelLiters,
      r.efficiency,
      r.revenue,
      r.maintCost,
      r.fuelCost,
      r.operationalCost,
      `${r.roi}%`,
      r.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TransitOps_Fleet_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Title Bar */}
      <div className="flex-between no-print">
        <div>
          <span className="eyebrow" style={{ marginBottom: '8px' }}>• FINANCIAL AUDIT</span>
          <h2 style={{ fontWeight: 700 }}>Fleet ROI & Performance</h2>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleCSVExport} className="btn-secondary" style={{ gap: '6px', borderColor: 'var(--ink-black)' }}>
            <Download size={16} /> Export CSV
          </button>
          <button onClick={handlePrint} className="btn-primary" style={{ gap: '6px' }}>
            <Printer size={16} /> Print PDF Report
          </button>
        </div>
      </div>

      {/* Header specifically for print view (hidden on screen) */}
      <div className="print-only" style={{ display: 'none', marginBottom: '32px', textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>TransitOps Corp</h1>
        <h2 style={{ fontSize: '1.5rem', color: '#555' }}>Official Fleet Operational Performance & ROI Audit</h2>
        <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '6px' }}>
          Report Date: {new Date('2026-07-12').toDateString()} | System Ledger Balance Sheet
        </p>
      </div>

      {/* Top Global Statistics Panel */}
      <div className="grid-3">
        <div className="card-elevated" style={{ borderLeft: '4px solid var(--ink-black)' }}>
          <span className="eyebrow" style={{ marginBottom: '6px' }}>• COMBINED FLEET ROI</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '2.25rem', fontWeight: 700, lineHeight: 1 }}>{globalRoi}%</span>
            {Number(globalRoi) >= 0 ? (
              <span className="badge badge-success" style={{ padding: '2px 6px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <ArrowUpRight size={10} /> Profitable
              </span>
            ) : (
              <span className="badge badge-danger" style={{ padding: '2px 6px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <ArrowDownRight size={10} /> Loss
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--slate-gray)', marginTop: '8px' }}>
            Lifetime profit margins calculated against fleet capital acquisition costs
          </p>
        </div>

        <div className="card-elevated" style={{ borderLeft: '4px solid var(--light-signal-orange)' }}>
          <span className="eyebrow" style={{ marginBottom: '6px' }}>• TOTAL ROAD REVENUE</span>
          <span style={{ fontSize: '2.25rem', fontWeight: 700, display: 'block', lineHeight: 1 }}>
            ${totalFleetRevenue.toLocaleString()}
          </span>
          <p style={{ fontSize: '0.8rem', color: 'var(--slate-gray)', marginTop: '8px' }}>
            Combined earnings gathered from all completed dispatches
          </p>
        </div>

        <div className="card-elevated" style={{ borderLeft: '4px solid var(--signal-orange)' }}>
          <span className="eyebrow" style={{ marginBottom: '6px' }}>• RUNNING OVERHEADS</span>
          <span style={{ fontSize: '2.25rem', fontWeight: 700, display: 'block', lineHeight: 1 }}>
            ${(totalFleetFuel + totalFleetMaint).toLocaleString()}
          </span>
          <p style={{ fontSize: '0.8rem', color: 'var(--slate-gray)', marginTop: '8px' }}>
            Strict fuel consumption (${totalFleetFuel.toLocaleString()}) and maintenance (${totalFleetMaint.toLocaleString()}) overheads
          </p>
        </div>
      </div>

      {/* Main Reports Performance Table */}
      <div className="table-container card-elevated" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Vehicle ID</th>
              <th>Type</th>
              <th>Acquisition Cost</th>
              <th>Distance (km)</th>
              <th>Fuel (L)</th>
              <th>Fuel Efficiency</th>
              <th>Revenue</th>
              <th>Fuel Costs</th>
              <th>Maintenance</th>
              <th>ROI (%)</th>
              <th className="no-print">Status</th>
            </tr>
          </thead>
          <tbody>
            {reportRows.map(r => (
              <tr key={r.regNumber}>
                <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{r.regNumber}</td>
                <td>{r.type}</td>
                <td>${r.acquisitionCost.toLocaleString()}</td>
                <td>{r.distance.toLocaleString()} km</td>
                <td>{r.fuelLiters > 0 ? `${r.fuelLiters.toLocaleString()} L` : '0 L'}</td>
                <td>
                  <span style={{ fontWeight: r.efficiency !== 'N/A' ? '700' : '400' }}>
                    {r.efficiency} {r.efficiency !== 'N/A' && 'km/L'}
                  </span>
                </td>
                <td style={{ color: '#1D6930', fontWeight: 600 }}>${r.revenue.toLocaleString()}</td>
                <td>${r.fuelCost.toLocaleString()}</td>
                <td>${r.maintCost.toLocaleString()}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ 
                      fontWeight: 700, 
                      color: r.roi > 0 ? '#1D6930' : r.roi < 0 ? 'var(--signal-orange)' : 'var(--ink-black)' 
                    }}>
                      {r.roi}%
                    </span>
                    {r.roi > 0 && <ArrowUpRight size={12} style={{ color: '#1D6930' }} />}
                    {r.roi < 0 && <ArrowDownRight size={12} style={{ color: 'var(--signal-orange)' }} />}
                  </div>
                </td>
                <td className="no-print">
                  <span className={`badge ${
                    r.status === 'Available' ? 'badge-success' : 
                    r.status === 'On Trip' ? 'badge-info' : 
                    r.status === 'In Shop' ? 'badge-warning' : 'badge-danger'
                  }`} style={{ fontSize: '0.65rem' }}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Audit note for official prints */}
      <div className="print-only" style={{ display: 'none', marginTop: '48px', borderTop: '1px solid #ccc', paddingTop: '16px', fontSize: '10pt', color: '#666' }}>
        <p>This document is a certified snapshot of vehicle dispatches, license compliance, and maintenance ledgers. Generated by TransitOps Platform.</p>
        <p style={{ marginTop: '6px', fontWeight: 'bold' }}>Auditor Signature: ___________________________</p>
      </div>

    </div>
  );
};

export default Reports;
