export interface UserProfileDto {
  id: number
  createdAt: Date
  updatedAt: Date
  userId: number
  providerId: number
  profileImage?: string | null
}

export interface UserProfileCreateDto {
  userId: number
  providerId: number
  profileImage?: string | null
}
