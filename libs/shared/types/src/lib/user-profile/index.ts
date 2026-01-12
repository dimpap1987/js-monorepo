export interface UserProfileDto {
  id: number
  createdAt: Date
  updatedAt: Date
  userId: number
  providerId: number
  profileImage?: string | null
  firstName?: string | null
  lastName?: string | null
  accessToken?: string | null
  refreshToken?: string | null
  tokenExpiry?: Date | null
  scopes?: string[]
}

export interface UserProfileCreateDto {
  userId: number
  providerId: number
  profileImage?: string | null
  firstName?: string | null
  lastName?: string | null
  accessToken?: string | null
  refreshToken?: string | null
  tokenExpiry?: Date | null
  scopes?: string[]
}
