import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Project } from './project.entity';
import { User } from '../users/user.entity';
import type{ ProjectRole } from './project-member.entity';

export type InvitationStatus = 'pending' | 'accepted' | 'expired';

@Entity()
export class ProjectInvitation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project!: Project;

  @Column()
  projectId!: string;

  @Column()
  email!: string;

  @Column({ type: 'varchar', default: 'member' })
  role!: ProjectRole;

  @Column({ unique: true })
  tokenHash!: string;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @Column({ type: 'varchar', default: 'pending' })
  status!: InvitationStatus;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invitedByUserId' })
  invitedBy!: User;

  @Column()
  invitedByUserId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}