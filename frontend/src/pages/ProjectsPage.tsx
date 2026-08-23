import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useGetMyProjectsQuery,
  useCreateProjectMutation,
  useLogoutUserMutation,
} from '../app/api';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

function ProjectsPage() {
  useDocumentTitle('Projects');

  const { data: projects, isLoading, error } = useGetMyProjectsQuery();
  const [createProject, { isLoading: isCreating, error: createError }] =
    useCreateProjectMutation();
  const [logoutUser] = useLogoutUserMutation();
  const [showForm, setShowForm] = useState(false);

  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject({ key, name, description }).unwrap();
      setKey('');
      setName('');
      setDescription('');
      setShowForm(false);
    } catch (err) {
      // handled by createError
    }
  };

  return (
    <div>
      <PageHeader
        title="Your projects"
        subtitle="Everything you're a member of, in one place"
        action={
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button variant="secondary" onClick={() => logoutUser()}>
              Log out
            </Button>
            <Button variant="primary" onClick={() => setShowForm((s) => !s)}>
              {showForm ? 'Cancel' : 'New project'}
            </Button>
          </div>
        }
      />

      <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {showForm && (
          <Card padding="lg">
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
              Create a project
            </h3>
            <form
              onSubmit={handleCreate}
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: 460 }}
            >
              <Input
                label="Key (2-5 uppercase letters)"
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase())}
                maxLength={5}
                placeholder="PT"
                required
              />
              <Input
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Project Tracker"
                required
              />
              <Textarea
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this project for?"
              />
              {createError && (
                <ErrorBanner message="Could not create project — check the key is unique and correctly formatted." />
              )}
              <Button type="submit" variant="primary" loading={isCreating} style={{ alignSelf: 'flex-start' }}>
                Create project
              </Button>
            </form>
          </Card>
        )}

        {isLoading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {error && <ErrorBanner message="Failed to load your projects. Try refreshing." />}

        {projects && projects.length === 0 && (
          <EmptyState
            title="No projects yet"
            description="Create your first project to start organizing issues and inviting your team."
            action={
              <Button variant="primary" onClick={() => setShowForm(true)}>
                Create a project
              </Button>
            }
          />
        )}

        {projects && projects.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
            {projects.map((project) => (
              <Card key={project.id} interactive padding="lg">
                <div
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: 'var(--accent)',
                    marginBottom: 'var(--space-2)',
                  }}
                >
                  {project.key}
                </div>
                <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>
                  {project.name}
                </h3>
                {project.description && (
                  <p
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)',
                      marginBottom: 'var(--space-4)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {project.description}
                  </p>
                )}
                <Link
                  to={`/projects/${project.id}/members`}
                  style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}
                >
                  Manage members →
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectsPage;