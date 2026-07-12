import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, Truck, Shield, DollarSign, Activity, FileText, Search, Moon, Sun } from 'lucide-react';
import LandingFooter from '../components/LandingFooter';

const THEME_KEY = 'transitops_theme';

const LandingPage = ({ setActiveTab, onLoginClick, isLoggedIn }) => {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <div style={{ position: 'relative' }}>
    <div style={{ position: 'relative', overflow: 'hidden', maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

      {/* Landing Page Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 24px',
        backgroundColor: 'var(--white)',
        border: '1px solid var(--border-light)',
        borderRadius: '999px',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '60px',
        marginTop: '20px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setActiveTab('landing')}>
          <img src="/logo.svg" alt="logo" style={{ width: '28px', height: '28px', flexShrink: 0 }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink-black)' }}>
            Transit<span style={{ color: 'var(--signal-orange)' }}>Ops</span>
          </h2>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Dark Mode Toggle */}
          <button
            className="dark-mode-toggle"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isLoggedIn ? (
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className="btn-primary"
              style={{ borderRadius: 'var(--radius-btn)' }}
            >
              Go to App <ArrowRight size={16} />
            </button>
          ) : (
            <button 
              onClick={onLoginClick} 
              className="btn-primary"
              style={{ borderRadius: 'var(--radius-btn)' }}
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Background Ghost Watermark */}
      <div 
        className="ghost-watermark" 
        style={{ top: '150px', left: '-20px', fontSize: '9rem' }}
      >
        TRANSIT
      </div>
      <div 
        className="ghost-watermark" 
        style={{ top: '480px', right: '-100px', fontSize: '9rem' }}
      >
        OPERATIONS
      </div>

      {/* Hero Section */}
      <section style={{ padding: '80px 0 100px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '800px', marginBottom: '48px' }}>
          <span className="eyebrow" style={{ marginBottom: '16px' }}>• SMART TRANSPORT SYSTEM</span>
          <h1 style={{ marginBottom: '24px', fontSize: '3.8rem', lineHeight: 1.05 }}>
            Transit<span style={{ color: 'var(--signal-orange)' }}>Ops</span>. Operations in perfect motion.
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--slate-gray)', maxWidth: '640px', marginBottom: '32px' }}>
            A centralized digital platform designed to govern your vehicle registries, driver safety compliance, dispatches, maintenance cycles, and dynamic operating ROI in real-time.
          </p>
          <div style={{ display: 'inline-flex', gap: '16px' }}>
            <button 
              onClick={() => {
                if (isLoggedIn) {
                  setActiveTab('dashboard');
                } else {
                  onLoginClick();
                }
              }} 
              className="btn-primary"
              style={{ padding: '12px 36px', borderRadius: '999px' }}
            >
              Launch Dashboard <ArrowRight size={16} />
            </button>
            <button 
              onClick={() => {
                if (isLoggedIn) {
                  const demoBtn = document.querySelector('.interactive-demo-panel button');
                  if (demoBtn) demoBtn.click();
                } else {
                  onLoginClick();
                }
              }} 
              className="btn-secondary"
              style={{ padding: '12px 36px', borderRadius: '999px' }}
            >
              Start Hackathon Guide
            </button>
          </div>
        </div>

        {/* Hero Stadium Frame */}
        <div 
          className="card-elevated hero-stadium"
          style={{
            backgroundImage: 'linear-gradient(rgba(20,20,19,0.7), rgba(20,20,19,0.3)), url("https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80")'
          }}
        >
          <div style={{ maxWidth: '500px' }}>
            <h2 style={{ color: 'var(--white)', fontSize: '2rem', marginBottom: '12px' }}>
              Full Visibility. Zero Friction.
            </h2>
            <p style={{ color: '#E8E2DA', fontSize: '0.95rem' }}>
              Switch spreadsheets for automated dispatch validations, driver safety logs, and cost analytics. Experience fleet operations built on speed and compliance.
            </p>
          </div>
        </div>
      </section>

      {/* Orbital Constellation Feature Section */}
      <section style={{ padding: '100px 0', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <span className="eyebrow" style={{ justifyContent: 'center', marginBottom: '16px' }}>• THE CONSTELLATION SYSTEM</span>
          <h2 style={{ fontSize: '2.5rem', maxWidth: '600px', margin: '0 auto' }}>
            Connected nodes forming a single, unified operations control.
          </h2>
        </div>

        {/* Orbit Graphics */}
        <div className="orbit-wrapper">
          {/* SVG Orbital Arcs */}
          <svg 
            viewBox="0 0 1000 650"
            className="orbit-svg"
          >
            <path 
              d="M 150 275 Q 280 180 500 130" 
              fill="none" 
              stroke="var(--light-signal-orange)" 
              strokeWidth="1.5" 
              strokeDasharray="4 4" 
            />
            <path 
              d="M 500 130 Q 720 180 850 275" 
              fill="none" 
              stroke="var(--light-signal-orange)" 
              strokeWidth="1.5" 
              strokeDasharray="4 4" 
            />
            <line 
              x1="500" 
              y1="250" 
              x2="500" 
              y2="400" 
              stroke="var(--light-signal-orange)" 
              strokeWidth="1.5" 
            />
          </svg>

          {/* Node 1: Vehicle Registry (Left) */}
          <div className="orbit-node orbit-node-left">
            <div className="orbit-container" style={{ width: '220px', height: '220px' }}>
              <div className="circle-portrait">
                <img 
                  src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=300&q=80" 
                  alt="Vehicles" 
                />
              </div>
              <button 
                onClick={() => {
                  if (isLoggedIn) {
                    setActiveTab('vehicles');
                  } else {
                    onLoginClick();
                  }
                }} 
                className="satellite-cta"
                title="Go to Vehicle Registry"
              >
                <ArrowRight size={20} />
              </button>
            </div>
            <div style={{ marginTop: '16px' }}>
              <span className="eyebrow" style={{ justifyContent: 'center', fontSize: '0.75rem', marginBottom: '4px' }}>ASSETS</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Fleet Registry</h3>
            </div>
          </div>

          {/* Node 2: Dispatches & Planning (Center Top) */}
          <div className="orbit-node orbit-node-top">
            <div className="orbit-container" style={{ width: '240px', height: '240px' }}>
              <div className="circle-portrait">
                <img 
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=300&q=80" 
                  alt="Dispatch" 
                />
              </div>
              <button 
                onClick={() => {
                  if (isLoggedIn) {
                    setActiveTab('trips');
                  } else {
                    onLoginClick();
                  }
                }} 
                className="satellite-cta"
                title="Go to Trip Management"
              >
                <ArrowRight size={20} />
              </button>
            </div>
            <div style={{ marginTop: '16px' }}>
              <span className="eyebrow" style={{ justifyContent: 'center', fontSize: '0.75rem', marginBottom: '4px' }}>DISPATCH</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Real-time Trips</h3>
            </div>
          </div>

          {/* Node 3: Driver Safety Compliance (Right) */}
          <div className="orbit-node orbit-node-right">
            <div className="orbit-container" style={{ width: '220px', height: '220px' }}>
              <div className="circle-portrait">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=300&q=80" 
                  alt="Drivers" 
                />
              </div>
              <button 
                onClick={() => {
                  if (isLoggedIn) {
                    setActiveTab('drivers');
                  } else {
                    onLoginClick();
                  }
                }} 
                className="satellite-cta"
                title="Go to Driver Profiles"
              >
                <ArrowRight size={20} />
              </button>
            </div>
            <div style={{ marginTop: '16px' }}>
              <span className="eyebrow" style={{ justifyContent: 'center', fontSize: '0.75rem', marginBottom: '4px' }}>COMPLIANCE</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Driver Safety</h3>
            </div>
          </div>

          {/* Node 4: ROI & Expenses (Center Bottom) */}
          <div className="orbit-node orbit-node-bottom">
            <div className="orbit-container" style={{ width: '220px', height: '220px' }}>
              <div className="circle-portrait">
                <img 
                  src="https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=300&q=80" 
                  alt="Expenses" 
                />
              </div>
              <button 
                onClick={() => {
                  if (isLoggedIn) {
                    setActiveTab('reports');
                  } else {
                    onLoginClick();
                  }
                }} 
                className="satellite-cta"
                title="Go to Financial Reports"
              >
                <ArrowRight size={20} />
              </button>
            </div>
            <div style={{ marginTop: '16px' }}>
              <span className="eyebrow" style={{ justifyContent: 'center', fontSize: '0.75rem', marginBottom: '4px' }}>FINANCE</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Cost & ROI Reports</h3>
            </div>
          </div>

        </div>
      </section>

      {/* Role-Based Benefits Section */}
      <section style={{ padding: '80px 0', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '48px' }}>
          <span className="eyebrow" style={{ marginBottom: '16px' }}>• ROLE-BASED ACCESS CONTROL</span>
          <h2>Designed for the entire fleet operations team</h2>
        </div>

        <div className="grid-4">
          <div className="card-elevated" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#3860BE12', color: '#3860BE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <Truck size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>Fleet Manager</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-gray)', lineHeight: '1.6', letterSpacing: '-0.01em' }}>
                Oversees vehicle lifecycle, schedules maintenance logs, registers transport assets, and tracks overall fleet capacity and utilization indexes.
              </p>
            </div>
          </div>

          <div className="card-elevated" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#4CAF5012', color: '#4CAF50', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <ArrowRight size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>Dispatch Coordinator / Driver</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-gray)', lineHeight: '1.6', letterSpacing: '-0.01em' }}>
                Creates trip logs, assigns available drivers and vehicles, tracks cargo load compliance, completes route logs, and registers refuels.
              </p>
            </div>
          </div>

          <div className="card-elevated" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#CF450012', color: '#CF4500', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <Shield size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>Safety Officer</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-gray)', lineHeight: '1.6', letterSpacing: '-0.01em' }}>
                Monitors active driver licenses, enforces compliance restrictions, tracks safety scores, and resolves safety warnings.
              </p>
            </div>
          </div>

          <div className="card-elevated" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#7F600012', color: '#7F6000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <DollarSign size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>Financial Analyst</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-gray)', lineHeight: '1.6', letterSpacing: '-0.01em' }}>
                Audits fuel logs and maintenance expenses, assesses cost ratios, computes per-vehicle ROI margins, and exports CSV reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics section */}
      <section className="metrics-banner">
        <div style={{ flex: '1 1 300px' }}>
          <span className="eyebrow" style={{ marginBottom: '12px' }}>• METRIC GOALS</span>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Driving efficiency through centralized data.</h2>
          <p style={{ color: 'var(--slate-gray)', fontSize: '0.95rem' }}>
            Connecting core telemetry logs with compliance and expenses enables actionable operational insights immediately.
          </p>
        </div>
        <div style={{ flex: '2 1 400px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '30px' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--ink-black)', display: 'block' }}>100%</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-gray)', textTransform: 'uppercase' }}>COMPLIANT DISPATCH</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--signal-orange)', display: 'block' }}>-15%</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-gray)', textTransform: 'uppercase' }}>FUEL WASTE</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--ink-black)', display: 'block' }}>24/7</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-gray)', textTransform: 'uppercase' }}>SYSTEM UPTIME</span>
          </div>
        </div>
      </section>

    </div>

    <LandingFooter />
    </div>
  );
};

export default LandingPage;
