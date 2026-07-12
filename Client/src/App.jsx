import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar, Topbar } from './components/Navbar';
import Footer from './components/Footer';
import InteractiveDemo from './components/InteractiveDemo';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const { notifications, activeUserRole, setActiveUserRole, hasAccess } = useApp();

  // Redirect on role change if current tab becomes unauthorized
  React.useEffect(() => {
    if (isLoggedIn && !hasAccess(activeTab)) {
      const tabs = ['dashboard', 'vehicles', 'drivers', 'trips', 'maintenance', 'expenses', 'reports', 'settings'];
      const fallbackTab = tabs.find(t => hasAccess(t));
      if (fallbackTab) {
        setActiveTab(fallbackTab);
      }
    }
  }, [activeUserRole, isLoggedIn, activeTab, hasAccess]);

  const handleLogin = (role, name) => {
    setActiveUserRole(role);
    setUserName(name || 'Ravee K.');
    setIsLoggedIn(true);
    
    // Set active tab to the first authorized tab for the logged in role
    const tabs = ['dashboard', 'vehicles', 'drivers', 'trips', 'maintenance', 'expenses', 'reports', 'settings'];
    const initialTab = tabs.find(t => {
      // Inline implementation of hasAccess for the target role
      const matrix = {
        'Fleet Manager': ['vehicles', 'drivers', 'maintenance', 'reports', 'settings'],
        'Driver': ['dashboard', 'vehicles', 'trips', 'settings'],
        'Safety Officer': ['drivers', 'trips', 'settings'],
        'Financial Analyst': ['vehicles', 'expenses', 'reports', 'settings']
      };
      return matrix[role]?.includes(t);
    }) || 'dashboard';
    
    setActiveTab(initialTab);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName('');
    setShowLogin(false);
  };

  if (!isLoggedIn) {
    if (showLogin) {
      return <LoginPage onLogin={handleLogin} onBack={() => setShowLogin(false)} />;
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
        <Topbar userName={userName} />

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

      {/* Interactive Demo (Hackathon Guide) */}
      <InteractiveDemo activeTab={activeTab} setActiveTab={setActiveTab} />

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
