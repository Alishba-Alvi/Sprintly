import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import {
  useListCommentsQuery,
  useGetProjectMembersQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from '../../app/api';
import type { Comment } from '../../app/api';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { ErrorBanner } from '../ui/ErrorBanner';
import { EmptyState } from '../ui/EmptyState';
import { Skeleton } from '../ui/Skeleton';
import { Pagination } from '../ui/Pagination';
import { CommentComposer } from './CommentComposer';
import { resolveMemberName, formatRelativeTime } from '../../utils/issue-activity';

const PAGE_SIZE = 20;

interface CommentThreadProps {
  projectId: string;
  issueId: string;
  canWrite: boolean;
  isLead: boolean;
}

function CommentSkeleton() {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
      <Skeleton width={28} height={28} radius="50%" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Skeleton width="30%" height={12} />
        <Skeleton width="90%" height={14} />
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  authorName,
  canEdit,
  canDelete,
  onUpdate,
  onDelete,
}: {
  comment: Comment;
  authorName: string;
  // Author AND currently has write access — a demoted viewer's own old
  // comments must not show an Edit control they'd only bounce off a
  // 403 from (server enforces authorId === userId, but ALSO requires
  // ProjectWriteGuard, so authorship alone isn't enough here).
  canEdit: boolean;
  canDelete: boolean;
  onUpdate: (body: string) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.body);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === comment.body) {
      setEditing(false);
      setDraft(comment.body);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onUpdate(trimmed);
      setEditing(false);
    } catch {
      setError('Could not save your edit.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
    } catch {
      setError('Could not delete this comment.');
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
      <Avatar name={authorName} size={28} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{authorName}</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
            {formatRelativeTime(comment.createdAt)}
            {comment.updatedAt !== comment.createdAt ? ' · edited' : ''}
          </span>
        </div>

        {error && <ErrorBanner message={error} />}

        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} disabled={saving} rows={3} />
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Button size="sm" onClick={handleSave} loading={saving}>
                Save
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setEditing(false);
                  setDraft(comment.body);
                }}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{comment.body}</p>
            {(canEdit || canDelete) && (
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 500 }}
                  >
                    Edit
                  </button>
                )}
                {canDelete &&
                  (confirmingDelete ? (
                    <span style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        style={{ fontSize: 'var(--text-xs)', color: 'var(--danger)', fontWeight: 600 }}
                      >
                        Confirm delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingDelete(false)}
                        disabled={deleting}
                        style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 500 }}
                      >
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(true)}
                      style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 500 }}
                    >
                      Delete
                    </button>
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function CommentThread({ projectId, issueId, canWrite, isLead }: CommentThreadProps) {
  const [page, setPage] = useState(1);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const { data: members } = useGetProjectMembersQuery(projectId);
  const {
    data: commentsResult,
    isLoading,
    error,
  } = useListCommentsQuery({ projectId, issueId, page, limit: PAGE_SIZE });

  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <CommentSkeleton />
        <CommentSkeleton />
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message="Could not load comments." />;
  }

  const comments = commentsResult?.data ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {canWrite && (
        <CommentComposer
          submitting={isCreating}
          onSubmit={async (body) => {
            await createComment({ projectId, issueId, body }).unwrap();
            setPage(1);
          }}
        />
      )}

      {comments.length === 0 ? (
        <EmptyState title="No comments yet" description="Be the first to leave a comment on this issue." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              authorName={resolveMemberName(comment.authorId, members)}
              canEdit={canWrite && comment.authorId === currentUser?.id}
              canDelete={isLead || (canWrite && comment.authorId === currentUser?.id)}
              onUpdate={async (body) => {
                await updateComment({ projectId, issueId, commentId: comment.id, body }).unwrap();
              }}
              onDelete={async () => {
                await deleteComment({ projectId, issueId, commentId: comment.id }).unwrap();
              }}
            />
          ))}
        </div>
      )}

      {commentsResult && (
        <Pagination
          page={commentsResult.page}
          limit={commentsResult.limit}
          total={commentsResult.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
