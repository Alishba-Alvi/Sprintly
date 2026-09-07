import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ default: 'user' })
  systemRole!: 'admin' | 'user';

  @Column({ type: 'varchar', nullable: true })
  refreshTokenHash!: string | null;

  @Column({ default: false })
  isVerified!: boolean;

  @Column({ type: 'varchar', nullable: true })
  verificationTokenHash!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}