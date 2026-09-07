import { IsEmail, IsIn } from 'class-validator';

export class InviteMemberDto {
  @IsEmail()
  email!: string;

  @IsIn(['lead', 'member', 'viewer'])
  projectRole!: 'lead' | 'member' | 'viewer';
}