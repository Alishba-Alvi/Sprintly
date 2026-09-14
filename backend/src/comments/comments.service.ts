import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { Issue } from '../issues/issue.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Issue)
    private issuesRepository: Repository<Issue>,
  ) {}

  async create(
    projectId: string,
    issueId: string,
    dto: CreateCommentDto,
    authorId: string,
  ): Promise<Comment> {
    await this.findIssueOrFail(projectId, issueId);

    const comment = this.commentsRepository.create({
      issueId,
      authorId,
      body: this.assertNonBlankBody(dto.body),
    });
    return this.commentsRepository.save(comment);
  }

  async findAll(
    projectId: string,
    issueId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Comment[]; total: number; page: number; limit: number }> {
    await this.findIssueOrFail(projectId, issueId);

    const [data, total] = await this.commentsRepository.findAndCount({
      where: { issueId },
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async update(
    projectId: string,
    issueId: string,
    commentId: string,
    dto: UpdateCommentDto,
    userId: string,
  ): Promise<Comment> {
    const comment = await this.findCommentOrFail(projectId, issueId, commentId);

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    comment.body = this.assertNonBlankBody(dto.body);
    return this.commentsRepository.save(comment);
  }

  async remove(
    projectId: string,
    issueId: string,
    commentId: string,
    userId: string,
    isLead: boolean,
  ): Promise<void> {
    const comment = await this.findCommentOrFail(projectId, issueId, commentId);

    if (comment.authorId !== userId && !isLead) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentsRepository.remove(comment);
  }

  private assertNonBlankBody(body: string): string {
    const trimmed = body.trim();
    if (trimmed.length === 0) {
      throw new BadRequestException('Comment body cannot be empty or whitespace-only');
    }
    return trimmed;
  }

  private async findIssueOrFail(projectId: string, issueId: string): Promise<Issue> {
    const issue = await this.issuesRepository.findOne({ where: { id: issueId, projectId } });
    if (!issue) {
      throw new NotFoundException('Issue not found');
    }
    return issue;
  }

  private async findCommentOrFail(
    projectId: string,
    issueId: string,
    commentId: string,
  ): Promise<Comment> {
    await this.findIssueOrFail(projectId, issueId);

    const comment = await this.commentsRepository.findOne({
      where: { id: commentId, issueId },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }
}
