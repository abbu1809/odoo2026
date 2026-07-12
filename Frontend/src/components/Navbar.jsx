import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, Truck, Users, MapPin, Wrench,
  Receipt, BarChart3, Settings, Search, ChevronDown
} from 'lucide-react';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'vehicles', label: 'Fleet', icon: Truck },
  { key: 'drivers', label: 'Drivers', icon: Users },
  { key: 'trips', label: 'Trips', icon: MapPin },
  { key: 'maintenance', label: 'Maintenance', icon: Wrench },
  { key: 'expenses', label: 'Fuel & Expenses', icon: Receipt },
  { key: 'reports', label: 'Analytics', icon: BarChart3 },
  { key: 'settings', label: 'Settings', icon: Settings },
];

const roles = [
  { name: 'Fleet Manager', color: '#3860BE', desc: 'Fleet, Maintenance' },
  { name: 'Driver', color: '#4CAF50', desc: 'Dashboard, Trips' },
  { name: 'Safety Officer', color: '#CF4500', desc: 'Drivers, Compliance' },
  { name: 'Financial Analyst', color: '#7F6000', desc: 'Expenses, Analytics' },
];

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { activeUserRole, setActiveUserRole, showToast, hasAccess } = useApp();

  const visibleItems = navItems.filter(item => hasAccess(item.key));

  return (
    <aside className="sidebar no-print">
      <div className="sidebar-brand" onClick={() => {
        // Redirect to first authorized tab
        const first = visibleItems[0]?.key || 'dashboard';
        setActiveTab(first);
      }}>
        <div style={{ display: 'flex', position: 'relative', width: '32px', height: '20px', flexShrink: 0 }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#EB001B', position: 'absolute', left: 0, opacity: 0.9 }} />
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#F79E1B', position: 'absolute', left: '12px', opacity: 0.9 }} />
        </div>
        <h2>Transit<span>Ops</span></h2>
      </div>

      <nav className="sidebar-nav">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              className={`sidebar-link${activeTab === item.key ? ' active' : ''}`}
              onClick={() => setActiveTab(item.key)}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

const Topbar = ({ userName }) => {
  const { activeUserRole, setActiveUserRole, showToast } = useApp();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const handleRoleChange = (roleName) => {
    setActiveUserRole(roleName);
    setRoleDropdownOpen(false);
    showToast(`Switched to ${roleName} view`, 'info');
  };

  return (
    <div className="topbar no-print">
      <div className="topbar-search">
        <Search size={16} style={{ color: 'var(--slate-gray)' }} />
        <input type="text" placeholder="Search..." />
      </div>

      <div className="topbar-user">
        <span className="topbar-user-name">{userName || 'Ravee K.'}</span>

        <div style={{ position: 'relative' }}>
          <button
            className="topbar-role-badge"
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
          >
            {activeUserRole === 'Driver' ? 'Dispatcher' : activeUserRole.split(' ').map(w => w[0]).join('')}
            <ChevronDown size={14} />
          </button>

          {roleDropdownOpen && (
            <>
              <div className="dropdown-backdrop" onClick={() => setRoleDropdownOpen(false)} />
              <div className="dropdown-menu">
                <div className="dropdown-header">Access Level Switcher</div>
                {roles.map((r) => (
                  <button
                    key={r.name}
                    className={`dropdown-item${activeUserRole === r.name ? ' active' : ''}`}
                    onClick={() => handleRoleChange(r.name)}
                  >
                    <div
                      className="dropdown-item-icon"
                      style={{ background: `${r.color}18`, color: r.color }}
                    >
                      <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                        {r.name.split(' ').map(w => w[0]).join('')}
                      </span>
                    </div>
                    <div className="dropdown-item-text">
                      <span>{r.name}</span>
                      <span>{r.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { Sidebar, Topbar };
export default Sidebar;
