import type { IssueStatus } from './issue.entity';

export const ALLOWED_TRANSITIONS: Record<IssueStatus, IssueStatus[]> = {
  to_do: ['in_progress'],
  in_progress: ['in_review', 'to_do'],
  in_review: ['done', 'in_progress'],
  done: ['in_progress'],
};

export function isValidTransition(from: IssueStatus, to: IssueStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}