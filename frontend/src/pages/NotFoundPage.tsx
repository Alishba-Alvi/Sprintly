import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/Button';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Page not found');

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-5)',
        padding: 'var(--space-6)',
        background: 'var(--bg-canvas)',
        textAlign: 'center',
      }}
    >
      <Logo size={96} opacity={0.35} />
      <div>
        <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>
          This page drifted outside your workspace
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-md)', maxWidth: 380 }}>
          The page you're looking for doesn't exist, or you may not have access to it.
        </p>
      </div>
      <Link to="/dashboard">
        <Button variant="primary">Back to dashboard</Button>
      </Link>
    </div>
  );
}