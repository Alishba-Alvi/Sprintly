import { BadRequestException } from '@nestjs/common';
import type { IssueStatus } from '../issue.entity';
import { ALLOWED_TRANSITIONS } from '../issue-status.constants';

export class InvalidTransitionException extends BadRequestException {
  constructor(from: IssueStatus, to: IssueStatus) {
    super({
      statusCode: 400,
      error: 'InvalidTransition',
      message: `Cannot transition an issue from "${from}" to "${to}".`,
      details: {
        from,
        to,
        allowedTransitions: ALLOWED_TRANSITIONS[from],
      },
    });
  }
}