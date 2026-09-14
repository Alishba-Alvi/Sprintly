import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { ActivityLog } from './activity-log.entity';
import { Issue } from '../issues/issue.entity';
import { ProjectMember } from '../projects/project-member.entity';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, ActivityLog, Issue, ProjectMember])],
  controllers: [CommentsController, ActivityController],
  providers: [CommentsService, ActivityService],
})
export class CommentsModule {}
