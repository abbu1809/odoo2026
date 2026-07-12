import React from 'react';
import { ArrowLeft, Compass } from 'lucide-react';

const NotFoundPage = ({ onGoHome }) => {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '24px',
        background: 'var(--canvas-cream)',
      }}
    >
      {/* Ghost Watermark */}
      <div className="ghost-watermark" style={{ top: '10%', left: '50%', transform: 'translateX(-50%)', fontSize: '11rem', whiteSpace: 'nowrap' }}>
        LOST ROUTE
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '520px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 24px',
            borderRadius: '50%',
            background: '#CF450012',
            color: 'var(--signal-orange)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Compass size={28} />
        </div>

        <h1 style={{ fontSize: '5rem', lineHeight: 1, marginBottom: '12px', color: 'var(--ink-black)' }}>
          4<span style={{ color: 'var(--signal-orange)' }}>0</span>4
        </h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', color: 'var(--ink-black)' }}>
          This route isn't on the map.
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--slate-gray)', marginBottom: '32px' }}>
          The page you're looking for doesn't exist, was moved, or the trip was cancelled before it got here.
        </p>

        <button
          onClick={onGoHome}
          className="btn-primary"
          style={{ padding: '12px 28px', borderRadius: '999px' }}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
