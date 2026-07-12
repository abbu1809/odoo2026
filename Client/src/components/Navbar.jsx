import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, Truck, Users, MapPin, Wrench,
  Receipt, BarChart3, Settings, Search, ChevronDown, LogOut
} from 'lucide-react';
import { humanize } from '../utils/enums';

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

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="sidebar no-print">
      <div className="sidebar-brand" onClick={() => setActiveTab('dashboard')}>
        <img src="/logo.svg" alt="logo" style={{ width: '28px', height: '28px', flexShrink: 0 }} />
        <h2>Transit<span>Ops</span></h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
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

const Topbar = () => {
  const { user, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = (user?.name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="topbar no-print">
      <div className="topbar-search">
        <Search size={16} style={{ color: 'var(--slate-gray)' }} />
        <input type="text" placeholder="Search..." />
      </div>

      <div className="topbar-user">
        <span className="topbar-user-name">{user?.name}</span>

        <div style={{ position: 'relative' }}>
          <button className="topbar-role-badge" onClick={() => setMenuOpen(!menuOpen)}>
            {initials}
            <ChevronDown size={14} />
          </button>

          {menuOpen && (
            <>
              <div className="dropdown-backdrop" onClick={() => setMenuOpen(false)} />
              <div className="dropdown-menu">
                <div className="dropdown-header">Signed in as</div>
                <div style={{ padding: '4px 16px 12px', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 700 }}>{user?.name}</div>
                  <div style={{ color: 'var(--slate-gray)' }}>{user?.email}</div>
                  <div style={{ color: 'var(--slate-gray)', marginTop: 2 }}>{humanize(user?.role)}</div>
                </div>
                <button className="dropdown-item" onClick={logout}>
                  <div className="dropdown-item-icon" style={{ background: '#F4433618', color: '#F44336' }}>
                    <LogOut size={14} />
                  </div>
                  <div className="dropdown-item-text">
                    <span>Log out</span>
                  </div>
                </button>
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
