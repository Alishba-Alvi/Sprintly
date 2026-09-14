import type { Issue } from '../app/api';

export type IssueStatus = Issue['status'];

export const STATUS_LABELS: Record<IssueStatus, string> = {
  to_do: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
};

// Mirrors backend/src/issues/issue-status.constants.ts exactly.
// Keep these two in sync — this is the frontend's only source of truth
// for which transitions are offered as buttons.
export const ALLOWED_TRANSITIONS: Record<IssueStatus, IssueStatus[]> = {
  to_do: ['in_progress'],
  in_progress: ['in_review', 'to_do'],
  in_review: ['done', 'in_progress'],
  done: ['in_progress'],
};

export function transitionLabel(from: IssueStatus, to: IssueStatus): string {
  if (from === 'done' && to === 'in_progress') return 'Reopen';
  if (from === 'in_progress' && to === 'to_do') return 'Move back to To Do';
  if (from === 'in_review' && to === 'in_progress') return 'Send back to In Progress';
  return `Move to ${STATUS_LABELS[to]}`;
}