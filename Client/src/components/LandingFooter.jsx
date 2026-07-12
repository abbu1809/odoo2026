import React from 'react';
import { ExternalLink } from 'lucide-react';

const developers = [
  { name: 'Abhishek Verma', github: 'abbu1809' },
  { name: 'Anurag Verma', github: 'anurag-verma-india' },
  { name: 'Aditya Sharma', github: 'R-8-12' },
];

const LandingFooter = () => {
  return (
    <footer
      className="no-print"
      style={{
        marginTop: '40px',
        borderTop: '1px solid var(--border-light)',
        background: 'var(--ink-black)',
        color: 'rgba(255,255,255,0.7)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '56px 24px 32px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '40px',
            marginBottom: '40px',
          }}
        >
          {/* Brand */}
          <div style={{ maxWidth: '360px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <img src="/logo.svg" alt="logo" style={{ width: '24px', height: '24px' }} />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--white)' }}>
                Transit<span style={{ color: 'var(--signal-orange)' }}>Ops</span>
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
              A centralized fleet operations platform — dispatch, compliance, maintenance,
              and ROI, built for a hackathon in a weekend.
            </p>
          </div>

          {/* Built By */}
          <div>
            <span
              style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'rgba(255,255,255,0.45)',
                marginBottom: '16px',
              }}
            >
              Built By
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {developers.map((dev) => (
                <a
                  key={dev.github}
                  href={`https://github.com/${dev.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: 'rgba(255,255,255,0.85)',
                    textDecoration: 'none',
                    fontSize: '0.88rem',
                    fontWeight: 500,
                  }}
                >
                  <ExternalLink size={14} style={{ flexShrink: 0, color: 'rgba(255,255,255,0.5)' }} />
                  {dev.name}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <span
              style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'rgba(255,255,255,0.45)',
                marginBottom: '16px',
              }}
            >
              Project
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a
                href="https://github.com/abbu1809/odoo2026"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: 'rgba(255,255,255,0.85)',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: 500,
                }}
              >
                <ExternalLink size={14} style={{ flexShrink: 0, color: 'rgba(255,255,255,0.5)' }} />
                Source on GitHub
              </a>
            </div>
          </div>
        </div>

        <div
          style={{
            paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '0.78rem',
            color: 'rgba(255,255,255,0.45)',
          }}
        >
          <span>© 2026 TransitOps · Smart Transport Operations Platform</span>
          <span>Built for Hackathon · Team TransitOps</span>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
