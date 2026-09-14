import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issue } from './issue.entity';
import { Label } from './label.entity';
import { Project } from '../projects/project.entity';
import { ProjectMember } from '../projects/project-member.entity';
import { ActivityLog } from '../comments/activity-log.entity';
import { IssuesService } from './issues.service';
import { IssuesController } from './issues.controller';
import { LabelsService } from './labels.service';
import { LabelsController } from './labels.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Issue, Label, Project, ProjectMember, ActivityLog])],
  controllers: [IssuesController, LabelsController],
  providers: [IssuesService, LabelsService],
  exports: [TypeOrmModule],
})
export class IssuesModule {}