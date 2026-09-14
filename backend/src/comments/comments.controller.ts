import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectMemberGuard } from '../projects/project-member.guard';
import { ProjectWriteGuard } from '../projects/project-write.guard';

@UseGuards(JwtAuthGuard, ProjectMemberGuard)
@Controller('projects/:projectId/issues/:issueId/comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @UseGuards(ProjectWriteGuard)
  @Post()
  create(
    @Param('projectId') projectId: string,
    @Param('issueId') issueId: string,
    @Body() dto: CreateCommentDto,
    @Req() req: Request,
  ) {
    const user = req.user as { userId: string };
    return this.commentsService.create(projectId, issueId, dto, user.userId);
  }

  @Get()
  findAll(
    @Param('projectId') projectId: string,
    @Param('issueId') issueId: string,
    @Query() query: PaginationQueryDto,
  ) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 && query.limit <= 100 ? query.limit : 20;
    return this.commentsService.findAll(projectId, issueId, page, limit);
  }

  @UseGuards(ProjectWriteGuard)
  @Patch(':commentId')
  update(
    @Param('projectId') projectId: string,
    @Param('issueId') issueId: string,
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
    @Req() req: Request,
  ) {
    const user = req.user as { userId: string };
    return this.commentsService.update(projectId, issueId, commentId, dto, user.userId);
  }

  @UseGuards(ProjectWriteGuard)
  @Delete(':commentId')
  remove(
    @Param('projectId') projectId: string,
    @Param('issueId') issueId: string,
    @Param('commentId') commentId: string,
    @Req() req: Request,
  ) {
    const user = req.user as { userId: string };
    const isLead = req.projectMembership?.projectRole === 'lead';
    return this.commentsService.remove(projectId, issueId, commentId, user.userId, isLead);
  }
}
