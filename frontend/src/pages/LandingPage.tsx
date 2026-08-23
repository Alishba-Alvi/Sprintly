import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/Button';
import { StatusBadge, PriorityBadge, TypeBadge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function LandingPage() {
  useDocumentTitle('Organize work, track issues, ship together');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-5) var(--space-6)',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Logo size={28} />
          <span style={{ fontWeight: 600 }}>Project Tracker</span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Link to="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary">Get started</Button>
          </Link>
        </div>
      </header>

      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: 'var(--space-7) var(--space-6) var(--space-6)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-7)',
          alignItems: 'center',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 48,
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: 'var(--space-5)',
              color: 'var(--text-primary)',
            }}
          >
            Organize the work.
            <br />
            Track what matters.
          </h1>
          <p
            style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: 'var(--space-6)',
              maxWidth: 460,
            }}
          >
            A focused home for your team's projects and issues — clear ownership, honest
            status, and nothing you don't need.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Link to="/register">
              <Button variant="primary" size="md">
                Create your first project
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="md">
                I have an account
              </Button>
            </Link>
          </div>
        </div>

        <div>
          <Card padding="lg" style={{ background: 'var(--bg-surface)' }}>
            <div
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
                marginBottom: 'var(--space-4)',
              }}
            >
              PT-14
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
              Fix pagination on issue list
            </h3>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-5)' }}>
              <TypeBadge type="bug" />
              <PriorityBadge priority="high" />
              <StatusBadge status="in_progress" />
            </div>
            <div
              style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: 'var(--space-4)',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-tertiary)',
              }}
            >
              Assigned · Updated 2 hours ago
            </div>
          </Card>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: 'var(--space-6)',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-4)',
        }}
      >
        {[
          {
            title: 'Projects with real ownership',
            body: 'Every project has a Lead, clear membership, and roles that actually restrict what people can do.',
          },
          {
            title: 'Issues that stay organized',
            body: 'Type, priority, assignee, epics, and labels — filterable and searchable, without the clutter.',
          },
          {
            title: 'A workflow you can trust',
            body: 'Status only moves through valid transitions, so "done" always means what it says.',
          },
        ].map((f) => (
          <Card key={f.title} padding="md">
            <h3 style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--space-2)' }}>{f.title}</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {f.body}
            </p>
          </Card>
        ))}
      </section>
    </div>
  );
}