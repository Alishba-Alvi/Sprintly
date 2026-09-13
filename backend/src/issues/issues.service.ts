import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, EntityManager, In } from 'typeorm';
import { Issue } from './issue.entity';
import type { IssueType } from './issue.entity';
import { Label } from './label.entity';
import { Project } from '../projects/project.entity';
import { ProjectMember } from '../projects/project-member.entity';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { TransitionIssueDto } from './dto/transition-issue.dto';
import { isValidTransition } from './issue-status.constants';
import { InvalidTransitionException } from './exceptions/invalid-transition.exception';

@Injectable()
export class IssuesService {
  constructor(
    @InjectRepository(Issue)
    private issuesRepository: Repository<Issue>,
    @InjectRepository(Label)
    private labelsRepository: Repository<Label>,
    @InjectRepository(ProjectMember)
    private membersRepository: Repository<ProjectMember>,
    private dataSource: DataSource,
  ) {}

  async create(projectId: string, dto: CreateIssueDto, reporterId: string): Promise<Issue> {
    return this.dataSource.transaction(async (manager) => {
      const project = await manager.findOne(Project, { where: { id: projectId } });
      if (!project) {
        throw new NotFoundException('Project not found');
      }

      if (dto.epicId) {
        await this.validateEpicLink(manager, projectId, dto.epicId, dto.type, null);
      }

      let labels: Label[] = [];
      if (dto.labelIds && dto.labelIds.length > 0) {
        labels = await this.validateLabelIds(manager, projectId, dto.labelIds);
      }

      const lastIssue = await manager
        .createQueryBuilder(Issue, 'issue')
        .where('issue.projectId = :projectId', { projectId })
        .orderBy('issue.number', 'DESC')
        .setLock('pessimistic_write')
        .getOne();

      const nextNumber = lastIssue ? lastIssue.number + 1 : 1;
      const key = `${project.key}-${nextNumber}`;

      const issue = manager.create(Issue, {
        projectId,
        number: nextNumber,
        key,
        title: dto.title,
        description: dto.description || null,
        type: dto.type,
        priority: dto.priority,
        status: 'to_do',
        reporterId,
        epicId: dto.epicId || null,
        labels,
      });

      return manager.save(issue);
    });
  }

  async findOne(projectId: string, issueId: string): Promise<Issue> {
    const issue = await this.issuesRepository.findOne({
      where: { id: issueId, projectId },
      relations: { labels: true },
    });
    if (!issue) {
      throw new NotFoundException('Issue not found');
    }
    return issue;
  }

