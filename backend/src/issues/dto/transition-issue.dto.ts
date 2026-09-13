import { IsIn } from 'class-validator';
import type { IssueStatus } from '../issue.entity';

const STATUSES: IssueStatus[] = ['to_do', 'in_progress', 'in_review', 'done'];

export class TransitionIssueDto {
  @IsIn(STATUSES)
  status!: IssueStatus;
}