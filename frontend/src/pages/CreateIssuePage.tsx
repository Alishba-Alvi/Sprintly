import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  useCreateIssueMutation,
  useListIssuesQuery,
  useGetLabelsQuery,
} from '../app/api';
import { useProjectRole } from '../hooks/useProjectRole';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

function CreateIssuePage() {
  useDocumentTitle('New issue');

  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { canWrite, isReady } = useProjectRole(projectId);

  // Mirrors the backend's ProjectWriteGuard: a Viewer landing here
  // directly (typed URL, bookmark, back button) is redirected away
  // rather than shown a form they cannot submit.
  useEffect(() => {
    if (isReady && !canWrite) {
      navigate(`/projects/${projectId}/issues`, { replace: true });
    }
  }, [isReady, canWrite, projectId, navigate]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('task');
  const [priority, setPriority] = useState('medium');
  const [epicId, setEpicId] = useState('');
  const [labelIds, setLabelIds] = useState<string[]>([]);

  const [createIssue, { isLoading }] = useCreateIssueMutation();
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null);

  const {
    data: epicsResult,
    error: epicsError,
  } = useListIssuesQuery({
    projectId: projectId!,
    type: 'epic',
    limit: 100,
  });
  const { data: labels, error: labelsError } = useGetLabelsQuery(projectId!);

  const epics = epicsResult?.data ?? [];

  const toggleLabel = (labelId: string) => {
    setLabelIds((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateErrorMessage(null);
    try {
      const result = await createIssue({
        projectId: projectId!,
        body: {
          title,
          description: description || undefined,
          type,
          priority,
          epicId: epicId || undefined,
          labelIds: labelIds.length > 0 ? labelIds : undefined,
        },
      }).unwrap();
      navigate(`/projects/${projectId}/issues/${result.id}`);
    } catch (err) {
      const fetchError = err as { data?: { message?: string | string[] } };
      const rawMessage = fetchError?.data?.message;
      const message = Array.isArray(rawMessage) ? rawMessage[0] : rawMessage;
      setCreateErrorMessage(message ?? 'Could not create issue. Check the fields above and try again.');
    }
  };

  // While we don't yet know the role, or we're about to redirect,
  // show a neutral loading state instead of a flash of the real form.
  if (!isReady || !canWrite) {
    return (
      <div style={{ padding: 'var(--space-6)', maxWidth: 640 }}>
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="New issue"
        breadcrumbs={[
          { label: 'Projects', to: '/projects' },
          { label: 'Issues', to: `/projects/${projectId}/issues` },
          { label: 'New' },
        ]}
      />

      <div style={{ padding: 'var(--space-6)', maxWidth: 640 }}>
        <Card padding="lg">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="A short, clear summary"
              required
            />

            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more detail (optional)"
            />

            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <div style={{ flex: 1 }}>
                <Select label="Type" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="task">Task</option>
                  <option value="bug">Bug</option>
                  <option value="story">Story</option>
                  <option value="epic">Epic</option>
                </Select>
              </div>
              <div style={{ flex: 1 }}>
                <Select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </Select>
              </div>
            </div>

            {type !== 'epic' && epicsError && (
              <ErrorBanner message="Could not load epics for this project. You can still create the issue without one." />
            )}
            {type !== 'epic' && !epicsError && epics.length > 0 && (
              <Select label="Epic (optional)" value={epicId} onChange={(e) => setEpicId(e.target.value)}>
                <option value="">No epic</option>
                {epics.map((epic) => (
                  <option key={epic.id} value={epic.id}>
                    {epic.key} — {epic.title}
                  </option>
                ))}
              </Select>
            )}

            {labelsError && (
              <ErrorBanner message="Could not load labels for this project." />
            )}
            {!labelsError && labels && labels.length > 0 && (
              <div>
                <label
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    display: 'block',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  Labels
                </label>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  {labels.map((label) => {
                    const active = labelIds.includes(label.id);
                    return (
                      <button
                        key={label.id}
                        type="button"
                        onClick={() => toggleLabel(label.id)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 999,
                          fontSize: 'var(--text-sm)',
                          fontWeight: 500,
                          border: `1px solid ${active ? 'var(--accent)' : 'var(--border-strong)'}`,
                          background: active ? 'var(--accent-dim)' : 'transparent',
                          color: active ? 'var(--accent)' : 'var(--text-secondary)',
                          transition: 'all var(--duration-fast) var(--ease-out)',
                        }}
                      >
                        {label.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {createErrorMessage && <ErrorBanner message={createErrorMessage} />}

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <Button type="submit" variant="primary" loading={isLoading}>
                Create issue
              </Button>
              <Link to={`/projects/${projectId}/issues`}>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default CreateIssuePage;