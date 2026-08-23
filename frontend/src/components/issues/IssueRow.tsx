import { Link } from 'react-router-dom';
import { TypeBadge, PriorityBadge, StatusBadge } from '../ui/Badge';

interface IssueRowProps {
  projectId: string;
  issue: {
    id: string;
    key: string;
    title: string;
    type: string;
    priority: string;
    status: string;
    assigneeId: string | null;
  };
}

function AssigneePlaceholder({ assigned }: { assigned: boolean }) {
  return (
    <div
      style={{
        width: 26,
        height: 26,
        borderRadius: '50%',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: assigned ? 'var(--bg-surface-2)' : 'transparent',
        border: assigned ? '1px solid var(--border-subtle)' : '1.5px dashed var(--border-strong)',
      }}
    >
      {assigned && (
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: 'var(--text-tertiary)',
          }}
        />
      )}
    </div>
  );
}

export function IssueRow({ projectId, issue }: IssueRowProps) {
  return (
    <Link
      to={`/projects/${projectId}/issues/${issue.id}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        padding: 'var(--space-3) var(--space-4)',
        borderBottom: '1px solid var(--border-subtle)',
        color: 'var(--text-primary)',
        transition: 'background var(--duration-fast) var(--ease-out)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--bg-surface-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <span
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-tertiary)',
          fontWeight: 500,
          width: 56,
          flexShrink: 0,
        }}
      >
        {issue.key}
      </span>

      <span
        style={{
          fontSize: 'var(--text-md)',
          fontWeight: 500,
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {issue.title}
      </span>

      <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>
        <TypeBadge type={issue.type} />
        <PriorityBadge priority={issue.priority} />
        <StatusBadge status={issue.status} />
      </div>

      <div style={{ width: 30, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
        <AssigneePlaceholder assigned={!!issue.assigneeId} />
      </div>
    </Link>
  );
}