  async update(projectId: string, issueId: string, dto: UpdateIssueDto): Promise<Issue> {
    return this.dataSource.transaction(async (manager) => {
      const issue = await manager.findOne(Issue, {
        where: { id: issueId, projectId },
        relations: { labels: true },
      });
      if (!issue) {
        throw new NotFoundException('Issue not found');
      }

      if (dto.assigneeId !== undefined && dto.assigneeId !== null) {
        const membership = await manager.findOne(ProjectMember, {
          where: { projectId, userId: dto.assigneeId },
        });
        if (!membership) {
          throw new BadRequestException('Assignee must be a member of this project');
        }
      }

      // Block changing type away from 'epic' while other issues still reference it
      if (dto.type !== undefined && dto.type !== 'epic' && issue.type === 'epic') {
        const childCount = await manager.count(Issue, { where: { epicId: issue.id } });
        if (childCount > 0) {
          throw new ConflictException(
            'Cannot change type away from Epic while other issues are linked to it. Unlink them first.',
          );
        }
      }

      if (dto.epicId !== undefined && dto.epicId !== null) {
        const finalType = dto.type !== undefined ? dto.type : issue.type;
        await this.validateEpicLink(manager, projectId, dto.epicId, finalType, issue.id);
      }

      if (dto.labelIds !== undefined) {
        issue.labels =
          dto.labelIds.length > 0
            ? await this.validateLabelIds(manager, projectId, dto.labelIds)
            : [];
      }

      Object.assign(issue, {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.assigneeId !== undefined && { assigneeId: dto.assigneeId }),
        ...(dto.epicId !== undefined && { epicId: dto.epicId }),
      });

      return manager.save(issue);
    });
  }

  async transition(projectId: string, issueId: string, dto: TransitionIssueDto): Promise<Issue> {
    return this.dataSource.transaction(async (manager) => {
      const issue = await manager
        .createQueryBuilder(Issue, 'issue')
        .where('issue.id = :issueId', { issueId })
        .andWhere('issue.projectId = :projectId', { projectId })
        .setLock('pessimistic_write')
        .getOne();

      if (!issue) {
        throw new NotFoundException('Issue not found');
      }

      if (!isValidTransition(issue.status, dto.status)) {
        throw new InvalidTransitionException(issue.status, dto.status);
      }

      issue.status = dto.status;
      return manager.save(issue);
    });
  }

  async findAll(
    projectId: string,
    filters: {
      status?: string;
      assigneeId?: string;
      type?: string;
      priority?: string;
      search?: string;
      epicId?: string;
      labelId?: string;
      page?: number;
      limit?: number;
      sortBy?: 'createdAt' | 'priority' | 'status';
      sortOrder?: 'ASC' | 'DESC';
    },
  ): Promise<{ data: Issue[]; total: number; page: number; limit: number }> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 && filters.limit <= 100 ? filters.limit : 20;
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'DESC';

    const query = this.issuesRepository
      .createQueryBuilder('issue')
      .where('issue.projectId = :projectId', { projectId });

    if (filters.status) {
      query.andWhere('issue.status = :status', { status: filters.status });
    }
    if (filters.assigneeId) {
      query.andWhere('issue.assigneeId = :assigneeId', { assigneeId: filters.assigneeId });
    }
    if (filters.type) {
      query.andWhere('issue.type = :type', { type: filters.type });
    }
    if (filters.priority) {
      query.andWhere('issue.priority = :priority', { priority: filters.priority });
    }
    if (filters.epicId) {
      query.andWhere('issue.epicId = :epicId', { epicId: filters.epicId });
    }
    if (filters.labelId) {
      // Equality join on a specific labelId matches at most one row per
      // issue, so this cannot multiply rows or corrupt LIMIT/OFFSET pagination.
      query.innerJoin('issue.labels', 'labelFilter', 'labelFilter.id = :labelId', {
        labelId: filters.labelId,
      });
    }

    const search = filters.search?.trim();
    if (search) {
      query.andWhere(
        '(issue.title ILIKE :search OR issue.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (sortBy === 'priority') {
      query.orderBy(
        `CASE issue.priority
          WHEN 'low' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'high' THEN 3
          WHEN 'critical' THEN 4
        END`,
        sortOrder,
      );
    } else {
      query.orderBy(`issue.${sortBy}`, sortOrder);
    }

    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();

    return { data, total, page, limit };
  }

  async remove(projectId: string, issueId: string): Promise<void> {
    const issue = await this.findOne(projectId, issueId);
    await this.issuesRepository.remove(issue);
  }

  private async validateEpicLink(
    manager: EntityManager,
    projectId: string,
    epicId: string,
    issueType: IssueType | undefined,
    currentIssueId: string | null,
  ): Promise<void> {
    if (currentIssueId && epicId === currentIssueId) {
      throw new BadRequestException('An issue cannot be linked to itself as its Epic');
    }

    if (issueType === 'epic') {
      throw new BadRequestException('An Epic cannot itself be linked to another Epic');
    }

    const epic = await manager.findOne(Issue, { where: { id: epicId, projectId } });
    if (!epic) {
      throw new BadRequestException('epicId does not reference an issue in this project');
    }
    if (epic.type !== 'epic') {
      throw new BadRequestException('epicId must reference an issue of type "epic"');
    }
  }

  private async validateLabelIds(
    manager: EntityManager,
    projectId: string,
    labelIds: string[],
  ): Promise<Label[]> {
    const labels = await manager.find(Label, {
      where: { id: In(labelIds), projectId },
    });
    if (labels.length !== labelIds.length) {
      throw new BadRequestException('One or more labelIds do not reference labels in this project');
    }
    return labels;
  }
}