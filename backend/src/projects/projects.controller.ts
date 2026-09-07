import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectMemberGuard } from './project-member.guard';
import { ProjectLeadGuard } from './project-lead.guard';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  create(@Body() dto: CreateProjectDto, @Req() req: Request) {
    const user = req.user as { userId: string };
    return this.projectsService.create(dto, user.userId);
  }

  @Get()
  findMyProjects(@Req() req: Request) {
    const user = req.user as { userId: string };
    return this.projectsService.findMyProjects(user.userId);
  }

  @UseGuards(ProjectMemberGuard)
  @Get(':projectId/members')
  listMembers(@Param('projectId') projectId: string) {
    return this.projectsService.listMembers(projectId);
  }

  @UseGuards(ProjectMemberGuard, ProjectLeadGuard)
  @Post(':projectId/members')
  addMember(@Param('projectId') projectId: string, @Body() dto: AddMemberDto) {
    return this.projectsService.addMember(projectId, dto);
  }

  @UseGuards(ProjectMemberGuard, ProjectLeadGuard)
  @Post(':projectId/invitations')
  invite(
    @Param('projectId') projectId: string,
    @Body() dto: InviteMemberDto,
    @Req() req: Request,
  ) {
    const user = req.user as { userId: string; name: string };
    return this.projectsService.invite(projectId, dto, user.userId, user.name);
  }

  @UseGuards(ProjectMemberGuard, ProjectLeadGuard)
  @Delete(':projectId/members/:userId')
  removeMember(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
  ) {
    return this.projectsService.removeMember(projectId, userId);
  }

  @UseGuards(ProjectMemberGuard, ProjectLeadGuard)
  @Patch(':projectId/members/:userId')
  updateMemberRole(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.projectsService.updateMemberRole(projectId, userId, dto);
  }
}