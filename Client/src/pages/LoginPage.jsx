import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ROLES, humanize } from '../utils/enums';
import { Moon, Sun } from 'lucide-react';

const THEME_KEY = 'transitops_theme';

const LoginPage = ({ onBack }) => {
  const { login, register, authLoading } = useApp();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [error, setError] = useState('');

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

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '', email: '', password: '', role: 'FLEET_MANAGER',
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    const result = await login(loginForm.email.trim(), loginForm.password);
    if (!result.ok) setError(result.error);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!registerForm.name.trim() || !registerForm.email.trim() || !registerForm.password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    const result = await register({
      name: registerForm.name.trim(),
      email: registerForm.email.trim(),
      password: registerForm.password,
      role: registerForm.role,
    });
    if (!result.ok) setError(result.error);
  };

  return (
    <div className="login-page">
      {/* Left Panel — Branding */}
      <div className="login-left">
        <div>
          <div className="login-brand" onClick={onBack} style={{ cursor: onBack ? 'pointer' : 'default' }}>
            <img src="/logo.svg" alt="logo" style={{ width: '36px', height: '36px', marginRight: '3px',filter: 'invert(1)' }} />
            <h1>Transit<span>Ops</span></h1>
          </div>
          <p className="login-subtitle">Smart Transport Operations Platform</p>
        </div>

        <div className="login-roles">
          <h3>One account, five roles:</h3>
          <ul>
            <li><span className="login-role-dot" style={{ background: '#F5A623' }} />Fleet Manager</li>
            <li><span className="login-role-dot" style={{ background: '#4CAF50' }} />Driver</li>
            <li><span className="login-role-dot" style={{ background: '#2196F3' }} />Safety Officer</li>
            <li><span className="login-role-dot" style={{ background: '#9C27B0' }} />Financial Analyst</li>
            <li><span className="login-role-dot" style={{ background: '#141413' }} />Admin</li>
          </ul>
        </div>

        <p className="login-footer-text">TransitOps © 2026 · RBAC v4.0</p>
      </div>

      {/* Right Panel — Form */}
      <div className="login-right" style={{ position: 'relative' }}>
        {/* Theme Toggle */}
        <button
          className="dark-mode-toggle"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{ position: 'absolute', top: '20px', right: '20px' }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="login-form-container">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              style={{
                background: 'none', border: 'none', color: 'var(--slate-gray)', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem',
                marginBottom: '20px', fontWeight: 500, padding: 0,
              }}
            >
              ← Back to Home
            </button>
          )}

          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={mode === 'login' ? 'btn-action btn-action-primary' : 'btn-action btn-action-secondary'}
              style={{ flex: 1 }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={mode === 'register' ? 'btn-action btn-action-primary' : 'btn-action btn-action-secondary'}
              style={{ flex: 1 }}
            >
              Create Account
            </button>
          </div>

          {mode === 'login' ? (
            <>
              <h2>Sign in to your account</h2>
              <p className="login-form-subtitle">Enter your credentials to continue</p>

              {error && (
                <div className="login-error-box">
                  <span style={{ fontSize: '1rem' }}>✕</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="login-field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="login-field">
                  <label>Password</label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
                <button type="submit" className="login-submit-btn" disabled={authLoading}>
                  {authLoading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2>Create your account</h2>
              <p className="login-form-subtitle">No accounts exist yet? Register the first one here.</p>

              {error && (
                <div className="login-error-box">
                  <span style={{ fontSize: '1rem' }}>✕</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister}>
                <div className="login-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    placeholder="Priya Shah"
                  />
                </div>
                <div className="login-field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="login-field">
                  <label>Password</label>
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
                <div className="login-field">
                  <label>Role (RBAC)</label>
                  <select
                    value={registerForm.role}
                    onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{humanize(r)}</option>)}
                  </select>
                </div>
                <button type="submit" className="login-submit-btn" disabled={authLoading}>
                  {authLoading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>
            </>
          )}

          <div className="login-access-info">
            <strong>Access is scoped by role:</strong><br />
            • Fleet Manager → Vehicles (view Fleet elsewhere), Drivers, Maintenance, Analytics<br />
            • Driver → Trips (view-only elsewhere: Vehicles)<br />
            • Safety Officer → Drivers, view-only Trips<br />
            • Financial Analyst → Fuel & Expenses, Analytics (view-only Vehicles)<br />
            • Admin → Full access + user management
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
