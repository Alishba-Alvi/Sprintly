import { Controller, Get, Post, Body, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('invitations')
export class InvitationsController {
  constructor(private projectsService: ProjectsService) {}

  @Get('preview')
  preview(@Query('token') token: string) {
    return this.projectsService.previewInvitation(token);
  }

  @Post('accept')
  @UseGuards(JwtAuthGuard)
  accept(@Body('token') token: string, @Req() req: Request) {
    const user = req.user as { userId: string };
    return this.projectsService.acceptInvitation(token, user.userId);
  }
}