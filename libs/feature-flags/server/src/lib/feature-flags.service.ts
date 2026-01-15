import { Injectable } from '@nestjs/common'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'

export type FeatureFlagKey = string

export interface FeatureFlagConfig {
  key: FeatureFlagKey
  enabled: boolean
  rollout: number
  description?: string | null
}

@Injectable()
export class FeatureFlagsService {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async getAllFlags(): Promise<Record<FeatureFlagKey, FeatureFlagConfig>> {
    const records = await this.txHost.tx.featureFlag.findMany()

    return records.reduce<Record<FeatureFlagKey, FeatureFlagConfig>>((acc, flag) => {
      acc[flag.key] = {
        key: flag.key,
        enabled: flag.enabled,
        rollout: flag.rollout,
        description: flag.description,
      }
      return acc
    }, {})
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
