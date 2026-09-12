import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useListIssuesQuery } from '../app/api';
import { useProjectRole } from '../hooks/useProjectRole';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonRow } from '../components/ui/Skeleton';
import { Pagination } from '../components/ui/Pagination';
import { IssueFilters, type IssueFilterState } from '../components/issues/IssueFilters';
import { IssueRow } from '../components/issues/IssueRow';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const emptyFilters: IssueFilterState = { search: '', status: '', type: '', priority: '' };

function IssuesPage() {
  useDocumentTitle('Issues');

  const { projectId } = useParams<{ projectId: string }>();
  const [filters, setFilters] = useState<IssueFilterState>(emptyFilters);
  const [page, setPage] = useState(1);

  const { canWrite, isReady } = useProjectRole(projectId);

  const handleFiltersChange = (next: IssueFilterState) => {
    setFilters(next);
    setPage(1);
  };

  const { data, isLoading, isFetching, error } = useListIssuesQuery({
    projectId: projectId!,
    status: filters.status || undefined,
    type: filters.type || undefined,
    priority: filters.priority || undefined,
    search: filters.search || undefined,
    page,
    limit: 20,
  });

  const hasActiveFilters = !!(filters.search || filters.status || filters.type || filters.priority);
  const showNewIssueButton = isReady && canWrite;

  return (
    <div>
      <PageHeader
        title="Issues"
        breadcrumbs={[{ label: 'Projects', to: '/projects' }, { label: 'Issues' }]}
        action={
          showNewIssueButton ? (
            <Link to={`/projects/${projectId}/issues/new`}>
              <Button variant="primary">New issue</Button>
            </Link>
          ) : undefined
        }
      />

      <div style={{ padding: 'var(--space-6)' }}>
        <Card padding="none">
          <IssueFilters filters={filters} onChange={handleFiltersChange} />

          <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
            {isLoading && (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            )}

            {error && (
              <div style={{ padding: 'var(--space-5)' }}>
                <ErrorBanner message="Failed to load issues. Try refreshing." />
              </div>
            )}

            {data && data.data.length === 0 && !isLoading && (
              <EmptyState
                title={hasActiveFilters ? 'No matching issues' : 'No issues yet'}
                description={
                  hasActiveFilters
                    ? 'Try adjusting or clearing your filters.'
                    : showNewIssueButton
                      ? 'Create the first issue to start tracking work on this project.'
                      : 'No issues have been created in this project yet.'
                }
                action={
                  hasActiveFilters ? (
                    <Button variant="secondary" onClick={() => handleFiltersChange(emptyFilters)}>
                      Clear filters
                    </Button>
                  ) : showNewIssueButton ? (
                    <Link to={`/projects/${projectId}/issues/new`}>
                      <Button variant="primary">Create an issue</Button>
                    </Link>
                  ) : undefined
                }
              />
            )}

            {data && data.data.length > 0 && (
              <div style={{ opacity: isFetching ? 0.6 : 1, transition: 'opacity var(--duration-fast) var(--ease-out)' }}>
                {data.data.map((issue) => (
                  <IssueRow key={issue.id} projectId={projectId!} issue={issue} />
                ))}
              </div>
            )}
          </div>

          {data && data.total > 0 && (
            <Pagination page={data.page} limit={data.limit} total={data.total} onPageChange={setPage} />
          )}
        </Card>
      </div>
    </div>
  );
}

export default IssuesPage;