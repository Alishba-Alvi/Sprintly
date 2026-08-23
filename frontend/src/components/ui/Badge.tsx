import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  color: string;
  dimColor: string;
}

export function Badge({ children, color, dimColor }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 9px',
        borderRadius: 999,
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        letterSpacing: '0.01em',
        background: dimColor,
        color,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
        }}
      />
      {children}
    </span>
  );
}

// ---- Semantic helper maps: the single source of truth for status/priority/type colors ----

export const STATUS_LABELS: Record<string, string> = {
  to_do: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
};

export const STATUS_COLORS: Record<string, { color: string; dim: string }> = {
  to_do: { color: 'var(--status-todo)', dim: 'var(--status-todo-dim)' },
  in_progress: { color: 'var(--status-progress)', dim: 'var(--status-progress-dim)' },
  in_review: { color: 'var(--status-review)', dim: 'var(--status-review-dim)' },
  done: { color: 'var(--status-done)', dim: 'var(--status-done-dim)' },
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const PRIORITY_COLORS: Record<string, { color: string; dim: string }> = {
  low: { color: 'var(--priority-low)', dim: 'var(--priority-low-dim)' },
  medium: { color: 'var(--priority-medium)', dim: 'var(--priority-medium-dim)' },
  high: { color: 'var(--priority-high)', dim: 'var(--priority-high-dim)' },
  critical: { color: 'var(--priority-critical)', dim: 'var(--priority-critical-dim)' },
};

export const TYPE_LABELS: Record<string, string> = {
  task: 'Task',
  bug: 'Bug',
  story: 'Story',
  epic: 'Epic',
};

export const TYPE_COLORS: Record<string, { color: string; dim: string }> = {
  task: { color: 'var(--type-task)', dim: 'var(--type-task-dim)' },
  bug: { color: 'var(--type-bug)', dim: 'var(--type-bug-dim)' },
  story: { color: 'var(--type-story)', dim: 'var(--type-story-dim)' },
  epic: { color: 'var(--type-epic)', dim: 'var(--type-epic-dim)' },
};

export function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.to_do;
  return (
    <Badge color={c.color} dimColor={c.dim}>
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const c = PRIORITY_COLORS[priority] ?? PRIORITY_COLORS.medium;
  return (
    <Badge color={c.color} dimColor={c.dim}>
      {PRIORITY_LABELS[priority] ?? priority}
    </Badge>
  );
}

export function TypeBadge({ type }: { type: string }) {
  const c = TYPE_COLORS[type] ?? TYPE_COLORS.task;
  return (
    <Badge color={c.color} dimColor={c.dim}>
      {TYPE_LABELS[type] ?? type}
    </Badge>
  );
}