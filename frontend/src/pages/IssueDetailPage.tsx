import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetIssueQuery,
  useUpdateIssueMutation,
  useDeleteIssueMutation,
  useListIssuesQuery,
  useGetLabelsQuery,
} from '../app/api';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { SkeletonCard } from '../components/ui/Skeleton';
import { StatusBadge } from '../components/ui/Badge';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { AssigneePicker } from '../components/issues/AssigneePicker';

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <span
        style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'var(--text-tertiary)',
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function IssueDetailPage() {
  const { projectId, issueId } = useParams<{ projectId: string; issueId: string }>();
  const navigate = useNavigate();

  const { data: issue, isLoading, error } = useGetIssueQuery({
    projectId: projectId!,
    issueId: issueId!,
  });
  const [updateIssue, { isLoading: isSaving }] = useUpdateIssueMutation();
  const [updateErrorMessage, setUpdateErrorMessage] = useState<string | null>(null);
  const [deleteIssue, { isLoading: isDeleting, error: deleteError }] = useDeleteIssueMutation();
  const {
    data: epicsResult,
    error: epicsError,
  } = useListIssuesQuery({ projectId: projectId!, type: 'epic', limit: 100 });
  const { data: labels, error: labelsError } = useGetLabelsQuery(projectId!);

  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useDocumentTitle(issue ? `${issue.key} · ${issue.title}` : 'Issue');

  const epics = (epicsResult?.data ?? []).filter((e) => e.id !== issueId);

  const handleFieldUpdate = async (body: Record<string, unknown>) => {
    setUpdateErrorMessage(null);
    try {
      await updateIssue({ projectId: projectId!, issueId: issueId!, body }).unwrap();
    } catch (err) {
      const fetchError = err as { data?: { message?: string | string[] } };
      const rawMessage = fetchError?.data?.message;
      const message = Array.isArray(rawMessage) ? rawMessage[0] : rawMessage;
      setUpdateErrorMessage(message ?? 'That change could not be saved.');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteIssue({ projectId: projectId!, issueId: issueId! }).unwrap();
      navigate(`/projects/${projectId}/issues`);
    } catch (err) {
      // handled by deleteError
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--space-6)' }}>
        <SkeletonCard />
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div style={{ padding: 'var(--space-6)' }}>
        <ErrorBanner message="Could not load this issue. It may have been deleted, or you may not have access." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={issue.title}
        breadcrumbs={[
          { label: 'Projects', to: '/projects' },
          { label: 'Issues', to: `/projects/${projectId}/issues` },
          { label: issue.key },
        ]}
        action={
          confirmingDelete ? (
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Button variant="danger" size="sm" onClick={handleDelete} loading={isDeleting}>
                Confirm delete
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setConfirmingDelete(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setConfirmingDelete(true)}>
              Delete issue
            </Button>
          )
        }
      />

      <div
        style={{
          padding: 'var(--space-6)',
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: 'var(--space-6)',
          alignItems: 'start',
        }}
      >
        {/* Left column: content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {updateErrorMessage && <ErrorBanner message={updateErrorMessage} />}
          {deleteError && <ErrorBanner message="Could not delete this issue. You may not have permission." />}

          <Card padding="lg">
            <span
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
              }}
            >
              {issue.key}
            </span>
            <h1 style={{ fontSize: 'var(--text-2xl)', marginTop: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              {issue.title}
            </h1>
            <p
              style={{
                fontSize: 'var(--text-md)',
                color: issue.description ? 'var(--text-primary)' : 'var(--text-tertiary)',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}
            >
              {issue.description || 'No description provided.'}
            </p>
          </Card>

          {/* Reserved for Phase 5 — comments & activity feed */}
          <Card padding="lg">
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-3)' }}>Activity</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
              Comments and activity history will appear here.
            </p>
          </Card>
        </div>

        {/* Right column: metadata rail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <Card padding="lg">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <MetaRow label="Status">
                <StatusBadge status={issue.status} />
              </MetaRow>

              <MetaRow label="Type">
                <Select
                  value={issue.type}
                  onChange={(e) => handleFieldUpdate({ type: e.target.value })}
                  disabled={isSaving}
                >
                  <option value="task">Task</option>
                  <option value="bug">Bug</option>
                  <option value="story">Story</option>
                  <option value="epic">Epic</option>
                </Select>
              </MetaRow>

              <MetaRow label="Priority">
                <Select
                  value={issue.priority}
                  onChange={(e) => handleFieldUpdate({ priority: e.target.value })}
                  disabled={isSaving}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </Select>
              </MetaRow>

              <MetaRow label="Epic">
                {epicsError ? (
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--danger)' }}>
                    Could not load epics for this project.
                  </span>
                ) : (
                  <Select
                    value={issue.epicId ?? ''}
                    onChange={(e) => handleFieldUpdate({ epicId: e.target.value || null })}
                    disabled={isSaving}
                  >
                    <option value="">No epic</option>
                    {epics.map((epic) => (
                      <option key={epic.id} value={epic.id}>
                        {epic.key} — {epic.title}
                      </option>
                    ))}
                  </Select>
                )}
              </MetaRow>

              <MetaRow label="Assignee">
                <AssigneePicker
                  currentAssigneeId={issue.assigneeId}
                  onAssign={(userId) => handleFieldUpdate({ assigneeId: userId })}
                  disabled={isSaving}
                />
              </MetaRow>

              <MetaRow label="Labels">
                {labelsError ? (
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--danger)' }}>
                    Could not load labels for this project.
                  </span>
                ) : labels && labels.length > 0 ? (
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    {labels.map((label) => {
                      const active = (issue.labels ?? []).some((l) => l.id === label.id);
                      return (
                        <button
                          key={label.id}
                          type="button"
                          disabled={isSaving}
                          onClick={() => {
                            const current = (issue.labels ?? []).map((l) => l.id);
                            const next = active
                              ? current.filter((id) => id !== label.id)
                              : [...current, label.id];
                            handleFieldUpdate({ labelIds: next });
                          }}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 999,
                            fontSize: 'var(--text-xs)',
                            fontWeight: 500,
                            border: `1px solid ${active ? 'var(--accent)' : 'var(--border-strong)'}`,
                            background: active ? 'var(--accent-dim)' : 'transparent',
                            color: active ? 'var(--accent)' : 'var(--text-secondary)',
                            opacity: isSaving ? 0.55 : 1,
                            transition: 'all var(--duration-fast) var(--ease-out)',
                          }}
                        >
                          {label.name}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                    No labels in this project
                  </span>
                )}
              </MetaRow>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
                <MetaRow label="Created">
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    {new Date(issue.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </MetaRow>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default IssueDetailPage;