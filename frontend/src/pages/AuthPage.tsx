import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useLoginMutation, useRegisterMutation } from '../app/api';
import { AuthField } from '../components/AuthField';
import { PasswordStrength, isPasswordStrong } from '../components/PasswordStrength';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Logo } from '../components/Logo';
import acceptTasksIllustration from '../assets/illustrations/accept-tasks.svg';
import coworkingIllustration from '../assets/illustrations/coworking.svg';

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

function validateEmail(value: string): string | undefined {
  if (!value) return undefined;
  return EMAIL_REGEX.test(value) ? undefined : 'Enter a valid email address';
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: { message?: string | string[] } }).data;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message[0] : data.message;
    }
  }
  return fallback;
}

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
  const [loginEmailError, setLoginEmailError] = useState<string | undefined>();
  const [login, { isLoading: loginLoading, error: loginError, reset: resetLogin }] = useLoginMutation();

  // ---- register form state ----
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEmailError, setRegEmailError] = useState<string | undefined>();
  const [register, { isLoading: registerLoading, error: registerError, reset: resetRegister }] = useRegisterMutation();

  // Wipe stale server + field errors the instant the mode switches
  useEffect(() => {
    resetLogin();
    resetRegister();
    setLoginEmailError(undefined);
    setRegEmailError(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(loginEmail);
    setLoginEmailError(emailErr);
    if (emailErr) return;
    try {
      await login({ email: loginEmail, password: loginPassword }).unwrap();
      navigate('/dashboard');
    } catch {
      // surfaced via loginError
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(regEmail);
    setRegEmailError(emailErr);
    if (emailErr || !isPasswordStrong(regPassword)) return;
    try {
      await register({ name, email: regEmail, password: regPassword }).unwrap();
      navigate('/login');
    } catch (err) {
      // surfaced via registerError
    }
  };

  const loginReady = loginEmail.length > 0 && loginPassword.length > 0 && !loginEmailError;
  const registerReady =
    name.trim().length >= 2 && regEmail.length > 0 && !regEmailError && isPasswordStrong(regPassword);

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
              <div key="login-mode">
                <h1 className="authL-title">Welcome back</h1>
                <p className="authL-subtitle">Log in to jump back into your team's sprint.</p>

                <form onSubmit={handleLogin} className="authL-form">
                  <AuthField
                    icon={<EnvelopeIcon />}
                    type="email"
                    name="email"
                    placeholder="Your email"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      if (loginEmailError) setLoginEmailError(undefined);
                      if (loginError) resetLogin();
                    }}
                    onBlur={() => setLoginEmailError(validateEmail(loginEmail))}
                    error={loginEmailError}
                    autoComplete="email"
                    required
                  />
                  <AuthField
                    icon={<LockIcon />}
                    isPassword
                    name="password"
                    placeholder="Your password"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (loginError) resetLogin();
                    }}
                    autoComplete="current-password"
                    required
                  />
                  {loginError && (
                    <ErrorBanner message={getErrorMessage(loginError, 'Invalid email or password.')} />
                  )}
                  <button type="submit" className="authL-submit" disabled={loginLoading || !loginReady}>
                    {loginLoading ? 'Logging in…' : 'Log in'}
                  </button>
                </form>

                <p className="authL-footer-text">
                  Don't have an account? <Link to="/register">Sign up</Link>
                </p>
              </div>
            ) : (
              <div key="register-mode">
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
                    autoComplete="name"
                    required
                  />
                  <AuthField
                    icon={<EnvelopeIcon />}
                    type="email"
                    name="email"
                    placeholder="Your email"
                    value={regEmail}
                    onChange={(e) => {
                      setRegEmail(e.target.value);
                      if (regEmailError) setRegEmailError(undefined);
                      if (registerError) resetRegister();
                    }}
                    onBlur={() => setRegEmailError(validateEmail(regEmail))}
                    error={regEmailError}
                    autoComplete="email"
                    required
                  />
                  <div>
                    <AuthField
                      icon={<LockIcon />}
                      isPassword
                      name="password"
                      placeholder="Your password"
                      value={regPassword}
                      onChange={(e) => {
                        setRegPassword(e.target.value);
                        if (registerError) resetRegister();
                      }}
                      autoComplete="new-password"
                      required
                    />
                    <PasswordStrength password={regPassword} />
                  </div>
                  {registerError && (
                    <ErrorBanner message={getErrorMessage(registerError, 'Registration failed.')} />
                  )}
                  <button type="submit" className="authL-submit" disabled={registerLoading || !registerReady}>
                    {registerLoading ? 'Creating account…' : 'Sign up'}
                  </button>
                </form>

                <p className="authL-footer-text">
                  Already have an account? <Link to="/login">Log in</Link>
                </p>
              </div>
            )}
          </div>
        </div>

        <IllustrationPanel src={mode === 'login' ? acceptTasksIllustration : coworkingIllustration} />
      </div>
    </div>
  );
}