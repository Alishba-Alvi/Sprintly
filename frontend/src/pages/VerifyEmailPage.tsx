import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useVerifyEmailMutation, useResendVerificationMutation } from '../app/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { Logo } from '../components/Logo';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: { message?: string | string[] } }).data;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message[0] : data.message;
    }
  }
  return fallback;
}

export default function VerifyEmailPage() {
  useDocumentTitle('Verify your email');

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const hasAttempted = useRef(false);

  const [verifyEmail, { isLoading, isSuccess, error }] = useVerifyEmailMutation();
  const [resendVerification, { isLoading: resendLoading, isSuccess: resendSent, error: resendError }] =
    useResendVerificationMutation();
  const [resendEmail, setResendEmail] = useState('');

  useEffect(() => {
    // Guards against StrictMode's double-invoke in dev, which would
    // otherwise fire the verify call twice on mount.
    if (hasAttempted.current || !token) return;
    hasAttempted.current = true;
    verifyEmail(token);
  }, [token, verifyEmail]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)',
        background: 'var(--bg-page)',
      }}
    >
      <Card padding="lg" style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
          <Logo size={28} />
        </div>

        {!token && (
          <>
            <h1 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>
              Missing verification link
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              This page needs a verification token in the URL. Use the link from your email.
            </p>
            <Link to="/login">Back to log in</Link>
          </>
        )}

        {token && isLoading && (
          <>
            <h1 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>Verifying…</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Hang tight, confirming your email.</p>
          </>
        )}

        {token && isSuccess && (
          <>
            <h1 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>Email verified</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Your account is active. You can log in now.
            </p>
            <Link to="/login">
              <Button variant="primary">Go to log in</Button>
            </Link>
          </>
        )}

        {token && !isLoading && error && (
          <>
            <h1 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>
              That link didn't work
            </h1>
            <ErrorBanner
              message={getErrorMessage(error, 'This verification link is invalid or has expired.')}
            />
            <p style={{ color: 'var(--text-secondary)', margin: 'var(--space-4) 0 var(--space-3)' }}>
              Enter your email to get a new link.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-strong)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-md)',
                }}
              />
              {resendSent ? (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  If that email is registered, a new link is on its way.
                </p>
              ) : (
                <Button
                  variant="secondary"
                  type="button"
                  loading={resendLoading}
                  disabled={!resendEmail}
                  onClick={() => resendVerification(resendEmail)}
                >
                  Send new link
                </Button>
              )}
              {resendError && <ErrorBanner message="Could not send a new link. Try again shortly." />}
            </div>
            <p style={{ marginTop: 'var(--space-4)' }}>
              <Link to="/login">Back to log in</Link>
            </p>
          </>
        )}
      </Card>
    </div>
  );
}