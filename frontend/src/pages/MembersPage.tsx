import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import {
  useGetProjectMembersQuery,
  useAddProjectMemberMutation,
  useRemoveProjectMemberMutation,
  useUpdateMemberRoleMutation,
  useLazySearchUserByEmailQuery,
  useGetMyProjectsQuery,
  useUpdateProjectMutation,
} from '../app/api';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { EmptyState } from '../components/ui/EmptyState';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

function MembersPage() {
  useDocumentTitle('Members');

  const { projectId } = useParams<{ projectId: string }>();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const {
    data: members,
    isLoading: isMembersLoading,
    isError: isMembersError,
    error,
  } = useGetProjectMembersQuery(projectId!);

  const [addMember, { isLoading: isAdding, error: addError }] = useAddProjectMemberMutation();
  const [removeMember, { isLoading: isRemoving }] = useRemoveProjectMemberMutation();
  const [updateRole, { isLoading: isUpdatingRole }] = useUpdateMemberRoleMutation();
  const [searchUser, { data: foundUser, isFetching: isSearching, error: searchError }] =
    useLazySearchUserByEmailQuery();

  const {
    data: projects,
    isLoading: isProjectsLoading,
    isError: isProjectsError,
  } = useGetMyProjectsQuery();
  const project = projects?.find((p) => p.id === projectId);
  const [updateProject, { isLoading: isSavingProject, error: updateProjectError }] =
    useUpdateProjectMutation();

  // Permission state is only trustworthy once BOTH queries it depends on
  // have settled. Until then, `isLead` must not be treated as a real "no" —
  // it's "not yet known" — so every gated control below checks
  // `permissionsReady` first and renders a neutral placeholder otherwise.
  // This also fails closed: a query error leaves permissionsReady false,
  // so gated controls simply never appear rather than guessing.
  const permissionsReady = !isMembersLoading && !isProjectsLoading;
  const myMembership = members?.find((m) => m.userId === currentUser?.id);
  const isLead = permissionsReady && myMembership?.projectRole === 'lead';

  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    if (project && !isEditingProject) {
      setEditName(project.name);
      setEditDescription(project.description ?? '');
    }
  }, [project, isEditingProject]);

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'lead' | 'member' | 'viewer'>('member');
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [roleUpdateError, setRoleUpdateError] = useState<string | null>(null);
  const [updatingRoleUserId, setUpdatingRoleUserId] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchUser(email);
  };

  const handleAdd = async () => {
    if (!foundUser) return;
    try {
      await addMember({ projectId: projectId!, userId: foundUser.id, projectRole: role }).unwrap();
      setEmail('');
    } catch (err) {
      // handled by addError
    }
  };

  const handleRemove = async (targetUserId: string) => {
    setRemoveError(null);
    setRemovingUserId(targetUserId);
    try {
      await removeMember({ projectId: projectId!, userId: targetUserId }).unwrap();
    } catch (err) {
      const fetchError = err as { data?: { message?: string } };
      setRemoveError(
        fetchError?.data?.message ??
          'Could not remove this member — you may not have permission, or they may be the last Lead.',
      );
    } finally {
      setRemovingUserId(null);
    }
  };

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    setRoleUpdateError(null);
    setUpdatingRoleUserId(targetUserId);
    try {
      await updateRole({
        projectId: projectId!,
        userId: targetUserId,
        projectRole: newRole as 'lead' | 'member' | 'viewer',
      }).unwrap();
    } catch (err) {
      const fetchError = err as { data?: { message?: string } };
      setRoleUpdateError(fetchError?.data?.message ?? 'Could not update role.');
    } finally {
      setUpdatingRoleUserId(null);
    }
  };

  const handleSaveProject = async () => {
    try {
      await updateProject({
        projectId: projectId!,
        name: editName,
        description: editDescription,
      }).unwrap();
      setIsEditingProject(false);
    } catch (err) {
      // surfaced via updateProjectError
    }
  };

  const handleCancelEdit = () => {
    if (project) {
      setEditName(project.name);
      setEditDescription(project.description ?? '');
    }
    setIsEditingProject(false);
  };

  // A small, static neutral placeholder — matches the page's existing
  // "Loading members..." text convention rather than inventing a new
  // shimmer/skeleton pattern the rest of the codebase doesn't use.
  const InlinePlaceholder = ({ width = 90 }: { width?: number }) => (
    <span
      style={{
        display: 'inline-block',
        width,
        height: 14,
        borderRadius: 'var(--radius-sm)',
        background: 'var(--bg-surface-2)',
      }}
    />
  );

  return (
    <div>
      <PageHeader
        title="Members"
        breadcrumbs={[{ label: 'Projects', to: '/projects' }, { label: 'Members' }]}
      />

      <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: 720 }}>
        {isProjectsError && (
          <ErrorBanner message="Failed to load project details (you may not have access to this project)." />
        )}

        {project && (
          <Card padding="lg">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)' }}>Project details</h3>
              {!permissionsReady && <InlinePlaceholder width={60} />}
              {permissionsReady && isLead && !isEditingProject && (
                <Button variant="secondary" size="sm" onClick={() => setIsEditingProject(true)}>
                  Edit
                </Button>
              )}
            </div>

            {permissionsReady && isLead && isEditingProject ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <Input
                  label="Name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
                <Input
                  label="Description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                {updateProjectError && (
                  <ErrorBanner
                    message={
                      (updateProjectError as { data?: { message?: string } })?.data?.message ??
                      'Could not update project — you may not have permission.'
                    }
                  />
                )}
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <Button variant="primary" size="sm" onClick={handleSaveProject} loading={isSavingProject}>
                    Save
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleCancelEdit} disabled={isSavingProject}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{project.name}</div>
                {project.description && (
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
                    {project.description}
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {!permissionsReady && !project && !isProjectsError && (
          <Card padding="lg">
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Loading project details...</p>
          </Card>
        )}

        {permissionsReady && isLead && (
          <Card padding="lg">
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>Add a member</h3>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <Input
                  label="Search by email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teammate@example.com"
                  required
                />
              </div>
              <Button type="submit" variant="secondary" loading={isSearching}>
                Search
              </Button>
            </form>

            {searchError && (
              <div style={{ marginTop: 'var(--space-3)' }}>
                <ErrorBanner message="No user found with that email." />
              </div>
            )}

            {foundUser && (
              <div
                style={{
                  marginTop: 'var(--space-4)',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface-2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                }}
              >
                <Avatar name={foundUser.name} size={32} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{foundUser.name}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                    {foundUser.email}
                  </div>
                </div>
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value as typeof role)}
                  style={{ width: 120 }}
                >
                  <option value="lead">Lead</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </Select>
                <Button variant="primary" size="sm" onClick={handleAdd} loading={isAdding}>
                  Add
                </Button>
              </div>
            )}

            {addError && (
              <div style={{ marginTop: 'var(--space-3)' }}>
                <ErrorBanner message="Could not add member — they may already be in this project." />
              </div>
            )}
          </Card>
        )}

        <Card padding="lg">
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
            Project members
          </h3>

          {removeError && (
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <ErrorBanner message={removeError} />
            </div>
          )}
          {roleUpdateError && (
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <ErrorBanner message={roleUpdateError} />
            </div>
          )}

          {isMembersLoading && (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Loading members...</p>
          )}
          {isMembersError && <ErrorBanner message="Failed to load members (you may not have access to this project)." />}
          {members && members.length === 0 && (
            <EmptyState title="No members yet" description="Search for a teammate above to add them." />
          )}

          {members && members.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {members.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3) 0',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <Avatar name={m.user.name} size={30} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{m.user.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                      {m.user.email}
                    </div>
                  </div>

                  {!permissionsReady ? (
                    <span style={{ width: 120, display: 'inline-flex' }}>
                      <InlinePlaceholder width={80} />
                    </span>
                  ) : isLead ? (
                    <Select
                      value={m.projectRole}
                      onChange={(e) => handleRoleChange(m.userId, e.target.value)}
                      disabled={isUpdatingRole && updatingRoleUserId === m.userId}
                      style={{ width: 120 }}
                    >
                      <option value="lead">Lead</option>
                      <option value="member">Member</option>
                      <option value="viewer">Viewer</option>
                    </Select>
                  ) : (
                    <span style={{ width: 120, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                      {m.projectRole}
                    </span>
                  )}

                  {permissionsReady && isLead && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemove(m.userId)}
                      disabled={isRemoving && removingUserId === m.userId}
                    >
                      {isRemoving && removingUserId === m.userId ? 'Removing...' : 'Remove'}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Link to="/projects" style={{ fontSize: 'var(--text-sm)' }}>
          ← Back to projects
        </Link>
      </div>
    </div>
  );
}

export default MembersPage;