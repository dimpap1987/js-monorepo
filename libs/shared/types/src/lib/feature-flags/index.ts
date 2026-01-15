export interface FeatureFlagDto {
  key: string
  enabled: boolean
  rollout: number
  description?: string | null
}

export type FeatureFlagsMapDto = Record<string, FeatureFlagDto>
