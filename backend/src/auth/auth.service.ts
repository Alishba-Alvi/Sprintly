import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { User } from '../users/user.entity';
import { ProjectInvitation } from '../projects/project-invitation.entity';
import { ProjectMember } from '../projects/project-member.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(ProjectInvitation)
    private invitationsRepository: Repository<ProjectInvitation>,
    @InjectRepository(ProjectMember)
    private membersRepository: Repository<ProjectMember>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async register(
    dto: RegisterDto,
  ): Promise<Omit<User, 'passwordHash' | 'refreshTokenHash' | 'verificationTokenHash'>> {
    const existing = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      isVerified: process.env.NODE_ENV !== 'production',
    });

    const saved = await this.usersRepository.save(user);

    await this.issueVerificationToken(saved);

    const { passwordHash: _, refreshTokenHash: __, verificationTokenHash: ___, ...result } = saved;
    return result;
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new ForbiddenException('Please verify your email before logging in');
    }

    return this.issueTokens(user);
  }

  async verifyEmail(rawToken: string): Promise<{ verified: true }> {
    let payload: { sub: string; jti: string };

    try {
      payload = await this.jwtService.verifyAsync(rawToken, {
        secret: this.configService.get('JWT_VERIFICATION_SECRET'),
      });
    } catch {
      throw new BadRequestException('Invalid or expired verification link');
    }

    const user = await this.usersRepository.findOne({ where: { id: payload.sub } });

    if (!user || !user.verificationTokenHash) {
      throw new BadRequestException('Invalid or expired verification link');
    }

    // Only the short jti is hashed and compared — never the full JWT. Hashing
    // the whole token risks the same >72-byte bcrypt truncation bug that
    // silently broke refresh-token rotation before.
    const matches = await bcrypt.compare(payload.jti, user.verificationTokenHash);
    if (!matches) {
      throw new BadRequestException('Invalid or expired verification link');
    }

    await this.usersRepository.update(user.id, {
      isVerified: true,
      verificationTokenHash: null,
    });


    return { verified: true };
  }

  async resendVerification(email: string): Promise<{ sent: true }> {
    const user = await this.usersRepository.findOne({ where: { email } });

    // Don't reveal whether an email is registered — respond the same way regardless.
    if (!user || user.isVerified) {
      return { sent: true };
    }

    await this.issueVerificationToken(user);
    return { sent: true };
  }

  async refresh(incomingRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: { sub: string; jti: string };

    try {
      payload = await this.jwtService.verifyAsync(incomingRefreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersRepository.findOne({ where: { id: payload.sub } });

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const matches = await bcrypt.compare(payload.jti, user.refreshTokenHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.issueTokens(user);
  }

  async logout(userId: string): Promise<void> {
    await this.usersRepository.update(userId, { refreshTokenHash: null });
  }

  private async issueVerificationToken(user: User): Promise<void> {
    const jti = randomUUID();

    const rawToken = await this.jwtService.signAsync(
      { sub: user.id, jti },
      {
        secret: this.configService.get('JWT_VERIFICATION_SECRET'),
        expiresIn: '24h',
      },
    );

    const verificationTokenHash = await bcrypt.hash(jti, 10);
    await this.usersRepository.update(user.id, { verificationTokenHash });

    // The token is saved either way. If the email fails to send (e.g. a
    // sandbox/domain restriction on the mail provider), don't fail the
    // whole register/resend request — the user account already exists,
    // and a resend can be tried again once the mail issue is fixed.
    try {
      await this.mailService.sendVerificationEmail(user.email, user.name, rawToken);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[AuthService] Verification email failed for ${user.email}: ${message}`);
    }
  }

  private async acceptPendingInvitations(user: User): Promise<void> {
    const pending = await this.invitationsRepository.find({
      where: { email: user.email, status: 'pending' },
    });

    for (const invitation of pending) {
      if (invitation.expiresAt < new Date()) {
        await this.invitationsRepository.update(invitation.id, { status: 'expired' });
        continue;
      }

      const alreadyMember = await this.membersRepository.findOne({
        where: { projectId: invitation.projectId, userId: user.id },
      });

      if (!alreadyMember) {
        const membership = this.membersRepository.create({
          projectId: invitation.projectId,
          userId: user.id,
          projectRole: invitation.role,
        });
        await this.membersRepository.save(membership);
      }

      await this.invitationsRepository.update(invitation.id, { status: 'accepted' });
    }
  }

  private async issueTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: user.id, email: user.email, role: user.systemRole, name: user.name };

    const accessToken = await this.jwtService.signAsync(payload);

    const jti = randomUUID();

    const refreshToken = await this.jwtService.signAsync(
      { ...payload, jti },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );

    const refreshTokenHash = await bcrypt.hash(jti, 10);
    await this.usersRepository.update(user.id, { refreshTokenHash });

    return { accessToken, refreshToken };
  }
}