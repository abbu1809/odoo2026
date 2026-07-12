import React from 'react';

const Footer = () => {
  return (
    <footer className="no-print" style={{
      background: 'var(--ink-black)',
      color: 'rgba(255,255,255,0.7)',
      padding: '20px 24px',
      fontSize: '0.78rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <span>© 2026 TransitOps · Smart Transport Operations Platform</span>
      <span>RBAC v4.0 · Built for Hackathon</span>
    </footer>
  );
};

export default Footer;
