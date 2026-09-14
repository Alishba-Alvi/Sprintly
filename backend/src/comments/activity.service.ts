import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './activity-log.entity';
import { Issue } from '../issues/issue.entity';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityRepository: Repository<ActivityLog>,
    @InjectRepository(Issue)
    private issuesRepository: Repository<Issue>,
  ) {}

  async findAll(
    projectId: string,
    issueId: string,
    page: number,
    limit: number,
  ): Promise<{ data: ActivityLog[]; total: number; page: number; limit: number }> {
    const issue = await this.issuesRepository.findOne({ where: { id: issueId, projectId } });
    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    const [data, total] = await this.activityRepository.findAndCount({
      where: { issueId },
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }
}
