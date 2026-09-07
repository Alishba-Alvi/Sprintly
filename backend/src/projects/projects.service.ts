import {
  Injectable,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { randomBytes, createHash } from 'crypto';
import { Project } from './project.entity';
import { ProjectMember } from './project-member.entity';
import { ProjectInvitation } from './project-invitation.entity';
import { User } from '../users/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { MailService } from '../mail/mail.service';

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function hashInvitationToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private membersRepository: Repository<ProjectMember>,
    @InjectRepository(ProjectInvitation)
    private invitationsRepository: Repository<ProjectInvitation>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private dataSource: DataSource,
    private mailService: MailService,
  ) {}

  async create(dto: CreateProjectDto, creatorUserId: string): Promise<Project> {
    const existing = await this.projectsRepository.findOne({
      where: { key: dto.key },
    });
    if (existing) {
      throw new ConflictException('Project key already in use');
    }

    return this.dataSource.transaction(async (manager) => {
      const project = manager.create(Project, {
        key: dto.key,
        name: dto.name,
        description: dto.description || null,
      });
      const savedProject = await manager.save(project);

      const membership = manager.create(ProjectMember, {
        projectId: savedProject.id,
        userId: creatorUserId,
        projectRole: 'lead',
      });
      await manager.save(membership);

      return savedProject;
    });
  }

  async findMyProjects(userId: string): Promise<Project[]> {
    return this.projectsRepository
      .createQueryBuilder('project')
      .innerJoin('project.members', 'member')
      .where('member.userId = :userId', { userId })
      .getMany();
  }

  async addMember(
    projectId: string,
    dto: AddMemberDto,
  ): Promise<ProjectMember> {
    const existing = await this.membersRepository.findOne({
      where: { projectId, userId: dto.userId },
    });
    if (existing) {
      throw new ConflictException('User is already a member of this project');
    }

    const membership = this.membersRepository.create({
      projectId,
      userId: dto.userId,
      projectRole: dto.projectRole,
    });
    return this.membersRepository.save(membership);
  }

  async removeMember(projectId: string, targetUserId: string): Promise<void> {
    const membership = await this.membersRepository.findOne({
      where: { projectId, userId: targetUserId },
    });
    if (!membership) {
      throw new NotFoundException('That user is not a member of this project');
    }

    const remainingLeads = await this.membersRepository.count({
      where: { projectId, projectRole: 'lead' },
    });
    if (membership.projectRole === 'lead' && remainingLeads <= 1) {
      throw new ConflictException(
        'Cannot remove the last remaining Lead from a project',
      );
    }

    await this.membersRepository.remove(membership);
  }

  async listMembers(projectId: string): Promise<ProjectMember[]> {
    return this.membersRepository.find({ where: { projectId } });
  }

  async updateMemberRole(
    projectId: string,
    targetUserId: string,
    dto: UpdateMemberRoleDto,
  ): Promise<ProjectMember> {
    const membership = await this.membersRepository.findOne({
      where: { projectId, userId: targetUserId },
    });
    if (!membership) {
      throw new NotFoundException('That user is not a member of this project');
    }

    if (membership.projectRole === 'lead' && dto.projectRole !== 'lead') {
      const remainingLeads = await this.membersRepository.count({
        where: { projectId, projectRole: 'lead' },
      });
      if (remainingLeads <= 1) {
        throw new ConflictException(
          'Cannot demote the last remaining Lead from a project',
        );
      }
    }

    membership.projectRole = dto.projectRole;
    return this.membersRepository.save(membership);
  }

  async invite(
  projectId: string,
  dto: InviteMemberDto,
  inviterUserId: string,
  inviterName: string,
): Promise<{ status: 'invited' }> {
  const project = await this.projectsRepository.findOne({
    where: { id: projectId },
  });
  if (!project) {
    throw new NotFoundException('Project not found');
  }

  const existingUser = await this.usersRepository.findOne({
    where: { email: dto.email },
  });

  if (existingUser) {
    const alreadyMember = await this.membersRepository.findOne({
      where: { projectId, userId: existingUser.id },
    });
    if (alreadyMember) {
      throw new ConflictException('User is already a member of this project');
    }
  }

  const existingInvite = await this.invitationsRepository.findOne({
    where: { projectId, email: dto.email, status: 'pending' },
  });
  if (existingInvite) {
    throw new ConflictException(
      'An invitation is already pending for this email',
    );
  }

  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = hashInvitationToken(rawToken);
  const expiresAt = new Date(Date.now() + INVITATION_TTL_MS);

  const invitation = this.invitationsRepository.create({
    projectId,
    email: dto.email,
    role: dto.projectRole,
    tokenHash,
    expiresAt,
    status: 'pending',
    invitedByUserId: inviterUserId,
  });
  await this.invitationsRepository.save(invitation);

  await this.mailService.sendInvitationEmail(
    dto.email,
    inviterName,
    project.name,
    rawToken,
  );

  return { status: 'invited' };
}

  async previewInvitation(
    rawToken: string,
  ): Promise<{
    projectName: string;
    email: string;
    role: ProjectMember['projectRole'];
  }> {
    const tokenHash = hashInvitationToken(rawToken);
    const invitation = await this.invitationsRepository.findOne({
      where: { tokenHash, status: 'pending' },
      relations: { project: true },
    });

    if (!invitation || invitation.expiresAt < new Date()) {
      throw new NotFoundException('This invitation is invalid or has expired');
    }

    return {
      projectName: invitation.project.name,
      email: invitation.email,
      role: invitation.role,
    };
  }
  async acceptInvitation(
  rawToken: string,
  userId: string,
): Promise<{ projectId: string; role: ProjectMember['projectRole'] }> {
  const tokenHash = hashInvitationToken(rawToken);
  const invitation = await this.invitationsRepository.findOne({
    where: { tokenHash, status: 'pending' },
  });

  if (!invitation) {
    throw new NotFoundException('This invitation is invalid or has expired');
  }

  if (invitation.expiresAt < new Date()) {
    await this.invitationsRepository.update(invitation.id, { status: 'expired' });
    throw new NotFoundException('This invitation is invalid or has expired');
  }

  const user = await this.usersRepository.findOne({ where: { id: userId } });
  if (!user || user.email !== invitation.email) {
    throw new ForbiddenException(
      'This invitation was sent to a different email address',
    );
  }

  const alreadyMember = await this.membersRepository.findOne({
    where: { projectId: invitation.projectId, userId },
  });

  if (!alreadyMember) {
    const membership = this.membersRepository.create({
      projectId: invitation.projectId,
      userId,
      projectRole: invitation.role,
    });
    await this.membersRepository.save(membership);
  }

  await this.invitationsRepository.update(invitation.id, { status: 'accepted' });

  return { projectId: invitation.projectId, role: invitation.role };
}
}
