import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar, Topbar } from './components/Navbar';
import Footer from './components/Footer';

// Import Views
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import VehicleRegistry from './pages/VehicleRegistry';
import DriverManagement from './pages/DriverManagement';
import TripManagement from './pages/TripManagement';
import Maintenance from './pages/Maintenance';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Page title map
const pageTitles = {
  dashboard: 'Dashboard',
  vehicles: 'Vehicle Registry',
  drivers: 'Drivers & Safety Profiles',
  trips: 'Trip Dispatcher',
  maintenance: 'Maintenance',
  expenses: 'Fuel & Expense Management',
  reports: 'Reports & Analytics',
  settings: 'Settings & RBAC',
};

function AppContent() {
  const [showLogin, setShowLogin] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { isAuthenticated, initializing, notifications } = useApp();

  if (initializing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--slate-gray)' }}>
        Loading TransitOps…
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showLogin) {
      return <LoginPage onBack={() => setShowLogin(false)} />;
    }
    return (
      <LandingPage
        setActiveTab={setActiveTab}
        onLoginClick={() => setShowLogin(true)}
        isLoggedIn={false}
      />
    );
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'vehicles': return <VehicleRegistry />;
      case 'drivers': return <DriverManagement />;
      case 'trips': return <TripManagement />;
      case 'maintenance': return <Maintenance />;
      case 'expenses': return <Expenses />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-shell">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Column Content Wrapper */}
      <div className="main-wrapper">
        {/* Top Bar */}
        <Topbar />

        {/* Main Content */}
        <main className="main-area">
          <div className="page-header">
            <h1 className="page-title">{pageTitles[activeTab] || 'Dashboard'}</h1>
          </div>
          {renderPage()}
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Toast Notifications */}
      <div className="toast-container no-print">
        {notifications.map((notif) => (
          <div key={notif.id} className={`toast toast-${notif.type}`}>
            <span style={{ fontWeight: 600 }}>
              {notif.type === 'error' ? '✕' : notif.type === 'info' ? 'ℹ' : '✓'}
            </span>
            <span>{notif.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
