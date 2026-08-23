import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  interactive?: boolean;
}

const paddingMap = {
  none: '0',
  sm: 'var(--space-3)',
  md: 'var(--space-5)',
  lg: 'var(--space-6)',
};

export function Card({
  children,
  padding = 'md',
  interactive = false,
  style,
  ...props
}: CardProps) {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: paddingMap[padding],
        transition: interactive
          ? 'border-color var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out)'
          : undefined,
        cursor: interactive ? 'pointer' : undefined,
        ...style,
      }}
      onMouseEnter={
        interactive
          ? (e) => {
              e.currentTarget.style.borderColor = 'var(--border-strong)';
            }
          : undefined
      }
      onMouseLeave={
        interactive
          ? (e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }
          : undefined
      }
      {...props}
    >
      {children}
    </div>
  );
}