import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';
import { Truck, Navigation, ShieldAlert, Award, Wrench, Fuel, DollarSign, Filter, RefreshCw, Activity } from 'lucide-react';

const Dashboard = () => {
  const {
    vehicles,
    drivers,
    trips,
    expenses,
    getVehicleOperationalCost,
    getVehicleRevenue
  } = useApp();

  // Filters
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('All');
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');

  // Clear filters
  const resetFilters = () => {
    setVehicleTypeFilter('All');
    setVehicleStatusFilter('All');
    setRegionFilter('All');
  };

  // Filter vehicles
  const filteredVehicles = vehicles.filter(v => {
    const matchType = vehicleTypeFilter === 'All' || v.type === vehicleTypeFilter;
    const matchStatus = vehicleStatusFilter === 'All' || v.status === vehicleStatusFilter;
    const matchRegion = regionFilter === 'All' || v.region === regionFilter;
    return matchType && matchStatus && matchRegion;
  });

  const filteredRegNumbers = filteredVehicles.map(v => v.registrationNumber);

  // Compute KPIs
  const totalVehiclesCount = filteredVehicles.length;
  const activeVehiclesCount = filteredVehicles.filter(v => v.status === 'On Trip').length;
  const availableVehiclesCount = filteredVehicles.filter(v => v.status === 'Available').length;
  const inMaintenanceCount = filteredVehicles.filter(v => v.status === 'In Shop').length;
  const retiredCount = filteredVehicles.filter(v => v.status === 'Retired').length;

  // Fleet utilization: active / (active + available + in_shop)
  const activeFleetCount = filteredVehicles.filter(v => v.status !== 'Retired').length;
  const fleetUtilization = activeFleetCount > 0 
    ? Math.round((activeVehiclesCount / activeFleetCount) * 100) 
    : 0;

  // Active & Pending Trips
  const activeTripsCount = trips.filter(t => 
    filteredRegNumbers.includes(t.vehicleId) && t.status === 'Dispatched'
  ).length;

  const pendingTripsCount = trips.filter(t => 
    filteredRegNumbers.includes(t.vehicleId) && t.status === 'Draft'
  ).length;

  // Drivers on Duty (Available or On Trip)
  const driversOnDuty = drivers.filter(d => d.status === 'Available' || d.status === 'On Trip').length;

  // 1. Chart Data: Expense Breakdown (Fuel, Maintenance, Tolls/Other)
  const filteredExpenses = expenses.filter(e => filteredRegNumbers.includes(e.vehicleId));
  
  const fuelExpenseTotal = filteredExpenses.filter(e => e.type === 'Fuel').reduce((sum, e) => sum + e.cost, 0);
  const maintExpenseTotal = filteredExpenses.filter(e => e.type === 'Maintenance').reduce((sum, e) => sum + e.cost, 0);
  const otherExpenseTotal = filteredExpenses.filter(e => e.type !== 'Fuel' && e.type !== 'Maintenance').reduce((sum, e) => sum + e.cost, 0);

  const expensePieData = [
    { name: 'Fuel Costs', value: fuelExpenseTotal || 1 },
    { name: 'Maintenance', value: maintExpenseTotal || 1 },
    { name: 'Tolls & Other', value: otherExpenseTotal || 1 }
  ];

  const PIE_COLORS = ['#141413', '#CF4500', '#F37338'];

  // 2. Chart Data: Utilization Trend (7-day mockup ending in today's calculated value)
  const utilizationTrendData = [
    { day: 'Mon', rate: 58 },
    { day: 'Tue', rate: 64 },
    { day: 'Wed', rate: 70 },
    { day: 'Thu', rate: 68 },
    { day: 'Fri', rate: 75 },
    { day: 'Sat', rate: 60 },
    { day: 'Today', rate: fleetUtilization }
  ];

  // 3. Chart Data: Revenue vs Cost per Vehicle
  const barChartData = filteredVehicles
    .filter(v => v.status !== 'Retired')
    .map(v => {
      const revenue = getVehicleRevenue(v.registrationNumber);
      const cost = getVehicleOperationalCost(v.registrationNumber);
      return {
        name: v.registrationNumber,
        Revenue: revenue,
        Cost: cost
      };
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Page Title & Context Bar */}
      <div className="flex-between">
        <div>
          <span className="eyebrow" style={{ marginBottom: '8px' }}>• LIVE DISPATCH CONTROL</span>
          <h2 style={{ fontWeight: 700 }}>Operational Overview</h2>
        </div>
        
        {/* Quick Role Notice */}
        <div className="card-raised" style={{ padding: '8px 16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4CAF50' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Active Role: Dashboard View</span>
        </div>
      </div>

      {/* Filter Bar Panel */}
      <div className="card-raised" style={{ padding: '20px 24px', borderRadius: '24px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--slate-gray)' }}>
          <Filter size={18} />
          <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Filter Fleet</span>
        </div>

        {/* Filter inputs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', flexGrow: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Type:</span>
            <select 
              value={vehicleTypeFilter} 
              onChange={(e) => setVehicleTypeFilter(e.target.value)}
              className="form-select"
              style={{ padding: '6px 14px', borderRadius: '14px', width: '130px', fontSize: '0.85rem' }}
            >
              <option value="All">All Types</option>
              <option value="Van">Van</option>
              <option value="Truck">Truck</option>
              <option value="Sedan">Sedan</option>
              <option value="Semi">Semi</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Status:</span>
            <select 
              value={vehicleStatusFilter} 
              onChange={(e) => setVehicleStatusFilter(e.target.value)}
              className="form-select"
              style={{ padding: '6px 14px', borderRadius: '14px', width: '140px', fontSize: '0.85rem' }}
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
              <option value="Retired">Retired</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Region:</span>
            <select 
              value={regionFilter} 
              onChange={(e) => setRegionFilter(e.target.value)}
              className="form-select"
              style={{ padding: '6px 14px', borderRadius: '14px', width: '130px', fontSize: '0.85rem' }}
            >
              <option value="All">All Regions</option>
              <option value="North">North</option>
              <option value="East">East</option>
              <option value="South">South</option>
              <option value="West">West</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        <button
          onClick={resetFilters}
          className="btn-secondary"
          style={{ padding: '6px 16px', fontSize: '0.85rem', borderRadius: '14px', gap: '6px' }}
        >
          <RefreshCw size={12} /> Reset Filters
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid-4">
        {/* KPI: Utilization */}
        <div className="card-elevated" style={{ borderLeft: '4px solid var(--light-signal-orange)' }}>
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-gray)', textTransform: 'uppercase' }}>Fleet Utilization</span>
            <Activity size={20} style={{ color: 'var(--light-signal-orange)' }} />
          </div>
          <span style={{ fontSize: '2.25rem', fontWeight: 700, display: 'block', lineHeight: 1 }}>{fleetUtilization}%</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--slate-gray)', marginTop: '6px', display: 'block' }}>
            {activeVehiclesCount} of {activeFleetCount} active assets on duty
          </span>
        </div>

        {/* KPI: Active Dispatches */}
        <div className="card-elevated" style={{ borderLeft: '4px solid var(--link-blue)' }}>
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-gray)', textTransform: 'uppercase' }}>Active dispatches</span>
            <Navigation size={20} style={{ color: 'var(--link-blue)' }} />
          </div>
          <span style={{ fontSize: '2.25rem', fontWeight: 700, display: 'block', lineHeight: 1 }}>{activeTripsCount}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--slate-gray)', marginTop: '6px', display: 'block' }}>
            {pendingTripsCount} loads pending dispatch
          </span>
        </div>

        {/* KPI: Available Assets */}
        <div className="card-elevated" style={{ borderLeft: '4px solid #4CAF50' }}>
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-gray)', textTransform: 'uppercase' }}>Available Assets</span>
            <Truck size={20} style={{ color: '#4CAF50' }} />
          </div>
          <span style={{ fontSize: '2.25rem', fontWeight: 700, display: 'block', lineHeight: 1 }}>{availableVehiclesCount}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--slate-gray)', marginTop: '6px', display: 'block' }}>
            Ready for route assignment
          </span>
        </div>

        {/* KPI: Maintenance Shop */}
        <div className="card-elevated" style={{ borderLeft: '4px solid var(--signal-orange)' }}>
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-gray)', textTransform: 'uppercase' }}>In Maintenance</span>
            <Wrench size={20} style={{ color: 'var(--signal-orange)' }} />
          </div>
          <span style={{ fontSize: '2.25rem', fontWeight: 700, display: 'block', lineHeight: 1 }}>{inMaintenanceCount}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--slate-gray)', marginTop: '6px', display: 'block' }}>
            Assets offline (In Shop)
          </span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid-2">
        {/* Trend Area Chart */}
        <div className="card-elevated" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>7-Day Utilization Trend (%)</h3>
          <div style={{ flexGrow: 1, width: '100%', height: '80%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={utilizationTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="utilGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--light-signal-orange)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--light-signal-orange)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="var(--slate-gray)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--slate-gray)" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--white)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)' }} 
                  labelStyle={{ fontWeight: 700 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="var(--light-signal-orange)" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#utilGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses Donut Chart */}
        <div className="card-elevated" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Fleet Expense Allocation ($)</h3>
          <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}>
            {fuelExpenseTotal === 0 && maintExpenseTotal === 0 && otherExpenseTotal === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--slate-gray)' }}>
                <DollarSign size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <span>No expense data logged for selected filter</span>
              </div>
            ) : (
              <>
                <div style={{ width: '50%', height: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {expensePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`$${value}`, 'Cost']}
                        contentStyle={{ backgroundColor: 'var(--white)', borderRadius: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Legend */}
                <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {expensePieData.map((item, index) => {
                    const total = fuelExpenseTotal + maintExpenseTotal + otherExpenseTotal || 1;
                    const pct = Math.round((item.value / total) * 100);
                    return (
                      <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: PIE_COLORS[index] }} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--slate-gray)' }}>
                            ${item.value.toLocaleString()} ({pct}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cost vs Revenue Bar Chart */}
      <div className="card-elevated" style={{ height: '380px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>Revenue vs. Operating Cost per Vehicle ($)</h3>
        <div style={{ flexGrow: 1, width: '100%', height: '80%' }}>
          {barChartData.length === 0 ? (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-gray)' }}>
              <span>No vehicle assets match current filters</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="var(--slate-gray)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--slate-gray)" fontSize={11} tickLine={false} />
                <Tooltip 
                  formatter={(value) => [`$${value}`, '']}
                  contentStyle={{ backgroundColor: 'var(--white)', borderRadius: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Revenue" fill="var(--ink-black)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Cost" fill="var(--light-signal-orange)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Duty Overview Roster Snippet */}
      <div className="card-elevated" style={{ padding: '24px' }}>
        <div className="flex-between" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Driver Safety & Scoreboard Overview</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--slate-gray)' }}>
            {driversOnDuty} on duty drivers
          </span>
        </div>
        <div className="grid-3">
          {drivers.slice(0, 3).map((driver) => {
            const isExpired = new Date(driver.licenseExpiryDate) < new Date('2026-07-12');
            return (
              <div key={driver.name} className="card-raised" style={{ position: 'relative' }}>
                <span className="eyebrow" style={{ fontSize: '0.7rem', marginBottom: '8px' }}>Driver profile</span>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>{driver.name}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--slate-gray)', marginBottom: '12px' }}>
                  License Category: {driver.licenseCategory}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Safety Score:</span>
                  <div style={{ flexGrow: 1, height: '6px', backgroundColor: 'var(--canvas-cream)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${driver.safetyScore}%`, 
                      height: '100%', 
                      backgroundColor: driver.safetyScore > 85 ? '#4CAF50' : driver.safetyScore > 70 ? 'var(--light-signal-orange)' : 'var(--signal-orange)'
                    }} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{driver.safetyScore}</span>
                </div>
                <div style={{ marginTop: '10px', display: 'flex', gap: '6px' }}>
                  <span className={`badge ${
                    driver.status === 'Available' ? 'badge-success' : 
                    driver.status === 'On Trip' ? 'badge-info' : 
                    driver.status === 'Suspended' ? 'badge-danger' : 'badge-neutral'
                  }`} style={{ fontSize: '0.65rem' }}>
                    {driver.status}
                  </span>
                  {isExpired && (
                    <span className="badge badge-danger" style={{ fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      <ShieldAlert size={10} /> Expired
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
