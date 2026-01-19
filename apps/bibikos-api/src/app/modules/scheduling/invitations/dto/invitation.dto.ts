import { InvitationStatus } from '@js-monorepo/bibikos-db'
import { IsEmail, IsEnum, IsInt, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator'

export class SendInvitationDto {
  @IsInt()
  classId: number

  @IsOptional()
  @IsString()
  @MaxLength(100)
  username?: string

  @ValidateIf((o) => !o.username)
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string
}

export class RespondToInvitationDto {
  @IsEnum(InvitationStatus)
  status: 'ACCEPTED' | 'DECLINED'
}

export interface InvitationResponseDto {
  id: number
  classId: number
  className: string
  organizerId: number
  organizerName: string | null
  invitedUserId: number | null
  invitedUsername: string | null
  invitedEmail: string | null
  status: InvitationStatus
  message: string | null
  createdAt: Date
  respondedAt: Date | null
  expiresAt: Date | null
}

export interface PendingInvitationDto {
  id: number
  classId: number
  className: string
  classDescription: string | null
  organizerName: string | null
  organizerSlug: string | null
  message: string | null
  createdAt: Date
  expiresAt: Date | null
}
