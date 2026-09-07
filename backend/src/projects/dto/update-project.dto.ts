import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
  // no `key` field on purpose — BR-1 says it's immutable once set.
  // as long as your global ValidationPipe has `whitelist: true`, a client
  // sending `key` in the body gets it silently stripped before this DTO
  // is even populated. Worth double-checking that's set in main.ts.
}