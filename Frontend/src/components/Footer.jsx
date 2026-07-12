import React from 'react';
import { Mail, Phone, MapPin, ExternalLink, Printer } from 'lucide-react';

const Footer = ({ setActiveTab }) => {
  const currentYear = new Date().getFullYear();

  const handlePrint = (e) => {
    e.preventDefault();
    window.print();
  };

  return (
    <footer className="no-print" style={{
      backgroundColor: 'var(--ink-black)',
      color: 'var(--white)',
      padding: '80px 24px 48px',
      marginTop: '120px',
      borderTopLeftRadius: '40px',
      borderTopRightRadius: '40px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Large Conversational Headline */}
        <div style={{ marginBottom: '60px', maxWidth: '600px' }}>
          <h2 style={{ color: 'var(--canvas-cream)', fontSize: '2.5rem', marginBottom: '16px', lineHeight: 1.15 }}>
            Ready to streamline your fleet? We're with you at every turn.
          </h2>
          <p style={{ color: '#D1CDC7', fontSize: '1.05rem', fontWeight: 400 }}>
            TransitOps delivers smart routing, safety compliance, and comprehensive asset tracking to logistics organizations worldwide.
          </p>
        </div>

        {/* 4-Column Link Grid */}
        <div 
          className="grid-4" 
          style={{ 
            borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
            paddingTop: '48px',
            paddingBottom: '48px',
            marginBottom: '48px'
          }}
        >
          {/* Col 1 */}
          <div>
            <h4 style={{ color: '#D1CDC7', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}>
              Fleet Operations
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>
                <a onClick={() => setActiveTab('dashboard')} style={{ color: 'var(--white)', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'none' }}>
                  Operational Dashboard
                </a>
              </li>
              <li>
                <a onClick={() => setActiveTab('vehicles')} style={{ color: 'var(--white)', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'none' }}>
                  Vehicle Registry
                </a>
              </li>
              <li>
                <a onClick={() => setActiveTab('drivers')} style={{ color: 'var(--white)', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'none' }}>
                  Driver Rosters & Compliance
                </a>
              </li>
              <li>
                <a onClick={() => setActiveTab('trips')} style={{ color: 'var(--white)', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'none' }}>
                  Active Dispatches
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2 */}
          <div>
            <h4 style={{ color: '#D1CDC7', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}>
              Costs & Maintenance
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>
                <a onClick={() => setActiveTab('maintenance')} style={{ color: 'var(--white)', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'none' }}>
                  Maintenance Scheduler
                </a>
              </li>
              <li>
                <a onClick={() => setActiveTab('expenses')} style={{ color: 'var(--white)', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'none' }}>
                  Fuel & Toll Logbooks
                </a>
              </li>
              <li>
                <a onClick={() => setActiveTab('reports')} style={{ color: 'var(--white)', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'none' }}>
                  Vehicle ROI Reports
                </a>
              </li>
              <li>
                <a href="#" onClick={handlePrint} style={{ color: 'var(--white)', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Printer size={14} /> Print Audit Page
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 style={{ color: '#D1CDC7', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}>
              Support Center
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', color: '#D1CDC7', fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} /> +1 (800) 555-T-OPS
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} /> dispatch@transitops.corp
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={14} style={{ marginTop: '3px' }} />
                <span>
                  100 Transit Parkway,<br />
                  Suite 400, Chicago, IL
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 style={{ color: '#D1CDC7', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}>
              Corporate links
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>
                <a href="https://www.mastercard.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--white)', fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Privacy Center <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="#" style={{ color: 'var(--white)', fontSize: '0.9rem', textDecoration: 'none' }}>
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" style={{ color: 'var(--white)', fontSize: '0.9rem', textDecoration: 'none' }}>
                  System Status
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright details */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          fontSize: '0.8rem',
          color: '#D1CDC7'
        }}>
          <div>
            © {currentYear} TransitOps. Inspired by geometric standards. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="#" style={{ color: '#D1CDC7', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: '#D1CDC7', textDecoration: 'none' }}>Cookie Settings</a>
            <a href="#" style={{ color: '#D1CDC7', textDecoration: 'none' }}>Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
