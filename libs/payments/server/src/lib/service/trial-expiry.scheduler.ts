import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { TrialService } from './trial.service'

@Injectable()
export class TrialExpiryScheduler {
  private readonly logger = new Logger(TrialExpiryScheduler.name)

  constructor(private readonly trialService: TrialService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredTrials() {
    this.logger.log('Running expired trials check...')
    const result = await this.trialService.processExpiredTrials()
    this.logger.log(`Processed ${result.processed} expired trials`)
  }
}
