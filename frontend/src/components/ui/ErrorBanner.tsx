interface ErrorBannerProps {
  message: string
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-3) var(--space-4)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--danger-dim)',
        background: 'var(--danger-dim)',
        color: 'var(--danger)',
        fontSize: 'var(--text-sm)',
      }}
      role="alert"
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'var(--danger)',
          flexShrink: 0,
        }}
      />
      {message}
    </div>
  )
}
