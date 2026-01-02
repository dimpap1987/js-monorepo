import { DistributedLockService } from '@js-monorepo/nest/distributed-lock'
import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { TrialService } from './trial.service'

@Injectable()
export class TrialExpiryScheduler {
  private readonly logger = new Logger(TrialExpiryScheduler.name)

  constructor(
    private readonly trialService: TrialService,
    private readonly distributedLockService: DistributedLockService
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredTrials() {
    // Use distributed lock to ensure only one instance processes expired trials
    const lockKey = 'cron:trial-expiry'
    const lockResult = await this.distributedLockService.withLock(
      lockKey,
      async () => {
        this.logger.log('Running expired trials check...')
        const result = await this.trialService.processExpiredTrials()
        this.logger.log(`Processed ${result.processed} expired trials`)
        return result
      },
      { ttlSeconds: 300 } // 5 minute TTL to cover the entire job duration
    )

    if (!lockResult.success) {
      this.logger.debug('Skipping expired trials check - another instance is processing')
    }
  }
}
