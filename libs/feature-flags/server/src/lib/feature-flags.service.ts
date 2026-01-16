import { Inject, Injectable } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { ConfigService } from '@nestjs/config'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'

export type FeatureFlagKey = string

export interface FeatureFlagConfig {
  key: FeatureFlagKey
  enabled: boolean
  rollout: number
  description?: string | null
}

const FEATURE_FLAGS_CACHE_KEY = 'feature-flags:all'

@Injectable()
export class FeatureFlagsService {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService
  ) {}

  async getAllFlags(): Promise<Record<FeatureFlagKey, FeatureFlagConfig>> {
    const cacheKey = FEATURE_FLAGS_CACHE_KEY
    const cacheTtl = 86400 * 1000 // 1 day in milliseconds

    // Check cache first
    const cached = await this.cacheManager.get<Record<FeatureFlagKey, FeatureFlagConfig>>(cacheKey)
    if (cached) {
      return cached
    }

    const records = await this.txHost.tx.featureFlag.findMany({
      orderBy: { key: 'asc' },
    })

    const result = records.reduce<Record<FeatureFlagKey, FeatureFlagConfig>>((acc, flag) => {
      acc[flag.key] = {
        key: flag.key,
        enabled: flag.enabled,
        rollout: flag.rollout,
        description: flag.description,
      }
      return acc
    }, {})

    // Cache for 1 day
    await this.cacheManager.set(cacheKey, result, cacheTtl)
    return result
  }

  async isEnabled(key: FeatureFlagKey, userId?: number): Promise<boolean> {
    const flag = await this.txHost.tx.featureFlag.findUnique({ where: { key } })
    if (!flag) return false
    if (!flag.enabled) return false

    // Simple rollout: hash userId deterministically into 0-99 and compare with rollout
    if (typeof userId === 'number' && flag.rollout < 100) {
      const bucket = this.hashToBucket(userId, flag.key)
      return bucket < flag.rollout
    }

    return true
  }

  async getEnabledFlagsForUser(userId?: number): Promise<Record<FeatureFlagKey, boolean>> {
    // getAllFlags() is cached, so this will use cached data if available
    const configs = await this.getAllFlags()
    const result: Record<FeatureFlagKey, boolean> = {}

    for (const [key, cfg] of Object.entries(configs)) {
      if (!cfg.enabled) {
        result[key] = false
        continue
      }

      if (typeof userId === 'number' && cfg.rollout < 100) {
        const bucket = this.hashToBucket(userId, key)
        result[key] = bucket < cfg.rollout
      } else {
        result[key] = true
      }
    }

    return result
  }

  async upsertFlag(input: { key: string; enabled?: boolean; rollout?: number; description?: string }): Promise<void> {
    await this.txHost.tx.featureFlag.upsert({
      where: { key: input.key },
      create: {
        key: input.key,
        enabled: input.enabled ?? false,
        rollout: input.rollout ?? 100,
        description: input.description,
      },
      update: {
        enabled: input.enabled ?? undefined,
        rollout: input.rollout ?? undefined,
        description: input.description ?? undefined,
      },
    })

    // Invalidate cache when flags are updated
    await this.cacheManager.del(FEATURE_FLAGS_CACHE_KEY)
  }

  private hashToBucket(userId: number, seed: string): number {
    const str = `${userId}:${seed}`
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const chr = str.charCodeAt(i)
      hash = (hash << 5) - hash + chr
      hash |= 0
    }
    // 0-99
    return Math.abs(hash) % 100
  }
}
