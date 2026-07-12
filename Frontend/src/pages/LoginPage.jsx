import React, { useState } from 'react';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('Ravee.k@transitops.in');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Dispatcher');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const roleMap = {
    'Fleet Manager': 'Fleet Manager',
    'Dispatcher': 'Driver',
    'Safety Officer': 'Safety Officer',
    'Financial Analyst': 'Financial Analyst'
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (attempts >= 5) {
      setError('Account locked after 5 failed attempts.');
      return;
    }

    // Demo credentials — any password works
    if (password.length < 3) {
      setAttempts(prev => prev + 1);
      setError('Invalid credentials. ' + (5 - attempts - 1) + ' attempts remaining.');
      return;
    }

    setError('');
    const mappedRole = roleMap[role] || 'Fleet Manager';
    onLogin(mappedRole, email.split('@')[0]);
  };

  return (
    <div className="login-page">
      {/* Left Panel — Branding */}
      <div className="login-left">
        <div>
          <div className="login-brand">
            <div className="login-brand-logo">
              <div className="login-brand-circle-1" />
              <div className="login-brand-circle-2" />
            </div>
            <h1>Transit<span>Ops</span></h1>
          </div>
          <p className="login-subtitle">Smart Transport Operations Platform</p>
        </div>

        <div className="login-roles">
          <h3>One login, four roles:</h3>
          <ul>
            <li>
              <span className="login-role-dot" style={{ background: '#F5A623' }} />
              Fleet Manager
            </li>
            <li>
              <span className="login-role-dot" style={{ background: '#4CAF50' }} />
              Dispatcher
            </li>
            <li>
              <span className="login-role-dot" style={{ background: '#2196F3' }} />
              Safety Officer
            </li>
            <li>
              <span className="login-role-dot" style={{ background: '#9C27B0' }} />
              Financial Analyst
            </li>
          </ul>
        </div>

        <p className="login-footer-text">TransitOps © 2026 · RBAC v4.0</p>
      </div>

      {/* Right Panel — Form */}
      <div className="login-right">
        <div className="login-form-container">
          <h2>Sign in to your account</h2>
          <p className="login-form-subtitle">Enter your credentials to continue</p>

          {error && (
            <div className="login-error-box">
              <span style={{ fontSize: '1rem' }}>✕</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label>Email</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            <div className="login-field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="login-field">
              <label>Role (RBAC)</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="Fleet Manager">Fleet Manager</option>
                <option value="Dispatcher">Dispatcher</option>
                <option value="Safety Officer">Safety Officer</option>
                <option value="Financial Analyst">Financial Analyst</option>
              </select>
            </div>

            <div className="login-options">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                />
                Remember me
              </label>
              <span className="login-forgot">Forgot password?</span>
            </div>

            <button type="submit" className="login-submit-btn">
              Sign In
            </button>
          </form>

          <div className="login-access-info">
            <strong>Access is scoped by role after login:</strong><br />
            • Fleet Manager → Fleet, Maintenance<br />
            • Dispatcher → Dashboard, Trips<br />
            • Safety Officer → Drivers, Compliance<br />
            • Financial Analyst → Fuel & Expenses, Analytics
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
