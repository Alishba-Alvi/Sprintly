import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { useGetProjectMembersQuery } from '../app/api';

export type ProjectRole = 'lead' | 'member' | 'viewer';

interface ProjectRoleResult {
  // True only once we actually know the answer. Every gated control must
  // wait for this before rendering its final state - never default to
  // "hidden" and call it done, since "hidden while loading" and
  // "confirmed not permitted" must never look identical (see MembersPage).
  isReady: boolean;
  // This user's role within THIS project, or null if not a member /
  // not yet known.
  role: ProjectRole | null;
  // Mirrors the backend's ProjectWriteGuard exactly: lead or member,
  // never viewer. Use this for create/edit actions.
  canWrite: boolean;
  // Mirrors the backend's ProjectLeadGuard exactly: lead only.
  // Use this for delete and other Lead-only actions.
  isLead: boolean;
  isError: boolean;
}

export function useProjectRole(projectId: string | undefined): ProjectRoleResult {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { data: members, isLoading, isError } = useGetProjectMembersQuery(projectId!, {
    skip: !projectId,
  });

  const isReady = !isLoading && !!projectId;
  const myMembership = members?.find((m) => m.userId === currentUser?.id);
  const role = isReady ? myMembership?.projectRole ?? null : null;

  return {
    isReady,
    role,
    canWrite: isReady && role !== null && role !== 'viewer',
    isLead: isReady && role === 'lead',
    isError,
  };
}