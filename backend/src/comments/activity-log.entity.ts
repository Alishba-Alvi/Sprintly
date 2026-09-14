import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Issue } from '../issues/issue.entity';
import { User } from '../users/user.entity';
import type { ActivityAction } from './activity-action.constants';

// Append-only audit trail: rows are created, never edited or deleted.
@Entity()
@Index(['issueId', 'createdAt'])
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Issue, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'issueId' })
  issue!: Issue;

  @Column()
  issueId!: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'actorId' })
  actor!: User | null;

  @Column({ nullable: true })
  actorId!: string | null;

  @Column({ type: 'varchar' })
  action!: ActivityAction;

  @Column({ type: 'varchar', nullable: true })
  fromValue!: string | null;

  @Column({ type: 'varchar', nullable: true })
  toValue!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
