import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: 'default' | 'error';
}

export function EmptyState({ title, description, action, tone = 'default' }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: 'var(--space-7) var(--space-5)',
        gap: 'var(--space-3)',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 'var(--radius-md)',
          background: tone === 'error' ? 'var(--danger-dim)' : 'var(--bg-surface-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-2)',
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: tone === 'error' ? '50%' : 3,
            background: tone === 'error' ? 'var(--danger)' : 'var(--text-tertiary)',
          }}
        />
      </div>
      <h3 style={{ fontSize: 'var(--text-lg)' }}>{title}</h3>
      {description && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: 360 }}>
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: 'var(--space-2)' }}>{action}</div>}
    </div>
  );
}