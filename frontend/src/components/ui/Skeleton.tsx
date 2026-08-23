interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = 16, radius = 'var(--radius-sm)', style }: SkeletonProps) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background:
          'linear-gradient(90deg, var(--bg-surface-2) 25%, var(--bg-surface-hover) 50%, var(--bg-surface-2) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.6s ease-in-out infinite',
        ...style,
      }}
    >
      <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        padding: 'var(--space-3) var(--space-4)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <Skeleton width={48} height={14} />
      <Skeleton width="35%" height={14} />
      <div style={{ flex: 1 }} />
      <Skeleton width={70} height={20} radius="999px" />
      <Skeleton width={70} height={20} radius="999px" />
      <Skeleton width={28} height={28} radius="50%" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div
      style={{
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <Skeleton width="40%" height={12} />
      <Skeleton width="70%" height={20} />
      <Skeleton width="90%" height={14} />
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
        <Skeleton width={60} height={20} radius="999px" />
        <Skeleton width={60} height={20} radius="999px" />
      </div>
    </div>
  );
}