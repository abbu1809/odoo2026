import React from 'react';
import { ExternalLink } from 'lucide-react';

const developers = [
  { name: 'Abhishek Verma', github: 'abbu1809', linkedin: 'https://www.linkedin.com/in/abhishekverma1809' },
  { name: 'Anurag Verma', github: 'anurag-verma-india', linkedin: 'https://www.linkedin.com/in/anurag-verma-india/' },
  { name: 'Aditya Sharma', github: 'R-8-12', linkedin: 'https://www.linkedin.com/in/aditya-sharma-4a2a0b255/' },
];

const GithubIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.13 0 1.54-.01 2.79-.01 3.17 0 .31.21.68.8.56C20.21 21.38 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
  </svg>
);

const LinkedinIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
  </svg>
);

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
              <img src="/logo.svg" alt="logo" style={{ width: '44px', height: '44px', filter: 'invert(1)' }} />
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {developers.map((dev) => (
                <div
                  key={dev.github}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                  }}
                >
                  <span
                    style={{
                      color: 'rgba(255,255,255,0.85)',
                      fontSize: '0.88rem',
                      fontWeight: 500,
                    }}
                  >
                    {dev.name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <a
                      href={`https://github.com/${dev.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${dev.name} on GitHub`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.06)',
                        color: 'rgba(255,255,255,0.7)',
                        transition: 'background 0.15s, color 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.14)';
                        e.currentTarget.style.color = 'var(--white)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                      }}
                    >
                      <GithubIcon size={15} />
                    </a>
                    <a
                      href={dev.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${dev.name} on LinkedIn`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.06)',
                        color: 'rgba(255,255,255,0.7)',
                        transition: 'background 0.15s, color 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#0A66C2';
                        e.currentTarget.style.color = 'var(--white)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                      }}
                    >
                      <LinkedinIcon size={15} />
                    </a>
                  </div>
                </div>
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
          <span>Built for Hackathon · Team Innov8ing 4u</span>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
