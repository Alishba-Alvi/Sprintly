import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectMemberGuard } from '../projects/project-member.guard';

@UseGuards(JwtAuthGuard, ProjectMemberGuard)
@Controller('projects/:projectId/issues/:issueId/activity')
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Get()
  findAll(
    @Param('projectId') projectId: string,
    @Param('issueId') issueId: string,
    @Query() query: PaginationQueryDto,
  ) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 && query.limit <= 100 ? query.limit : 20;
    return this.activityService.findAll(projectId, issueId, page, limit);
  }
}
