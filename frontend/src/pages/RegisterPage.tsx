import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegisterMutation } from '../app/api';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { Logo } from '../components/Logo';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

function RegisterPage() {
  useDocumentTitle('Create an account');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [register, { isLoading, error }] = useRegisterMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({ name, email, password }).unwrap();
      navigate('/login');
    } catch (err) {
      // error state already captured by the `error` variable from the hook
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-canvas)',
        padding: 'var(--space-5)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            justifyContent: 'center',
            marginBottom: 'var(--space-6)',
          }}
        >
          <Logo size={30} />
          <span style={{ fontWeight: 600, fontSize: 'var(--text-lg)' }}>Project Tracker</span>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
          }}
        >
          <h1 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-1)' }}>
            Create your account
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-5)' }}>
            Start organizing your team's work
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Input
              label="Name"
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              autoComplete="name"
              required
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />

            {error && <ErrorBanner message="Registration failed. Email may already be in use." />}

            <Button type="submit" variant="primary" loading={isLoading} style={{ width: '100%', marginTop: 'var(--space-2)' }}>
              Create account
            </Button>
          </form>
        </div>

        <p
          style={{
            textAlign: 'center',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            marginTop: 'var(--space-5)',
          }}
        >
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;