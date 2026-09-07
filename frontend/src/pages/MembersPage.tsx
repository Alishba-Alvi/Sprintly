import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useGetProjectMembersQuery,
  useAddProjectMemberMutation,
  useRemoveProjectMemberMutation,
  useUpdateMemberRoleMutation,
  useLazySearchUserByEmailQuery,
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
  const { data: members, isLoading, error } = useGetProjectMembersQuery(projectId!);
  const [addMember, { isLoading: isAdding, error: addError }] = useAddProjectMemberMutation();
  const [removeMember, { isLoading: isRemoving }] = useRemoveProjectMemberMutation();
  const [updateRole, { isLoading: isUpdatingRole }] = useUpdateMemberRoleMutation();
  const [searchUser, { data: foundUser, isFetching: isSearching, error: searchError }] =
    useLazySearchUserByEmailQuery();

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

  return (
    <div>
      <PageHeader
        title="Members"
        breadcrumbs={[{ label: 'Projects', to: '/projects' }, { label: 'Members' }]}
      />

      <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: 720 }}>
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

          {isLoading && (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Loading members...</p>
          )}
          {error && <ErrorBanner message="Failed to load members (you may not have access to this project)." />}
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
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemove(m.userId)}
                    disabled={isRemoving && removingUserId === m.userId}
                  >
                    {isRemoving && removingUserId === m.userId ? 'Removing...' : 'Remove'}
                  </Button>
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