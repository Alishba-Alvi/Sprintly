import { useState } from 'react';
import { CommentThread } from './CommentThread';
import { ActivityFeed } from './ActivityFeed';

interface IssueActivityPanelProps {
  projectId: string;
  issueId: string;
  canWrite: boolean;
  isLead: boolean;
}

type Tab = 'comments' | 'activity';

export function IssueActivityPanel({ projectId, issueId, canWrite, isLead }: IssueActivityPanelProps) {
  const [tab, setTab] = useState<Tab>('comments');

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-4)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {(['comments', 'activity'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              padding: '8px 4px',
              marginBottom: -1,
              fontSize: 'var(--text-md)',
              fontWeight: 600,
              color: tab === t ? 'var(--text-primary)' : 'var(--text-tertiary)',
              borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`,
              textTransform: 'capitalize',
              transition: 'color var(--duration-fast) var(--ease-out)',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'comments' ? (
        <CommentThread projectId={projectId} issueId={issueId} canWrite={canWrite} isLead={isLead} />
      ) : (
        <ActivityFeed projectId={projectId} issueId={issueId} />
      )}
    </div>
  );
}
