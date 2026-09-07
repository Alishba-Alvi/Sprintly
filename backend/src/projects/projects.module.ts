import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { ProjectMember } from './project-member.entity';
import { ProjectInvitation } from './project-invitation.entity';
import { User } from '../users/user.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { InvitationsController } from './invitations.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectMember, ProjectInvitation, User]), MailModule],
  controllers: [ProjectsController, InvitationsController],
  providers: [ProjectsService],
  exports: [TypeOrmModule],
})
export class ProjectsModule {}