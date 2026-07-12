import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import InteractiveDemo from './components/InteractiveDemo';

// Import Views
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import VehicleRegistry from './pages/VehicleRegistry';
import DriverManagement from './pages/DriverManagement';
import TripManagement from './pages/TripManagement';
import Maintenance from './pages/Maintenance';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';

function AppContent() {
  const [activeTab, setActiveTab] = useState('landing');
  const { notifications } = useApp();

  const renderActivePage = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage setActiveTab={setActiveTab} />;
      case 'dashboard':
        return <Dashboard />;
      case 'vehicles':
        return <VehicleRegistry />;
      case 'drivers':
        return <DriverManagement />;
      case 'trips':
        return <TripManagement />;
      case 'maintenance':
        return <Maintenance />;
      case 'expenses':
        return <Expenses />;
      case 'reports':
        return <Reports />;
      default:
        return <LandingPage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      {/* Floating Navigation Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Core View Area */}
      <main className="main-content">
        {renderActivePage()}
      </main>

      {/* Interactive Hackathon Guide Panel */}
      <InteractiveDemo activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Global Toast Alert Notifications */}
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

      {/* Editorial Footer */}
      <Footer setActiveTab={setActiveTab} />
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
