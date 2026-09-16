// Small helpers shared by the Comments and Activity panels on
// IssueDetailPage. Kept separate from issue-status.ts since these are
// about people/time, not issue status.

interface MemberLike {
  userId: string
  user: {
    name: string
  }
}

/**
 * Resolve a userId to a display name using the already-fetched project
 * members list (no dedicated "get user by id" endpoint exists on the
 * backend, per the Phase 5 spec). Falls back gracefully for a null
 * actor/author or a member who has since left the project.
 */
export function resolveMemberName(
  userId: string | null,
  members: MemberLike[] | undefined,
): string {
  if (!userId) return 'Someone'
  const member = members?.find((m) => m.userId === userId)
  return member?.user.name ?? 'Former member'
}

/**
 * Compact relative time (e.g. "2m ago", "3h ago", "5d ago"), falling
 * back to a short absolute date once it's more than a week old.
 */
export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate)
  const diffMs = Date.now() - date.getTime()
  const diffSec = Math.round(diffMs / 1000)

  if (diffSec < 60) return 'just now'

  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`

  const diffHour = Math.round(diffMin / 60)
  if (diffHour < 24) return `${diffHour}h ago`

  const diffDay = Math.round(diffHour / 24)
  if (diffDay < 7) return `${diffDay}d ago`

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
