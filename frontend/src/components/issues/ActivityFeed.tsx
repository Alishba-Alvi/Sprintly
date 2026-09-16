import { useState } from 'react';
import { useListActivityQuery, useGetProjectMembersQuery } from '../../app/api';
import type { ActivityLogEntry } from '../../app/api';
import { ErrorBanner } from '../ui/ErrorBanner';
import { EmptyState } from '../ui/EmptyState';
import { Skeleton } from '../ui/Skeleton';
import { Pagination } from '../ui/Pagination';
import { STATUS_LABELS } from '../../utils/issue-status';
import { resolveMemberName, formatRelativeTime } from '../../utils/issue-activity';

const PAGE_SIZE = 20;

interface ActivityFeedProps {
  projectId: string;
  issueId: string;
}

// STATUS_LABELS is keyed by the known IssueStatus union, but fromValue/
// toValue come back from the API as plain strings — look them up through
// an untyped view of the map instead of indexing the typed one directly
// (avoids TS7053) and fall back to the raw value if it's ever unknown.
function statusLabel(raw: string): string {
  return (STATUS_LABELS as Record<string, string>)[raw] ?? raw;
}

function describeActivity(entry: ActivityLogEntry, members: Parameters<typeof resolveMemberName>[1]): string {
  const actor = resolveMemberName(entry.actorId, members);

  switch (entry.action) {
    case 'created':
      return `${actor} created this issue`;

    case 'status_changed': {
      const from = entry.fromValue ? statusLabel(entry.fromValue) : null;
      const to = entry.toValue ? statusLabel(entry.toValue) : 'an unknown status';
      return from ? `${actor} moved this from ${from} to ${to}` : `${actor} set status to ${to}`;
    }

    case 'assigned': {
      const from = entry.fromValue ? resolveMemberName(entry.fromValue, members) : null;
      const to = entry.toValue ? resolveMemberName(entry.toValue, members) : null;
      if (to && from) return `${actor} reassigned this from ${from} to ${to}`;
      if (to) return `${actor} assigned this to ${to}`;
      return `${actor} unassigned this issue`;
    }

    default:
      return `${actor} updated this issue`;
  }
}

function ActivitySkeleton() {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
      <Skeleton width={8} height={8} radius="50%" />
      <Skeleton width="60%" height={14} />
    </div>
  );
}

export function ActivityFeed({ projectId, issueId }: ActivityFeedProps) {
  const [page, setPage] = useState(1);

  const { data: members } = useGetProjectMembersQuery(projectId);
  const {
    data: activityResult,
    isLoading,
    error,
  } = useListActivityQuery({ projectId, issueId, page, limit: PAGE_SIZE });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <ActivitySkeleton />
        <ActivitySkeleton />
        <ActivitySkeleton />
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message="Could not load activity." />;
  }

  const entries = activityResult?.data ?? [];

  if (entries.length === 0) {
    return <EmptyState title="No activity yet" description="Status changes and assignments will show up here." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {entries.map((entry, i) => (
          <div
            key={entry.id}
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              alignItems: 'flex-start',
              padding: '10px 0',
              borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
            }}
          >
            <span
              style={{
                marginTop: 6,
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--text-tertiary)',
                flexShrink: 0,
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                {describeActivity(entry, members)}
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                {formatRelativeTime(entry.createdAt)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {activityResult && (
        <Pagination
          page={activityResult.page}
          limit={activityResult.limit}
          total={activityResult.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
