import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Truck, Shield, User, DollarSign, Menu, Search, LogOut } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { activeUserRole, setActiveUserRole, showToast } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const roles = [
    { name: 'Fleet Manager', icon: Truck, color: '#3860BE', desc: 'Manage assets, dispatches, & logs' },
    { name: 'Driver', icon: User, color: '#4CAF50', desc: 'Log trips, fuel, & odometers' },
    { name: 'Safety Officer', icon: Shield, color: '#CF4500', desc: 'Track compliance & safety scores' },
    { name: 'Financial Analyst', icon: DollarSign, color: '#7F6000', desc: 'Analyze costs, revenue, & ROI' }
  ];

  const handleRoleChange = (roleName) => {
    setActiveUserRole(roleName);
    setDropdownOpen(false);
    showToast(`Switched view to ${roleName} mode`, 'info');
  };

  const getRoleIcon = (roleName) => {
    const role = roles.find((r) => r.name === roleName);
    return role ? role.icon : Truck;
  };

  const ActiveRoleIcon = getRoleIcon(activeUserRole);

  return (
    <nav className="floating-nav no-print">
      {/* Brand Logo */}
      <div 
        className="flex-center" 
        style={{ gap: '10px', cursor: 'pointer' }}
        onClick={() => setActiveTab('landing')}
      >
        <div style={{ display: 'flex', position: 'relative', width: '38px', height: '24px' }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#EB001B',
            opacity: 0.9,
            position: 'absolute',
            left: 0
          }} />
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#F79E1B',
            opacity: 0.9,
            position: 'absolute',
            left: '14px'
          }} />
        </div>
        <span style={{ fontStyle: 'normal', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.03em' }}>
          Transit<span style={{ color: '#CF4500' }}>Ops</span>
        </span>
      </div>

      {/* Navigation Links */}
      <ul className="nav-links">
        <li>
          <a className={activeTab === 'landing' ? 'active' : ''} onClick={() => setActiveTab('landing')}>
            Home
          </a>
        </li>
        <li>
          <a className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            Dashboard
          </a>
        </li>
        <li>
          <a className={activeTab === 'vehicles' ? 'active' : ''} onClick={() => setActiveTab('vehicles')}>
            Vehicles
          </a>
        </li>
        <li>
          <a className={activeTab === 'drivers' ? 'active' : ''} onClick={() => setActiveTab('drivers')}>
            Drivers
          </a>
        </li>
        <li>
          <a className={activeTab === 'trips' ? 'active' : ''} onClick={() => setActiveTab('trips')}>
            Dispatches
          </a>
        </li>
        <li>
          <a className={activeTab === 'maintenance' ? 'active' : ''} onClick={() => setActiveTab('maintenance')}>
            Maintenance
          </a>
        </li>
        <li>
          <a className={activeTab === 'expenses' ? 'active' : ''} onClick={() => setActiveTab('expenses')}>
            Expenses
          </a>
        </li>
        <li>
          <a className={activeTab === 'reports' ? 'active' : ''} onClick={() => setActiveTab('reports')}>
            Reports
          </a>
        </li>
      </ul>

      {/* Right Tools & RBAC Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          className="flex-center" 
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--ink-black)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <Search size={20} />
        </button>

        {/* Role Selector Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex-center"
            style={{
              backgroundColor: 'var(--ink-black)',
              color: 'var(--canvas-cream)',
              border: 'none',
              borderRadius: 'var(--radius-pill-btn)',
              padding: '6px 14px',
              gap: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <ActiveRoleIcon size={14} />
            <span>{activeUserRole}</span>
          </button>

          {dropdownOpen && (
            <>
              <div 
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  zIndex: 999
                }} 
                onClick={() => setDropdownOpen(false)}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  backgroundColor: 'var(--white)',
                  boxShadow: 'var(--shadow-hover)',
                  borderRadius: '20px',
                  width: '280px',
                  padding: '10px',
                  zIndex: 1000,
                  border: '1px solid rgba(0,0,0,0.05)'
                }}
              >
                <div style={{
                  padding: '8px 12px 12px',
                  borderBottom: '1px solid var(--canvas-cream)',
                  marginBottom: '6px'
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate-gray)', display: 'block', letterSpacing: '0.04em' }}>
                    Access Level Switcher
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {roles.map((role) => {
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.name}
                        onClick={() => handleRoleChange(role.name)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          padding: '8px 12px',
                          border: 'none',
                          background: activeUserRole === role.name ? 'var(--canvas-cream)' : 'none',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (activeUserRole !== role.name) {
                            e.currentTarget.style.backgroundColor = 'var(--soft-bone)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (activeUserRole !== role.name) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <div style={{
                          padding: '6px',
                          backgroundColor: `${role.color}15`,
                          color: role.color,
                          borderRadius: '50%',
                          marginTop: '2px'
                        }}>
                          <Icon size={14} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--ink-black)', display: 'block' }}>
                            {role.name}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--slate-gray)' }}>
                            {role.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
