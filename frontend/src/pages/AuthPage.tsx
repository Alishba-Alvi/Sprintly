import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useLoginMutation, useRegisterMutation } from '../app/api';
import { AuthField } from '../components/AuthField';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Logo } from '../components/Logo';
import acceptTasksIllustration from '../assets/illustrations/accept-tasks.svg';
import coworkingIllustration from '../assets/illustrations/coworking.svg';

function EnvelopeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  );
}

function BrandMark() {
  return (
    <div className="authL-card-brand">
      <Logo size={24} />
      <span className="authL-brand-name">
        sprint<span className="authL-brand-accent">ly</span>
      </span>
    </div>
  );
}

function IllustrationPanel({ src }: { src: string }) {
  return (
    <div className="authL-illu-panel">
      <div className="authL-illu-halo" aria-hidden="true">
        <span className="authL-ring" />
        <span className="authL-dot-accent" />
      </div>
      <div className="authL-illu-parallax">
        <div className="authL-illu-inner">
          <img src={src} alt="" />
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const mode: 'login' | 'register' = location.pathname === '/register' ? 'register' : 'login';

  useDocumentTitle(mode === 'login' ? 'Log in' : 'Create an account');

  // ---- login form state ----
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [login, { isLoading: loginLoading, error: loginError }] = useLoginMutation();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login({ email: loginEmail, password: loginPassword }).unwrap();
      navigate('/dashboard');
    } catch {
      // surfaced via loginError
    }
  };

  // ---- register form state ----
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [register, { isLoading: registerLoading, error: registerError }] = useRegisterMutation();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await register({ name, email: regEmail, password: regPassword }).unwrap();
      navigate('/login');
    } catch {
      // surfaced via registerError
    }
  };

  return (
    <div className="authL-page">
      <Link to="/" className="authL-back" aria-label="Back to home">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </Link>

      <div className={`authL-card${mode === 'register' ? ' authL-card--register' : ''}`}>
        <div className="authL-form-panel">
          <BrandMark />
          <div className="authL-form-inner">
            {mode === 'login' ? (
              <>
                <h1 className="authL-title">Welcome back</h1>
                <p className="authL-subtitle">Log in to jump back into your team's sprint.</p>

                <form onSubmit={handleLogin} className="authL-form">
                  <AuthField
                    icon={<EnvelopeIcon />}
                    type="email"
                    name="email"
                    placeholder="Your email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                  <AuthField
                    icon={<LockIcon />}
                    isPassword
                    name="password"
                    placeholder="Your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  {loginError && <ErrorBanner message="Invalid email or password." />}
                  <button type="submit" className="authL-submit" disabled={loginLoading}>
                    {loginLoading ? 'Logging in…' : 'Log in'}
                  </button>
                </form>

                <p className="authL-footer-text">
                  Don't have an account? <Link to="/register">Sign up</Link>
                </p>
              </>
            ) : (
              <>
                <h1 className="authL-title">Start your first sprint</h1>
                <p className="authL-subtitle">Create your workspace and get your team moving.</p>

                <form onSubmit={handleRegister} className="authL-form">
                  <AuthField
                    icon={<UserIcon />}
                    type="text"
                    name="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    minLength={2}
                    autoComplete="name"
                    required
                  />
                  <AuthField
                    icon={<EnvelopeIcon />}
                    type="email"
                    name="email"
                    placeholder="Your email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                  <AuthField
                    icon={<LockIcon />}
                    isPassword
                    name="password"
                    placeholder="Your password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  {registerError && <ErrorBanner message="Registration failed. Email may already be in use." />}
                  <button type="submit" className="authL-submit" disabled={registerLoading}>
                    {registerLoading ? 'Creating account...' : 'Sign up'}
                  </button>
                </form>

                <p className="authL-footer-text">
                  Already have an account? <Link to="/login">Log in</Link>
                </p>
              </>
            )}
          </div>
        </div>

        <IllustrationPanel src={mode === 'login' ? acceptTasksIllustration : coworkingIllustration} />
      </div>
    </div>
  );
}